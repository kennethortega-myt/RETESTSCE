export interface FiltroTransaccionesRealizadas {
    esquema?:string;
    usuario: string;
    idProceso: any;
    idEleccion: any;
    codigoCentroComputo: string;
    nombreCentroComputo: string;
    fechaDesde: Date;
    horaDesde: string;
    fechaHasta: Date;
    horaHasta: string;
    soloConAutorizacion: boolean;
    proceso: string;
    acronimo:string;
}

export interface FiltroListarUsuarios {
    esquema: string;
    acronimo:string;
}
