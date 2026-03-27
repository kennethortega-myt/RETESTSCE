import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActasComponent } from './actas.component';
import { ResumenTotalNacionComponent } from './resumen-total-nacion/resumen-total-nacion.component';
import { AvanceEstadoActasNacionComponent } from './avance-estado-actas-nacion/avance-estado-actas-nacion.component';
import { MesaPorMesaNacionComponent } from './mesa-por-mesa-nacion/mesa-por-mesa-nacion.component';
import { MesasEstadoNacionComponent } from './mesas-estado-nacion/mesas-estado-nacion.component';
import { ResultadosNacionComponent } from './resultados-nacion/resultados-nacion.component';
import { DigitalizacionNacionComponent } from './digitalizacion-nacion/digitalizacion-nacion.component';
import { EstadoActasOdpeNacionComponent } from './estado-actas-odpe-nacion/estado-actas-odpe-nacion.component';
import { ActasDigitalizadasComponent } from './actas-digitalizadas/actas-digitalizadas.component';
import { InformacionOficialNacionComponent } from './informacion-oficial-nacion/informacion-oficial-nacion.component';
import { AuditoriaDigitacionNacionComponent } from './auditoria-digitacion-nacion/auditoria-digitacion-nacion.component';
import { AutoridadesRevocadasComponent } from './autoridades-revocadas/autoridades-revocadas.component';
import {roleAuthorizationGuard} from '../../../../guards/role-authorization.guard';

const routes: Routes = [
  {
    path: '', component: ActasComponent,
    children: [
      { path: 'resumen-total', component: ResumenTotalNacionComponent, canActivate: [roleAuthorizationGuard] },
      { path: 'avance-estado-actas', component: AvanceEstadoActasNacionComponent, canActivate: [roleAuthorizationGuard]  },
      { path: 'mesa-por-mesa', component: MesaPorMesaNacionComponent, canActivate: [roleAuthorizationGuard]  },
      { path: 'mesas-por-estado', component: MesasEstadoNacionComponent, canActivate: [roleAuthorizationGuard]  },
      { path: 'resultados', component: ResultadosNacionComponent , canActivate: [roleAuthorizationGuard] },
      { path: 'digitalizacion', component: DigitalizacionNacionComponent, canActivate: [roleAuthorizationGuard]  },
      { path: 'informacion-oficial', component: InformacionOficialNacionComponent , canActivate: [roleAuthorizationGuard] },
      { path: 'auditoria-digitacion', component: AuditoriaDigitacionNacionComponent , canActivate: [roleAuthorizationGuard] },
      { path: 'estado-actas-odpe', component: EstadoActasOdpeNacionComponent, canActivate: [roleAuthorizationGuard] },
      { path: 'estado-actas-odpe', component: EstadoActasOdpeNacionComponent, canActivate: [roleAuthorizationGuard] },
      { path: 'actas-digitalizadas', component: ActasDigitalizadasComponent, canActivate: [roleAuthorizationGuard] },
      { path: 'autoridades-revocadas', component: AutoridadesRevocadasComponent, canActivate: [roleAuthorizationGuard] },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActasRoutingModule { }
