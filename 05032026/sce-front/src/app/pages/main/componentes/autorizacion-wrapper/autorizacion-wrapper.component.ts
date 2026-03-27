import { Component } from '@angular/core';
import {AutorizacionWrapperService} from '../../../../service/autorizacion-wrapper.service';
import {AsyncPipe, CommonModule} from '@angular/common';

@Component({
  selector: 'app-autorizacion-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe
  ],
  template: `
    <section *ngIf="autorizado$ | async; else pendiente" class="secciones veri-resolucion">
      <ng-content></ng-content>
    </section>

    <ng-template #pendiente>
      <section class="secciones version">
        <div>
          <h1 class="titulo1">Autorización pendiente</h1>
          <section class="seccion-unidos section-version">
            <article class="w-100 content-version">
              <div class="personaje-anuncio">
                <p>{{mensajeAcceso$ | async}}</p>
                <img alt="" src="../assets/img/personaje1.svg" />
              </div>
            </article>
          </section>
        </div>
      </section>
    </ng-template>
  `
})
export class AutorizacionWrapperComponent {
  autorizado$ = this.authService.autorizado$;
  mensajeAcceso$ = this.authService.mensajeAcceso$;

  constructor(private authService: AutorizacionWrapperService) {}
}
