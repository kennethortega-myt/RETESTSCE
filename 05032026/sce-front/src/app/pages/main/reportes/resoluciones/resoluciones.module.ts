import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResolucionesRoutingModule } from './resoluciones-routing.module';
import { ResolucionesComponent } from './resoluciones.component';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
//import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { ConsultaResolucionesComponent } from './consulta-resoluciones/consulta-resoluciones.component';
import { DigitalizacionComponent } from './digitalizacion/digitalizacion.component';
import { ActasDevueltasComponent } from './actas-devueltas/actas-devueltas.component';
import { ActasNoDevueltasComponent } from './actas-no-devueltas/actas-no-devueltas.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { TotalActasEnviadasJeeComponent } from './total-actas-enviadas-jee/total-actas-enviadas-jee.component';
import { FiltroReporteActasEnviadasJEENacionComponent } from './total-actas-enviadas-jee/componentes/filtro-reporte-actas-enviadas-jee-nacion/filtro-reporte-actas-enviadas-jee-nacion.component';


@NgModule({
  declarations: [
    ResolucionesComponent,
    ConsultaResolucionesComponent,
    DigitalizacionComponent,
    ActasDevueltasComponent,
    ActasNoDevueltasComponent,
    TransmisionComponent,
    TotalActasEnviadasJeeComponent,
    FiltroReporteActasEnviadasJEENacionComponent
  ],
  imports: [
    CommonModule,
    ResolucionesRoutingModule,
    MaterialModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    //FlexLayoutModule,
    FormsModule,
    MatSortModule,
  ],
  
})
export class ResolucionesModule { }
