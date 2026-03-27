/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package pe.gob.onpe.scescanner.common.util;

import java.util.ArrayList;
import java.util.List;

public class ListaMensajes {
    
    private ListaMensajes(){
        
    }
    
    public static class Mensajes {
        private final int codMensaje;
        private final String strMensaje;

        public Mensajes(int codMensaje, String strMensaje) {
            this.codMensaje = codMensaje;
            this.strMensaje = strMensaje;
        }
        
        public String getStrMensaje() {
            return strMensaje;
        }
    }
    
    public static class ListMensajes {
        private final List<Mensajes> listaMensaje;
        
        public ListMensajes() {
            listaMensaje = new ArrayList<>();
            
            //Con Correcciones ortograficas
            listaMensaje.add(new Mensajes(-1,  "Número de Acta no Valido."));
            listaMensaje.add(new Mensajes(-2,  "Número de Acta de Instalación y Sufragio No Valido."));
            listaMensaje.add(new Mensajes(-3,  "El Número de Acta de Escrutinio no coincide con el del Acta de Instalación y Sufragio."));
            listaMensaje.add(new Mensajes(-4,  "El Número de Copia del Acta de Escrutinio no coincide con el del Acta de Instalación y Sufragio."));
            listaMensaje.add(new Mensajes(-5,  "Dígito de Verificación del Acta de Instalación y Sufragio Presidencial Incorrecto."));
            listaMensaje.add(new Mensajes(-6,  "Dígito de Verificación del Acta de Instalación y Sufragio Congresal Incorrecto."));
            listaMensaje.add(new Mensajes(-7,  "Dígito de Verificación del Acta de Instalación y Sufragio de Parlamento Andino Incorrecto."));
            listaMensaje.add(new Mensajes(-8,  "Número de Copia del Acta de Instalación y Sufragio No Valido."));
            listaMensaje.add(new Mensajes(-9,  "Dígito de Verificación del Acta de Escrutinio Incorrecto."));
            listaMensaje.add(new Mensajes(-10, "Número de Acta no existente o no corresponde a este Centro de Computo."));
            listaMensaje.add(new Mensajes(-11, "El Acta no está Pendiente de Digitalización."));
            listaMensaje.add(new Mensajes(-12, "Código de Barras del Acta No Reconocido."));
            listaMensaje.add(new Mensajes(-14, "El Archivo de Imagen no pudo ser guardado en el Repositorio.\nEl Acta no será registrada en la base de datos.\nIntentelo nuevamente."));
            listaMensaje.add(new Mensajes(-15, "El Componente de digitalización no retornó ningún dato."));
            listaMensaje.add(new Mensajes(-16, "EL Acta de Instalación y Sufragio podría estar en una posición incorrecta, el sistema no pudo actualizar la imagen."));
            listaMensaje.add(new Mensajes(-17, "FUNCIÓN NO IMPLEMENTADA."));
            listaMensaje.add(new Mensajes(-18, "Las Actas fueron digitalizadas correctamente pero no se pudo generar el Número de Lote.\nLas Actas volveran a su estado anterior y las imágenes serán eliminadas."));
            listaMensaje.add(new Mensajes(-19, "No se han registrado nuevas Actas."));
            listaMensaje.add(new Mensajes(-20, "Archivo de Imagen no pudo ser Actualizado."));
            listaMensaje.add(new Mensajes(-21, "Tipo de Acta no Reconocida."));
            listaMensaje.add(new Mensajes(-22, "El archivo de imagen no pudo ser actualizado, no se registrará esta imagen en el sistema."));
            listaMensaje.add(new Mensajes(-23, "Esta Acta no se encuentra en la lista de actas Incompletas."));
            listaMensaje.add(new Mensajes(-24, "No se pudo generar el Archivo de Imagen Multipagina del Acta Electoral. No se ha Registrado el Acta."));
            listaMensaje.add(new Mensajes(-25, "El Nombre de Archivo Generado para el Acta es Incorrecto."));
            listaMensaje.add(new Mensajes(-26, "Un Acta con el mismo Número y del Mismo Tipo se encuentra también en estado Incompleto en el escaneo. No se podrá Registrar el Acta.")); //este mensaje se está editando en IngresoManualActasSTAE
            listaMensaje.add(new Mensajes(-27, "Esta Acta ya se encuentra Registrada en estado Incompleto."));
            listaMensaje.add(new Mensajes(-28, "Ruta Local No Encontrada."));
            listaMensaje.add(new Mensajes(-29, "Ruta en Red No Encontrada."));
            listaMensaje.add(new Mensajes(-30, "La Resolución ha sido anulada y no puede ser digitalizada."));
            listaMensaje.add(new Mensajes(-31, "La Resolución ya no se encuentra en estado de ser digitalizada."));
            listaMensaje.add(new Mensajes(-32, "No coincide el número de copia del Acta Registrada con el del Acta Resuelta."));
            listaMensaje.add(new Mensajes(-33, "El Acta no pasó por el Segundo Control de Calidad antes de ser enviada para Resolución."));
            listaMensaje.add(new Mensajes(-34, "El Acta ha sido declarada como Mesa no Instalada."));
            listaMensaje.add(new Mensajes(-35, "No se pudo actualizar la imagen de la resolución en el servidor Backup de Imágenes. No se ejecutara el registro."));
            listaMensaje.add(new Mensajes(-36, "No hay un repositorio configurado para almacenar las imágenes."));
            listaMensaje.add(new Mensajes(-37, "No se puede accesar al directorio principal de imágenes."));
            listaMensaje.add(new Mensajes(-38, "No se puede accesar al directorio backup de imágenes."));
            listaMensaje.add(new Mensajes(-39, "El Archivo de Imagen no pudo ser guardado en el Repositorio Principal.\nEl Acta no será registrada en la base de datos.\nIntentelo nuevamente."));
            listaMensaje.add(new Mensajes(-40, "El Archivo de Imagen no pudo ser guardado en el Repositorio Backup.\nEl Acta no será registrada en la base de datos.\nIntentelo nuevamente."));
            listaMensaje.add(new Mensajes(-41, "El Componente de procesamiento de imágenes no retornó ningún dato."));
            
            listaMensaje.add(new Mensajes(-42, "El Acta no pertenece al tipo de solución tecnológica STAE"));
            listaMensaje.add(new Mensajes(-43, "Los Datos del Acta STAE no han sido transmitidos a este Centro de Computo.\nSi desea procesar el acta ingrese a la opción Habilitar Acta desde el módulo de Digitación de Actas y Resoluciones."));
            listaMensaje.add(new Mensajes(-44, "El Acta debe ser digitalizada como Tipo: \"Acta STAE\".\nSeleccione esta opción desde el combo en la parte superior de la ventana."));
            listaMensaje.add(new Mensajes(-45, "El Acta debe ser digitalizada como Tipo: \"Acta STAE Contingencia\". Seleccione esta opción desde el combo en la parte superior de la ventana."));
            listaMensaje.add(new Mensajes(-46, "El Acta STAE se ha transmitido de modo normal, pero el tipo de hoja tiene un estado diferente al requerido (Estado G)."));
            listaMensaje.add(new Mensajes(-47, "El Acta STAE se ha Reprocesado para ser ingresada manualmente, pero el tipo de hoja tiene un estado diferente al requerido (Estado A-B)."));
            listaMensaje.add(new Mensajes(-48, "El Acta STAE se encuentra en un estado no Reconocido."));
            
            
            listaMensaje.add(new Mensajes(-50, "El tipo de documento no corresponde a una Lista de Electores."));
            listaMensaje.add(new Mensajes(-51, "La página de la Lista de Electores no está Pendiente de Digitalización."));
            listaMensaje.add(new Mensajes(-52, "La Lista de Electores no está Pendiente de Digitalización."));            
            listaMensaje.add(new Mensajes(-53, "No se han registrado nuevas Listas de Electores."));
            listaMensaje.add(new Mensajes(-54, "La Lista de Electores se ha registrado como Digitalizada con Pérdida Parcial."));
            listaMensaje.add(new Mensajes(-55, "No se han registrado nuevas Relaciones de Miembros de Mesa."));
            listaMensaje.add(new Mensajes(-56, "El Número de Copia de la Relación de Miembros de Mesa No Sorteados no corresponde con el de la Hoja de Control de Asistencia."));
            listaMensaje.add(new Mensajes(-57, "Número de Relación de Miembros de Mesa No Sorteados u Hoja de Control de Asistencia No Válido."));            
            listaMensaje.add(new Mensajes(-58, "El Número de Relación de Miembros de Mesa No Sorteados no coincide con el de la Hoja de Control de Asistencia."));
            listaMensaje.add(new Mensajes(-59, "Dígito de Verificación de la Relación de Miembros de Mesa No Sorteados y el de la Hoja de Control de Asistencia No Coincide."));
            listaMensaje.add(new Mensajes(-60, "Dígito de Verificación de la Relación de Miembros de Mesa No Sorteados y el de la Hoja de Control de Asistencia Incorrecto."));
            listaMensaje.add(new Mensajes(-61, "Número de Mesa no existente o no corresponde a este Centro de Computo."));
            listaMensaje.add(new Mensajes(-62, "El Documento no está Pendiente de Digitalización."));
            listaMensaje.add(new Mensajes(-63, "Número de Página de Lista de Electores No Válido."));
            listaMensaje.add(new Mensajes(-64, "Dígito de Chequeo no Válido."));
            listaMensaje.add(new Mensajes(-65, "El Total de Páginas es incorrecto."));
            listaMensaje.add(new Mensajes(-66, "El estado de la Lista de Electores "
                    + "que intenta ingresar es de Pérdida Total. "
                    + "Debe quitar la selección como Pérdida Total del documento en el módulo de Registro de Omisos."));
            listaMensaje.add(new Mensajes(-67, "El número de página digitado es mayor que el total del páginas de la Lista de Electores."));
            
            listaMensaje.add(new Mensajes(-68, "El número de página requerido no ha sido encontrado en los documentos escaneados."));
            listaMensaje.add(new Mensajes(-69, "Página de Lista de Electores no pudo ser actualizada.\nEl Archivo podría estar siendo utilizado por otra aplicación."));
            
            listaMensaje.add(new Mensajes(-70, "El Número de mesa ingresado no corresponde a la Lista de Electores en revisión.\nVerifique el número ingresado, de otro modo haga clic en la opcion Omitir."));
            listaMensaje.add(new Mensajes(-71, "El Número de página ingresado no corresponde a la Lista de Electores en revisión.\nVerifique el número ingresado, de otro modo haga clic en la opcion Omitir."));
            listaMensaje.add(new Mensajes(-72, "Número de Relación de Miembros de Mesa no Válido."));
            listaMensaje.add(new Mensajes(-73, "Número de Lista de Electores no Válido."));
            listaMensaje.add(new Mensajes(-74, "La mesa se encuentra No Instalada."));
            listaMensaje.add(new Mensajes(-75, "El tipo de documento no corresponde a una Relación de Miembros de Mesa."));
            listaMensaje.add(new Mensajes(-76, "No se puede digitalizar la Relación de Miembros de Mesa "
                    + "puesto que tiene una Denuncia que la declara con Pérdida Total."));
            
            listaMensaje.add(new Mensajes(-101,"El documento de tipo [Acta de Instalación] no corresponde al tipo de Acta Solicitada para escaneo.\nLea los mensajes en pantalla antes de iniciar las secuencias de digitalización."));
            listaMensaje.add(new Mensajes(-102,"El documento de tipo [Acta de Sufragio] no corresponde al tipo de Acta Solicitada para escaneo.\nLea los mensajes en pantalla antes de iniciar las secuencias de digitalización."));
            listaMensaje.add(new Mensajes(-103,"El documento de tipo [Acta de Escrutinio] no corresponde al tipo de Acta Solicitada para escaneo.\nLea los mensajes en pantalla antes de iniciar las secuencias de digitalización."));
            
            listaMensaje.add(new Mensajes(-104,"No se pudo cargar la imagen recortada."));
            listaMensaje.add(new Mensajes(-105,"No se encontró la imagen recortada."));
            listaMensaje.add(new Mensajes(-106,"El Componente de procesamiento de imágenes retornó un valor no reconocido."));
            
            listaMensaje.add(new Mensajes(-107,"El Acta ha sido Anulada por Extravío."));
            listaMensaje.add(new Mensajes(-108,"El Acta ha sido Anulada por Siniestrada."));
            
            listaMensaje.add(new Mensajes(-109, "El Acta no pertenece al tipo de solución tecnológica STAE-2"));
            listaMensaje.add(new Mensajes(-110, "Los Datos del Acta STAE-2 no han sido transmitidos a este Centro de Computo.\nSi desea procesar el acta ingrese a la opción Habilitar Acta desde el módulo de Digitación de Actas y Resoluciones."));
            listaMensaje.add(new Mensajes(-111, "El Acta debe ser digitalizada como Tipo: \"Acta STAE-2\".\nSeleccione esta opción desde el combo en la parte superior de la ventana."));
            listaMensaje.add(new Mensajes(-112, "El Acta debe ser digitalizada como Tipo: \"Acta STAE-2 Contingencia\". Seleccione esta opción desde el combo en la parte superior de la ventana."));
            listaMensaje.add(new Mensajes(-113, "El Acta STAE-2 se ha transmitido de modo normal, pero el tipo de hoja tiene un estado diferente al requerido (Estado M)."));
            listaMensaje.add(new Mensajes(-114, "El Acta STAE-2 se ha Reprocesado para ser ingresada manualmente, pero el tipo de hoja tiene un estado diferente al requerido (Estado A-B)."));
            listaMensaje.add(new Mensajes(-115, "El Acta STAE-2 se encuentra en un estado no Reconocido."));
            
            listaMensaje.add(new Mensajes(-116, "El Acta Presidencial del Extranjero, enviada digitalmente desde el consulado, no está habilitada.\nSi desea procesar el acta ingrese a la opción \"Habilitar Acta Extranjero\" desde el módulo de Digitación de Actas y Resoluciones."));
            listaMensaje.add(new Mensajes(-117, "El Acta Presidencial del Extranjero se encuentra en un estado no Reconocido."));
            listaMensaje.add(new Mensajes(-118, "El Acta Presidencial del Extranjero ha sido habilitada para digitalizarse como una copia digital enviada desde el consulado."));
            listaMensaje.add(new Mensajes(-119, "El Número de Copia no corresponde a un Acta Presidencial del Extranjero."));
            listaMensaje.add(new Mensajes(-120, "El Acta Escaneada no corresponde al tipo de Acta Presidencial del Extranjero."));
            
            listaMensaje.add(new Mensajes(-121, "El Acta Presidencial del Extranjero, enviada digitalmente desde el consulado, ya ha sido reemplazada por un Acta Original."));
            
            listaMensaje.add(new Mensajes(-122, "No se pudo Actualizar el estado de Digitalización del Acta en la Base de Datos."));
            listaMensaje.add(new Mensajes(-123, "No se puede realizar la verificación de los estados del acta. Error de respuesta desde la Base de Datos."));
            
            
            listaMensaje.add(new Mensajes(-124,  "Número de Copia del Acta de Escrutinio No Valido."));
            listaMensaje.add(new Mensajes(-125,  "Número de Copia del Acta No Valido."));
            listaMensaje.add(new Mensajes(-126,  "Tipo de Proceso Electoral no Reconocido."));
            
            listaMensaje.add(new Mensajes(-127,  "No coincide el número de copia del Acta Registrada, con el número de copia del Acta que se está Digitalizando."));
            
            
            listaMensaje.add(new Mensajes(-128, "Algunos archivos PDF generados no pudieron ser actualizados en su ubicación."));
            listaMensaje.add(new Mensajes(-129, "Se produjo un error al intentar actualizar la ubicación de los archivos PDF generados."));
            listaMensaje.add(new Mensajes(-130, "No se pudieron procesar todas las imágenes."));
            listaMensaje.add(new Mensajes(-131, "No se pudieron procesar todas las imágenes, y algunos archivos PDF no pudieron ser actualizados en su ubicación."));
            listaMensaje.add(new Mensajes(-132, "No se pudieron procesar todas las imágenes, y se produjo un error al intentar actualizar la ubicación de los archivos PDF generados."));
            listaMensaje.add(new Mensajes(-133, "No se econtraron los archivos PDF generados."));
            
            listaMensaje.add(new Mensajes(-134, "Se produjo un error en el compenente de procesamiento de imágenes durante la conversión a PDF."));
            
            listaMensaje.add(new Mensajes(-135, "El rango de copia de esta acta no está identificada."));
            
            //SCE
            listaMensaje.add(new Mensajes(-136, "Error en servicio: El documento no pudo ser enviado al servidor."));
            listaMensaje.add(new Mensajes(-137, "La resolución no pudo ser guardada en el repositorio local de imágenes, pero fue enviada al servidor correctamente."));
            listaMensaje.add(new Mensajes(-138, "El acta no reconocida no pudo ser guardado en el repositorio local de imágenes."));
            listaMensaje.add(new Mensajes(-139, "El acta no pudo ser guardada en el repositorio local de imágenes, pero fue enviada al servidor correctamente."));
            listaMensaje.add(new Mensajes(-140, "La Lista de Electores no pudo ser guardada en el repositorio local de imágenes."));
            listaMensaje.add(new Mensajes(-141, "Error al comprimir imágenes en archivo zip."));
            listaMensaje.add(new Mensajes(-142, "No se pudo generar el archivo PDF del documento escaneado"));
            listaMensaje.add(new Mensajes(-143, "El documento electoral no pudo ser guardado en el repositorio local de imágenes."));
            
            listaMensaje.add(new Mensajes(-144, "El rango de copia del acta, o el dígito de chequeo, no se encuentran en el servicio Elecciones."));
            listaMensaje.add(new Mensajes(-145, "No se han definido correctamente los parametros de lectura del código de barras."));
            listaMensaje.add(new Mensajes(-999, "Su sesión ya no es válida o fue cerrada remotamente. Inicie sesión nuevamente."));
            listaMensaje.add(new Mensajes(-1000, "Se ha realizado un cierre de actividades en el centro de computo, no es posible iniciar sesión."));
        }
        
        public  String obtenerMensaje(int codMensaje){
            String strMensaje = null;
            for(Mensajes msg: listaMensaje){
                if(msg.codMensaje==codMensaje){
                    strMensaje = msg.getStrMensaje();
                    break;
                }
            }
            if(strMensaje==null){
                strMensaje = "Tipo de Error no definido";
            }
            return strMensaje;
        }
    }
    
    public static final ListMensajes listMsg = new ListMensajes();
    
    public static String obtenerMensaje(int codMensaje){
        return listMsg.obtenerMensaje(codMensaje);
    }
}
