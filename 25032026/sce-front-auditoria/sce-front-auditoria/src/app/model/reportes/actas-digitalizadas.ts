export interface FiltroActasDigitalizadas {
    esquema?:string;
    usuario: string;
    idProceso: number;
    idEleccion: number;
    idCentroComputo: number;
    idOdpe: number; 
    fechaInicial: Date;    
    fechaFin: Date;    
    proceso: string;
    eleccion: string;
    centroComputo: string;
    odpe: string;
}