import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { ActasRoutingModule } from './actas-routing.module';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AvanceEstadoActasNacionComponent } from './avance-estado-actas-nacion/avance-estado-actas-nacion.component';
import { DigitalizacionNacionComponent } from './digitalizacion-nacion/digitalizacion-nacion.component';
import { MesaPorMesaNacionComponent } from './mesa-por-mesa-nacion/mesa-por-mesa-nacion.component';
import { ResultadosNacionComponent } from './resultados-nacion/resultados-nacion.component';
import { ResumenTotalNacionComponent } from './resumen-total-nacion/resumen-total-nacion.component';

import { ActasDigitalizadasComponent } from './actas-digitalizadas/actas-digitalizadas.component';
import { ActasComponent } from './actas.component';
import { EstadoActasOdpeNacionComponent } from './estado-actas-odpe-nacion/estado-actas-odpe-nacion.component';
import { EstadoActasOdpeComponent } from './estado-actas-odpe/estado-actas-odpe.component';
import { InformacionOficialComponent } from './informacion-oficial/informacion-oficial.component';
import { MesasEstadoNacionComponent } from './mesas-estado-nacion/mesas-estado-nacion.component';
import { SeguimientoActasDigitalizadasComponent } from './seguimiento-actas-digitalizadas/seguimiento-actas-digitalizadas.component';
import { VerificacionDigitacionComponent } from './verificacion-digitacion/verificacion-digitacion.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpLoadingInterceptorService } from 'src/app/transversal/http-loading-interceptor.service';
import { AuditoriaDigitacionNacionComponent } from './auditoria-digitacion-nacion/auditoria-digitacion-nacion.component';
import { InformacionOficialNacionComponent } from './informacion-oficial-nacion/informacion-oficial-nacion.component';
import { ResumenResultadosComponent } from './resultados-nacion/resumen-resultados/resumen-resultados.component';
import { TablaDetalleResultadosCprComponent } from './resultados-nacion/tabla-detalle-resultados-cpr/tabla-detalle-resultados-cpr.component';
import { TablaDetalleResultadosComponent } from './resultados-nacion/tabla-detalle-resultados/tabla-detalle-resultados.component';
import { AutoridadesRevocadasComponent } from './autoridades-revocadas/autoridades-revocadas.component';

@NgModule({
  declarations: [
    AvanceEstadoActasNacionComponent,
    DigitalizacionNacionComponent,
    MesaPorMesaNacionComponent,
    ResultadosNacionComponent,
    ResumenTotalNacionComponent,
    MesasEstadoNacionComponent,
    ActasComponent,
    InformacionOficialComponent,
    InformacionOficialNacionComponent,
    SeguimientoActasDigitalizadasComponent,
    EstadoActasOdpeComponent,
    VerificacionDigitacionComponent,
    AuditoriaDigitacionNacionComponent,
    EstadoActasOdpeNacionComponent,
    ActasComponent,
    EstadoActasOdpeNacionComponent,
    ActasDigitalizadasComponent,
    TablaDetalleResultadosComponent,
    ResumenResultadosComponent,
    ResumenResultadosComponent,
    TablaDetalleResultadosCprComponent,
    AutoridadesRevocadasComponent,
    TablaDetalleResultadosCprComponent,
  ],
  imports: [
    ActasRoutingModule,
    MatTableModule,
    MaterialModule,
    NgxExtendedPdfViewerModule,
    //FlexLayoutModule,
    FormsModule,
    MatSortModule,
    CommonModule,
    SharedModule,
],
exports: [
  MatTableModule,
    FormsModule,
    CommonModule,
    SharedModule
],
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpLoadingInterceptorService,
    multi: true
  }
]
})
export class ActasModule { }
