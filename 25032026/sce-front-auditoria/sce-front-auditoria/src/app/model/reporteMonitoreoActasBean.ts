import {OrganizacionPoliticaBean} from "./organizacionPoliticaBean";
import {DetalleActaBean} from "./detalleActaBean";
import {ElectorCiudadanoBean} from "./electorCiudadanoBean";
import {ObservacionBean} from "./observacionBean";

export class ReporteMonitoreoActasBean {
  actaVotos: Array<OrganizacionPoliticaBean>;
  detalleActa: DetalleActaBean;
  electoresCiudadanos: Array<ElectorCiudadanoBean>;
  observaciones: Array<ObservacionBean>;
}
