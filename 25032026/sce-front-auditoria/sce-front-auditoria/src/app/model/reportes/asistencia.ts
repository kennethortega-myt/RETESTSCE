export interface FiltroAsistencia {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    idCentroComputo: number;      
    ubigeo: string;
    proceso: string;
    eleccion: string;
    mesa: string;
    codigoCentroComputo?: string;
}