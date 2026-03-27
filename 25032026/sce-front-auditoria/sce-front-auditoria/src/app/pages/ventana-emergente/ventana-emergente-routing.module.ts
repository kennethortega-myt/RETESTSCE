import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {VerActasComponent} from './ver-actas/ver-actas.component';
import {VentanaEmergenteGuard} from '../../guards/ventana-emergente.guard';
import {VerResolucionComponent} from './ver-resolucion/ver-resolucion-component';
import {VerActasGenericoComponent} from './ver-actas-generico/ver-actas-generico.component';

const routes: Routes = [
  {
    path: 'ver-actas',
    component: VerActasComponent,
    canActivate: [VentanaEmergenteGuard]
  },
  {
    path: 'ver-actas-generico',
    component: VerActasGenericoComponent,
    canActivate: [VentanaEmergenteGuard]
  },
  {
    path: 'ver-resolucion',
    component: VerResolucionComponent,
    canActivate: [VentanaEmergenteGuard]
  }
];

@NgModule({
  imports: [
    MatIconModule,
    RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentanaEmergenteRoutingModule{}
