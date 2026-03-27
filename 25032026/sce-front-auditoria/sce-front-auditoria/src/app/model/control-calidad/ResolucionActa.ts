export interface ResolucionActa {
    idDetActaResol: number;
	idActa: number;
	idResolucion: number;
	idArchivo: number;
	nombreResolucion: string;
	numeroElectores: number;
	numeroElectoresAusentes: number;
	fileResolucion?: any;
	numeroExpediente: string;
}