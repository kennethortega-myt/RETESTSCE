package pe.gob.onpe.scescanner.http.impl;

import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.ParseException;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.entity.mime.HttpMultipartMode;
import org.apache.http.entity.mime.MultipartEntityBuilder;
import org.apache.http.entity.mime.content.FileBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.constant.ConstantLogs;
import pe.gob.onpe.scescanner.common.constant.ConstantParamHttp;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.FileControl;
import pe.gob.onpe.scescanner.domain.ActaScanDto;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Documentos;
import pe.gob.onpe.scescanner.domain.Eleccion;
import pe.gob.onpe.scescanner.domain.HttpResp;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.domain.ResolucionDigital;
import pe.gob.onpe.scescanner.domain.RespRegActas;
import pe.gob.onpe.scescanner.http.ISceHttp;

import javax.crypto.Cipher;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Stream;

import static pe.gob.onpe.scescanner.common.util.Utils.hashSHA256;
import static pe.gob.onpe.scescanner.common.util.Utils.obtenerHoraExpiracion;

public class SceHttpImpl implements ISceHttp{
    
    private static final Logger logger = LoggerFactory.getLogger(SceHttpImpl.class);
    
    private final String apiUrlBase = GlobalDigitalizacion.getHostService();
    
    private static final String MSG_ERROR_REQHTTP = "Falla en solicitud HTTP";
    private static final String MSG_ERROR_HILO = "Hilo interrumpido";
    private static final String TEXT_MSG = "message";
    
    // Cliente HTTP compartido con pool de conexiones para mejor rendimiento
    private final CloseableHttpClient httpClient;
    
    public SceHttpImpl() {
        // Configurar pool de conexiones
        PoolingHttpClientConnectionManager connectionManager = new PoolingHttpClientConnectionManager();
        connectionManager.setMaxTotal(200); // Total de conexiones simultáneas
        connectionManager.setDefaultMaxPerRoute(50); // Conexiones por ruta/endpoint
        
        // Configurar timeouts
        RequestConfig requestConfig = RequestConfig.custom()
                .setConnectTimeout(10000) // 10 segundos para establecer conexión
                .setSocketTimeout(60000)  // 60 segundos para leer respuesta (uploads pueden ser lentos)
                .setConnectionRequestTimeout(5000) // 5 segundos para obtener conexión del pool
                .build();
        
        // Crear cliente HTTP reutilizable
        this.httpClient = HttpClients.custom()
                .setConnectionManager(connectionManager)
                .setDefaultRequestConfig(requestConfig)
                .setKeepAliveStrategy((response, context) -> 30 * 1000) // Keep-alive 30 segundos
                .build();
        
        logger.info("HttpClient inicializado con pool de conexiones: maxTotal=200, maxPerRoute=50");
    }
    
    private String obtenerJsonString(JSONObject jsonObj, String nombreCampo)
    {
        if (jsonObj.has(nombreCampo) && !jsonObj.isNull(nombreCampo)) {
            return jsonObj.getString(nombreCampo);
        }
        return "";
    }
    private int obtenerJsonInt(JSONObject jsonObj, String nombreCampo)
    {
        if (jsonObj.has(nombreCampo) && !jsonObj.isNull(nombreCampo)) {
            Object obj = jsonObj.get(nombreCampo);
            if(obj != null && (obj instanceof Integer || obj.toString().matches("\\d+"))){ //matches("[0-9]+")
                return jsonObj.getInt(nombreCampo);
            }
        }
        return 0;
    }
    
    private long obtenerJsonLong(JSONObject jsonObj, String nombreCampo)
    {
        if (jsonObj.has(nombreCampo) && !jsonObj.isNull(nombreCampo)) {
            Object obj = jsonObj.get(nombreCampo);
            if(obj != null && (obj instanceof Integer || obj.toString().matches("\\d+"))){
                return jsonObj.getLong(nombreCampo);
            }
        }
        return 0;
    }
    
    private static String leerArchivo(String nombreArchivo){
        
        StringBuilder contenido = new StringBuilder();
                
        if(FileControl.validateFile(nombreArchivo)){
            try(BufferedReader fileReader = new BufferedReader(new FileReader(nombreArchivo));){
                String linea;
                while ((linea = fileReader.readLine()) != null) {
                    contenido.append(linea).append("\n"); // Agregar cada línea al contenido
                }
            }
            catch (IOException e) {
                logger.error("Error in CsvFileReader", e);
            }
        }
        
        return contenido.toString();
    }
    
    private DocumentoElectoral obtenerTipoDocumentoDesdeJSON(JSONObject jsonTipoDoc){
        
        DocumentoElectoral tipoDocumento = new DocumentoElectoral();
        
        tipoDocumento.setIddoc(obtenerJsonInt(jsonTipoDoc,"id"));
        tipoDocumento.setDescDocumento(obtenerJsonString(jsonTipoDoc,"nombreDoc"));  
        tipoDocumento.setDescDocCorto(obtenerJsonString(jsonTipoDoc,"descCorta"));
        tipoDocumento.setHabilitado(obtenerJsonInt(jsonTipoDoc,"activo"));

        tipoDocumento.setTipoImagen(obtenerJsonInt(jsonTipoDoc,"tipoImagen"));
        tipoDocumento.setScanBothPages(obtenerJsonInt(jsonTipoDoc,"escanerAmbasCaras"));
        tipoDocumento.setSizeHojaSel(obtenerJsonInt(jsonTipoDoc,"tamanioHoja"));
        tipoDocumento.setImgfileMultiPage(obtenerJsonInt(jsonTipoDoc,"multipagina"));

        tipoDocumento.setCbOrienta(obtenerJsonInt(jsonTipoDoc,"codBarOrientacion"));
        tipoDocumento.setCbLeft(obtenerJsonInt(jsonTipoDoc,"codBarLeft"));
        tipoDocumento.setCbTop(obtenerJsonInt(jsonTipoDoc,"codBarTop"));
        tipoDocumento.setCbWidth(obtenerJsonInt(jsonTipoDoc,"codBarWidth"));
        tipoDocumento.setCbHeight(obtenerJsonInt(jsonTipoDoc,"codBarHeight"));
        
        return tipoDocumento;
    }
    
    private List<DocumentoElectoral> generarListaTipoDocumentos(String responseBody)
    {
        List<DocumentoElectoral> listaTipoDocumentos = new ArrayList<>();
                
        try {
            JSONObject jsonObject = new JSONObject(responseBody);

            JSONArray jsonDataArray = jsonObject.getJSONArray("data");
            
            for (int d = 0; d < jsonDataArray.length(); d++){
                JSONObject jsonTipoDoc = jsonDataArray.getJSONObject(d);
                
                DocumentoElectoral tipoDocumento = obtenerTipoDocumentoDesdeJSON(jsonTipoDoc);
                
                listaTipoDocumentos.add(tipoDocumento);
            }
        }catch (JSONException e) {
            logger.error("Error en obtener lista tipo documento simple", e);
        }
        
        return listaTipoDocumentos;
    }
    

    private <T> List<T> procesarGetResponseConModoSinConexion(
            String archivoJson,
            String endpoint, 
            String bearerToken, 
            java.util.function.Function<String, List<T>> generadorLista) {
        
        List<T> lista = new ArrayList<>();
        
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            String fileJson = System.getenv(ConstantDigitalizacion.VARENV_PATH_PROGRAMDATA)+File.separator+ConstantDigitalizacion.NOMBRE_SISTEMA+File.separator+archivoJson;
            String responseBody = leerArchivo(fileJson);
            if(!responseBody.isEmpty()){
                lista = generadorLista.apply(responseBody);
            }
        }
        else{
            lista = procesarGetResponseConLista(endpoint, bearerToken, generadorLista);
        }
        
        return lista;
    }

    @Override
    public List<DocumentoElectoral> obtenerTiposDocumento(String bearerToken) {
        return procesarGetResponseConModoSinConexion(
            "tipodoc_simple.json",
            "/admin-documento-electoral/lista-documentos-principales",
            bearerToken,
            this::generarListaTipoDocumentos
        );
    }
    
    @Override
    public List<Documentos> obtenerDocumentos(String bearerToken) {
        return procesarGetResponseConModoSinConexion(
            "tipodoc.json",
            "/admin-documento-electoral",
            bearerToken,
            this::generarListaDocumentos
        );
    }
    
    @Override
    public List<Eleccion> obtenerListaElecciones(String bearerToken){
        return procesarGetResponseConModoSinConexion(
            "elecciones.json",
            "/proceso/elecciones",
            bearerToken,
            this::generarListaElecciones
        );
    }
    
    private List<Documentos> generarListaDocumentos(String responseBody)
    {
        List<Documentos> listaDocumentos = new ArrayList<>();
        
        try{
            JSONObject jsonObject = new JSONObject(responseBody);
            JSONArray jsonDataArray = jsonObject.getJSONArray("data");
            
            for (int i = 0; i < jsonDataArray.length(); i++)
            {
                JSONObject jsonData = jsonDataArray.getJSONObject(i);

                int visible = obtenerJsonInt(jsonData,"visible");

                if(visible==1)
                {
                    Documentos documento = new Documentos();
                    List<DocumentoElectoral> listaTipoDocumentos = new ArrayList<>();

                    documento.setNombreDocumento(jsonData.getString("nombreDoc"));   
                    documento.setVisible(visible);

                    JSONArray jsonDocArray = jsonData.getJSONArray("documentos");

                    for (int d = 0; d < jsonDocArray.length(); d++){
                        JSONObject jsonTipoDoc = jsonDocArray.getJSONObject(d);
                        
                        DocumentoElectoral tipoDocumento = obtenerTipoDocumentoDesdeJSON(jsonTipoDoc);
                        
                        listaTipoDocumentos.add(tipoDocumento);
                    }

                    documento.setTipoDocumento(listaTipoDocumentos);

                    listaDocumentos.add(documento);
                }
            }
        }catch (JSONException e) {
            logger.error("Error en obtener lista documentos principal", e);
        }
        
        return listaDocumentos;
    }
    

    private HttpGet crearHttpGet(String nameService, String bearerToken) {
        String strUrl = apiUrlBase + nameService;
        HttpGet httpGet = new HttpGet(strUrl);

        // ← SOLO agregar header si hay token
        if(bearerToken != null && !bearerToken.isEmpty()){
            httpGet.setHeader(ConstantDigitalizacion.HEADER_AUTHORIZATION, ConstantDigitalizacion.TOKEN_PREFIX_BEARER + bearerToken);
        }
        
        // Agregar header de sesión UUID
        if(ConstantDigitalizacion.getUuidSesion() != null && !ConstantDigitalizacion.getUuidSesion().isEmpty()){
            httpGet.setHeader(ConstantDigitalizacion.HEADER_ID_SESION, ConstantDigitalizacion.getUuidSesion());
        }
        
        return httpGet;
    }

    private String obtenerGetResponseBody(String nameService, String bearerToken){
        
        HttpGet httpGet = crearHttpGet(nameService, bearerToken);
        
        try {
            org.apache.http.HttpResponse response = httpClient.execute(httpGet);
            
            if(response != null && response.getStatusLine().getStatusCode() == 200){
                return EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
            }
        } catch (IOException | ParseException e) {
            logger.error(MSG_ERROR_REQHTTP, e);
        }
        return null;
    }
    
    
    @Override
    public List<RespRegActas> registrarActas(String strListaActas, String descDocCorto)
    {
        //NO USADA ...
        List<RespRegActas> listaRespRegActas = new ArrayList<>();
        
        String strUrl = apiUrlBase + "/acta/updateActaInitialLoad/";
        
        JSONObject jsonObject = new JSONObject();
        
        String[] arrayActas = strListaActas.split(",");
        
        long lfecha = new Date().getTime();
        
        jsonObject.put("fecha", lfecha);
        jsonObject.put("documentoElectoral", descDocCorto);
        jsonObject.put("actaCopia", new JSONArray(arrayActas));
        
        Map<String, String> headers = new HashMap<>();
        headers.put(ConstantDigitalizacion.HEADER_CONTENT_TYPE, ConstantDigitalizacion.APPLICATION_JSON);
        
        HttpClient httpClient = HttpClient.newHttpClient();
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(strUrl))
                .POST(HttpRequest.BodyPublishers.ofString(jsonObject.toString()))
                .headers(headers.entrySet().stream()
                        .flatMap(entry -> entry.getValue() != null ? Stream.of(entry.getKey(), entry.getValue()) : Stream.empty())
                        .toArray(String[]::new))
                .build();
        
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            int statusCode = response.statusCode();
            
            if (statusCode == 200) {
                //no usado invalido
                String responseBody = response.body();
                RespRegActas reg = new RespRegActas();
                reg.setStrMensaje(responseBody);
                listaRespRegActas.add(reg);
            }
        } catch (IOException e) {
            logger.error(MSG_ERROR_REQHTTP, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error(MSG_ERROR_HILO, e);
        }
        
        return listaRespRegActas;
    }
    
    @Override
    public Login login(String username, String password){
        
        Login dataLogin = new Login();
        
        // Verificar login de administrador
        if(ConstantDigitalizacion.ADM_REF.equalsIgnoreCase(hashSHA256(username.toUpperCase()))) {
            return procesarLoginAdministrador(username, password, dataLogin);
        }
        
        // Verificar modo sin conexión
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            dataLogin.setMessage("El sistema está configurado sin conexión.");
            return dataLogin;
        }

        // Encriptar contraseña si es posible
        String passwordToSend = obtenerPasswordEncriptada(password, username);
        
        // Realizar login en el servidor
        return ejecutarLoginServidor(username, passwordToSend, dataLogin);
    }
    
    private Login procesarLoginAdministrador(String username, String password, Login dataLogin) {
        if(ConstantDigitalizacion.KADM_REF.equalsIgnoreCase(hashSHA256(password.toUpperCase()))) {
            dataLogin.setStatus(200);
            dataLogin.setNcc("ADMINISTRADOR");
            dataLogin.setUserName(username);
            dataLogin.setPer("PER_DIGI");
            dataLogin.setCcc("");
            dataLogin.setIss("");
            dataLogin.setApr("");
            dataLogin.setExePc(0);
            dataLogin.setExpToken(obtenerHoraExpiracion(ConstantDigitalizacion.MINUTOS_ACTIVO));
            GlobalDigitalizacion.setUsarSinConexion(ConstantDigitalizacion.ACCEP_SIN_CONEXION);
        } else {
            dataLogin.setMessage("Contraseña de administrador incorrecta");
        }
        return dataLogin;
    }
    
    private String obtenerPasswordEncriptada(String password, String username) {
        String clavePublica = obtenerClavePublica();
        if(clavePublica != null && !clavePublica.isEmpty()){
            String passwordEncriptada = encriptarConRSA(password, clavePublica);
            if(passwordEncriptada != null){
                logger.info("Contraseña encriptada con RSA para usuario: {}.",  username);
                return passwordEncriptada;
            }
            logger.warn("No se pudo encriptar contraseña, enviando sin encriptar");
        } else {
            logger.warn("No se pudo obtener clave pública, enviando contraseña sin encriptar");
        }
        return password;
    }
    
    private Login ejecutarLoginServidor(String username, String passwordToSend, Login dataLogin) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username", username);
        jsonObject.put("password", passwordToSend);
        
        HttpPost httpPost = crearHttpPostLogin(jsonObject);
        
        try {
            org.apache.http.HttpResponse response = httpClient.execute(httpPost);
            int statusCode = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
            
            if (statusCode == 200) {
                procesarRespuestaExitosa(responseBody, username, dataLogin, statusCode);
            } else {
                procesarRespuestaError(responseBody, dataLogin, statusCode);
            }
        }
        catch (JSONException e){
            logger.error(ConstantLogs.ERROR, e);
        }
        catch (IOException | ParseException e) {
            dataLogin.setMessage(e.toString());
            logger.error(MSG_ERROR_REQHTTP, e);
        }
        
        return dataLogin;
    }
    
    private HttpPost crearHttpPostLogin(JSONObject jsonObject) {
        String strUrl = apiUrlBase + "/api/auth/login";
        HttpPost httpPost = new HttpPost(strUrl);
        StringEntity entity = new StringEntity(jsonObject.toString(), "UTF-8");
        
        httpPost.setHeader(ConstantDigitalizacion.HEADER_CONTENT_TYPE, ConstantDigitalizacion.APPLICATION_JSON);
        UUID uuid = UUID.randomUUID();
        ConstantDigitalizacion.setUuidSesion(uuid.toString());
        httpPost.setHeader(ConstantDigitalizacion.HEADER_ID_SESION, ConstantDigitalizacion.getUuidSesion());
        httpPost.setEntity(entity);
        
        return httpPost;
    }
    
    private void procesarRespuestaExitosa(String responseBody, String username, Login dataLogin, int statusCode) {
        JSONObject jsonResponse = new JSONObject(responseBody);
        
        String token = obtenerJsonString(jsonResponse,"token");
        String refreshToken = obtenerJsonString(jsonResponse,"refreshToken");
        
        String strJsonToken = decodeJWT(token);
        JSONObject jsonToken = new JSONObject(strJsonToken);
        
        dataLogin.setStatus(statusCode);
        dataLogin.setToken(token);
        dataLogin.setRefreshToken(refreshToken);
        
        logger.info(token);
        
        poblarDatosLoginDesdeToken(jsonToken, dataLogin);
        
        if(!refreshToken.isEmpty()) {
            procesarRefreshToken(refreshToken, dataLogin);
        }
        
        dataLogin.setUserName(username);
    }
    
    private void poblarDatosLoginDesdeToken(JSONObject jsonToken, Login dataLogin) {
        dataLogin.setNcc(obtenerJsonString(jsonToken,"ncc"));
        dataLogin.setCcc(obtenerJsonString(jsonToken,"ccc"));
        dataLogin.setPer(obtenerJsonString(jsonToken,"per"));
        dataLogin.setIss(obtenerJsonString(jsonToken,"iss"));
        dataLogin.setIat(obtenerJsonLong(jsonToken,"iat"));
        dataLogin.setExp(obtenerJsonLong(jsonToken,"exp"));
        dataLogin.setApr(obtenerJsonString(jsonToken,"apr"));
        dataLogin.setExePc(obtenerJsonInt(jsonToken, "exepc"));
        dataLogin.setEcc(obtenerJsonInt(jsonToken, "ecc"));
        
        Date fechaExp = new Date(dataLogin.getExp()*1000);
        dataLogin.setExpToken(fechaExp);
    }
    
    private void procesarRefreshToken(String refreshToken, Login dataLogin) {
        String strJsonToken = decodeJWT(refreshToken);
        JSONObject jsonToken = new JSONObject(strJsonToken);
        long exp = obtenerJsonLong(jsonToken,"exp");
        Date fechaExp = new Date(exp*1000);
        dataLogin.setExpRefToken(fechaExp);
    }
    
    private void procesarRespuestaError(String responseBody, Login dataLogin, int statusCode) {
        dataLogin.setStatus(statusCode);
        JSONObject jsonResponse = new JSONObject(responseBody);
        dataLogin.setMessage(jsonResponse.getString(TEXT_MSG));
    }



    private String encriptarConRSA(String textoPlano, String clavePublicaPEM) {
        try {
            // Limpiar formato PEM
            String publicKeyPEM = clavePublicaPEM
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");

            // Decodificar Base64
            byte[] publicKeyBytes = Base64.getDecoder().decode(publicKeyPEM);

            // Crear clave pública
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PublicKey publicKey = keyFactory.generatePublic(keySpec);

            // Encriptar
            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] encryptedBytes = cipher.doFinal(textoPlano.getBytes(StandardCharsets.UTF_8));

            // Retornar en Base64
            return Base64.getEncoder().encodeToString(encryptedBytes);

        } catch (Exception e) {
            logger.error("Error encriptando con RSA", e);
            return null;
        }
    }

    @Override
    public String obtenerClavePublica() {
        String clavePublica = "";

        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            // En modo sin conexión, no hay encriptación
            return clavePublica;
        }

        String responseBody = obtenerGetResponseBody("/api/auth/public-key", null);

        if(responseBody != null){
            try {
                logger.debug("Respuesta del servicio de clave pública: {}", responseBody);
                
                JSONObject jsonResponse = new JSONObject(responseBody);
                clavePublica = obtenerJsonString(jsonResponse, "publicKey");
                
                if(clavePublica != null && !clavePublica.isEmpty()) {
                    logger.info("Clave pública RSA obtenida exitosamente");
                } else {
                    logger.warn("La clave pública está vacía en la respuesta");
                }
            } catch (JSONException e) {
                logger.error("Error al parsear JSON de clave pública", e);
            }
        } else {
            logger.error("No se recibió respuesta del servicio de clave pública");
        }

        return clavePublica;
    }


    private HttpPost crearHttpPostRefreshToken(String refToken) {
        String strUrl = apiUrlBase + "/usuario/refreshToken";
        
        HttpPost httpPost = new HttpPost(strUrl);
        httpPost.setHeader(HttpHeaders.AUTHORIZATION, ConstantDigitalizacion.TOKEN_PREFIX_BEARER + refToken);
        httpPost.setHeader(ConstantDigitalizacion.HEADER_CONTENT_TYPE, ConstantDigitalizacion.APPLICATION_JSON);
        
        // Agregar header de sesión UUID
        if(ConstantDigitalizacion.getUuidSesion() != null && !ConstantDigitalizacion.getUuidSesion().isEmpty()){
            httpPost.setHeader(ConstantDigitalizacion.HEADER_ID_SESION, ConstantDigitalizacion.getUuidSesion());
        }
        
        return httpPost;
    }

    @Override
    public Login refreshToken(String refToken){
        
        Login dataLogin = new Login();
        
        HttpPost httpPost = crearHttpPostRefreshToken(refToken);
        
        try {
            org.apache.http.HttpResponse response = httpClient.execute(httpPost);
            
            int statusCode = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
            
            if (statusCode == 200) {
                JSONObject jsonResponse = new JSONObject(responseBody);
                
                String message = obtenerJsonString(jsonResponse,TEXT_MSG);
                
                JSONObject jsonData = jsonResponse.getJSONObject("data");
                
                String token = obtenerJsonString(jsonData,"token");
                String refreshToken = obtenerJsonString(jsonData,"refreshToken");
                
                String strJsonToken = decodeJWT(token);
                
                JSONObject jsonToken = new JSONObject(strJsonToken);
                
                dataLogin.setToken(token);
                dataLogin.setRefreshToken(refreshToken);
                
                dataLogin.setNcc(obtenerJsonString(jsonToken,"ncc"));
                dataLogin.setCcc(obtenerJsonString(jsonToken,"ccc"));
                dataLogin.setPer(obtenerJsonString(jsonToken,"per"));
                dataLogin.setIss(obtenerJsonString(jsonToken,"iss"));
                dataLogin.setIat(obtenerJsonLong(jsonToken,"iat"));
                dataLogin.setExp(obtenerJsonLong(jsonToken,"exp"));
                dataLogin.setApr(obtenerJsonString(jsonToken,"apr"));
                
                Date fechaExp = new Date(dataLogin.getExp()*1000);
                dataLogin.setExpToken(fechaExp);
                
                if(!refreshToken.isEmpty())
                {
                    strJsonToken = decodeJWT(refreshToken);
                    jsonToken = new JSONObject(strJsonToken);
                    long exp = obtenerJsonLong(jsonToken,"exp");
                    fechaExp = new Date(exp*1000);
                    dataLogin.setExpRefToken(fechaExp);
                }
                
                dataLogin.setUserName(obtenerJsonString(jsonToken,"usr"));
                dataLogin.setStatus(statusCode);
                dataLogin.setMessage(message);
            } else {
                dataLogin.setStatus(statusCode);
                
                JSONObject jsonResponse = new JSONObject(responseBody);
                String message = obtenerJsonString(jsonResponse,TEXT_MSG);
                dataLogin.setMessage(message);
            }
        }
        catch (JSONException e){
            logger.error(ConstantLogs.ERROR, e);
        }
        catch (IOException | ParseException e) {
            dataLogin.setMessage(e.toString());
            logger.error(MSG_ERROR_REQHTTP, e);
        }
        return dataLogin;
    }
    
    private String decodeJWT(String jwtToken)
    {
        String[] splitString = jwtToken.split("\\.");
        
        String base64EncodedBody = splitString[1];
                
        return new String(Base64.getUrlDecoder().decode(base64EncodedBody), StandardCharsets.UTF_8);
    }
    
    @Override
    public HttpResp cerrarSesion(String username, String bearerToken){
                
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            return new HttpResp(true, 0, "Sesión sin conexión");
        }
        else{
            String strUrl = "/usuario/cerrar-sesion";
            strUrl = strUrl+"?usuario="+username;
            
            return enviarHttpPost(strUrl, bearerToken, null);
        }
    }
    
    private HttpResp enviarHttpPost(String nombreServicio, String bearerToken, HttpEntity entity)
    {
        HttpResp httpResp = new HttpResp();
        
        String strUrl = apiUrlBase + nombreServicio;
        
        HttpPost httpPost = new HttpPost(strUrl);
        if(entity!=null){
            httpPost.setEntity(entity);
        }
        httpPost.setHeader(HttpHeaders.AUTHORIZATION, ConstantDigitalizacion.TOKEN_PREFIX_BEARER + bearerToken);
        
        // Agregar header de sesión UUID
        if(ConstantDigitalizacion.getUuidSesion() != null && !ConstantDigitalizacion.getUuidSesion().isEmpty()){
            httpPost.setHeader(ConstantDigitalizacion.HEADER_ID_SESION, ConstantDigitalizacion.getUuidSesion());
        }
        
        try {
            org.apache.http.HttpResponse response = httpClient.execute(httpPost);
            
            int statusCode = response.getStatusLine().getStatusCode();
            String responseBody = EntityUtils.toString(response.getEntity());
                        
            httpResp.setSuccess((statusCode >= 200 && statusCode <= 201));
            httpResp.setStatusCode(statusCode);
            
            JSONObject jsonResponse = new JSONObject(responseBody);
            httpResp.setMessage(obtenerJsonString(jsonResponse,TEXT_MSG));
        }
        catch (JSONException e){
            return new HttpResp(false, 0, e.toString());
        }
        catch (IOException | ParseException e) {
            logger.error(ConstantLogs.ERROR, e);
            return new HttpResp(false, 0, e.toString());
        }
        
        return httpResp;
    }
    
    private HttpResp validarArchivoExiste(File file) {
        if(!file.exists()){
            return new HttpResp(false, 0, ConstantDigitalizacion.MSG_FILE_NOTFOUND+file.getName());
        }
        return null;
    }
    
    private MultipartEntityBuilder crearMultipartBuilder(File file) {
        FileBody fileBody = new FileBody(file, ContentType.DEFAULT_BINARY);
        return MultipartEntityBuilder.create()
                .setMode(HttpMultipartMode.STRICT)
                .addPart(ConstantParamHttp.FILE, fileBody);
    }
    
    @Override
    public HttpResp uploadActasDigitalizadas(String fileNameImage, String strActaCopia, String abrevDocumento, String bearerToken){
        
        File file = new File(fileNameImage);
        HttpResp errorResp = validarArchivoExiste(file);
        if(errorResp != null) return errorResp;
        
        HttpEntity entity = crearMultipartBuilder(file)
                .addPart("code", crearStringBody(strActaCopia))
                .build();
        
        if( abrevDocumento.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)){
            return enviarHttpPost("/digitization/uploadActaDigitization", bearerToken, entity);
        }else if( abrevDocumento.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE)){
            return enviarHttpPost("/digitization/uploadActaCeleste", bearerToken, entity);
        } else {
            return enviarHttpPost("/digitization/uploadActaDigitization", bearerToken, entity);
        }
    }
    
    @Override
    public HttpResp uploadHojaAsistenciaMMyRelNoSort(String fileNameImage, String strActaCopia, String bearerToken){
        
        File file = new File(fileNameImage);
        HttpResp errorResp = validarArchivoExiste(file);
        if(errorResp != null) return errorResp;
        
        HttpEntity entity = crearMultipartBuilder(file)
                .addPart("mesa", crearStringBody(strActaCopia))
                .build();
        
        return enviarHttpPost("/digitization/uploadMiembrosDeMesa", bearerToken, entity);
    }
    
    private void agregarIdOpcional(MultipartEntityBuilder builder, long idDoc, String nombreParte) {
        if (idDoc != -1) {
            StringBody idBody = new StringBody(Long.toString(idDoc), ContentType.DEFAULT_TEXT);
            builder.addPart(nombreParte, idBody);
        }
    }
    
    private StringBody crearStringBody(String valor) {
        return new StringBody(valor, ContentType.DEFAULT_TEXT);
    }
    
    @Override
    public HttpResp uploadResolucion(long idDoc, String fileNameImage, String strNumeroResolucion, int numPaginas, String bearerToken) {
        
        File file = new File(fileNameImage);
        HttpResp errorResp = validarArchivoExiste(file);
        if(errorResp != null) return errorResp;
        
        MultipartEntityBuilder builder = crearMultipartBuilder(file)
                .addPart(ConstantParamHttp.NUMERO_RESOLUCION, crearStringBody(strNumeroResolucion))
                .addPart(ConstantParamHttp.NUMERO_PAGINAS, crearStringBody(Integer.toString(numPaginas)));

        agregarIdOpcional(builder, idDoc, "idResolucion");
        
        return enviarHttpPost("/resoluciones/uploadResolucionDigitalizada", bearerToken, builder.build());
    }
    
    @Override
    public HttpResp uploadOtrosDocumentos(long idDoc, String strTipoDoc, String fileNameImage, String strNumeroDocumento, int numPaginas, String bearerToken) {
        
        File file = new File(fileNameImage);
        HttpResp errorResp = validarArchivoExiste(file);
        if(errorResp != null) return errorResp;
        
        MultipartEntityBuilder builder = crearMultipartBuilder(file)
                .addPart(ConstantParamHttp.NUMERO_DOCUMENTO, crearStringBody(strNumeroDocumento))
                .addPart(ConstantParamHttp.ABREV_DOCUMENTO, crearStringBody(strTipoDoc))
                .addPart(ConstantParamHttp.NUMERO_PAGINAS, crearStringBody(Integer.toString(numPaginas)));

        agregarIdOpcional(builder, idDoc, ConstantParamHttp.ID_OTRO_DOCUMENTO);
        
        return enviarHttpPost("/otros-documentos/upload-digtal", bearerToken, builder.build());
    }
    
    @Override
    public HttpResp uploadListaElect(String numMesa, String zipFileName, String bearerToken){
        
        File file = new File(zipFileName);
        HttpResp errorResp = validarArchivoExiste(file);
        if(errorResp != null) return errorResp;
        
        HttpEntity entity = crearMultipartBuilder(file)
                .addPart("mesa", crearStringBody(numMesa))
                .build();
        
        return enviarHttpPost("/digitization/uploadListaElectores", bearerToken, entity);
    }
    
    private List<Eleccion> generarListaElecciones(String responseBody)
    {
        List<Eleccion> listaElecciones = new ArrayList<>();
        
        try {
            JSONObject jsonObject = new JSONObject(responseBody);
            
            JSONArray jsonDataArray = jsonObject.getJSONArray("data");
            
            for (int d = 0; d < jsonDataArray.length(); d++){
                JSONObject jsonEleccion = jsonDataArray.getJSONObject(d);
                
                Eleccion eleccion = new Eleccion();
                
                eleccion.setCodigo(obtenerJsonString(jsonEleccion,"codigo"));
                eleccion.setNombre(obtenerJsonString(jsonEleccion,"nombre"));
                eleccion.setRangoInicial(obtenerJsonInt(jsonEleccion,"rangoInicial"));
                eleccion.setRangoFinal(obtenerJsonInt(jsonEleccion,"rangoFinal"));
                eleccion.setDigCheqAE(obtenerJsonString(jsonEleccion,"digitoChequeoAE"));
                eleccion.setDigCheqAIS(obtenerJsonString(jsonEleccion,"digitoChequeoAIS"));
                eleccion.setDigCheqError(obtenerJsonString(jsonEleccion,"digitoCequeoError"));
                
                listaElecciones.add(eleccion);
            }
        }
        catch (JSONException e) {
            logger.error("Error en obtener lista de elecciones", e);
        }
        
        return listaElecciones;
    }
    
    
    private List<ResolucionDigital> generarListaResolucionesDigital(String responseBody)
    {
        List<ResolucionDigital> listaResoluciones = new ArrayList<>();
        
        try {
            JSONArray jsonDataArray = new JSONArray(responseBody);
            
            for (int d = 0; d < jsonDataArray.length(); d++){
                JSONObject jsonResol = jsonDataArray.getJSONObject(d);
                ResolucionDigital resolucion = new ResolucionDigital();
                
                resolucion.setId(obtenerJsonLong(jsonResol, "id"));
                resolucion.setIdArchivo(obtenerJsonLong(jsonResol, "idArchivo"));
                resolucion.setNombreArchivo(obtenerJsonString(jsonResol, "nombreArchivo"));
                resolucion.setNumeroResolucion(obtenerJsonString(jsonResol, ConstantParamHttp.NUMERO_RESOLUCION));
                resolucion.setFechaRegistro(obtenerJsonLong(jsonResol, "fechaRegistro"));
                resolucion.setNumeroPaginas(obtenerJsonInt(jsonResol, ConstantParamHttp.NUMERO_PAGINAS));
                resolucion.setEstadoDigitalizacion(obtenerJsonString(jsonResol, ConstantParamHttp.ESTADO_DIGITALIZACION));
                
                listaResoluciones.add(resolucion);
            }
        }
        catch (JSONException e) {
            logger.error(ConstantLogs.ERROR, e);
        }
        
        return listaResoluciones;
    }
    
    private List<ResolucionDigital> generarListaOtrosDocumentosDigital(String responseBody)
    {
        List<ResolucionDigital> listaResoluciones = new ArrayList<>();
        
        try {
            JSONArray jsonDataArray = new JSONArray(responseBody);
            
            for (int d = 0; d < jsonDataArray.length(); d++){
                JSONObject jsonResol = jsonDataArray.getJSONObject(d);
                ResolucionDigital resolucion = new ResolucionDigital();
                resolucion.setId(obtenerJsonLong(jsonResol, ConstantParamHttp.ID_OTRO_DOCUMENTO));
                resolucion.setIdArchivo(obtenerJsonLong(jsonResol, "idArchivo"));
                resolucion.setNombreArchivo(obtenerJsonString(jsonResol, "nombreArchivo"));
                resolucion.setNumeroResolucion(obtenerJsonString(jsonResol, ConstantParamHttp.NUMERO_DOCUMENTO));
                resolucion.setFechaRegistro(obtenerJsonLong(jsonResol, "fechaSceScanner"));
                resolucion.setNumeroPaginas(obtenerJsonInt(jsonResol, ConstantParamHttp.NUMERO_PAGINAS));
                resolucion.setEstadoDigitalizacion(obtenerJsonString(jsonResol, ConstantParamHttp.ESTADO_DIGITALIZACION));
                listaResoluciones.add(resolucion);
            }
        }
        catch (JSONException e) {
            logger.error(ConstantLogs.ERROR, e);
        }
        
        return listaResoluciones;
    }
    
    
    private List<ResolucionDigital> generarListaLeMmDigital(String responseBody) {
        List<ResolucionDigital> listaResoluciones = new ArrayList<>();
        
        try {
            JSONArray jsonDataArray = new JSONArray(responseBody);
            
            for (int d = 0; d < jsonDataArray.length(); d++) {
                JSONObject jsonResol = jsonDataArray.getJSONObject(d);
                ResolucionDigital resolucion = new ResolucionDigital();
                resolucion.setId(obtenerJsonLong(jsonResol, ConstantParamHttp.ID_OTRO_DOCUMENTO));
                resolucion.setNumeroResolucion(obtenerJsonString(jsonResol, ConstantParamHttp.NUMERO_DOCUMENTO));
                resolucion.setEstadoDigitalizacion(obtenerJsonString(jsonResol, ConstantParamHttp.ESTADO_DIGITALIZACION));
                resolucion.setEstadoDocumento(obtenerJsonString(jsonResol, "estadoDocumento"));
                resolucion.setFechaRegistro(obtenerJsonLong(jsonResol, "fechaSceScanner"));
                listaResoluciones.add(resolucion);
            }
        }
        catch (JSONException e) {
            logger.error(ConstantLogs.ERROR, e);
        }
        
        return listaResoluciones;
    }
    
    
    private List<ActaScanDto> generarListaActasDigitalizadas(String responseBody) {
        List<ActaScanDto> lista = new ArrayList<>();
        
        try {
            JSONArray jsonDataArray = new JSONArray(responseBody);
            
            for (int d = 0; d < jsonDataArray.length(); d++){
                JSONObject jsonResol = jsonDataArray.getJSONObject(d);
                ActaScanDto actaScanDto = new ActaScanDto();
                actaScanDto.setIdActa(obtenerJsonLong(jsonResol, "idActa"));
                actaScanDto.setNombreEleccion(obtenerJsonString(jsonResol, "nombreEleccion"));
                actaScanDto.setCodigoEleccion(obtenerJsonString(jsonResol, "codigoEleccion"));
                actaScanDto.setMesa(obtenerJsonString(jsonResol, "mesa"));
                actaScanDto.setCopia(obtenerJsonString(jsonResol, "copia"));
                actaScanDto.setDigitoChequeoEscrutinio(obtenerJsonString(jsonResol, "digitoChequeoEscrutinio"));
                actaScanDto.setEstadoActa(obtenerJsonString(jsonResol, "estadoActa"));
                actaScanDto.setEstadoComputo(obtenerJsonString(jsonResol, "estadoComputo"));
                actaScanDto.setEstadoDigitalizacion(obtenerJsonString(jsonResol, ConstantParamHttp.ESTADO_DIGITALIZACION));
                actaScanDto.setArchivoEscrutinio(obtenerJsonString(jsonResol, "archivoEscrutinio"));
                actaScanDto.setArchivoInstalacion(obtenerJsonString(jsonResol, "archivoInstalacion"));
                actaScanDto.setArchivoSufragio(obtenerJsonString(jsonResol, "archivoSufragio"));
                actaScanDto.setArchivoInstalacionSufragio(obtenerJsonString(jsonResol, "archivoInstalacionSufragio"));
                actaScanDto.setActivo(obtenerJsonInt(jsonResol, "activo"));
                actaScanDto.setSolucionTecnologica(obtenerJsonLong(jsonResol, "solucionTecnologica"));
                actaScanDto.setTipoTransmision(obtenerJsonInt(jsonResol, "tipoTransmision"));
                actaScanDto.setFechaModificacion(obtenerJsonLong(jsonResol, "fechaModificacion"));
                
                
                if((ConstantDigitalizacion.ESTADO_ACTA_SINIESTRADA.equals(actaScanDto.getEstadoActa())) ||
                        (ConstantDigitalizacion.ESTADO_ACTA_EXTRAVIADA.equals(actaScanDto.getEstadoActa())) ||
                        (ConstantDigitalizacion.ESTADO_ACTA_MESA_NO_INSTALADA.equals(actaScanDto.getEstadoActa()) && 
                        ConstantDigitalizacion.ESTADO_COMPUTO_ACTA_CONTABILIZADA.equals(actaScanDto.getEstadoComputo()))){
                    
                    actaScanDto.setEstadoDigitalizacion(ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA);
                }
                

                lista.add(actaScanDto);
            }
        }catch (JSONException e) {
            logger.error(ConstantLogs.ERROR, e);
        }
        
        return lista;
    }
    
    private <T> List<T> procesarGetResponseConLista(
            String endpoint, 
            String bearerToken, 
            java.util.function.Function<String, List<T>> generadorLista) {
        
        List<T> lista = new ArrayList<>();
        String responseBody = obtenerGetResponseBody(endpoint, bearerToken);
        
        if(responseBody != null){
            lista = generadorLista.apply(responseBody);
        }
        return lista;
    }
    
    @Override
    public List<ResolucionDigital> obtenerResolucionesDigitalizadas(String bearerToken){
        
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            return new ArrayList<>();
        }
        
        return procesarGetResponseConLista(
            "/resoluciones/total-digitalizadas", 
            bearerToken, 
            this::generarListaResolucionesDigital
        );
    }
    
    @Override
    public List<ResolucionDigital> obtenerOtrosDocumentosDigitalizados(String bearerToken){
        
        if(GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)){
            return new ArrayList<>();
        }
        
        return procesarGetResponseConLista(
            "/otros-documentos/total-digitalizadas", 
            bearerToken, 
            this::generarListaOtrosDocumentosDigital
        );
    }
    
    
    @Override
    public List<ActaScanDto> obtenerActasScaneadas(String bearerToken, String abrevDocumento, String codigoEleccion, String estado) {
        List<ActaScanDto> lista = new ArrayList<>();
        
        String url  = "";
        
        switch (abrevDocumento) {
            case ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL -> // Construir URL con parámetros
                url = String.format("/digitization/listActasSceScanner?codigoEleccion=%s&estadoDigitalizacion=%s",
                        codigoEleccion != null ? codigoEleccion : "",
                        estado != null ? estado : "");
            case ConstantDigitalizacion.ABREV_ACTA_CELESTE -> 
                url = String.format("/digitization/listActasCelesteSceScanner?codigoEleccion=%s&estadoDigitalizacion=%s",
                        codigoEleccion != null ? codigoEleccion : "",
                        estado != null ? estado : "");
            default -> {
                    return lista;
            }
        }
        
        String responseBody = obtenerGetResponseBody(url, bearerToken);
        
        if (responseBody != null) {
            lista = generarListaActasDigitalizadas(responseBody);
        }
        
        return lista;
    }
    
    @Override
    public HttpResp confirmarPuestaCero(String bearerToken) {
        
        return enviarHttpPost("/puesta-cero/confirm-from-cc", bearerToken, null);
    }

    @Override
    public String validarSesionActiva(String bearerToken) {

        HttpGet httpGet = crearHttpGet("/usuario/validar-sesion-activa", bearerToken);
        
        try {
            org.apache.http.HttpResponse response = httpClient.execute(httpGet);
            
            if(response != null){
                int statusCode = response.getStatusLine().getStatusCode();
                String body = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
                
                // Solo si es 200 intentamos interpretar el body
                if (statusCode == 200) {
                    boolean activo = Boolean.parseBoolean(body);
                    return activo ? "" : "La sesión no está activa o ha expirado. Inicie sesión nuevamente";
                } else {
                    return "La sesión no está activa o ha expirado. Inicie sesión nuevamente";
                }
            }
        } catch (IOException | ParseException e) {
            logger.error(MSG_ERROR_REQHTTP, e);
        } catch (Exception ex) {
            logger.error("Error procesando la respuesta del servidor", ex);
        }
        
        return "No se pudo conectar con el servidor.";
    }

    @Override
    public List<ResolucionDigital> obtenerLeDigitalizados(String bearerToken) {
        return procesarGetResponseConLista(
            "/mesa/list-le-scescanner", 
            bearerToken, 
            this::generarListaLeMmDigital
        );
    }

    @Override
    public List<ResolucionDigital> obtenerMmDigitalizados(String bearerToken) {
        return procesarGetResponseConLista(
            "/mesa/list-mm-scescanner", 
            bearerToken, 
            this::generarListaLeMmDigital
        );
    }
    
    /**
     * Cierra el cliente HTTP y libera recursos del pool de conexiones.
     * Debe ser llamado cuando el servicio ya no se vaya a usar.
     */
    public void close() {
        try {
            if (httpClient != null) {
                httpClient.close();
                logger.info("HttpClient cerrado correctamente");
            }
        } catch (IOException e) {
            logger.error("Error cerrando HttpClient", e);
        }
    }
    
}

