import {EstadosBean} from "./estadosBean";

export class DetalleActaBean{
  grupoEscaneo: string;
  numeroMesa: string;
  estadoMesa: string;
  usuarioModificacion: string;
  fechaModificacion: string;
  estadosActa: Array<EstadosBean>;
  estadosProceso: Array<EstadosBean>;
}
