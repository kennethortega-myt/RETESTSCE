import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-procesamiento-manual-consulta',
  standalone: true,
  imports: [],
  template: `
  <article class="w-80 d-flex flex-column">
    <div class="contenedor-documento-muestra2 w-100 text-center" >
      <div class=" contenido-scroll cont-anuncio">
        <div class="personaje-anuncio">
          <p>
            Seleccione un acta para realizar el procesamiento manual.
          </p>
          <img src="../assets/img/personaje1.svg" alt="">
        </div>
      </div>
    </div>
  </article>
  `,
  styleUrl: './procesamiento-manual-consulta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcesamientoManualConsultaComponent { }
