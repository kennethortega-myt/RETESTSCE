import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '../../material/material.module';
import {VerActasComponent} from './ver-actas/ver-actas.component';
import {VentanaEmergenteRoutingModule} from './ventana-emergente-routing.module';
import {VerResolucionComponent} from './ver-resolucion/ver-resolucion-component';
import {SharedModule} from "../shared/shared.module";
import {VerActasGenericoComponent} from './ver-actas-generico/ver-actas-generico.component';

@NgModule({
  declarations: [
    VerActasComponent,
    VerActasGenericoComponent,
    VerResolucionComponent
  ],
    imports: [
        CommonModule,
        MaterialModule,
        VentanaEmergenteRoutingModule,
        SharedModule
    ]
})
export class VentanaEmergenteModule { }
