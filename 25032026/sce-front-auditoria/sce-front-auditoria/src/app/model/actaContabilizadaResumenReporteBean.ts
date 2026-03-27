import {EncabezadoFiltroContabilizacionActaBean} from "./encabezadoFiltroContabilizacionActaBean";
import {ActaContabilizadaReporteBean} from "./actaContabilizadaReporteBean";
import {MesasAInstalarBean} from "./mesasAInstalarBean";
import {ActasProcesadasBean} from "./actasProcesadasBean";
import {ActasPorResolverJEEBean} from "./actasPorResolverJEEBean";
import {ActasAnuladasPorResolucionBean} from "./actasAnuladasPorResolucionBean";
import {ActaContabilizadaDetalleBean} from "./actaContabilizadaDetalleBean";

export class ActaContabilizadaResumenReporteBean{
  encabezado: EncabezadoFiltroContabilizacionActaBean;
  detalleValidos: Array<ActaContabilizadaReporteBean>;
  votosValidos: ActaContabilizadaReporteBean;
  votosEmitidos: ActaContabilizadaReporteBean;
  detalleNoValidos: Array<ActaContabilizadaReporteBean>;
  resumenMesasAInstalar: MesasAInstalarBean;
  resumenActasProcesadas: ActasProcesadasBean;
  resumenActasPorResolverJEE : ActasPorResolverJEEBean;
  resumenActasAnuladasPorResolucion: ActasAnuladasPorResolucionBean;
  resumenActasPorProcesar: ActaContabilizadaDetalleBean;
}
