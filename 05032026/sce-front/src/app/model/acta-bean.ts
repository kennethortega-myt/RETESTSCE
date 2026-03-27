import {FirmaBean} from "./firma-bean";
import {VotoBean} from "./voto-bean";
import {ObservacionBean} from "./observacion-bean";
import {HoraInicioFinBean} from "./hora-inicio-fin-bean";

export class ActaBean{

  id: number;
  nroActa: string;
  estado: number;
  idProceso: number;
  idEleccion: number;
  estadoCumpleActa: boolean;
  firmas: Array<FirmaBean>;
  votos: Array<VotoBean>;
  observaciones: Array<ObservacionBean>;
  horaInicioFin: HoraInicioFinBean;
  departamento: string;
  provincia: string;
  distrito: string;
  local: string;

}
