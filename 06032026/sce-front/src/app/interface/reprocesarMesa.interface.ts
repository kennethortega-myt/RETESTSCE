import {MesaBean} from '../model/mesaBean';

export interface ITipoDocumento {
  codigo: string;
  nombre: string;
  reprocesar: boolean
}

export interface IReprocesarMesaRequest {
  mesa: MesaBean;
  tipoDocumentos: ITipoDocumento[];
}

export interface IReprocesarMesaTable {
  mesa: string;
  position: number;
  LE: boolean;
  HA: boolean;
  MMAE: boolean;
  PER: boolean;
  data?: IReprocesarMesaRequest;
}

export interface IEliminarMesaTable {
  mesa: string;
  position: number;
  idMesa: number;
}
