import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
//MIGRACION
import { ControlComponent } from './control/control.component';
import { MaterialModule } from '../../material/material.module';
import { SharedModule } from "../shared/shared.module";
import { PopControlComponent } from './control/pop-control/pop-control.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ImageMapComponent } from '../../image-map/image-map.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatTableModule } from "@angular/material/table";
import { MatSortModule } from "@angular/material/sort";
import { PopMensajeComponent } from "../shared/pop-mensaje/pop-mensaje.component";
import { PopMensajeDataGenericaComponent } from "../shared/pop-mensaje-data-generica/pop-mensaje-data-generica.component";
import { AuthComponent } from "../../helper/auth-component";
import {PrincipalComponent} from './principal/principal.component';
import {DialogoConfirmacionComponent} from './dialogo-confirmacion/dialogo-confirmacion.component';
import {ResolucionesComponent} from './resoluciones/resoluciones.component';
import {HojaAsistenciaComponent} from './hoja-asistencia/hoja-asistencia.component';
import {ListaElectoresComponent} from './lista-electores/lista-electores.component';
import {MonitoreoComponent} from './monitoreo/monitoreo.component';
import {VerificacionActasComponent} from './verificacion-actas/verificacion-actas.component';
import {InicioVerificacionComponent} from './verificacion-actas/inicio-verificacion/inicio-verificacion.component';
import {Paso1actasComponent} from './verificacion-actas/paso1actas/paso1actas.component';
import {Paso3actasComponent} from './verificacion-actas/paso3actas/paso3actas.component';
import {PopUpVotoComponent} from './verificacion-actas/pop-up-voto/pop-up-voto.component';
import {PopObservaciones2Component} from './verificacion-actas/pop-observaciones2/pop-observaciones2.component';
import {PopObservacionesComponent} from './verificacion-actas/pop-observaciones/pop-observaciones.component';
import {
  PopDialogObservacionComponent
} from './verificacion-actas/pop-dialog-observacion/pop-dialog-observacion.component';
import {ModalobservacionComponent} from './verificacion-actas/modalobservacion/modalobservacion.component';
import {ModalfinalizacionComponent} from './verificacion-actas/modalfinalizacion/modalfinalizacion.component';
import {ActasDevueltasComponent} from './resolucion/actas-devueltas/actas-devueltas.component';
import {EnvioActasComponent} from './resolucion/envio-actas/envio-actas.component';
import {
  PopReporteCargoEntregaComponent
} from './resolucion/envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component';
import {ListaResolucionesComponent} from './resolucion/lista-resoluciones/lista-resoluciones.component';
import {
  PopResolucionPdfComponent
} from './resolucion/lista-resoluciones/pop-resolucion-pdf/pop-resolucion-pdf.component';
import {PopAsociadasComponent} from './resolucion/pop-asociadas/pop-asociadas.component';
import {PopCargoComponent} from './resolucion/pop-cargo/pop-cargo.component';
import {PopListActasAsocComponent} from './resolucion/pop-list-actas/pop-list-actas-asoc.component';
import {VerificacionResolucionComponent} from './verificacion-resolucion/verificacion-resolucion.component';
import {ModalResolucionComponent} from './verificacion-resolucion/modal-resolucion/modal-resolucion.component';
import {
  DialogoConfirmacionExtsinComponent
} from './dialogo-confirmacion-extraviadas/dialogo-confirmacion-extsin.component';
import {MmActaEscrutinioComponent} from './registros-omisos/mm-acta-escrutinio/mm-acta-escrutinio.component';
import {
  ModalObservacionOmisosComponent
} from './registros-omisos/modal-observacion-omisos/modal-observacion-omisos.component';
import {
  OmisosHojaAsistenciaComponent
} from './registros-omisos/omisos-hoja-asistencia/omisos-hoja-asistencia.component';
import {
  OmisosListaElectoresComponent
} from './registros-omisos/omisos-lista-electores/omisos-lista-electores.component';
import {OmisosNoSorteadosComponent} from './registros-omisos/omisos-no-sorteados/omisos-no-sorteados.component';
import {RegistroPersonerosComponent} from './registros-omisos/registro-personeros/registro-personeros.component';
import {RegistrosOmisosComponent} from './registros-omisos/registros-omisos.component';
import {ReporteAvanceMesaComponent} from './reporte-avance-mesa/reporte-avance-mesa.component';
import {ReporteAvanceMesaNacionComponent} from './reporte-avance-mesa-nacion/reporte-avance-mesa-nacion.component';
import {
  ReporteRelacionPuestaCeroNacionComponent
} from './reporte-relacion-puesta-cero-nacion/reporte-relacion-puesta-cero-nacion.component';
import {
  ReporteTotalCentroComputoComponent
} from './reporte-total-centro-computo/reporte-total-centro-computo.component';
import {
  ReporteActasContabilizadasComponent
} from './reporte-actas-contabilizadas/reporte-actas-contabilizadas.component';
import {ReporteAvanceEstadoActasComponent} from './reporte-avance-estado-actas/reporte-avance-estado-actas.component';
import {ReporteMonitoreoActasComponent} from './reporte-monitoreo-actas/reporte-monitoreo-actas.component';
import {ReporteResumenTotalCcComponent} from './reporte-resumen-total-cc/reporte-resumen-total-cc.component';
import {
  ReporteVerificacionDigitacionCcComponent
} from './reporte-verificacion-digitacion-cc/reporte-verificacion-digitacion-cc.component';
import {ReportePuestasCeroCcComponent} from './reporte-puestas-cero-cc/reporte-puestas-cero-cc.component';
import {
  ReporteResumenEstadoActaCcComponent
} from './reporte-resumen-estado-acta-cc/reporte-resumen-estado-acta-cc.component';
import {ReporteMesasUbigeoCcComponent} from './reporte-mesas-ubigeo-cc/reporte-mesas-ubigeo-cc.component';
import {
  ReporteOrganizacionesPoliticasCcComponent
} from './reporte-organizaciones-politicas-cc/reporte-organizaciones-politicas-cc.component';
import {
  ReporteCandidatosOrgPoliticasCcComponent
} from './reporte-candidatos-org-politicas-cc/reporte-candidatos-org-politicas-cc.component';
import {
  ReporteAutoridadesConsultaCcComponent
} from './reporte-autoridades-consulta-cc/reporte-autoridades-consulta-cc.component';
import {
  ReporteMonitoreoDetalleActasComponent
} from './reporte-monitoreo-detalle-actas/reporte-monitoreo-detalle-actas.component';
import {
  ReporteActasContabilizadasResultadosComponent
} from './reporte-actas-contabilizadas-resultados/reporte-actas-contabilizadas-resultados.component';
import {
  ReporteActasContabilizadasResumenComponent
} from './reporte-actas-contabilizadas-resumen/reporte-actas-contabilizadas-resumen.component';
import {
  ReporteAvanceEstadoActasNacionComponent
} from './reporte-avance-estado-actas-nacion/reporte-avance-estado-actas-nacion.component';
import {
  ReporteCandidatosOrgPoliticasNacionComponent
} from './reporte-candidatos-org-politicas-nacion/reporte-candidatos-org-politicas-nacion.component';
import {
  PopObservacionesActaComponent
} from './reporte-monitoreo-actas-obserbaciones/pop-observaciones-acta/pop-observaciones.acta.component';
import {
  PopObservacionesDetalleComponent
} from './reporte-monitoreo-actas-obserbaciones/pop-observaciones-detalle/pop-observaciones.detalle.component';
import {
  ReporteMonitoreoActasObserbacionesComponent
} from './reporte-monitoreo-actas-obserbaciones/reporte-monitoreo-actas-obserbaciones.component';
import {ReporteMonitoreoElectoresComponent} from './reporte-monitoreo-electores/reporte-monitoreo-electores.component';
import {PuestaCeroComponent} from './puesta-cero/puesta-cero.component';
import {PopAutorizacionComponent} from './puesta-cero/pop-autorizacion/pop-autorizacion.component';
import {PopReportePuestaCeroComponent} from './puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import {
  PopResultadoPuestaCeroComponent
} from './puesta-cero/pop-resultado-puesta-cero/pop-resultado-puesta-cero.component';
import {TranzabilidadActasComponent} from './tranzabilidad-actas/tranzabilidad-actas.component';
import {TranzabilidadMesasComponent} from './tranzabilidad-mesas/tranzabilidad-mesas.component';
import {HabilitarActasStaeComponent} from './habilitar-actas-stae/habilitar-actas-stae.component';
import {ReprocesarActaComponent} from './reprocesar-acta/reprocesar-acta.component';
import {
  ActasCorregirConsultaComponent
} from './actas-corregir/actas-corregir-consulta/actas-corregir-consulta.component';
import {
  ActasCorregirVotosTotalesPreferencialesComponent
} from './actas-corregir/actas-corregir-votos-totales-preferenciales/actas-corregir-votos-totales-preferenciales.component';
import {
  ActasCorregirVotosTotalesComponent
} from './actas-corregir/actas-corregir-votos-totales/actas-corregir-votos-totales.component';
import {ModalActaComponent} from './actas-corregir/modal-acta/modal-acta.component';
import {ModalGuardarComponent} from './actas-corregir/modal-guardar/modal-guardar.component';
import {
  PopActasCorregirVotoComponent
} from './actas-corregir/pop-actas-corregir-voto/pop-actas-corregir-voto.component';
import {PopupArrastrableComponent} from './actas-corregir/popup-arrastrable/popup-arrastrable.component';
import {ActasCorregirComponent} from './actas-corregir/actas-corregir.component';
import {AutorizacionesComponent} from './autorizaciones/autorizaciones.component';
import {VerificaVersionComponent} from './verifica-version/verifica-version.component';
import {CargaInicialComponent} from './carga-inicial/carga-inicial.component';
import {DescargaInstalacionComponent} from './descarga-instalacion/descarga-instalacion.component';
import {InstalacionPadronComponent} from './instalacion-padron/instalacion-padron.component';
import {AnexosComponent} from './anexos/anexos.component';
import {
  ConfiguracionDocumentacionProcesalComponent
} from './configuracion-documentacion-procesal/configuracion-documentacion-procesal.component';
import {
  ConfigDocumentoPaso2Component
} from './configuracion-documentacion-procesal/config-documento-paso2/config-documento-paso2.component';
import {
  ConfigDocumentoPaso3Component
} from './configuracion-documentacion-procesal/config-documento-paso3/config-documento-paso3.component';
import {ConfiguracionesComponent} from './configuraciones/configuraciones.component';
import {Paso1Component} from './configuraciones/paso1/paso1.component';
import {Paso2Component} from './configuraciones/paso2/paso2.component';
import {Paso3Component} from './configuraciones/paso3/paso3.component';
import {Paso4Component} from './configuraciones/paso4/paso4.component';
import {PopInfosubelecionComponent} from './configuraciones/paso1/pop-infosubelecion/pop-infosubelecion.component';
import {PopNuevodocumentoComponent} from './configuraciones/paso1/pop-nuevodocumento/pop-nuevodocumento.component';
import {PopAdicionalComponent} from './configuraciones/paso2/pop-adicional/pop-adicional.component';
import {MapImagenComponent} from './configuraciones/paso3/map-imagen/map-imagen.component';
import {ConfigdocsComponent} from './configuraciones/configdocs/configdocs.component';
import {MenuLateralComponent} from './componentes/menu-lateral/menu-lateral.component';
import {ProcesoComponent} from './proceso/proceso.component';
import {PopListaProcesoComponent} from './proceso/pop-lista-proceso/pop-lista-proceso.component';
import {PopNuevoPComponent} from './proceso/pop-nuevo-p/pop-nuevo-p.component';
import {PopProcesoComponent} from './proceso/pop-proceso/pop-proceso.component';
import {PuestaCeroNacionComponent} from './puesta-cero-nacion/puesta-cero-nacion.component';
import {MonitoreoNacionComponent} from './monitoreo-nacion/monitoreo-nacion.component';
import {CierreSesionesComponent} from './cierre-sesiones/cierre-sesiones.component';
import {UsuariosComponent} from './usuarios/usuarios.component';
import {ModalEditarUsuarioComponent} from './usuarios/modal-editar-usuario/modal-editar-usuario.component';
import {VerificaVersionNacionComponent} from './verifica-version-nacion/verifica-version-nacion.component';
import {ReimpresionComponent} from './reimpresion/reimpresion.component';
import {AutorizacionesNacionComponent} from './autorizaciones-nacion/autorizaciones-nacion.component';
import {BackupRestauracionComponent} from './backup-restauracion/backup-restauracion.component';
import {BackupRestauracionNacionComponent} from './backup-restauracion-nacion/backup-restauracion-nacion.component';
import {BackupRestauracionFormularioComponent} from './backup-restauracion-base/backup-restauracion-formulario.component';
import {ModalImgComponent} from './descarga-instalacion/modal-img/modal-img.component';
import {ParametrosComponent} from './parametros/parametros.component';
import {ParametrosConexionCcComponent} from './parametros-conexion-cc/parametros-conexion-cc.component'
import {MesasPorMesaComponent} from './reportes/mesas-por-mesa/mesas-por-mesa.component';
import {ReportesComponent} from './reportes/reportes.component';
import {RespaldoComponent} from './respaldo/respaldo.component';
import {ModalComponent} from './verifica-version/modal/modal.component';
import {ModalReporteComponent} from './verifica-version/modal-reporte/modal-reporte.component';
import {Paso2revocatoriaComponent} from './verificacion-actas/paso2revocatoria/paso2revocatoria.component';
import {ModalGuardarReproComponent} from './reprocesar-acta/modal-guardar-repro/modal-guardar-repro.component';
import {TrazabilidadIconComponent} from './tranzabilidad-base/trazabilidad-icon.component';
import {LogUnicoComponent} from './log-unico/log-unico.component';
import { ControlCalidadComponent } from './control-calidad/control-calidad.component';
import { Paso1CcComponent } from './control-calidad/paso1-cc/paso1-cc.component';
import { Paso2CcComponent } from './control-calidad/paso2-cc/paso2-cc.component';
import { Paso3CcComponent } from './control-calidad/paso3-cc/paso3-cc.component';
import { PopupObservacionesComponent } from './control-calidad/popup-observaciones/popup-observaciones.component';
import { PopupVerResolucionComponent } from './control-calidad/popup-ver-resolucion/popup-ver-resolucion.component';
import { SeccionVerResolsActaComponent } from './control-calidad/seccion-ver-resols-acta/seccion-ver-resols-acta.component';
import { PopupRechazarCcComponent } from './control-calidad/popup-rechazar-cc/popup-rechazar-cc.component';
import { DataResolucionComponent } from './control-calidad/data-resolucion/data-resolucion.component';
import { PopupResolucionAplicadaComponent } from './control-calidad/popup-resolucion-aplicada/popup-resolucion-aplicada.component';
import {Paso2TablaTotalesComponent} from './verificacion-actas/paso2-tabla-totales/paso2-tabla-totales.component';
import {
  Paso2TablaTotalesPreferencialesComponent
} from './verificacion-actas/paso2-tabla-totales-preferenciales/paso2-tabla-totales-preferenciales.component';
import { SeccionVotosComponent } from './control-calidad/seccion-votos/seccion-votos.component';
import { SeccionDatosActaComponent } from './control-calidad/seccion-datos-acta/seccion-datos-acta.component';
import { ColumnaVotosComponent } from './control-calidad/columna-votos/columna-votos.component';
import {ControlDigtalDenunciasComponent} from './denuncias/control-digtal/control-digtal-denuncias.component';
import {ListaDenunciasComponent} from './denuncias/lista-denuncias/lista-denuncias.component';
import {PopAsociadasDenunciasComponent} from './denuncias/pop-asociadas/pop-asociadas-denuncias.component';
import { ControlSCComponent } from './control-sc/control-sc.component';
import { PopControlSCComponent } from './control-sc/pop-control-sc/pop-control-sc.component';
import { ProcesamientoManualComponent } from './procesamiento-manual/procesamiento-manual.component';
import { ProcesamientoManualVotosTotalesComponent } from './procesamiento-manual/procesamiento-manual-votos-totales/procesamiento-manual-votos-totales.component';
import { ProcesamientoManualVotosTotalesPreferencialesComponent } from './procesamiento-manual/procesamiento-manual-votos-totales-preferenciales/procesamiento-manual-votos-totales-preferenciales.component';
import { PopVerActaSobreComponent } from './resolucion/envio-actas/pop-ver-acta-sobre/pop-ver-acta-sobre.component';
import { JuradoElectoralEspecialComponent } from './jurado-electoral-especial/jurado-electoral-especial.component';
import { MatMenuModule } from '@angular/material/menu';



@NgModule({
  declarations: [
    MainComponent,
    HeaderComponent,
    FooterComponent,
    ControlComponent,
    ControlSCComponent,
    ResolucionesComponent,
    AuthComponent,
    DialogoConfirmacionComponent,
    PrincipalComponent,
    PopControlComponent,
    PopControlSCComponent,
    ImageMapComponent,
    PopMensajeComponent,
    PopMensajeDataGenericaComponent,
    HojaAsistenciaComponent,
    ListaElectoresComponent,
    VerificacionActasComponent,
    InicioVerificacionComponent,
    Paso1actasComponent,
    Paso2TablaTotalesComponent,
    ProcesamientoManualVotosTotalesComponent,
    ProcesamientoManualVotosTotalesPreferencialesComponent,
    Paso2TablaTotalesPreferencialesComponent,
    Paso2revocatoriaComponent,
    Paso3actasComponent,
    PopUpVotoComponent,
    PopObservaciones2Component,
    PopObservacionesComponent,
    PopDialogObservacionComponent,
    ModalobservacionComponent,
    ModalfinalizacionComponent,
    ActasDevueltasComponent,
    EnvioActasComponent,
    PopReporteCargoEntregaComponent,
    PopVerActaSobreComponent,
    ListaResolucionesComponent,
    PopResolucionPdfComponent,
    PopAsociadasComponent,
    PopCargoComponent,
    PopListActasAsocComponent,
    VerificacionResolucionComponent,
    ModalResolucionComponent,
    DialogoConfirmacionExtsinComponent,
    MonitoreoComponent,
    MmActaEscrutinioComponent,
    ModalObservacionOmisosComponent,
    OmisosHojaAsistenciaComponent,
    OmisosListaElectoresComponent,
    OmisosNoSorteadosComponent,
    RegistroPersonerosComponent,
    RegistrosOmisosComponent,
    ReporteActasContabilizadasComponent,
    ReporteAvanceEstadoActasComponent,
    ReporteAvanceMesaComponent,
    ReporteAvanceMesaNacionComponent,
    ReporteMonitoreoActasComponent,
    ReporteTotalCentroComputoComponent,
    ReporteRelacionPuestaCeroNacionComponent,
    ReporteResumenTotalCcComponent,
    ReporteVerificacionDigitacionCcComponent,
    ReportePuestasCeroCcComponent,
    ReporteResumenEstadoActaCcComponent,
    ReporteMesasUbigeoCcComponent,
    ReporteOrganizacionesPoliticasCcComponent,
    MesasPorMesaComponent,
    ReporteCandidatosOrgPoliticasCcComponent,
    ReporteAutoridadesConsultaCcComponent,
    ReporteMonitoreoDetalleActasComponent,
    ReporteActasContabilizadasResultadosComponent,
    ReporteActasContabilizadasResumenComponent,
    ReporteAvanceEstadoActasNacionComponent,
    ReporteCandidatosOrgPoliticasNacionComponent,
    PopObservacionesActaComponent,
    PopObservacionesDetalleComponent,
    ReporteMonitoreoActasObserbacionesComponent,
    ReporteMonitoreoElectoresComponent,
    PuestaCeroComponent,
    PopAutorizacionComponent,
    PopReportePuestaCeroComponent,
    PopResultadoPuestaCeroComponent,
    TranzabilidadActasComponent,
    TranzabilidadMesasComponent,
    HabilitarActasStaeComponent,
    ReprocesarActaComponent,
    ActasCorregirConsultaComponent,
    ActasCorregirVotosTotalesPreferencialesComponent,
    ActasCorregirVotosTotalesComponent,
    ModalActaComponent,
    ModalGuardarComponent,
    ModalGuardarReproComponent,
    PopActasCorregirVotoComponent,
    PopupArrastrableComponent,
    ActasCorregirComponent,
    ProcesamientoManualComponent,
    AutorizacionesComponent,
    VerificaVersionComponent,
    CargaInicialComponent,
    DescargaInstalacionComponent,
    InstalacionPadronComponent,
    AnexosComponent,
    ConfiguracionDocumentacionProcesalComponent,
    ConfigDocumentoPaso2Component,
    ConfigDocumentoPaso3Component,
    ConfiguracionesComponent,
    Paso1Component,
    Paso2Component,
    Paso3Component,
    Paso4Component,
    PopInfosubelecionComponent,
    PopNuevodocumentoComponent,
    PopAdicionalComponent,
    MapImagenComponent,
    ConfigdocsComponent,
    MenuLateralComponent,
    ReportesComponent,
    ProcesoComponent,
    ModalImgComponent,
    PopListaProcesoComponent,
    PopNuevoPComponent,
    PopProcesoComponent,
    PuestaCeroNacionComponent,
    MonitoreoNacionComponent,
    CierreSesionesComponent,
    UsuariosComponent,
    ModalEditarUsuarioComponent,
    VerificaVersionNacionComponent,
    ModalComponent,
    ModalReporteComponent,
    ReimpresionComponent,
    LogUnicoComponent,
    AutorizacionesNacionComponent,
    ParametrosComponent,
    JuradoElectoralEspecialComponent,
    ParametrosConexionCcComponent,
    RespaldoComponent,
    BackupRestauracionComponent,
    BackupRestauracionNacionComponent,
    BackupRestauracionFormularioComponent,
    ControlCalidadComponent,
    Paso1CcComponent,
    Paso2CcComponent,
    Paso3CcComponent,
    PopupObservacionesComponent,
    PopupVerResolucionComponent,
    SeccionVerResolsActaComponent,
    PopupRechazarCcComponent,
    DataResolucionComponent,
    PopupResolucionAplicadaComponent,
    SeccionVotosComponent,
    SeccionDatosActaComponent,
    ColumnaVotosComponent,
    ControlDigtalDenunciasComponent,
    ListaDenunciasComponent,
    PopAsociadasDenunciasComponent
  ],
    imports: [
        CommonModule,
        MainRoutingModule,
        MaterialModule,
        //FlexLayoutModule,
        SharedModule,
        NgxExtendedPdfViewerModule,
        MatChipsModule,
        MatPaginatorModule,
        MatTableModule,
        MatSortModule,
        TrazabilidadIconComponent
    ],
  exports: [
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    MaterialModule,
    SharedModule
  ],
})
export class MainModule{}
