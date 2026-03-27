import {EleccionBean} from "./eleccionBean";

export class ProcesoElectoralResponseBean {
  id: number;
  cnombre: string;
  nombre?:string;
  cacronimo: string;
  acronimo?: string;
  dfechaConvocatoria: Date;
  ntipoAmbitoElectoral: number;
  nactivo: number;
  elecciones: EleccionBean[];
  nombreEsquemaPrincipal: string;

}
