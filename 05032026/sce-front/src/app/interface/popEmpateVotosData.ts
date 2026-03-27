import { DistritoElectoralEmpateBean } from "../model/distritoElectoralEmpateBean";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";
import { EleccionResponseBean } from "../model/eleccionResponseBean";

export interface PopEmpateVotosData{
  proceso: ProcesoElectoralResponseBean;
  tipoEleccion: EleccionResponseBean;
  listEmpate: Array<DistritoElectoralEmpateBean>;
}
