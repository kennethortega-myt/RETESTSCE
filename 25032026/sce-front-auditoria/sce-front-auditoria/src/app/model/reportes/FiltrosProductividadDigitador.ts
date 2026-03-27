export interface FiltroProductividadDigitador {
    esquema: string;
    idProceso: number;
    idEleccion: number;    
    idCentroComputo: number;
    proceso: string;	
    usuario: string;
    usuarioDigitador: string;
    centroComputo: string;  
    eleccion: string;  
}

export interface UsuarioDigitador {
    codigoUsuario: string;
    documentoIdentidad: string;
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
}