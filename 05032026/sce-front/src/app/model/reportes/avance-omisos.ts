export interface FiltroAvanceOmisos {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    idCentroComputo: number;    
    proceso: string;
    eleccion: string;
    tipoReporte: number;
}

export interface AvanceOmisos {
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
    totalMesas: number;
    mesasRegistradas: number;
    totalElectores: number;
    totalOmisos: number;
    porAvanceMesas: number;
}