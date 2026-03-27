import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {isAuthenticatedGuard} from "./guards/is-authenticated.guard";
import {isNotAuthenticatedGuard} from "./guards/is-not-authenticated.guard";

const routes: Routes = [/*{
  path: '',
  redirectTo: '/inicio',
  pathMatch: 'full'
 },*/
  {path: 'inicio',
    canActivate: [isNotAuthenticatedGuard],
    loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioModule)},
  {
    path: 'main',
    canActivate: [isAuthenticatedGuard],
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainModule)
  },

  { path: 'ventana-emergente',
    canActivate: [isAuthenticatedGuard],
    loadChildren: () => import('./pages/ventana-emergente/ventana-emergente.module').then(m => m.VentanaEmergenteModule)
  },
  {path: '**', redirectTo: 'inicio'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
