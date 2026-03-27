import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HojasAsistenciaRoutingModule } from './hojas-asistencia-routing.module';
import { HojasAsistenciaComponent } from './hojas-asistencia.component';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AvanceComponent } from './avance/avance.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { PersonerosComponent } from './personeros/personeros.component';
import { PorGeneroComponent } from './por-genero/por-genero.component';
import { MmActaEscrutinioComponent } from './mm-acta-escrutinio/mm-acta-escrutinio.component';
import { DigitalizacionComponent } from './digitalizacion/digitalizacion.component';


@NgModule({
  declarations: [
    HojasAsistenciaComponent,
    AvanceComponent,
    AsistenciaComponent,
    TransmisionComponent,
    PersonerosComponent,
    PorGeneroComponent,
    MmActaEscrutinioComponent,
    DigitalizacionComponent
  ],
  imports: [
    CommonModule,
    HojasAsistenciaRoutingModule,
    MaterialModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    MatSortModule,
  ]
})
export class HojasAsistenciaModule { }
