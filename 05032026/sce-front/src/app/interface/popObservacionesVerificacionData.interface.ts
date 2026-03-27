import {AutorizacionCCRequestBean} from '../model/autorizacionCCRequestBean';

export interface PopObservacionesVerificacionDataInterface{
  pngImageUrlObservacionEscrutinio?: string;
  pngImageUrlObservacionInstalacion?: string;
  pngImageUrlObservacionSufragio?: string;
  solicitudNulidad?: boolean;
  autorizado?: boolean;
  solicitudAutorizacion?: AutorizacionCCRequestBean;
}
