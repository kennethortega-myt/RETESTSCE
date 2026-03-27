export interface FiltroResultados {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    idCentroComputo: number;
    idOdpe: number;
    ubigeo: string;
    proceso: string;
    eleccion: string;
    tipoReporte: number;
    cc?: string;
    codigoEleccion: string;
    acronimo: string;
    centroComputo?: string;
    odpe?: string;
}

export interface ResultadosActasContabilizadas {
    detalleResultado: DetalleResultados[];
    detalleTotal:     DetalleResultados[];
    resumenActas:     ResumenActasContabilizadas;
    cantidadVotosPref: number;
}

export interface ResultadosActasContabilizadasCPR {
    detalleResultado: DetalleResultadosCPR[];
    resumenActas:     ResumenActasContabilizadas;
}

export interface DetalleResultados {
    numeroAp:           number | null;
    codigoAp:           null | string;
    agrupacionPolitica: string;
    cantidadVotos:      number;
    votosValidados:     number | null;
    votosEmitidos:      number;
    votosPreferenciales: number[];
}

export interface DetalleResultadosCPR {
    numeroAp:           number | null;
    codigoAp:           null | string;
    agrupacionPolitica: string;
    votosSi:      number;
    votosNo:     number;
    votosBlancos:      number;
    votosNulos:      number;
    ciudadanosVotaron:      number;
    votosSiNo2:    number;
}

export interface ResumenActasContabilizadas {
    actasProcesadas:   number;
    contabilizadasNormal: number;
    impugnados:        number;
    errorMaterial:        number;
    ilegible:             number;
    incompleta:       number;
    nulidad:           number;
    sinDatos:             number;
    extraviada:       number;
    sinFirma:         number;
    siniestrada:      number;
    otrasObservaciones:   number;
    anulada:          number;
    actasNoInstalada: number;
    mesasPorProcesar:  number;
    mesasAinstalar:   number;
    mesasInstaladas:  number;
    mesasNoInstaladas: number;

    pendiente:        number;

    electoresHabiles: number;
    enDigitacion:     number;
    mesasHabiles:      number;

    actasProcesadasPorcentaje: number;
	actasPorProcesarPorcentaje: number;
    porcentajeAvance: number;
}
