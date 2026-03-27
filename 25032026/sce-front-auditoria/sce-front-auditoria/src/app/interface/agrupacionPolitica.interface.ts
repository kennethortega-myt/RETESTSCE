import {IVotoData} from './votoData.interface';

export interface IAgrupacionPolitica{
  idDetActa: number;
  primeraDigitacion: string;
  segundaDigitacion: string;
  terceraDigitacion: string;
  votosPreferenciales?: IVotoData[];
  votosOpciones?: IVotoData[];
}
