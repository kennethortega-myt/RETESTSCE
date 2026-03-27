export interface FiltroResumenTotal {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    codigoEleccion: string;
    idCentroComputo: number;
    // idOdpe: number;
    tipoReporte: number;
    proceso: string;
    eleccion: string;
    habilitado: number;
    centroComputo: string;
    estado: string;
}

export interface DetalleResumenTotal {
    codigoCc:               string;
    centroComputo:          string;
    habilitado:             string;
    mesasAInstalar:         number;
    mesasInstal:            number;
    mesasNoInstal:          number;
    actasSiniestradas:      number;
    actasExtraviadas:       number;
    actasProcesadas:        number;
    actasContabilizadas:    number;
    digActas:               number;
    digListaElectores:      number;
    digHojasAsistencia:     number;
    digResoluciones:        number;
    txActas:                number;
    txResolucion:           number;
    omisosMm:               number;
    omisosVotantes:         number;
    omisosMmActaEscrutinio: number;
    omisosPersoneros:       number;
}
