import { ActaPendienteControlCalidad } from "./ActaPendienteControlCalidad";
import { ResolucionActa } from "./ResolucionActa";

export interface DataPopupRechazarCC {
    acta: ActaPendienteControlCalidad;
    listaResoluciones: ResolucionActa[];
}

export interface DatosActaRechazar {
    idActa: number;
    idsResoluciones: number[];
}