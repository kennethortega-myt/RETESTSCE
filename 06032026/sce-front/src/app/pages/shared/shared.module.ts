import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NoEspacioInicioDirective} from "./directive/no-espacio-inicio.directive";
import { SoloNumerosDirective } from "./directive/solo-numeros.directive";
import { UppercaseDirective } from "./directive/uppercase.directive";
import { LazyImageComponent } from './lazy-image/lazy-image.component';
import {MinLengthDirective} from "./directive/min-length.directive";
import {PorcentajeFormatPipe} from "./pipes/porcentajeFormat.pipe";
import {NumerosHashDirective} from "./directive/numeros-hash.directive";
import {NumerosHashNDirective} from "./directive/numeros-hash-N.directive";
import {NumerosDosPuntosNDirective} from "./directive/numeros-dosPuntos-N.directive";
import {UppercaseFormReactDirective} from "./directive/uppercase-form-react.directive";
import {PdfViewerComponent} from "./pdf-viewer/pdf-viewer.component";
import {NgxExtendedPdfViewerModule} from "ngx-extended-pdf-viewer";
import {SoloAlfabeticosNumerosDirective} from "./directive/solo-alfabeticos-numeros.directive";
import {ValidacionInputCustomDirective} from "./directive/validacion-input-custom.directive";
import {FocusNextPrefEnterDirective} from "./directive/focus-next-pref-enter.directive";
import {FocusNextPrefFlechaDirective} from "./directive/focus-next-pref-flecha.directive";
import {FocusActaCorregirEnterDirective} from "./directive/focus-acta-corregir-enter.directive";
import {FocusActaCorregirFlechaDirective} from "./directive/focus-acta-corregir-flecha.directive";
import {FocusVeriResolucionEnterDirective} from "./directive/focus-veri-resolucion-enter.directive";
import {FocusVeriResolucionFlechaDirective} from "./directive/focus-veri-resolucion-flecha.directive";
import {SceMatTableComponent} from "./sce-mat-table/sce-mat-table.component";
import {MaterialModule} from "../../material/material.module";
import {SoloNumerosFormReactDirective} from "./directive/solo-numeros-form-react.directive";
import { GraficaRevocatoriaComponent } from './grafica-revocatoria/grafica-revocatoria.component';
import { MensajePersonajeComponent } from './mensaje-personaje/mensaje-personaje.component';
import { PieAmchartsComponent } from './pie-amcharts/pie-amcharts.component';
import { NgxMaskConfig, NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from "ngx-mask";
import { FiltroReporteModeloUnoComponent } from './filtro-reporte-modelo-uno/filtro-reporte-modelo-uno.component';
import { ModalGenericoComponent } from './modal-generico/modal-generico.component';
import { ModalGenericoReporteComponent } from './modal-generico-reporte/modal-generico-reporte.component';
import {ValidacionInputCustomReactDirective} from "./directive/validacion-input-custom-react.directive";
import {DesabilitarCopyPasteCuteDirective} from "./directive/desabilitar-copy-paste-cute.directive";
import { FiltroReporteModeloDosComponent } from './filtro-reporte-modelo-dos/filtro-reporte-modelo-dos.component';
import {FocusNextEnterTotalDirective} from "./directive/focus-next-enter-total.directive";
import {FocusNextFlechaTotalDirective} from "./directive/focus-next-flecha-total.directive";
import { PdfViewerReporteComponent } from "./pdf-viewer-reporte/pdf-viewer-reporte.component";
import {FocusNextRevocatoriaEnterDirective} from "./directive/focus-next-revocatoria-enter.directive";
import {FocusNextRevocatoriaFlechaDirective} from "./directive/focus-next-revocatoria-flecha.directive";
import {FocusActaCorregirEnterRevocatoriaDirective} from './directive/focus-acta-corregir-enter-revocatoria.directive';
import {
  FocusActaCorregirFlechaRevocatoriaDirective
} from './directive/focus-acta-corregir-flecha-revocatoria.directive';
import {FocusVeriResoRevoEnterDirective} from './directive/focus-veri-reso-revo-enter.directive';
import {SoloAlfaNumericoDirective} from './directive/solo-alfa-numerico.directive';
import {TablaActasComponent} from './tabla-actas/tabla-actas.component';
import {FocusActaCorregirEnterVotosTotalesDirective} from './directive/focus-acta-corregir-enter-votos-totales.directive';
import {FocusActaCorregirFlechaVotosTotalesDirective} from './directive/focus-acta-corregir-flecha-votos-totales.directive';
import {FocusNextEnterTotalPreferencialDirective} from './directive/focus-next-enter-total-preferencial.Directive';
import {FocusNextFlechaTotalPreferencialDirective} from './directive/focus-next-flecha-total-preferencial.directive';
import {FechaHoraDirective} from './directive/fecha-hora.directive';
import {PdfViewerGenericoMovibleComponent} from './pdf-viewer-generico-movible/pdf-viewer-generico-movible.component';
import { FocusProcesamientoManualEnterTotalDirective } from "./directive/focus-procesamiento-manual-enter-total.directive";
import { NoEspacioInicioReactDirective } from "./directive/no-espacio-inicio-react.directive";
import { SoloAlfabeticosFormReactDirective } from "./directive/solo-alfabeticos-form-react.directive";
import { CentroComputoCompletoNacionPipe } from "./pipes/centroComputoCompletoNacion.pipe";
import {SceSoloNumerosExceptoDirective} from './directive/sce-solo-numeros-excepto.directive';
import {ModalActaMovibleComponent} from './modal-acta-movible/modal-acta-movible.component';
import {SoloNumerosConPegarDirective} from './directive/solo-numeros-copiar-pegar.directive';


const maskConfig: Partial<NgxMaskConfig> = {
  validation: true,
};
@NgModule({
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule,
    MaterialModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ],
  declarations: [
    NoEspacioInicioDirective,
    NoEspacioInicioReactDirective,
    SoloAlfabeticosFormReactDirective,
    SoloNumerosDirective,
    UppercaseDirective,
    UppercaseFormReactDirective,
    LazyImageComponent,
    MinLengthDirective,
    PorcentajeFormatPipe,
    CentroComputoCompletoNacionPipe,
    NumerosHashDirective,
    SoloNumerosFormReactDirective,
    SoloNumerosConPegarDirective,
    NumerosHashNDirective,
    NumerosDosPuntosNDirective,
    FechaHoraDirective,
    PdfViewerComponent,
    PdfViewerGenericoMovibleComponent,
    ModalActaMovibleComponent,
    SoloAlfabeticosNumerosDirective,
    ValidacionInputCustomDirective,
    ValidacionInputCustomReactDirective,
    DesabilitarCopyPasteCuteDirective,
    FocusNextPrefEnterDirective,
    FocusNextEnterTotalDirective,
    FocusNextEnterTotalPreferencialDirective,
    FocusNextFlechaTotalPreferencialDirective,
    FocusProcesamientoManualEnterTotalDirective,
    FocusNextFlechaTotalDirective,
    FocusNextPrefFlechaDirective,
    FocusNextRevocatoriaEnterDirective,
    FocusNextRevocatoriaFlechaDirective,
    FocusActaCorregirEnterDirective,
    FocusActaCorregirEnterVotosTotalesDirective,
    FocusActaCorregirEnterRevocatoriaDirective,
    FocusActaCorregirFlechaDirective,
    FocusActaCorregirFlechaVotosTotalesDirective,
    FocusActaCorregirFlechaRevocatoriaDirective,
    FocusVeriResolucionEnterDirective,
    FocusVeriResoRevoEnterDirective,
    FocusVeriResolucionFlechaDirective,
    SceMatTableComponent,
    TablaActasComponent,
    GraficaRevocatoriaComponent,
    MensajePersonajeComponent,
    PieAmchartsComponent,
    FiltroReporteModeloUnoComponent,
    ModalGenericoComponent,
    ModalGenericoReporteComponent,
    FiltroReporteModeloDosComponent,
    PdfViewerReporteComponent,
    SoloAlfaNumericoDirective,
    SceSoloNumerosExceptoDirective
  ],
  exports: [
    NoEspacioInicioDirective,
    NoEspacioInicioReactDirective,
    SoloAlfabeticosFormReactDirective,
    SoloNumerosDirective,
    UppercaseDirective,
    UppercaseFormReactDirective,
    LazyImageComponent,
    MinLengthDirective,
    PorcentajeFormatPipe,
    CentroComputoCompletoNacionPipe,
    NumerosHashDirective,
    SoloNumerosFormReactDirective,
    SoloNumerosConPegarDirective,
    NumerosHashNDirective,
    NumerosDosPuntosNDirective,
    FechaHoraDirective,
    PdfViewerComponent,
    PdfViewerGenericoMovibleComponent,
    ModalActaMovibleComponent,
    SoloAlfabeticosNumerosDirective,
    ValidacionInputCustomDirective,
    ValidacionInputCustomReactDirective,
    DesabilitarCopyPasteCuteDirective,
    FocusNextPrefEnterDirective,
    FocusNextFlechaTotalDirective,
    FocusNextEnterTotalDirective,
    FocusNextEnterTotalPreferencialDirective,
    FocusNextFlechaTotalPreferencialDirective,
    FocusProcesamientoManualEnterTotalDirective,
    FocusNextPrefFlechaDirective,
    FocusNextRevocatoriaEnterDirective,
    FocusNextRevocatoriaFlechaDirective,
    FocusActaCorregirEnterDirective,
    FocusActaCorregirEnterVotosTotalesDirective,
    FocusActaCorregirEnterRevocatoriaDirective,
    FocusActaCorregirFlechaDirective,
    FocusActaCorregirFlechaVotosTotalesDirective,
    FocusActaCorregirFlechaRevocatoriaDirective,
    FocusVeriResolucionEnterDirective,
    FocusVeriResoRevoEnterDirective,
    FocusVeriResolucionFlechaDirective,
    SceMatTableComponent,
    TablaActasComponent,
    MensajePersonajeComponent,
    FiltroReporteModeloUnoComponent,
    NgxMaskDirective,
    FiltroReporteModeloDosComponent,
    PdfViewerReporteComponent,
    SoloAlfaNumericoDirective,
    SceSoloNumerosExceptoDirective
  ],
  providers: [
    provideEnvironmentNgxMask(maskConfig)
  ]
})
export class SharedModule{}
