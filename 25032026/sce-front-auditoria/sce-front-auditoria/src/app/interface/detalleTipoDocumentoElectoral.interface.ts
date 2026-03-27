import {IArchivo} from "./archivo.interface";
import { IDatosGeneralResponse, IDocumentoElectoralResponse} from "./general.interface";

export interface IDetalleTipoDocumentoElectoral {
  id?: number;
  tipoEleccion: IDatosGeneralResponse;
  documentoElectoral: IDocumentoElectoralResponse;
  archivo?: IArchivo;
  archivoBase64?: string;
  requerido: number;
  activo: number;
  rangoInicial?: string;
  rangoFinal?: string;
  digitoChequeo?: string;
  digitoError?: string;
}
