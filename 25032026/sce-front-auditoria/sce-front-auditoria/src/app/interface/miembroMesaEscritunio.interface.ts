import {MesaBean} from '../model/mesaBean';

export interface IMiembroMesaEscrutinioRequest{
  id?: number;
  documentoIdentidadPresidente: string;
  documentoIdentidadSecretario: string;
  documentoIdentidadTercerMiembro: string;
  mesa: MesaBean;
  tipoFiltro: number;
  actaId?: number;
  acronimoProceso?: string;
}
