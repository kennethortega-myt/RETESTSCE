import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ControlComponent } from './control/control.component';
import { MainComponent } from './main.component';
import { roleAuthorizationGuard } from '../../guards/role-authorization.guard';
import {PrincipalComponent} from './principal/principal.component';
import {ResolucionesComponent} from './resoluciones/resoluciones.component';
import {HojaAsistenciaComponent} from './hoja-asistencia/hoja-asistencia.component';
import {ListaElectoresComponent} from './lista-electores/lista-electores.component';
import {MonitoreoComponent} from './monitoreo/monitoreo.component';
import {VerificacionActasComponent} from './verificacion-actas/verificacion-actas.component';
import {InicioVerificacionComponent} from './verificacion-actas/inicio-verificacion/inicio-verificacion.component';
import {Paso1actasComponent} from './verificacion-actas/paso1actas/paso1actas.component';
import {Paso3actasComponent} from './verificacion-actas/paso3actas/paso3actas.component';
import {ListaResolucionesComponent} from './resolucion/lista-resoluciones/lista-resoluciones.component';
import {EnvioActasComponent} from './resolucion/envio-actas/envio-actas.component';
import {ActasDevueltasComponent} from './resolucion/actas-devueltas/actas-devueltas.component';
import {VerificacionResolucionComponent} from './verificacion-resolucion/verificacion-resolucion.component';
import {
  OmisosListaElectoresComponent
} from './registros-omisos/omisos-lista-electores/omisos-lista-electores.component';
import {
  OmisosHojaAsistenciaComponent
} from './registros-omisos/omisos-hoja-asistencia/omisos-hoja-asistencia.component';
import {MmActaEscrutinioComponent} from './registros-omisos/mm-acta-escrutinio/mm-acta-escrutinio.component';
import {RegistroPersonerosComponent} from './registros-omisos/registro-personeros/registro-personeros.component';
import {ReporteAvanceMesaComponent} from './reporte-avance-mesa/reporte-avance-mesa.component';
import {
  ReporteTotalCentroComputoComponent
} from './reporte-total-centro-computo/reporte-total-centro-computo.component';
import {
  ReporteRelacionPuestaCeroNacionComponent
} from './reporte-relacion-puesta-cero-nacion/reporte-relacion-puesta-cero-nacion.component';
import {
  ReporteActasContabilizadasComponent
} from './reporte-actas-contabilizadas/reporte-actas-contabilizadas.component';
import {ReporteAvanceEstadoActasComponent} from './reporte-avance-estado-actas/reporte-avance-estado-actas.component';
import {ReporteResumenTotalCcComponent} from './reporte-resumen-total-cc/reporte-resumen-total-cc.component';
import {ReporteMonitoreoActasComponent} from './reporte-monitoreo-actas/reporte-monitoreo-actas.component';
import {ReportePuestasCeroCcComponent} from './reporte-puestas-cero-cc/reporte-puestas-cero-cc.component';
import {
  ReporteVerificacionDigitacionCcComponent
} from './reporte-verificacion-digitacion-cc/reporte-verificacion-digitacion-cc.component';
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
import {TranzabilidadActasComponent} from './tranzabilidad-actas/tranzabilidad-actas.component';
import {TranzabilidadMesasComponent} from './tranzabilidad-mesas/tranzabilidad-mesas.component';
import {HabilitarActasStaeComponent} from './habilitar-actas-stae/habilitar-actas-stae.component';
import {ReprocesarActaComponent} from './reprocesar-acta/reprocesar-acta.component';
import {ActasCorregirComponent} from './actas-corregir/actas-corregir.component';
import {
  ActasCorregirConsultaComponent
} from './actas-corregir/actas-corregir-consulta/actas-corregir-consulta.component';
import {
  ActasCorregirVotosTotalesComponent
} from './actas-corregir/actas-corregir-votos-totales/actas-corregir-votos-totales.component';
import {
  ActasCorregirVotosTotalesPreferencialesComponent
} from './actas-corregir/actas-corregir-votos-totales-preferenciales/actas-corregir-votos-totales-preferenciales.component';
import {AutorizacionesComponent} from './autorizaciones/autorizaciones.component';
import {VerificaVersionComponent} from './verifica-version/verifica-version.component';
import {PuestaCeroComponent} from './puesta-cero/puesta-cero.component';
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
import {ProcesoComponent} from './proceso/proceso.component';
import {PuestaCeroNacionComponent} from './puesta-cero-nacion/puesta-cero-nacion.component';
import {ReimpresionComponent} from './reimpresion/reimpresion.component';
import {BackupRestauracionNacionComponent} from './backup-restauracion-nacion/backup-restauracion-nacion.component';
import {MesasPorMesaComponent} from './reportes/mesas-por-mesa/mesas-por-mesa.component';
import {ParametrosComponent} from './parametros/parametros.component';
import {ParametrosConexionCcComponent} from './parametros-conexion-cc/parametros-conexion-cc.component'
import {ReportesComponent} from './reportes/reportes.component';
import {RespaldoComponent} from './respaldo/respaldo.component';
import {Paso2revocatoriaComponent} from './verificacion-actas/paso2revocatoria/paso2revocatoria.component';
import {AutorizacionesNacionComponent} from './autorizaciones-nacion/autorizaciones-nacion.component';
import {VerificaVersionNacionComponent} from './verifica-version-nacion/verifica-version-nacion.component';
import {CierreSesionesComponent} from './cierre-sesiones/cierre-sesiones.component';
import {UsuariosComponent} from './usuarios/usuarios.component';
import { ControlCalidadComponent } from './control-calidad/control-calidad.component';
import { CierreActividadesComponent } from './cierre-actividades/cierre-actividades.component';
import {LogUnicoComponent} from './log-unico/log-unico.component';
import { ReprocesarMesaComponent } from './reprocesar-mesa/reprocesar-mesa.component';
import {MonitoreoNacionComponent} from './monitoreo-nacion/monitoreo-nacion.component';
import {Paso2TablaTotalesComponent} from './verificacion-actas/paso2-tabla-totales/paso2-tabla-totales.component';
import {
  Paso2TablaTotalesPreferencialesComponent
} from './verificacion-actas/paso2-tabla-totales-preferenciales/paso2-tabla-totales-preferenciales.component';
import { CifraRepartidoraComponent } from './cifra-repartidora/cifra-repartidora.component';
import {ControlDigtalDenunciasComponent} from './denuncias/control-digtal/control-digtal-denuncias.component';
import { ResolucionesDevueltasComponent } from './resolucion/resoluciones-devueltas/resoluciones-devueltas.component';
import {ListaDenunciasComponent} from './denuncias/lista-denuncias/lista-denuncias.component';
import { ControlSCComponent } from './control-sc/control-sc.component';
import { ProcesamientoManualComponent } from './procesamiento-manual/procesamiento-manual.component';
import { ProcesamientoManualConsultaComponent } from './procesamiento-manual/procesamiento-manual-consulta/procesamiento-manual-consulta.component';
import { ProcesamientoManualVotosTotalesComponent } from './procesamiento-manual/procesamiento-manual-votos-totales/procesamiento-manual-votos-totales.component';
import { ProcesamientoManualVotosTotalesPreferencialesComponent } from './procesamiento-manual/procesamiento-manual-votos-totales-preferenciales/procesamiento-manual-votos-totales-preferenciales.component';
import { EliminacionOmisosComponent } from './registros-omisos/eliminacion-omisos/eliminacion-omisos.component';
import { BusquedaElectoresComponent } from './registros-omisos/busqueda-electores/busqueda-electores.component';
import { ListadoPcComponent } from './listado-pc/listado-pc.component';
import { ListadoPcNacionComponent } from './listado-pc-nacion/listado-pc-nacion.component';
import { JuradoElectoralEspecialComponent } from './jurado-electoral-especial/jurado-electoral-especial.component';


const routes: Routes = [
  {
    path: '', component: MainComponent,
    children: [
      { path: 'principal', component: PrincipalComponent },

      // Control de Digitalización
      {
        path: 'control',
        component: ControlComponent,
        canActivate: [roleAuthorizationGuard]
      },
      { path: 'controlSC',
        component: ControlSCComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'resoluciones',
        component: ResolucionesComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'denuncias',
        component: ControlDigtalDenunciasComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'hoja-asistencia',
        component: HojaAsistenciaComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'lista-electoral',
        component: ListaElectoresComponent,
        canActivate: [roleAuthorizationGuard]
      },

      // Digitación de Actas
      {
        path: 'verificacion-actas',
        component: VerificacionActasComponent,
        canActivate: [roleAuthorizationGuard],
        children: [
          { path: 'consulta', component: InicioVerificacionComponent },
          { path: 'paso1', component: Paso1actasComponent },
          { path: 'presidencial', component: Paso2TablaTotalesComponent },
          { path: 'diputados', component: Paso2TablaTotalesPreferencialesComponent },
          { path: 'parlamento-andino', component: Paso2TablaTotalesPreferencialesComponent },
          { path: 'senador-unico', component: Paso2TablaTotalesPreferencialesComponent },
          { path: 'senador-multiple', component: Paso2TablaTotalesPreferencialesComponent },
          { path: 'revocatoria', component: Paso2revocatoriaComponent },
          { path: 'paso3', component: Paso3actasComponent },
        ]
      },
      {
        path: 'lista-resoluciones',
        component: ListaResolucionesComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'resoluciones-devueltas',
        component: ResolucionesDevueltasComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'envio-actas-jurado',
        component: EnvioActasComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'registro-actas-devueltas',
        component: ActasDevueltasComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'verificacion-resolucion',
        component: VerificacionResolucionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'monitoreo',
        component: MonitoreoComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'omisos-lista-electores',
        component: OmisosListaElectoresComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'omisos-hoja-asistencia',
        component: OmisosHojaAsistenciaComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'mm-acta-escrutinio',
        component: MmActaEscrutinioComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'registro-personeros',
        component: RegistroPersonerosComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'eliminacion-omisos',
        component: EliminacionOmisosComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'busqueda-electores',
        component: BusquedaElectoresComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-actas-contabilizadas',
        component: ReporteActasContabilizadasComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-avance-estado-actas',
        component: ReporteAvanceEstadoActasComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-avance-mesa',
        component: ReporteAvanceMesaComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-monitoreo-actas',
        component: ReporteMonitoreoActasComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-total-centro-computo',
        component: ReporteTotalCentroComputoComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-relacion-puesta-cero-nacion',
        component: ReporteRelacionPuestaCeroNacionComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-resumen-total-cc',
        component: ReporteResumenTotalCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-verificacion-digitacion-cc',
        component: ReporteVerificacionDigitacionCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-puestas-cero-cc',
        component: ReportePuestasCeroCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-resumen-estado-acta-cc',
        component: ReporteResumenEstadoActaCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-mesas-ubigeo-cc',
        component: ReporteMesasUbigeoCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-organizaciones-politicas-cc',
        component: ReporteOrganizacionesPoliticasCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-candidatos-org-politicas-cc',
        component: ReporteCandidatosOrgPoliticasCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reporte-autoridades-consulta-cc',
        component: ReporteAutoridadesConsultaCcComponent ,
        canActivate: [roleAuthorizationGuard]
      },

      {
        path: 'tranzabilidad-actas',
        component: TranzabilidadActasComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'tranzabilidad-mesas',
        component: TranzabilidadMesasComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reimpresion',
        component: ReimpresionComponent ,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'parametros',
        component: ParametrosComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'jurado-electoral-especial',
        component: JuradoElectoralEspecialComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'parametros-cc',
        component: ParametrosConexionCcComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'respaldo',
        component: RespaldoComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'listado-pc',
        component: ListadoPcComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'listado-pc-nacion',
        component: ListadoPcNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },

      {
        path: 'actas-corregir',
        component: ActasCorregirComponent,
        canActivate: [roleAuthorizationGuard],
        children: [
          { path: 'consulta', component: ActasCorregirConsultaComponent },
          { path: 'presidencial', component: ActasCorregirVotosTotalesComponent },
          { path: 'distrital', component: ActasCorregirVotosTotalesComponent },
          { path: 'preferencial', component: ActasCorregirVotosTotalesPreferencialesComponent },
        ]
      },
      { path: 'habilitar-actas-stae',
        component: HabilitarActasStaeComponent,
        canActivate: [roleAuthorizationGuard]
      },
      { path: 'reprocesar-acta',
        component: ReprocesarActaComponent,
        canActivate: [roleAuthorizationGuard]
      },
      // Administradores
      {
        path: 'autorizaciones',
        component: AutorizacionesComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'autorizaciones-nacion',
        component: AutorizacionesNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'puesta-cero',
        component: PuestaCeroComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'verificacion-version',
        component: VerificaVersionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'verificacion-version-nacion',
        component: VerificaVersionNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'carga-inicial',
        component: CargaInicialComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'descarga-instalacion',
        component: DescargaInstalacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'instalacion-padron',
        component: InstalacionPadronComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes',
        component: ReportesComponent,
        canActivate: [roleAuthorizationGuard]
      },

      {
        path: 'anexos',
        component: AnexosComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'configuracionDocumentacionProcesal',
        component: ConfiguracionDocumentacionProcesalComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'configuracionDocumentacionProcesal2',
        component: ConfigDocumentoPaso2Component,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'configuracionDocumentacionProcesal3',
        component: ConfigDocumentoPaso3Component,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'configuraciones',
        component: ConfiguracionesComponent,
        canActivate: [roleAuthorizationGuard],
        children: [
          { path: 'paso1', component: Paso1Component },
          { path: 'paso2', component: Paso2Component },
          { path: 'paso3', component: Paso3Component },
          { path: 'paso4', component: Paso4Component }
        ]
      },
      {
        path: 'proceso',
        component: ProcesoComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'puesta-cero-nacion',
        component: PuestaCeroNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'monitoreo-nacion',
        component: MonitoreoNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'log-nacion',
        component: LogUnicoComponent, data: { tipo: 'nacion' },
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'log',
        component: LogUnicoComponent, data: { tipo: 'orc' },
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'cierre-sesion',
        component: CierreSesionesComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/avance-mesa',
        loadChildren: () => import('./reportes/avance-mesa/avance-mesa.module').then((m)=>m.AvanceMesaModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/actas',
        loadChildren: () => import('./reportes/actas/actas.module').then((m)=>m.ActasModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/otros',
        loadChildren: () => import('./reportes/otros/otros.module').then((m)=>m.OtrosModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/resoluciones',
        loadChildren: () => import('./reportes/resoluciones/resoluciones.module').then((m)=>m.ResolucionesModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/miembros-mesa',
        loadChildren: () => import('./reportes/miembros-mesa/miembros-mesa.module').then((m)=>m.MiembrosMesaModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/lista-electores',
        loadChildren: () => import('./reportes/lista-electores/lista-electores.module').then((m)=>m.ListaElectoresModule),
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'reportes/hojas-asistencia',
        loadChildren: () => import('./reportes/hojas-asistencia/hojas-asistencia.module').then((m)=>m.HojasAsistenciaModule),
        canActivate: [roleAuthorizationGuard]
      },

      {
        path: 'mesa-por-mesa',
        component: MesasPorMesaComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'respaldo/:accion',
        component: RespaldoComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'respaldo-nacion/:accion',
        component: BackupRestauracionNacionComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'control-calidad',
        component: ControlCalidadComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'cierre-actividades',
        component: CierreActividadesComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'procesamiento-manual',
        component: ProcesamientoManualComponent,
        canActivate: [roleAuthorizationGuard],
        children: [
          { path: 'consulta', component: ProcesamientoManualConsultaComponent },
          { path: 'presidencial', component: ProcesamientoManualVotosTotalesComponent },
          { path: 'parlamento', component: ProcesamientoManualVotosTotalesPreferencialesComponent },
          { path: 'diputados', component: ProcesamientoManualVotosTotalesPreferencialesComponent },
          { path: 'senador-multiple', component: ProcesamientoManualVotosTotalesPreferencialesComponent },
          { path: 'senador-unico', component: ProcesamientoManualVotosTotalesPreferencialesComponent },
        ]
      },
      {
        path: 'reprocesar-mesa',
        component: ReprocesarMesaComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'lista-denuncias',
        component: ListaDenunciasComponent,
        canActivate: [roleAuthorizationGuard]
      },
      {
        path: 'cifra-repartidora',
        component: CifraRepartidoraComponent,
        canActivate: [roleAuthorizationGuard]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
