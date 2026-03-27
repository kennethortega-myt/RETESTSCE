import {Component, Input} from '@angular/core';
import {MesasAInstalarBean} from "../../../model/mesasAInstalarBean";
import {ActasProcesadasBean} from "../../../model/actasProcesadasBean";
import {ActasPorResolverJEEBean} from "../../../model/actasPorResolverJEEBean";
import {ActasAnuladasPorResolucionBean} from "../../../model/actasAnuladasPorResolucionBean";
import {ActaContabilizadaDetalleBean} from "../../../model/actaContabilizadaDetalleBean";

@Component({
  selector: 'app-reporte-actas-contabilizadas-resumen',
  templateUrl: './reporte-actas-contabilizadas-resumen.component.html',
})
export class ReporteActasContabilizadasResumenComponent  {

  @Input() resumenMesaAInstalar : MesasAInstalarBean;
  @Input() resumenActasProcesadas : ActasProcesadasBean;
  @Input() resumenActasPorResolverJEE: ActasPorResolverJEEBean;
  @Input() resumenActasAnuladasPorResolucion: ActasAnuladasPorResolucionBean;
  @Input() resumenActasPorProcesar: ActaContabilizadaDetalleBean;

  constructor() {

  }

}
