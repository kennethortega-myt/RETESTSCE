import { VotosEmpateResultadoBean } from "./votosEmpateResultadoBean";

export class DistritoElectoralEmpateBean {
  distritoElectoral: string;
  descripcionDistritoElectoral: string;
  tipoEleccion: string;
  descripcionTipoEleccion: string;
  votosValidos: string;
  agrupacionesPoliticas: Array<VotosEmpateResultadoBean>;

}
