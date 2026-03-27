import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaElectoresComponent } from './lista-electores.component';
import { AvanceComponent } from './avance/avance.component';
import { MesasComponent } from './mesas/mesas.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { ObservacionesComponent } from './observaciones/observaciones.component';
import { PorGeneroComponent } from './por-genero/por-genero.component';
import { DigitalizacionComponent } from './digitalizacion/digitalizacion.component';
import { OmisosAusentismoComponent } from './omisos-ausentismo/omisos-ausentismo.component';
import { ReporteDetalleAvanceRegistroUbigeoNacionComponent } from './reporte-detalle-avance-registro-ubigeo-nacion/reporte-detalle-avance-registro-ubigeo-nacion.component';
import { MesasSinOmisosElectoresComponent } from './mesas-sin-omisos-electores/mesas-sin-omisos-electores.component';
import {AvanceDigitalizacionComponent} from './avance-digitalizacion/avance-digitalizacion.component';
import {
  AvanceDigitalizacionDenunciasComponent
} from './avance-digitalizacion-denuncias/avance-digitalizacion-denuncias.component';

const routes: Routes = [
  {
    path: '', component: ListaElectoresComponent,
    children: [
      { path: 'avance', component: AvanceComponent },
      { path: 'avance-digitalizacion', component: AvanceDigitalizacionComponent },
      { path: 'avance-digitalizacion-denuncias', component: AvanceDigitalizacionDenunciasComponent },
      { path: 'mesas', component: MesasComponent },
      { path: 'asistencia', component: AsistenciaComponent },
      { path: 'transmision', component: TransmisionComponent },
      { path: 'observaciones', component: ObservacionesComponent },
      { path: 'por-genero', component: PorGeneroComponent },      { path: 'digitalizacion', component: DigitalizacionComponent },
      { path: 'omisos-ausentismo', component: OmisosAusentismoComponent},
      { path: 'mesas-sin-omisos', component: MesasSinOmisosElectoresComponent},
      { path: 'detalle-avance-registros-ubigeo', component: ReporteDetalleAvanceRegistroUbigeoNacionComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListaElectoresRoutingModule { }
