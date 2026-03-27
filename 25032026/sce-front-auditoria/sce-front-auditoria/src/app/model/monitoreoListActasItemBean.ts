export type MonitoreoObtenerActasNacionParams = {
    idProceso: number;
    idEleccion: string;
    idDepartamento: number;
    idProvincia: number;
    idDistrito: number;
    idLocal: number;
    acronimo: string;
    mesa: string;
    estado: string;
    cantidad: number;
    pageIndex: number;
};

export type MonitoreoCargarPaginacionParams = {
    idProceso: number;
    idEleccion: string;
    idDepartamento: number;
    idProvincia: number;
    idDistrito: number;
    idLocal: number;
    mesa:string;
    acronimo: string;
    estado: string;
    cantidad: number;
};

export class MonitoreoListActasItemBean{
    total: number;
    totalNormales: number;
    totalObservadas: number;
    totalEnviadasJne: number;
    totalDevueltasJne: number;
    fechaRegistro: string;
    listActaItems: Array<ListActasBean>;
}
export class ListActasBean {
    actaId: number;
    grupoActa?: string;
    acta: string;
    mesa: string;
    estado: string;
    fecha: string;
    imagenInstalacion: string;
    imagenEscrutinio: string;
    imagenSufragio: string;
    imagenInstalacionSufragio: string;
    estadoDescripcion?: string;
    nroActa?: string;
    verActa?:number;
    nro?: number;
}
