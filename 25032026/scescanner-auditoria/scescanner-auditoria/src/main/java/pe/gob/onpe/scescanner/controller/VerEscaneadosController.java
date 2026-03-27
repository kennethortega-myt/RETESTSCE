package pe.gob.onpe.scescanner.controller;

import javafx.application.Platform;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.concurrent.Task;
import javafx.concurrent.Worker;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.fxml.JavaFXBuilderFactory;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.ListCell;
import javafx.scene.control.TableCell;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.stage.WindowEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pe.gob.onpe.scescanner.common.constant.ConstantClasesCss;
import pe.gob.onpe.scescanner.common.constant.ConstantDigitalizacion;
import pe.gob.onpe.scescanner.common.constant.ConstantMensajes;
import pe.gob.onpe.scescanner.common.global.GlobalDigitalizacion;
import pe.gob.onpe.scescanner.common.util.FileControl;
import pe.gob.onpe.scescanner.common.util.Messages;
import pe.gob.onpe.scescanner.common.view.AppController;
import pe.gob.onpe.scescanner.domain.ActaScanDto;
import pe.gob.onpe.scescanner.domain.ActasDigitalEstado;
import pe.gob.onpe.scescanner.domain.DocumentoElectoral;
import pe.gob.onpe.scescanner.domain.Eleccion;
import pe.gob.onpe.scescanner.domain.EstadosDigitalizacion;
import pe.gob.onpe.scescanner.domain.HttpResp;
import pe.gob.onpe.scescanner.domain.Login;
import pe.gob.onpe.scescanner.domain.ResolucionDigital;
import pe.gob.onpe.scescanner.service.ISceService;
import pe.gob.onpe.scescanner.service.impl.SceServiceImpl;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.ResourceBundle;
import java.util.stream.Collectors;

import static pe.gob.onpe.scescanner.common.dll.SceOpt.escanearResoluciones;
import static pe.gob.onpe.scescanner.common.util.Utils.onActualizaNomFileImageActa;
import static pe.gob.onpe.scescanner.common.view.AppController.loadFXML;

public class VerEscaneadosController implements Initializable {

    /**
     * Initializes the controller class.
     */
    ISceService sceService;

    @FXML
    private AnchorPane anchorPaneButtons;

    @FXML
    private AnchorPane anchorFiltro;

    @FXML
    private ComboBox<Eleccion> cboEleccion;

    @FXML
    private ComboBox<EstadosDigitalizacion> cboEstadosDigitalizacion;

    @FXML
    private VBox menuVBox;

    @FXML
    private Label labelTituloDocumentos;

    @FXML
    private Label lblTotalDocs;

    @FXML
    private Label lblPendientes;
    @FXML
    private
    Label lblRechazadas;
    @FXML
    private
    Label lblAprobadas;
    @FXML
    private
    Label lblNoInstaladas;

    @FXML
    private Label lblDigitalizadas;

    @FXML
    private ImageView imgPendientes;
    @FXML
    private
    ImageView imgDigitalizadas;
    @FXML
    private
    ImageView imgRechazadas;
    @FXML
    private
    ImageView imgAprobadas;
    @FXML
    private
    ImageView imgNoInstaladas;

    private Scene scene;
    private Stage mainStage;

    private String strNameScanner;
    private String strValRetFromLib;
    private static final String MSG_ERROR_SCAN1 = "Error al ejecutar escaneo";

    private IMainController mainClassStage;

    private static final Logger logger = LoggerFactory.getLogger(VerEscaneadosController.class);

    private static final String FORMAT_FECHA = "dd/MM/yyyy";
    private static final String FORMAT_HORA = "HH:mm:ss";

    private record FechaFormateada(String fecha, String hora) {
    }
    
    private static FechaFormateada formatearFecha(long timestamp) {
        Date fecha = new Date(timestamp);
        SimpleDateFormat formatoFecha = new SimpleDateFormat(FORMAT_FECHA);
        SimpleDateFormat formatoHora = new SimpleDateFormat(FORMAT_HORA);
        
        String strFecha = formatoFecha.format(fecha);
        String strHora = formatoHora.format(fecha).toUpperCase();
        
        return new FechaFormateada(strFecha, strHora);
    }
    
    private ActasDigitalEstado crearActaDigitalBase(ResolucionDigital res, String strTipoActa) {
        FechaFormateada fechaFormateada = formatearFecha(res.getFechaRegistro());
        
        ActasDigitalEstado actasDigitalEstado = new ActasDigitalEstado();
        actasDigitalEstado.setId(res.getId());
        actasDigitalEstado.setStrActa(res.getNumeroResolucion());
        actasDigitalEstado.setStrFechaDigital(fechaFormateada.fecha());
        actasDigitalEstado.setStrHoraDigital(fechaFormateada.hora());
        actasDigitalEstado.setStrTipoActa(strTipoActa);
        actasDigitalEstado.setEstadoDigitalizacion(res.getEstadoDigitalizacion());
        
        return actasDigitalEstado;
    }

    @FXML
    Button btnCerrar;

    @FXML
    TableView<ActasDigitalEstado> tblActasDigital;

    ObservableList<ActasDigitalEstado> obsListActas;

    @FXML
    TableColumn<ActasDigitalEstado, String> colActa;

    @FXML
    TableColumn<ActasDigitalEstado, String> colEleccion;

    @FXML
    TableColumn<ActasDigitalEstado, String> colFecha;

    @FXML
    TableColumn<ActasDigitalEstado, String> colHora;

    @FXML
    TableColumn<ActasDigitalEstado, ActasDigitalEstado> colEstadoDigitalizacion;

    @FXML
    TableColumn<ActasDigitalEstado, ActasDigitalEstado> colAcciones;

    Image imgStatPlomo = loadImage("/pe/gob/onpe/scescanner/images/status_plomo.png");
    Image imgStatVerde = loadImage("/pe/gob/onpe/scescanner/images/status_verde.png");
    Image imgStatRojo = loadImage("/pe/gob/onpe/scescanner/images/status_rojo.png");
    Image imgStatCelesteClaro = loadImage("/pe/gob/onpe/scescanner/images/status_celeste_claro.png");
    Image imgStatNegro = loadImage("/pe/gob/onpe/scescanner/images/status_negro.png");

    Image imgEditarOff = loadImage("/pe/gob/onpe/scescanner/images/ico_editar_off.png");
    Image imgVerOn = loadImage("/pe/gob/onpe/scescanner/images/ico_ver.png");
    Image imgVerOff = loadImage("/pe/gob/onpe/scescanner/images/ico_ver_off.png");
    Image imgScannerOn = loadImage("/pe/gob/onpe/scescanner/images/ico_scanner.png");
    Image imgScannerOff = loadImage("/pe/gob/onpe/scescanner/images/ico_scanner_off.png");

    private DocumentoElectoral docElecSeleccionado;


    private List<Eleccion> listElecciones;

    private Login dataLogin;

    @Override
    public void initialize(URL url, ResourceBundle rb) {

        //Nombre del escaner
        sceService = new SceServiceImpl();

        strNameScanner = GlobalDigitalizacion.getNombreTwainEscaner();

        listElecciones = new ArrayList<>();

        docElecSeleccionado = null;
        iniciarTableView();
    }

    public void init() {
        this.scene = this.mainStage.getScene();
        this.sceService = new SceServiceImpl();

        createMenuItems();

        obsListActas.clear();
        listElecciones.clear();

        getEleccionesSce();
        cargarComboEstadosDigitalizacion();
        cargarComboEleccion();

        docElecSeleccionado = null;
        labelTituloDocumentos.setText("");
        lblTotalDocs.setText("");

        anchorFiltro.setVisible(false);
        tblActasDigital.setLayoutY(16);
        tblActasDigital.setPrefHeight(479);

    }

    private void cargarComboEleccion() {

        Eleccion seleccionar = new Eleccion();
        seleccionar.setCodigo("");
        seleccionar.setNombre(ConstantDigitalizacion.ITEM_TEXT_TODOS);

        List<Eleccion> documentosConSeleccionar = new ArrayList<>();
        documentosConSeleccionar.add(seleccionar);
        documentosConSeleccionar.addAll(listElecciones);

        cboEleccion.getItems().clear();
        cboEleccion.setItems(FXCollections.observableArrayList(documentosConSeleccionar));
        cboEleccion.setCellFactory(param -> crearEleccionListCell());
        cboEleccion.setButtonCell(crearEleccionListCell());
        
        Platform.runLater(() -> cboEleccion.getSelectionModel().selectFirst());
    }

    private ListCell<Eleccion> crearEleccionListCell() {
        return new ListCell<>() {
            @Override
            protected void updateItem(Eleccion item, boolean empty) {
                super.updateItem(item, empty);
                if (item == null || empty) {
                    setText(null);
                    setStyle("");
                } else {
                    setText(item.getNombre());
                    setStyle(getEstiloPorNombre(item.getNombre()));
                }
            }
        };
    }

    private void cargarComboEstadosDigitalizacion() {

        List<EstadosDigitalizacion> documentos = new ArrayList<>();

        EstadosDigitalizacion e1 = new EstadosDigitalizacion();
        e1.setCodigoEstado(ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA);
        e1.setNombre("APROBADAS");
        documentos.add(e1);

        EstadosDigitalizacion e2 = new EstadosDigitalizacion();
        e2.setCodigoEstado(ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA);
        e2.setNombre("RECHAZADAS");
        documentos.add(e2);

        EstadosDigitalizacion e3 = new EstadosDigitalizacion();
        e3.setCodigoEstado(ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA);
        e3.setNombre("DIGITALIZADAS");
        documentos.add(e3);

        EstadosDigitalizacion e4 = new EstadosDigitalizacion();
        e4.setCodigoEstado(ConstantDigitalizacion.ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION);
        e4.setNombre("PENDIENTES");
        documentos.add(e4);
        
        EstadosDigitalizacion e5 = new EstadosDigitalizacion();
        e5.setCodigoEstado(ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA);
        e5.setNombre("NO INSTALADAS / EXT / SINI");
        documentos.add(e5);

        EstadosDigitalizacion seleccionar = new EstadosDigitalizacion();
        seleccionar.setCodigoEstado("");
        seleccionar.setNombre(ConstantDigitalizacion.ITEM_TEXT_TODOS);

        List<EstadosDigitalizacion> documentosConSeleccionar = new ArrayList<>();
        documentosConSeleccionar.add(seleccionar);
        documentosConSeleccionar.addAll(documentos);

        cboEstadosDigitalizacion.getItems().clear();
        cboEstadosDigitalizacion.setItems(FXCollections.observableArrayList(documentosConSeleccionar));

        cboEstadosDigitalizacion.setCellFactory(param -> crearEstadosDigitalizacionListCell());
        cboEstadosDigitalizacion.setButtonCell(crearEstadosDigitalizacionListCell());

        cboEstadosDigitalizacion.getSelectionModel().select(0);
    }

    private ListCell<EstadosDigitalizacion> crearEstadosDigitalizacionListCell() {
        return new ListCell<>() {
            @Override
            protected void updateItem(EstadosDigitalizacion item, boolean empty) {
                super.updateItem(item, empty);
                if (item == null || empty) {
                    setText(null);
                    setStyle("");
                } else {
                    setText(item.getNombre());
                    setStyle(getEstiloPorNombre(item.getNombre()));
                }
            }
        };
    }

    private String getEstiloPorNombre(String nombre) {
        return ConstantDigitalizacion.ITEM_TEXT_TODOS.equals(nombre)
                ? "-fx-text-fill: gray; -fx-font-size: 15px;"
                : "-fx-text-fill: black;";
    }

    public void setEventHiden(EventHandler<ActionEvent> closeEvent) {
        this.btnCerrar.setOnAction(closeEvent);
    }

    public Parent getView() {
        return anchorPaneButtons;
    }

    public void updateListSelected() {
        if (this.docElecSeleccionado != null) {
            obsListActas.clear();
            tblActasDigital.getSortOrder().clear();
            listarDocumentosElectorales(this.docElecSeleccionado.getDescDocCorto());
        }
    }

    private void iniciarTableView() {

        colActa.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, String> p) -> new SimpleStringProperty(p.getValue().getStrActa()));

        colEleccion.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, String> p) -> new SimpleStringProperty(p.getValue().getNombreEleccion()));

        colFecha.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, String> p) -> new SimpleStringProperty(p.getValue().getStrFechaDigital()));
        colHora.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, String> p) -> new SimpleStringProperty(p.getValue().getStrHoraDigital()));

        colEstadoDigitalizacion.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, ActasDigitalEstado> p) -> new SimpleObjectProperty<>(p.getValue()));
        colEstadoDigitalizacion.setCellFactory(column -> new StatusTableCell());
        // Configurar comparador personalizado para ordenar por prioridad de estado
        colEstadoDigitalizacion.setComparator((acta1, acta2) -> {
            if (acta1 == null && acta2 == null) return 0;
            if (acta1 == null) return -1;
            if (acta2 == null) return 1;
            return Integer.compare(acta1.getPrioridadEstado(), acta2.getPrioridadEstado());
        });

        colAcciones.setCellValueFactory((TableColumn.CellDataFeatures<ActasDigitalEstado, ActasDigitalEstado> p) -> new SimpleObjectProperty<>(p.getValue()));
        colAcciones.setCellFactory(column -> new ButtonsTableCell(this));

        obsListActas = FXCollections.observableArrayList();
        tblActasDigital.setItems(obsListActas);
    }

    private void getEleccionesSce() {
        listElecciones = sceService.obtenerListaElecciones(this.dataLogin.getToken());
    }

    private boolean esActaAIS(String strNumActa) {
        boolean esAIS = false;
        String numActa = strNumActa.substring(0, 9);
        int rangoActa = Integer.parseInt(numActa.substring(6, 8));
        String digCheq = numActa.substring(8, 9);

        for (Eleccion eleccion : listElecciones) {
            if ((rangoActa >= eleccion.getRangoInicial())
                    && (rangoActa <= eleccion.getRangoFinal())) {
                if (digCheq.equals(eleccion.getDigCheqAIS())) {
                    esAIS = true;
                }
                break;
            }
        }
        return esAIS;
    }

    @FXML
    public void onBuscarActas() {
        Eleccion eleccionSeleccionada = cboEleccion.getSelectionModel().getSelectedItem();
        EstadosDigitalizacion estadoSeleccionado = cboEstadosDigitalizacion.getSelectionModel().getSelectedItem();
        
        if (eleccionSeleccionada == null || estadoSeleccionado == null) {
            return;
        }
        
        String codigoEleccion = eleccionSeleccionada.getCodigo();
        String codigoEstadoDigitalizacion = estadoSeleccionado.getCodigoEstado();
        int total = listarActasElectorales(codigoEleccion, codigoEstadoDigitalizacion, docElecSeleccionado.getDescDocCorto());
        lblTotalDocs.setText((total) + " Actas Electorales");
    }

    private int listarActasElectorales(String codigoEleccion, String estadoDigitalizacion, String abreviaturaDoc) {
        tblActasDigital.getSortOrder().clear();
        obsListActas.clear();

        String strFolder = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abreviaturaDoc).toString();
        List<ActaScanDto> actasScaneadas = sceService.obtenerActasScaneadas(dataLogin.getToken(), abreviaturaDoc, codigoEleccion, estadoDigitalizacion);

        SimpleDateFormat formatoFecha = new SimpleDateFormat(FORMAT_FECHA);
        SimpleDateFormat formatoHora = new SimpleDateFormat(FORMAT_HORA);

        // Contadores
        int contadorPendientes = 0;
        int contadorDigitalizadas = 0;
        int contadorAceptadas = 0;
        int contadorRechazadas = 0;
        int contadorNoinstaladas = 0;

        for (ActaScanDto res : actasScaneadas) {
            ActasDigitalEstado acta = crearActaDigitalEstado(res, strFolder, abreviaturaDoc, formatoFecha, formatoHora);
            obsListActas.add(acta);

            // Contar según estado digitalización
            String estado = acta.getEstadoDigitalizacion();
            if (esPendiente(estado)) {
                contadorPendientes++;
            } else if (esDigitalizada(estado)) {
                contadorDigitalizadas++;
            } else if (esActaAceptada(estado)) {
                contadorAceptadas++;
            } else if (esRechazada(estado)) {
                contadorRechazadas++;
            }else if (esNoinstaladaExtraviadaSiniestrada(estado)) {
                contadorNoinstaladas++;
            }
        }

        lblPendientes.setText(String.format(ConstantMensajes.TEXT_LABEL_PENDIENTE, contadorPendientes));
        lblAprobadas.setText(String.format(ConstantMensajes.TEXT_LABEL_ACEPTADAS, contadorAceptadas));
        lblRechazadas.setText(String.format(ConstantMensajes.TEXT_LABEL_RECHAZADAS, contadorRechazadas));
        lblDigitalizadas.setText(String.format(ConstantMensajes.TEXT_LABEL_DIGITALIZADAS, contadorDigitalizadas));
        lblNoInstaladas.setText(String.format("No Instaladas/Extr/Sin (%05d)", contadorNoinstaladas));
        // Log de contadores

        return actasScaneadas.size();
    }

    private boolean esPendiente(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_PARCIAL.equals(estado);
    }

    private boolean esDigitalizada(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA.equals(estado);
    }
    
    private boolean esActaAceptada(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_2DO_CONTROL_ACEPTADA.equals(estado)|| ConstantDigitalizacion.ESTADO_DIGTAL_REVISADA_1ER_CC_VISOR_ABIERTO.equals(estado);
    }

    private boolean esAceptada(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_ACEPTADA.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_APROBADA.equals(estado);
    }

    private boolean esRechazada(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_DENUN_RECHAZADO.equals(estado)
                || ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC.equals(estado);
    }
    
    private boolean esNoinstaladaExtraviadaSiniestrada(String estado) {
        return ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA.equals(estado);
    }

    // ... resto de métodos anteriores
    private ActasDigitalEstado crearActaDigitalEstado(ActaScanDto res, String strFolder, String abreviaturaDoc,
            SimpleDateFormat formatoFecha, SimpleDateFormat formatoHora) {
        Date fecha = new Date(res.getFechaModificacion());
        String strfecha = formatoFecha.format(fecha);
        String strhora = formatoHora.format(fecha).toUpperCase();

        ActasDigitalEstado acta = new ActasDigitalEstado();
        acta.setId(res.getIdActa());
        acta.setStrActa(res.getMesa() + res.getCopia() + res.getDigitoChequeoEscrutinio());
        acta.setStrFechaDigital(strfecha);
        acta.setStrHoraDigital(strhora);
        acta.setFullPathImagenes(strFolder);
        acta.setArchivoEscrutinio(reemplazarExtensionPdfATif(res.getArchivoEscrutinio()));
        acta.setArchivoInstalacion(reemplazarExtensionPdfATif(res.getArchivoInstalacion()));
        acta.setArchivoSufragio(reemplazarExtensionPdfATif(res.getArchivoSufragio()));
        acta.setArchivoInstalacionSufragio(reemplazarExtensionPdfATif(res.getArchivoInstalacionSufragio()));
        acta.setStrTipoActa(abreviaturaDoc);
        acta.setNombreEleccion(res.getNombreEleccion());
        acta.setNEstadoDigital(1);
        acta.setEstadoDigitalizacion(res.getEstadoDigitalizacion());
        acta.setSolucionTecnologica(res.getSolucionTecnologica());
        acta.setTipoTransmision(res.getTipoTransmision());

        // Aplicar lógica de estado según solución tecnológica
        aplicarLogicaEstadoDigitalizacion(acta);

        return acta;
    }

    private void aplicarLogicaEstadoDigitalizacion(ActasDigitalEstado acta) {
        if (acta.getSolucionTecnologica() == null) {
            return;
        }

        if ((esSolucionConvencionalOStae(acta.getSolucionTecnologica()) && esParcialConvencional(acta))
                || (Objects.equals(acta.getSolucionTecnologica(), ConstantDigitalizacion.SOLUCION_TECNOLOGICA_VOTO_DIGITAL) 
                    && esParcialVotoDigital(acta))) {
            acta.setEstadoDigitalizacion(ConstantDigitalizacion.ESTADO_DIGTAL_PARCIAL);
        }
    }

    private boolean esSolucionConvencionalOStae(Long solucionTecnologica) {
        return Objects.equals(solucionTecnologica, ConstantDigitalizacion.SOLUCION_TECNOLOGICA_CONVENCIONAL)
                || Objects.equals(solucionTecnologica, ConstantDigitalizacion.SOLUCION_TECNOLOGICA_STAE);
    }

    private boolean esParcialConvencional(ActasDigitalEstado acta) {
        boolean escrutinioVacio = esNullOVacio(acta.getArchivoEscrutinio());
        boolean instalacionSufragioVacio = esNullOVacio(acta.getArchivoInstalacionSufragio());

        return (!escrutinioVacio && instalacionSufragioVacio)
                || (escrutinioVacio && !instalacionSufragioVacio);
    }

    private boolean esParcialVotoDigital(ActasDigitalEstado acta) {
        int nullCount = 0;
        if (esNullOVacio(acta.getArchivoEscrutinio())) {
            nullCount++;
        }
        if (esNullOVacio(acta.getArchivoInstalacion())) {
            nullCount++;
        }
        if (esNullOVacio(acta.getArchivoSufragio())) {
            nullCount++;
        }

        // Si hay entre 1 y 2 nulls (parcial)
        return nullCount > 0 && nullCount < 3;
    }

    private boolean esNullOVacio(String archivo) {
        return archivo == null || archivo.trim().isEmpty();
    }

    private String reemplazarExtensionPdfATif(String nombreArchivo) {
        return nombreArchivo != null ? nombreArchivo.replaceAll("(?i)\\.pdf$", ".TIF") : "";
    }


    private int listarResolucionesFromService(String strTipoDoc) {

        String strFolder = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), strTipoDoc).toString();

        List<ResolucionDigital> resolucionesDigital;

        if (strTipoDoc.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {
            resolucionesDigital = sceService.obtenerOtrosDocumentosDigitalizados(dataLogin.getToken());
        } else {
            //se asume que son resoluciones
            resolucionesDigital = sceService.obtenerResolucionesDigitalizadas(dataLogin.getToken());
        }

        int nunResol = resolucionesDigital.size();

        int contadorPendientes = 0;
        int contadorDigitalizadas = 0;
        int contadorAceptadas = 0;
        int contadorRechazadas = 0;

        for (ResolucionDigital res : resolucionesDigital) {

            String strFileName = res.getNombreArchivo().replaceAll("(?i)\\.pdf$", ConstantDigitalizacion.EXTENSION_TIF);
            
            ActasDigitalEstado actasDigitalEstado = crearActaDigitalBase(res, strTipoDoc);
            actasDigitalEstado.setStrNomFile(strFolder + File.separator + strFileName);

            String estado = res.getEstadoDigitalizacion();

            if (esPendiente(estado)) {
                contadorPendientes++;
            } else if (esDigitalizada(estado)) {
                contadorDigitalizadas++;
            } else if (esAceptada(estado)) {
                contadorAceptadas++;
            } 

            lblPendientes.setText(String.format(ConstantMensajes.TEXT_LABEL_PENDIENTE, contadorPendientes));
            lblAprobadas.setText(String.format(ConstantMensajes.TEXT_LABEL_ACEPTADAS, contadorAceptadas));
            lblRechazadas.setText(String.format(ConstantMensajes.TEXT_LABEL_RECHAZADAS, contadorRechazadas));
            lblDigitalizadas.setText(String.format(ConstantMensajes.TEXT_LABEL_DIGITALIZADAS, contadorDigitalizadas));
            obsListActas.add(actasDigitalEstado);
        }

        logger.info("Lista de actas: {}", obsListActas);

        return nunResol;
    }
    
    
    
    private int listarListaElectoresFromService(String abrev) {

        List<ResolucionDigital> resolucionesDigital = new ArrayList<>();

        if(abrev.equalsIgnoreCase(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)){
            resolucionesDigital = sceService.obtenerLeDigitalizados(dataLogin.getToken());

        }else  if(abrev.equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)){
            resolucionesDigital = sceService.obtenerMmDigitalizados(dataLogin.getToken());
        }

        int nunResol = resolucionesDigital.size();

        int contadorPendientes = 0;
        int contadorDigitalizadas = 0;
        int contadorAceptadas = 0;
        int contadorRechazadas = 0;
        int contadorNoInstaladas = 0;

        for (ResolucionDigital res : resolucionesDigital) {
            String strFolder = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abrev, res.getNumeroResolucion()).toString();
            
            ActasDigitalEstado actasDigitalEstado = crearActaDigitalBase(res, abrev);
            actasDigitalEstado.setFullPathImagenes(strFolder);
            actasDigitalEstado.setStrNomFile(strFolder);
            actasDigitalEstado.setNEstadoDigital(1);
            actasDigitalEstado.setEstadoDocumento(res.getEstadoDocumento());

            if (esNoinstaladaLe(actasDigitalEstado)) {
                contadorNoInstaladas++;
            } else if (esPendienteLe(actasDigitalEstado)) {
                contadorPendientes++;
            } else if (esDigitalizadaLe(actasDigitalEstado)) {
                contadorDigitalizadas++;
            }else if (esRechazadaLe(actasDigitalEstado)) {
                contadorRechazadas++;
            } else if (esActaAceptadaLe(actasDigitalEstado)) {
                contadorAceptadas++;
            }

            lblPendientes.setText(String.format(ConstantMensajes.TEXT_LABEL_PENDIENTE, contadorPendientes));
            lblAprobadas.setText(String.format(ConstantMensajes.TEXT_LABEL_ACEPTADAS, contadorAceptadas));
            lblRechazadas.setText(String.format(ConstantMensajes.TEXT_LABEL_RECHAZADAS, contadorRechazadas));
            lblDigitalizadas.setText(String.format(ConstantMensajes.TEXT_LABEL_DIGITALIZADAS, contadorDigitalizadas));
            lblNoInstaladas.setText(String.format("No Instaladas (%05d)", contadorNoInstaladas));
            obsListActas.add(actasDigitalEstado);
        }
        logger.info("Lista de actas: {}", obsListActas);
        return nunResol;
    }


    private int listarMiembrosMesaFromService(String abrev) {

        List<ResolucionDigital> resolucionesDigital = obtenerResolucionesDigitalesPorTipo(abrev);
        int nunResol = resolucionesDigital.size();

        int[] contadores = new int[5]; // pendientes, digitalizadas, aceptadas, rechazadas, noInstaladas
        String strFolder = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg(), abrev).toString();
        Map<String, List<File>> archivosPorMesa = obtenerArchivosPorMesa(strFolder);

        for (ResolucionDigital res : resolucionesDigital) {
            ActasDigitalEstado actasDigitalEstado = crearActaDigitalDesdeResolucion(res, strFolder, abrev, archivosPorMesa);
            actualizarContadoresLe(actasDigitalEstado, contadores);
            actualizarLabelsContadoresLe(contadores);
            obsListActas.add(actasDigitalEstado);
        }
        
        return nunResol;
    }
    
    private List<ResolucionDigital> obtenerResolucionesDigitalesPorTipo(String abrev) {
        if (abrev.equalsIgnoreCase(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)) {
            return sceService.obtenerLeDigitalizados(dataLogin.getToken());
        } else if (abrev.equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
            return sceService.obtenerMmDigitalizados(dataLogin.getToken());
        }
        return new ArrayList<>();
    }
    
    private Map<String, List<File>> obtenerArchivosPorMesa(String strFolder) {
        final File folder = new File(strFolder);
        File[] filesArray = folder.listFiles((dir, name) -> name.toUpperCase().endsWith(".TIF"));
        
        if (filesArray == null || filesArray.length == 0) {
            return new HashMap<>();
        }
        
        return Arrays.stream(filesArray)
                .filter(File::isFile)
                .filter(file -> file.getName().length() == 13)
                .collect(Collectors.groupingBy(
                        file -> file.getName().toUpperCase().substring(0, 6)
                ));
    }
    
    private ActasDigitalEstado crearActaDigitalDesdeResolucion(ResolucionDigital res, String strFolder, String abrev, Map<String, List<File>> archivosPorMesa) {
        String strFileName = res.getNumeroResolucion();
        Date fecha = new Date(res.getFechaRegistro());
        SimpleDateFormat formato = new SimpleDateFormat(FORMAT_FECHA);
        String strfecha = formato.format(fecha);
        formato = new SimpleDateFormat(FORMAT_HORA);
        String strhora = formato.format(fecha).toUpperCase();

        ActasDigitalEstado actasDigitalEstado = new ActasDigitalEstado();
        actasDigitalEstado.setId(res.getId());
        actasDigitalEstado.setStrActa(res.getNumeroResolucion());
        actasDigitalEstado.setStrFechaDigital(strfecha);
        actasDigitalEstado.setFullPathImagenes(strFolder);
        actasDigitalEstado.setStrHoraDigital(strhora);
        actasDigitalEstado.setStrNomFile(strFolder + File.separator + strFileName);
        actasDigitalEstado.setStrTipoActa(abrev);
        actasDigitalEstado.setNEstadoDigital(1);
        actasDigitalEstado.setEstadoDigitalizacion(res.getEstadoDigitalizacion());
        actasDigitalEstado.setEstadoDocumento(res.getEstadoDocumento());

        asignarArchivosAActa(actasDigitalEstado, strFileName, archivosPorMesa);
        return actasDigitalEstado;
    }
    
    private void asignarArchivosAActa(ActasDigitalEstado actasDigitalEstado, String strFileName, Map<String, List<File>> archivosPorMesa) {
        List<File> archivos = archivosPorMesa.get(strFileName);
        if (archivos != null && !archivos.isEmpty()) {
            String primerArchivo = archivos.get(0).getName();
            String segundoArchivo = archivos.size() > 1 ? archivos.get(1).getName() : "";
            actasDigitalEstado.setArchivoEscrutinio(primerArchivo);
            actasDigitalEstado.setArchivoInstalacionSufragio(segundoArchivo);
        }
    }
    
    private void actualizarContadoresLe(ActasDigitalEstado actasDigitalEstado, int[] contadores) {
        if (esNoinstaladaLe(actasDigitalEstado)) {
            contadores[0]++;
        } else if (esPendienteLe(actasDigitalEstado)) {
            contadores[1]++;
        } else if (esDigitalizadaLe(actasDigitalEstado)) {
            contadores[2]++;
        } else if (esRechazadaLe(actasDigitalEstado)) {
            contadores[3]++;
        } else if (esActaAceptadaLe(actasDigitalEstado)) {
            contadores[4]++;
        }
    }
    
    private void actualizarLabelsContadoresLe(int[] contadores) {
        lblNoInstaladas.setText(String.format("No Instaladas (%05d)", contadores[0]));
        lblPendientes.setText(String.format(ConstantMensajes.TEXT_LABEL_PENDIENTE, contadores[1]));
        lblDigitalizadas.setText(String.format(ConstantMensajes.TEXT_LABEL_DIGITALIZADAS, contadores[2]));
        lblRechazadas.setText(String.format(ConstantMensajes.TEXT_LABEL_RECHAZADAS, contadores[3]));
        lblAprobadas.setText(String.format(ConstantMensajes.TEXT_LABEL_ACEPTADAS, contadores[4]));
    }


    private boolean esPendienteLe(ActasDigitalEstado actasDigitalEstado) {
        return ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_PENDIENTE.equals(actasDigitalEstado.getEstadoDigitalizacion());
    }

    private boolean esDigitalizadaLe(ActasDigitalEstado actasDigitalEstado) {
        return ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_DIGITALIZADA.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_DIGITALIZADA_PARCIALMENTE.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_PERDIDA_TOTAL.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_DIGITALIZADA_CON_PERDIDA_PARCIAL.equals(actasDigitalEstado.getEstadoDigitalizacion());
    }

    private boolean esActaAceptadaLe(ActasDigitalEstado actasDigitalEstado) {
        return ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_APROBADA_CON_PERDIDA_PARCIAL.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_APROBADA_COMPLETA.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_PROCESADO.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.MESA_REPROCESAR.equals(actasDigitalEstado.getEstadoDigitalizacion())
                || ConstantDigitalizacion.MESA_IS_EDIT.equals(actasDigitalEstado.getEstadoDigitalizacion());
    }

    private boolean esRechazadaLe(ActasDigitalEstado actasDigitalEstado) {
        return actasDigitalEstado.getEstadoDigitalizacion().equals(ConstantDigitalizacion.C_ESTADO_DIGTAL_MESA_RECHAZADA);
    }

    private boolean esNoinstaladaLe(ActasDigitalEstado actasDigitalEstado) {
        return ConstantDigitalizacion.MESA_NO_INSTALADA.equals(actasDigitalEstado.getEstadoDocumento());
    }

    private void createMenuItems() {

        List<DocumentoElectoral> tipoDocumento = sceService.obtenerTiposDocumento(this.dataLogin.getToken());

        if (!menuVBox.getChildren().isEmpty()) {
            menuVBox.getChildren().clear();
        }

        for (DocumentoElectoral docElec : tipoDocumento) {
            Button button = new Button(docElec.getDescDocumento());
            button.setId(docElec.getDescDocCorto());
            button.setUserData(docElec);
            button.setAlignment(Pos.CENTER_LEFT);
            button.getStyleClass().add("menu-button");
            button.setOnAction(e -> handleMenuItemAction(button));
            menuVBox.getChildren().add(button);

        }
    }

    private void handleMenuItemAction(Button selectedButton) {
        // Reiniciar el estilo de todos los botones
        for (Node button : menuVBox.getChildren()) {
            button.getStyleClass().remove("selected-menu-button");
        }
        // Aplicar estilo al botón seleccionado
        selectedButton.getStyleClass().add("selected-menu-button");

        String buttonText = selectedButton.getText();
        String buttonID = selectedButton.getId();
        docElecSeleccionado = (DocumentoElectoral) selectedButton.getUserData();
        labelTituloDocumentos.setText(buttonText);
        tblActasDigital.getSortOrder().clear();
        obsListActas.clear();

        lblPendientes.setText(String.format(ConstantMensajes.TEXT_LABEL_PENDIENTE, 0));
        lblAprobadas.setText(String.format(ConstantMensajes.TEXT_LABEL_ACEPTADAS, 0));
        lblRechazadas.setText(String.format(ConstantMensajes.TEXT_LABEL_RECHAZADAS, 0));
        lblDigitalizadas.setText(String.format(ConstantMensajes.TEXT_LABEL_DIGITALIZADAS, 0));
        lblNoInstaladas.setText(String.format("No Instaladas/Extr/Sin (%05d)", 0));

        listarDocumentosElectorales(buttonID);
    }

    private void listarDocumentosElectorales(String abrevDocElectoral) {
        mostrarTodosLosIndicadores();

        String mensaje = sceService.validarSesionActiva(this.dataLogin.getToken());
        if (!mensaje.isEmpty()) {
            mainClassStage.mostrarLoginTokenInvalido();
            return;
        }

        boolean isActa = esActaElectoral(abrevDocElectoral);
        colEleccion.setVisible(isActa);
        anchorFiltro.setVisible(false);

        if (GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)) {
            return;
        }

        listarDocumentosPorTipo(abrevDocElectoral, isActa);
    }
    
    private void mostrarTodosLosIndicadores() {
        lblAprobadas.setVisible(true);
        imgAprobadas.setVisible(true);
        lblDigitalizadas.setVisible(true);
        imgDigitalizadas.setVisible(true);
        lblPendientes.setVisible(true);
        imgPendientes.setVisible(true);
        lblRechazadas.setVisible(true);
        imgRechazadas.setVisible(true);
        lblNoInstaladas.setVisible(true);
        imgNoInstaladas.setVisible(true);
    }
    
    private void ocultarTodosLosIndicadores() {
        lblAprobadas.setVisible(false);
        imgAprobadas.setVisible(false);
        lblDigitalizadas.setVisible(false);
        imgDigitalizadas.setVisible(false);
        lblPendientes.setVisible(false);
        imgPendientes.setVisible(false);
        lblRechazadas.setVisible(false);
        imgRechazadas.setVisible(false);
        lblNoInstaladas.setVisible(false);
        imgNoInstaladas.setVisible(false);
    }
    
    private void configurarVisibilidadIndicadores(String abrevDocElectoral) {
        // Ocultar todos primero
        ocultarTodosLosIndicadores();
        
        // Para Resoluciones y Denuncias: solo mostrar Digitalizadas, Aprobadas y Rechazadas
        if (abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES) ||
            abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {
            lblDigitalizadas.setVisible(true);
            imgDigitalizadas.setVisible(true);
            lblAprobadas.setVisible(true);
            imgAprobadas.setVisible(true);
            lblRechazadas.setVisible(true);
            imgRechazadas.setVisible(true);
        } else {
            // Para otros documentos: mostrar todos los indicadores
            mostrarTodosLosIndicadores();
        }
    }
    
    private boolean esActaElectoral(String abrevDocElectoral) {
        return abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)
                || abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL)
                || abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO)
                || abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_ACTA_CELESTE);
    }
    
    private void listarDocumentosPorTipo(String abrevDocElectoral, boolean isActa) {
        // Configurar visibilidad de indicadores según el tipo de documento
        configurarVisibilidadIndicadores(abrevDocElectoral);
        
        if (abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES)) {
            int resol = listarResolucionesFromService(abrevDocElectoral);
            lblTotalDocs.setText(resol + " Resoluciones y/o Memorándums");
        } else if (abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {
            int resol = listarResolucionesFromService(abrevDocElectoral);
            lblTotalDocs.setText(resol + " Denuncias");
        } else if (abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)) {
            int resol = listarListaElectoresFromService(abrevDocElectoral);
            lblTotalDocs.setText(resol + " Mesas");
        } else if (abrevDocElectoral.equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
            int resol = listarMiembrosMesaFromService(abrevDocElectoral);
            lblTotalDocs.setText(resol + " Mesas");
        } else if (isActa) {
            listarActasElectoralesConFiltro(abrevDocElectoral);
        }
    }
    
    private void listarActasElectoralesConFiltro(String abrevDocElectoral) {
        anchorFiltro.setVisible(true);
        cboEleccion.getSelectionModel().selectFirst();
        cboEstadosDigitalizacion.getSelectionModel().selectFirst();
        int docEscaneados = listarActasElectorales("", "", abrevDocElectoral);
        lblTotalDocs.setText((docEscaneados) + " Actas Electorales");
    }

    private String copiarAImagenTemporal(String strPathNomFile, String numActa) {
        String strPathNomFileTmp = GlobalDigitalizacion.getFullRutaArchivosAppData() + File.separator + numActa + ".TIF";

        boolean bSuccess = FileControl.validateDir(GlobalDigitalizacion.getFullRutaArchivosAppData(), true);
        if (FileControl.validateFile(strPathNomFileTmp)) {
            FileControl.deleteChildren(strPathNomFileTmp);
        }
        if (bSuccess) {
            bSuccess = FileControl.fileCopyNIO(strPathNomFile, strPathNomFileTmp);
            if (bSuccess) {
                bSuccess = FileControl.validateFile(strPathNomFileTmp);
            }
        }
        if (!bSuccess) {
            return null;
        }

        return strPathNomFileTmp;
    }

    private boolean renombrarImagenActa(String strPathNomFile, DocumentoElectoral tipoDoc, String numActa, 
            StringBuilder sbNomFileActa, StringBuilder sbPathNomFile, StringBuilder sbNumActa, StringBuilder sbCodTipoElec) {

        String strPathNomFileTmp = copiarAImagenTemporal(strPathNomFile, numActa);

        if (strPathNomFileTmp == null) {
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "Se produjo un error al generar imagen temporal.");
            return false;
        }

        String descDocCorto = determinarTipoActa(tipoDoc, numActa);
        String messageService = procesarUploadActa(strPathNomFileTmp, strPathNomFile, tipoDoc, numActa);
        
        FileControl.deleteChildren(strPathNomFileTmp);

        if (messageService == null) {
            return actualizarArchivoLocal(strPathNomFile, descDocCorto, numActa, sbNomFileActa, sbPathNomFile, sbNumActa, sbCodTipoElec);
        }

        AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, messageService);
        return false;
    }
    
    private String determinarTipoActa(DocumentoElectoral tipoDoc, String numActa) {
        String descDocCorto = tipoDoc.getDescDocCorto();

        if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO)) {
            descDocCorto = esActaAIS(numActa) ? ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO : ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO;
            tipoDoc.setDescDocCorto(descDocCorto);
        } else if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO_CELESTE)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO_CELESTE)) {
            descDocCorto = esActaAIS(numActa) ? ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO_CELESTE : ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO_CELESTE;
            tipoDoc.setDescDocCorto(descDocCorto);
        }

        return descDocCorto;
    }
    
    private String procesarUploadActa(String strPathNomFileTmp, String strPathNomFile, DocumentoElectoral tipoDoc, String numActa) {
        if (GlobalDigitalizacion.getUsarSinConexion().equalsIgnoreCase(ConstantDigitalizacion.ACCEP_SIN_CONEXION)) {
            return null;
        }

        HttpResp httpResp = ejecutarUploadActa(strPathNomFileTmp, strPathNomFile, tipoDoc, numActa);
        
        if (httpResp == null || httpResp.isSuccess()) {
            return null;
        }

        return construirMensajeError(httpResp);
    }
    
    private HttpResp ejecutarUploadActa(String strPathNomFileTmp, String strPathNomFile, DocumentoElectoral tipoDoc, String numActa) {
        String descDocCorto = tipoDoc.getDescDocCorto();
        
        if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_STAE)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_ESCRUTINIO_CELESTE)
                || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.PREF_ACTA_INST_SUFRAGIO_CELESTE)) {
            return sceService.uploadActasDigitalizadas(strPathNomFileTmp, numActa, descDocCorto, this.dataLogin.getToken());
        } else if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA)) {
            return sceService.uploadHojaAsistenciaMMyRelNoSort(strPathNomFile, numActa, this.dataLogin.getToken());
        }
        
        return null;
    }
    
    private String construirMensajeError(HttpResp httpResp) {
        if (httpResp.getStatusCode() > 0) {
            return httpResp.getMessage().isEmpty() ? "" : httpResp.getMessage();
        }
        return httpResp.getMessage().isEmpty() ? null : httpResp.getMessage();
    }
    
    private boolean actualizarArchivoLocal(String strPathNomFile, String descDocCorto, String numActa,
            StringBuilder sbNomFileActa, StringBuilder sbPathNomFile, StringBuilder sbNumActa, StringBuilder sbCodTipoElec) {
        int actualiza = onActualizaNomFileImageActa(strPathNomFile, descDocCorto, numActa,
                sbNomFileActa, sbPathNomFile, sbNumActa, sbCodTipoElec);

        if (actualiza != 1) {
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING,
                    "La imagen fue guardada en base de datos pero no pudo se pudo actualizar en repositorio local.");
        }
        
        return true;
    }

    private void renombrarImagen(ActasDigitalEstado actaDigital) {  

        try {
            FXMLLoader fxmlLoader = loadFXML("RenombrarActas");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();

            RenombrarActasController renombrarActas = fxmlLoader.getController();
            configurarRenombrarActasController(renombrarActas);

            EventHandler<WindowEvent> eventHiden = event -> 
                procesarRenombramientoActa(actaDigital, renombrarActas);

            renombrarActas.setActasDigital(actaDigital);
            renombrarActas.setDocElectoral(this.docElecSeleccionado);
            renombrarActas.setEventHiden(eventHiden);
            renombrarActas.loadImage();
        } catch (IOException e) {
            logger.warn("Error loading image", e);
        }
    }
    
    private void configurarRenombrarActasController(RenombrarActasController renombrarActas) {
        renombrarActas.setMainStage(this.mainStage);
        renombrarActas.setStageParent(this.mainStage);
        renombrarActas.setMainClassStage(mainClassStage);
        renombrarActas.init();
    }
    
    private void procesarRenombramientoActa(ActasDigitalEstado actaDigital, RenombrarActasController renombrarActas) {
        if (renombrarActas.getNumActa() == null) {
            return;
        }

        StringBuilder sbNomFileActa = new StringBuilder();
        StringBuilder sbPathNomFile = new StringBuilder();
        StringBuilder sbNumActa = new StringBuilder();
        StringBuilder sbCodTipoElec = new StringBuilder();

        boolean bSuccess = renombrarImagenActa(actaDigital.getStrNomFile(), this.docElecSeleccionado, 
                renombrarActas.getNumActa(), sbNomFileActa, sbPathNomFile, sbNumActa, sbCodTipoElec);
        
        if (bSuccess) {
            actualizarActaDigitalDespuesRenombrar(actaDigital, sbNumActa, sbPathNomFile);
            AppController.handleMessageBoxModal(mainStage,
                    String.format("El acta %s se guardó correctamente", sbNumActa.toString()));
        }
    }
    
    private void actualizarActaDigitalDespuesRenombrar(ActasDigitalEstado actaDigital, 
            StringBuilder sbNumActa, StringBuilder sbPathNomFile) {
        if (actaDigital.getStrTipoActa().equalsIgnoreCase(this.docElecSeleccionado.getDescDocCorto())) {
            actaDigital.setStrActa(sbNumActa.toString());
            actaDigital.setStrActaCopia(sbNumActa.toString());
            actaDigital.setNEstadoDigital(1);
            actaDigital.setStrNomFile(sbPathNomFile.toString());
        } else {
            eliminarActaDeTabla();
        }
        tblActasDigital.refresh();
    }
    
    private void eliminarActaDeTabla() {
        int idx = tblActasDigital.getSelectionModel().getSelectedIndex();
        if (idx >= 0) {
            tblActasDigital.getItems().remove(idx);
        }
    }

    private void verImagen(ActasDigitalEstado actaDigital) {

        try {
            FXMLLoader fxmlLoader = loadFXML("VerImagen");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();

            VerImagenController verImagen = fxmlLoader.getController();
            verImagen.setStageParent(this.mainStage);
            verImagen.setActasDigital(actaDigital);
            verImagen.init();
        } catch (IOException e) {
            logger.warn("Error initializing image viewer", e);
        }
    }

    private void escanearImagen(ActasDigitalEstado actaDigital) {  

        try {
            FXMLLoader fxmlLoader = loadFXML("NombreDocAEscanear");
            fxmlLoader.setBuilderFactory(new JavaFXBuilderFactory());
            fxmlLoader.load();

            NombreDocAEscanearController nombreDocAEscanear = fxmlLoader.getController();
            nombreDocAEscanear.setMainStage(this.mainStage);
            nombreDocAEscanear.setStageParent(this.mainStage);
            nombreDocAEscanear.setMainClassStage(mainClassStage);
            nombreDocAEscanear.setActaDigtalEstado(actaDigital);

            EventHandler<WindowEvent> eventHiden = event -> {
                if (nombreDocAEscanear.getNameDocDigital() != null) {
                    onIniciarEscaneoDocumentos(docElecSeleccionado, nombreDocAEscanear.getNameDocDigital(), actaDigital.getId());
                }
            };

            nombreDocAEscanear.setNameDocDigital(actaDigital.getStrActa());
            nombreDocAEscanear.init();
            nombreDocAEscanear.setEventHiden(eventHiden);
        } catch (IOException e) {
            logger.warn("Error setting event handler", e);
        }
    }

    private Task<Integer> createTaskEscaneoDocumentos(DocumentoElectoral tipoDocumentoScan, String numeroDocumento) {
        return new Task<Integer>() {

            @Override
            protected Integer call() throws Exception {   

                String descDocCorto = tipoDocumentoScan.getDescDocCorto();

                int iTipoImgSel = tipoDocumentoScan.getTipoImagen();
                int tamanioHoja = tipoDocumentoScan.getSizeHojaSel();
                int iImgMultiPage = tipoDocumentoScan.getImgfileMultiPage();
                int iScanBothPages = tipoDocumentoScan.getScanBothPages();

                int iReturn = -17;

                //..Validando Directorios....
                boolean bSuccess = FileControl.validateDir(GlobalDigitalizacion.getFullRutaArchivosAppData(), true);
                if (bSuccess) {
                    String strPathFilesImgs = Paths.get(GlobalDigitalizacion.getRutaScanPrincipal(), GlobalDigitalizacion.getRutaArchivosImg()).toString();
                    bSuccess = FileControl.validateDir(strPathFilesImgs, true);
                    if (!bSuccess) {
                        strValRetFromLib = "Error:|Directorio no encontrado|" + strPathFilesImgs;
                        return 0;
                    }
                } else {
                    strValRetFromLib = "Error:|Directorio no encontrado|" + GlobalDigitalizacion.getFullRutaArchivosAppData();
                    return 0;
                }

                scene.setCursor(javafx.scene.Cursor.WAIT);

                if (descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_RESOLUCIONES)
                        || descDocCorto.equalsIgnoreCase(ConstantDigitalizacion.ABREV_DENUNCIAS)) {

                    String fileNumeroDocumento = numeroDocumento.replaceAll("[ /]+", "-");

                    strValRetFromLib = escanearResoluciones(0, GlobalDigitalizacion.getFullRutaArchivosAppData(), GlobalDigitalizacion.getRutaArchivosTemp(), strNameScanner,
                            iTipoImgSel, tamanioHoja, iImgMultiPage, iScanBothPages, 300, ConstantDigitalizacion.DIGTAL_DOC_PGNEW_FILE, 0,
                            0, 0, 0, 0, 0,
                            fileNumeroDocumento + ".TIF", numeroDocumento, GlobalDigitalizacion.getNomprocCorto(), GlobalDigitalizacion.getCentroComputo(), 0, 0);

                    iReturn = 1;
                }

                return iReturn;
            }
        };
    }

    public void onFinalizoGuardadoDocumento() {

        tblActasDigital.getSortOrder().clear();
        obsListActas.clear();
        listarResolucionesFromService(docElecSeleccionado.getDescDocCorto());
    }

    private void onIniciarEscaneoDocumentos(DocumentoElectoral docElectoral, String numeroDocumento, long idDoc) 
    {
        Task<Integer> task = createTaskEscaneoDocumentos(docElectoral, numeroDocumento);

        task.stateProperty().addListener(new ChangeListener<Worker.State>() {
            @Override
            public void changed(ObservableValue<? extends Worker.State> observableValue, Worker.State oldState, Worker.State newState) {
                if (newState == Worker.State.RUNNING) {
                    scene.setCursor(javafx.scene.Cursor.WAIT);
                }
                else if (newState == Worker.State.SUCCEEDED) {
                    procesarEscaneoDocumentosExitoso(task, docElectoral, numeroDocumento, idDoc);
                    finalizarEscaneoDocumentos();
                }
                else if (newState == Worker.State.FAILED) {
                    AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, MSG_ERROR_SCAN1);
                    finalizarEscaneoDocumentos();
                }
            }
        });

        scene.setCursor(javafx.scene.Cursor.WAIT);
        new Thread(task).start();
        desabilitarBotones(true);
        mainStage.requestFocus();
        scene.setCursor(javafx.scene.Cursor.WAIT);
    }
    
    private void procesarEscaneoDocumentosExitoso(Task<Integer> task, DocumentoElectoral docElectoral, String numeroDocumento, long idDoc) {
        Integer iTask = task.getValue();

        if (iTask != 1) {
            return;
        }

        scene.setCursor(javafx.scene.Cursor.DEFAULT);
        iTask = mainClassStage.onMostrarResolucionEscaneada(strValRetFromLib, docElectoral, numeroDocumento, idDoc);

        if (iTask == 0) {
            AppController.mostrarMensajeErrorDesdeLib(mainStage, strValRetFromLib, null);
        } else if (iTask == -136) {
            manejarErrorEscaneoDocumentos();
        } else if (iTask < 0) {
            AppController.mostrarMensajeError(mainStage, iTask, null);
        }
    }
    
    private void manejarErrorEscaneoDocumentos() {
        if (strValRetFromLib.isEmpty()) {
            AppController.mostrarMensajeError(mainStage, -136, null);
        } else {
            AppController.handleMessageBoxModal(mainStage, Messages.typeMessage.WARNING, strValRetFromLib);
        }
    }
    
    private void finalizarEscaneoDocumentos() {
        desabilitarBotones(false);
        scene.setCursor(javafx.scene.Cursor.DEFAULT);
    }

    private void desabilitarBotones(boolean bDisable) {
        btnCerrar.setDisable(bDisable);
        tblActasDigital.setDisable(bDisable);
        menuVBox.setDisable(bDisable);
    }

    public class StatusTableCell extends TableCell<ActasDigitalEstado, ActasDigitalEstado> {

        private final ImageView imageView = new ImageView();

        public StatusTableCell() {
            setGraphic(imageView);
            setGraphic(null); // Inicialmente, no mostrar ninguna imagen
            imageView.setFitWidth(24);
            imageView.setFitHeight(24);
        }

        @Override
        protected void updateItem(ActasDigitalEstado actasDigitalEstado, boolean empty) {
            super.updateItem(actasDigitalEstado, empty);

            if (empty || actasDigitalEstado == null) {
                setGraphic(null);
                return;
            }

            asignarImagenEstado(actasDigitalEstado);
            setGraphic(imageView);
        }
        
        private void asignarImagenEstado(ActasDigitalEstado actasDigitalEstado) {
            if (esListaElectorOHojaAsistencia(actasDigitalEstado)) {
                asignarImagenListaElectorOHojaAsistencia(actasDigitalEstado);
            } else {
                asignarImagenPorEstadoDigitalizacion(actasDigitalEstado.getEstadoDigitalizacion());
            }
        }
        
        private boolean esListaElectorOHojaAsistencia(ActasDigitalEstado actasDigitalEstado) {
            return actasDigitalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)
                    || actasDigitalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA);
        }
        
        private void asignarImagenListaElectorOHojaAsistencia(ActasDigitalEstado actasDigitalEstado) {
            if (esNoinstaladaLe(actasDigitalEstado)) {
                imageView.setImage(imgStatNegro);
            }else if (esPendienteLe(actasDigitalEstado)) {
                imageView.setImage(imgStatPlomo);
            } else if (esDigitalizadaLe(actasDigitalEstado)) {
                imageView.setImage(imgStatCelesteClaro);
            } else if (esRechazadaLe(actasDigitalEstado)) {
                imageView.setImage(imgStatRojo);
            } else if (esActaAceptadaLe(actasDigitalEstado)) {
                imageView.setImage(imgStatVerde);
            }
        }
        
        private void asignarImagenPorEstadoDigitalizacion(String estadoDigitalizacion) {
            switch (estadoDigitalizacion) {
                case ConstantDigitalizacion.ESTADO_DIGTAL_DIGITALIZADA ->
                    imageView.setImage(imgStatCelesteClaro);
                case ConstantDigitalizacion.ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION, 
                        ConstantDigitalizacion.ESTADO_DIGTAL_PARCIAL ->
                    imageView.setImage(imgStatPlomo);
                case ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA,
                    ConstantDigitalizacion.ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA,
                    ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC,
                    ConstantDigitalizacion.ESTADO_DIGTAL_DENUN_RECHAZADO ->
                    imageView.setImage(imgStatRojo);
                case ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA ->
                    imageView.setImage(imgStatNegro);
                default ->
                    imageView.setImage(imgStatVerde);
            }
        }
    }

    public class ButtonsTableCell extends TableCell<ActasDigitalEstado, ActasDigitalEstado> {

        final HBox buttonsContainer = new HBox();
        final Button cellButtonScan = new Button();
        final Button cellButtonEdit = new Button();
        final Button cellButtonVer = new Button();
        final VerEscaneadosController verEscanContol;

        public ButtonsTableCell(VerEscaneadosController verEscanContol) {
            buttonsContainer.setAlignment(Pos.CENTER_LEFT);
            buttonsContainer.setSpacing(10);
            buttonsContainer.getChildren().addAll(cellButtonScan, cellButtonEdit, cellButtonVer);

            cellButtonScan.setOnAction(e -> handleButtonScanAction());
            cellButtonEdit.setOnAction(e -> handleButtonEditAction());
            cellButtonVer.setOnAction(e -> handleButtonVerAction());

            cellButtonScan.setPrefSize(20, 20);
            cellButtonEdit.setPrefSize(20, 20);
            cellButtonVer.setPrefSize(20, 20);

            cellButtonScan.setStyle(ConstantClasesCss.BACKGROUND_COLOR_TRANSPAARENT);
            cellButtonEdit.setStyle(ConstantClasesCss.BACKGROUND_COLOR_TRANSPAARENT);
            cellButtonVer.setStyle(ConstantClasesCss.BACKGROUND_COLOR_TRANSPAARENT);

            this.verEscanContol = verEscanContol;
        }

        private void handleButtonScanAction() {

            String mensaje = sceService.validarSesionActiva(dataLogin.getToken());
            if (!mensaje.isEmpty()) {
                mainClassStage.mostrarLoginTokenInvalido();
                return;
            }

            getTableView().getSelectionModel().clearSelection();
            getTableView().getSelectionModel().select(getIndex());

            verEscanContol.escanearImagen(getTableRow().getItem());
        }

        private void handleButtonEditAction() {

            String mensaje = sceService.validarSesionActiva(dataLogin.getToken());
            if (!mensaje.isEmpty()) {
                mainClassStage.mostrarLoginTokenInvalido();
                return;
            }

            getTableView().getSelectionModel().clearSelection();
            getTableView().getSelectionModel().select(getIndex());

            verEscanContol.renombrarImagen(getTableRow().getItem());
        }

        private void handleButtonVerAction() {

            String mensaje = sceService.validarSesionActiva(dataLogin.getToken());
            if (!mensaje.isEmpty()) {
                mainClassStage.mostrarLoginTokenInvalido();
                return;
            }

            getTableView().getSelectionModel().clearSelection();
            getTableView().getSelectionModel().select(getIndex());

            verEscanContol.verImagen(getTableRow().getItem());
        }

        @Override
        protected void updateItem(ActasDigitalEstado actaDigtalEstado, boolean empty) {
            super.updateItem(actaDigtalEstado, empty);

            if (empty || actaDigtalEstado == null) {
                setGraphic(null);
                return;
            }

            configurarBotonesPorEstado(actaDigtalEstado);
            setGraphic(buttonsContainer);
        }
        
        private void configurarBotonesPorEstado(ActasDigitalEstado actaDigtalEstado) {
            if (esActaRechazada(actaDigtalEstado)) {
                configurarBotonesSoloVer();
            } else if (esListaElectorOHojaAsistencia(actaDigtalEstado)) {
                configurarBotonesListaElectorOHojaAsistencia(actaDigtalEstado);
            } else {
                configurarBotonesPorEstadoDigitalizacion(actaDigtalEstado.getEstadoDigitalizacion());
            }
        }
        
        private boolean esActaRechazada(ActasDigitalEstado actaDigtalEstado) {
            return esActaConvencional(actaDigtalEstado) && esEstadoRechazado(actaDigtalEstado.getEstadoDigitalizacion());
        }
        
        private boolean esActaConvencional(ActasDigitalEstado actaDigtalEstado) {
            String tipoActa = actaDigtalEstado.getStrTipoActa();
            return tipoActa.equals(ConstantDigitalizacion.ABREV_ACTA_CONVENCIONAL)
                    || tipoActa.equals(ConstantDigitalizacion.ABREV_ACTA_CELESTE)
                    || tipoActa.equals(ConstantDigitalizacion.ABREV_ACTA_EXTRANJERO)
                    || tipoActa.equals(ConstantDigitalizacion.ABREV_ACTA_VOTO_DIGITAL);
        }
        
        private boolean esEstadoRechazado(String estadoDigitalizacion) {
            return estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA)
                    || estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA)
                    || estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC)
                    || estadoDigitalizacion.equals(ConstantDigitalizacion.ESTADO_DIGTAL_DENUN_RECHAZADO);
        }
        
        private boolean esListaElectorOHojaAsistencia(ActasDigitalEstado actaDigtalEstado) {
            return actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_LISTA_ELECTORES)
                    || actaDigtalEstado.getStrTipoActa().equals(ConstantDigitalizacion.ABREV_HOJA_ASISTENCIA);
        }
        
        private void configurarBotonesSoloVer() {
            cellButtonScan.setGraphic(new ImageView(imgScannerOff));
            cellButtonEdit.setGraphic(new ImageView(imgEditarOff));
            cellButtonVer.setGraphic(new ImageView(imgVerOn));
            cellButtonScan.setDisable(true);
            cellButtonEdit.setDisable(true);
            cellButtonVer.setDisable(false);
        }
        
        private void configurarBotonesListaElectorOHojaAsistencia(ActasDigitalEstado actaDigtalEstado) {

            if(esNoinstaladaLe(actaDigtalEstado)) {
                configurarBotonesTodosDeshabilitados();
            } else if (esDigitalizadaLe(actaDigtalEstado) || esActaAceptadaLe(actaDigtalEstado)) {
                configurarBotonesSoloVer();
            } else {
                configurarBotonesTodosDeshabilitados();
            }
        }
        
        private void configurarBotonesTodosDeshabilitados() {
            cellButtonScan.setGraphic(new ImageView(imgScannerOff));
            cellButtonEdit.setGraphic(new ImageView(imgEditarOff));
            cellButtonVer.setGraphic(new ImageView(imgVerOff));
            cellButtonScan.setDisable(true);
            cellButtonEdit.setDisable(true);
            cellButtonVer.setDisable(true);
        }
        
        private void configurarBotonesPorEstadoDigitalizacion(String estadoDigitalizacion) {
            switch (estadoDigitalizacion) {
                case ConstantDigitalizacion.ESTADO_DIGTAL_PENDIENTE_DIGITALIZACION,
                     ConstantDigitalizacion.ESTADO_DIGTAL_NO_INSTALADA -> 
                    configurarBotonesTodosDeshabilitados();
                case ConstantDigitalizacion.ESTADO_DIGTAL_PARCIAL -> 
                    configurarBotonesSoloVer();
                case ConstantDigitalizacion.ESTADO_DIGTAL_1ER_CONTROL_RECHAZADA,
                    ConstantDigitalizacion.ESTADO_DIGTAL_1ERA_DIGITACION_RECHAZADA, 
                    ConstantDigitalizacion.ESTADO_DIGTAL_RESOL_RECHAZADO_2DO_CC, 
                    ConstantDigitalizacion.ESTADO_DIGTAL_DENUN_RECHAZADO -> 
                    configurarBotonesScanYVer();
                default -> 
                    configurarBotonesSoloVer();
            }
        }
        
        private void configurarBotonesScanYVer() {
            cellButtonScan.setGraphic(new ImageView(imgScannerOn));
            cellButtonEdit.setGraphic(new ImageView(imgEditarOff));
            cellButtonVer.setGraphic(new ImageView(imgVerOn));
            cellButtonScan.setDisable(false);
            cellButtonEdit.setDisable(true);
            cellButtonVer.setDisable(false);
        }
    }
    

    private Image loadImage(String resourcePath) {
        try {
            var stream = getClass().getResourceAsStream(resourcePath);
            if (stream == null) {
                logger.warn("No se pudo cargar la imagen: {}", resourcePath);
                return null;
            }
            return new Image(stream);
        } catch (Exception e) {
            logger.error("Error al cargar imagen: {}", resourcePath, e);
            return null;
        }
    }
    
    @FXML
    public void onCerrar() {
        logger.warn("cerrando ver escaneados");
    }
    
    public void setDataLogin(Login dataLogin) {
        this.dataLogin = dataLogin;
    }
    
    public void setMainStage(Stage mainStage) {
        this.mainStage = mainStage;
    }
    
    public void setMainClassStage(IMainController mainClassStage) {
        this.mainClassStage = mainClassStage;
    }

}



