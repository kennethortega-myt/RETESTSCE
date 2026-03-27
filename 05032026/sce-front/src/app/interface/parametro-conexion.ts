
export interface IEditParametroConexion{
    idCentroComputo: number;
    codigoCc: string;
    nombre:string;
    puerto: number;
    ip: string;
    protocolo: string;
    estado: string,
    usuarioModificacion: string,
    fechaModificacion: string,
    isEditar?: boolean
}



export interface IDetalleParametroConexion{
    idCentroComputo: number;
    codigoCc: string;
    nombre:string;
    puerto: number;
    ip: string;
    protocolo: string;
    estado: string,
    activo: number,
    esActivo: boolean,
    usuarioModificacion: string,
    fechaModificacion: string,
    detalle?: Array<IEditParametroConexion>
}
