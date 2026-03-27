import {IDatosGeneralResponse} from "./general.interface";

export interface IDetalleConfiguracionDocumentoElectoral {
  id?: number;

  detalleTipoEleccionDocumentoElectoral: IDetalleConfiguracionDocumentoElectoral;

  seccion: IDatosGeneralResponse;

  tipoDato: number;

  habilitado: number;

  pixelTopX?: number;

  pixelTopY?: number;

  pixelBottomX?: number;

  pixelBottomY?: number;

  coordenadaRelativaTopX?: number;

  coordenadaRelativaTopY?: number;

  coordenadaRelativaBottomX?: number;

  coordenadaRelativaBottomY?: number;

  width?: number;

  height?: number;

  activo: number;

  usuario?: string;

  idColor?: number;

  colorHex?: string;
  selected?: boolean;
}
