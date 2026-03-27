import { ConsultaResumenBean } from "./consultaResumenBean";
import { ReporteResultadosBean } from "./reporteResultadosBean";

export class ConsultaCifraRepartidoraResponseBean {
  consultaResumen: ConsultaResumenBean;
  porcentajeAvance: string;
  listReporteResultados: Array<ReporteResultadosBean>;
}
