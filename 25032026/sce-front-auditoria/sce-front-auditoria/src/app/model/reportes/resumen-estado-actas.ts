export interface FiltroResumenEstadoActas {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion?: number;
    idOdpe: number;
    idCentroComputo: number;
    proceso: string;
    eleccion?: string;
    centroComputo: string;
    odpe: string;
    codigoCentroComputo ?: string;
}

export interface ResumenEstadoActas {
    detalleEstadoActasOdpe: DetalleEstadoActas[];
    totalEstadoActasOdpe: DetalleEstadoActas[];
}

export interface DetalleEstadoActas {
    num: number;
    descEleccion: string;    
    ahProcesar: number;
    porProcesar: number;
    procesadas: number;
    observadas: number;
    resueltas: number;
    pendienteResol: number;
}
