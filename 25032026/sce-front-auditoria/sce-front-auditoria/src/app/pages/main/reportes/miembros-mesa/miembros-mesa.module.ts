import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MiembrosMesaRoutingModule } from './miembros-mesa-routing.module';
import { AsistenciaMiembroMesaComponent } from './asistencia-miembro-mesa/asistencia-miembro-mesa.component';
import { MiembrosMesaComponent } from './miembros-mesa.component';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
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
import {AvanceDigitalizacionComponent} from './avance-digitalizacion/avance-digitalizacion.component';


@NgModule({  declarations: [
    AsistenciaMiembroMesaComponent,
    MiembrosMesaComponent,
    AsistenciaPersonerosComponent,
    AsistenciaMmEscrutinioComponent,
    DetalleAvanceRegistroUbigeoComponent,
    ProcedePagoComponent,
    AvanceMiembrosMesaComponent,
    PersonerosComponent,
    MiembrosMesaActaEscrutinioComponent,
    MesasSinOmisosMiembrosMesaComponent,
    AvanceDigitalizacionComponent
  ],
  imports: [
    CommonModule,
    MiembrosMesaRoutingModule,
    MaterialModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    MatSortModule,
  ]
})
export class MiembrosMesaModule { }
