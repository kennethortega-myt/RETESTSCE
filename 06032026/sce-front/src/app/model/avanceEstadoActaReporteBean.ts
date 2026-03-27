export interface AvanceEstadoActaReporteBean {
  encabezado: EncabezadoFiltroAvanceEstadoActaBean;
  resumen: AvanceEstadoActaResumenBean;
  detalleAvanceEstadoMesa: AvanceEstadoActaDetalleBean[];
  totalAvanceEstadoMesa: AvanceEstadoActaDetalleBean[];
}

export interface EncabezadoFiltroAvanceEstadoActaBean {
  codigoEleccion: string;
  nombreEleccion: string;
  codigoCc: string;
  nombreCc: string;
  nombreProceso: string;
}

export interface AvanceEstadoActaResumenBean{
  porProcesar: number;
  procesadas: number;
  contabilizadas: number;
}

export interface AvanceEstadoActaDetalleBean {
  codigoCc: string;
  nombreCc: string;
  fechaUltModificacion: string;
  mesasHabiles: string;
  totalActas: string;
  actasIngresadas: string;
  actasProcesadas: string;
  actasProcesadasPorcen: string;
  actasContabilizadas: string;
  actasContabilizadasPorcen: string;
  actasPendientesResolverJEE: string;
  actasPendientesResolverJEEPorcen: string;
}
