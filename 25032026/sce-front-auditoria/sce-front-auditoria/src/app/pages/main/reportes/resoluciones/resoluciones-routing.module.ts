import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResolucionesComponent } from './resoluciones.component';
import { ConsultaResolucionesComponent } from './consulta-resoluciones/consulta-resoluciones.component';
import { DigitalizacionComponent } from './digitalizacion/digitalizacion.component';
import { ActasDevueltasComponent } from './actas-devueltas/actas-devueltas.component';
import { ActasNoDevueltasComponent } from './actas-no-devueltas/actas-no-devueltas.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { TotalActasEnviadasJeeComponent } from './total-actas-enviadas-jee/total-actas-enviadas-jee.component';
import {roleAuthorizationGuard} from '../../../../guards/role-authorization.guard';

const routes: Routes = [
  {
    path: '', component: ResolucionesComponent,
    children: [
      { path: 'consulta-resoluciones', component:ConsultaResolucionesComponent, canActivate: [roleAuthorizationGuard]},
      { path: 'digitalizacion', component:DigitalizacionComponent,canActivate: [roleAuthorizationGuard]},
      { path: 'actas-devueltas', component:ActasDevueltasComponent,canActivate: [roleAuthorizationGuard]},
      { path: 'actas-no-devueltas', component:ActasNoDevueltasComponent,canActivate: [roleAuthorizationGuard]},
      { path: 'transmision', component:TransmisionComponent,canActivate: [roleAuthorizationGuard]},
      { path: 'total-actas-enviadas-jee', component:TotalActasEnviadasJeeComponent,canActivate: [roleAuthorizationGuard]},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResolucionesRoutingModule { }
