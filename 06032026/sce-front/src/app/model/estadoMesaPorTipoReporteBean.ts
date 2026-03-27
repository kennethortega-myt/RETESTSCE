export class EstadoMesaPorTipoReporteBean {
    idTipoReporte: number;
    estados: [EstadoMesa]
}
export interface EstadoMesa {
    id: number;
    codigo: string;
    nombre: string;
}