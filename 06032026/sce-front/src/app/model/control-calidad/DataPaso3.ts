export interface DatosActaAceptar {
    idActa: number;
    idsResoluciones: number[];
}

export interface DataPaso3 {
    imagenesAgrupol: CortesImagen;
    imagenesPreferencial?: any;
	numeroColumnasPref?: number;
	detActaAgrupol: DetalleActa[];
    detActaPreferenciales: DetalleActa[][]; 
	cvas: number;
	sinFirmas: boolean;
	solicitudNulidad: boolean;
}

export interface CortesImagen {
    nro?: number;
    oopp?: string;
    votos_1: ImagenFile;
    votos_2: ImagenFile;
}

export interface ImagenFile {
    file: number;
    predicted?: string;
}

export interface DetalleActa {
    id?: number;
	idAgrupacion: number;
	posicion: number;
	votos: string;
	estado: number;
    hayDiferencia?: boolean;
}

export interface SrcImagenesAgrupolPaso3 {
    srcImgAgrupol: string;
    srcImgVotos1: string;
}

export interface VotosResolucionAplicada {
    votosAntes: DetalleActa[];
    votosAntesPreferenciales?: DetalleActa[][];
    votosDespues: DetalleActa[];
    votosDespuesPreferenciales?: DetalleActa[][];
    cvasAntes: string;
    cvasDespues: string;
    solicitudNulidadAntes: boolean;
    solicitudNulidadDespues: boolean;
}