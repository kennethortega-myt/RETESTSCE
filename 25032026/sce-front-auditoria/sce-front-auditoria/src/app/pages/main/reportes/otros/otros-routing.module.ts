import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OtrosComponent } from './otros.component';
import { MesasUbigeoNacionComponent } from './mesas-ubigeo-nacion/mesas-ubigeo-nacion.component';
import { OrganizacionesPoliticasNacionComponent } from './organizaciones-politicas-nacion/organizaciones-politicas-nacion.component';
import { CandidatosOrgPoliticaNacionComponent } from './candidatos-org-politica-nacion/candidatos-org-politica-nacion.component';
import { AutoridadesConsultaNacionComponent } from './autoridades-consulta-nacion/autoridades-consulta-nacion.component';
import { TransaccionesRealizadasComponent } from './transacciones-realizadas/transacciones-realizadas.component';
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

const routes: Routes = [
  {
    path: '', component: OtrosComponent,
    children: [
      { path: 'mesas-ubigeo', component: MesasUbigeoNacionComponent },
      { path: 'organizaciones-politicas', component: OrganizacionesPoliticasNacionComponent },
      { path: 'candidatos-org-politica', component: CandidatosOrgPoliticaNacionComponent},
      { path: 'autoridades-consulta', component: AutoridadesConsultaNacionComponent },
      { path: 'transacciones-realizadas', component: TransaccionesRealizadasComponent},
      { path: 'relacion-puesta-cero', component: RelacionPuestaCeroNacionComponent},
      { path: 'transmision', component: TransmisionComponent},
      { path: 'recepcion', component: RecepcionComponent},
      { path: 'sistemas-automatizados', component: SistemasAutomatizadosComponent},
      { path: 'probables-candidatos-electos', component: ProbablesCandidatosElectosComponent },
      { path: 'precision-asist-automa-control-digitalizacion', component: PrecisionAsistAutomaControlDigitalizacionComponent },
      { path: 'precision-asist-automa-digitacion', component: PrecisionAsistAutomaDigitacionComponent },
      { path: 'productividad-digitador', component: ProductividadDigitadorComponent},
      { path: 'comparacion-digitacion-asist-automa', component: ComparacionDigitacionAsistAutomaComponent},
      { path: 'barrera-electoral', component: BarreraElectoralComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OtrosRoutingModule { }
