import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HojasAsistenciaComponent } from './hojas-asistencia.component';
import { AvanceComponent } from './avance/avance.component';
import { AsistenciaComponent } from './asistencia/asistencia.component';
import { TransmisionComponent } from './transmision/transmision.component';
import { PersonerosComponent } from './personeros/personeros.component';
import { PorGeneroComponent } from './por-genero/por-genero.component';
import { MmActaEscrutinioComponent } from './mm-acta-escrutinio/mm-acta-escrutinio.component';
import { DigitalizacionComponent } from './digitalizacion/digitalizacion.component';

const routes: Routes = [
  {
    path: '', component: HojasAsistenciaComponent,
    children: [
      { path: 'avance', component: AvanceComponent },
      { path: 'asistencia', component: AsistenciaComponent },
      { path: 'transmision', component: TransmisionComponent },
      { path: 'personeros', component: PersonerosComponent},
      { path: 'por-genero', component: PorGeneroComponent},
      { path: 'mm-acta-escrutinio', component: MmActaEscrutinioComponent},
      { path: 'digitalizacion', component: DigitalizacionComponent},

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HojasAsistenciaRoutingModule { }
