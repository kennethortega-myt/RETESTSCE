import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiembrosMesaComponent } from './miembros-mesa.component';
import { AsistenciaMiembroMesaComponent } from './asistencia-miembro-mesa/asistencia-miembro-mesa.component';
import { AsistenciaPersonerosComponent } from './asistencia-personeros/asistencia-personeros.component';
import { AsistenciaMmEscrutinioComponent } from './asistencia-mm-escrutinio/asistencia-mm-escrutinio.component';
import { DetalleAvanceRegistroUbigeoComponent } from './detalle-avance-registro-ubigeo/detalle-avance-registro-ubigeo.component';
import {ProcedePagoComponent} from './procede-pago/procede-pago.component';
import {PersonerosComponent} from './personeros/personeros.component';
import {
  MiembrosMesaActaEscrutinioComponent
} from './miembros-mesa-acta-escrutinio/miembros-mesa-acta-escrutinio.component';
import {AvanceMiembrosMesaComponent} from './miembros-mesa/miembros-mesa.component';
import {MesasSinOmisosMiembrosMesaComponent} from './mesas-sin-omisos-miembros-mesa/mesas-sin-omisos-miembros-mesa.component';
import { ObservacionesComponent } from '../lista-electores/observaciones/observaciones.component';
import {roleAuthorizationGuard} from '../../../../guards/role-authorization.guard';
import {AvanceDigitalizacionComponent} from './avance-digitalizacion/avance-digitalizacion.component';

const routes: Routes = [
  {
    path: '', component: MiembrosMesaComponent,
    children: [
      { path: 'asistencia-miembro-mesa', component: AsistenciaMiembroMesaComponent},
      { path: 'asistencia-personeros', component: AsistenciaPersonerosComponent},
      { path : 'asistencia-mm-escrutinio', component: AsistenciaMmEscrutinioComponent},
      { path : 'detalle-avance-registro-ubigeo', component: DetalleAvanceRegistroUbigeoComponent},
      { path : 'procede-pago', component: ProcedePagoComponent, canActivate: [roleAuthorizationGuard]},
      { path: 'miembros-mesa', component: AvanceMiembrosMesaComponent },
      { path: 'personeros', component: PersonerosComponent },
      { path: 'miembros-mesa-acta-escrutinio', component: MiembrosMesaActaEscrutinioComponent },
      { path: 'mesas-sin-omisos-miembros-mesa', component: MesasSinOmisosMiembrosMesaComponent },
      { path: 'observaciones', component: ObservacionesComponent },
      { path: 'avance-digitalizacion', component: AvanceDigitalizacionComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MiembrosMesaRoutingModule { }
