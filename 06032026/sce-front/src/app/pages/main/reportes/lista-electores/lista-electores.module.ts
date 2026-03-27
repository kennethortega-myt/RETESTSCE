import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListaElectoresRoutingModule } from './lista-electores-routing.module';
import { ListaElectoresComponent } from './lista-electores.component';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MesasUbigeoNacionComponent } from './mesas-ubigeo-nacion/mesas-ubigeo-nacion.component';
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


@NgModule({  declarations: [
    ListaElectoresComponent,
    MesasUbigeoNacionComponent,
    AvanceComponent,
    MesasComponent,
    AsistenciaComponent,
    TransmisionComponent,
    ObservacionesComponent,
    PorGeneroComponent,
    DigitalizacionComponent,
    OmisosAusentismoComponent,
    ReporteDetalleAvanceRegistroUbigeoNacionComponent,
    MesasSinOmisosElectoresComponent,
    AvanceDigitalizacionComponent,
    AvanceDigitalizacionDenunciasComponent
  ],
  imports: [
    CommonModule,
    ListaElectoresRoutingModule,
    MaterialModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    MatSortModule,
  ]
})
export class ListaElectoresModule { }
