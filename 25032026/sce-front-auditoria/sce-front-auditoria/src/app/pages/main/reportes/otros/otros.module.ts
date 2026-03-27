import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OtrosRoutingModule } from './otros-routing.module';
import { OtrosComponent } from './otros.component';
import { MaterialModule } from 'src/app/material/material.module';
import { SharedModule } from 'src/app/pages/shared/shared.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { AutoridadesConsultaNacionComponent } from './autoridades-consulta-nacion/autoridades-consulta-nacion.component';
import { CandidatosOrgPoliticaNacionComponent } from './candidatos-org-politica-nacion/candidatos-org-politica-nacion.component';
import { OrganizacionesPoliticasNacionComponent } from './organizaciones-politicas-nacion/organizaciones-politicas-nacion.component';
import { MesasUbigeoNacionComponent } from './mesas-ubigeo-nacion/mesas-ubigeo-nacion.component';
import { TransaccionesRealizadasComponent } from './transacciones-realizadas/transacciones-realizadas.component';
import { RelacionPuestaCeroComponent } from './relacion-puesta-cero/relacion-puesta-cero.component';
import { RelacionPuestaCeroNacionComponent } from './relacion-puesta-cero-nacion/relacion-puesta-cero-nacion.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { RecepcionComponent } from './recepcion/recepcion.component';
import { SistemasAutomatizadosComponent } from './sistemas-automatizados/sistemas-automatizados.component';
import { ProbablesCandidatosElectosComponent } from './probables-candidatos-electos/probables-candidatos-electos.component';
import { PrecisionAsistAutomaControlDigitalizacionComponent } from './precision-asist-automa-control-digitalizacion/precision-asist-automa-control-digitalizacion.component';
import { PrecisionAsistAutomaDigitacionComponent } from './precision-asist-automa-digitacion/precision-asist-automa-digitacion.component';
import { ProductividadDigitadorComponent } from './productividad-digitador/productividad-digitador.component';
import { ComparacionDigitacionAsistAutomaComponent } from './comparacion-digitacion-asist-automa/comparacion-digitacion-asist-automa.component';
import { BarreraElectoralComponent } from './barrera-electoral/barrera-electoral.component';


@NgModule({
  declarations: [
    OtrosComponent,
    AutoridadesConsultaNacionComponent,
    CandidatosOrgPoliticaNacionComponent,
    OrganizacionesPoliticasNacionComponent,
    MesasUbigeoNacionComponent,
    TransaccionesRealizadasComponent,
    RelacionPuestaCeroComponent,
    RelacionPuestaCeroNacionComponent,
    TransmisionComponent,
    RecepcionComponent,
    SistemasAutomatizadosComponent,
    ProbablesCandidatosElectosComponent,
    PrecisionAsistAutomaControlDigitalizacionComponent,
    PrecisionAsistAutomaDigitacionComponent,
    ProductividadDigitadorComponent,
    ComparacionDigitacionAsistAutomaComponent,
    BarreraElectoralComponent
  ],
  imports: [
    CommonModule,
    OtrosRoutingModule,
    MaterialModule,
    SharedModule,
    NgxExtendedPdfViewerModule,
    FormsModule,
    MatSortModule,
  ]
})
export class OtrosModule { }
