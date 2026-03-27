export interface FiltroRecepcion {
    esquema?:string;
    acronimo?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;       
    proceso: string;    
    codigoCentroComputo: string;
    centroComputo: string;
    fechaInicial: Date;
    fechaFin: Date;    
}