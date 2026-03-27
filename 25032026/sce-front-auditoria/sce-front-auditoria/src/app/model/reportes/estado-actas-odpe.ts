export interface FiltroEstadoActasOdpe {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    idCentroComputo: number;
    idOdpe: number;
    proceso: string;
    eleccion: string;
    centroComputo: string;
    odpe: string;
    codigoCentroComputo ?: string;
}

export interface EstadoActasOdpe {
    detalleEstadoActasOdpe: DetalleEstadoActasOdpe[];
    totalEstadoActasOdpe: DetalleEstadoActasOdpe[];
}

export interface DetalleEstadoActasOdpe {
    num: number;
    descOdpe: string;
    descCentroCompu: string;
    ahProcesar: number;
    porProcesar: number;
    procesadas: number;
    observadas: number;
    resueltas: number;
    pendienteResol: number;
}
