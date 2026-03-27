import {VotoPreferencialPorCorregirBean} from "./votoPreferencialPorCorregirBean";
import {VotoOpcionPorCorregirBean} from './votoOpcionPorCorregirBean';

export class AgrupolPorCorregirBean{
  nro: number;
  idDetActa: number;
  organizacionPolitica: string;
  primeraDigitacion: string;
  segundaDigitacion: string;
  terceraDigitacion: string;
  votosOpciones: Array<VotoOpcionPorCorregirBean>;
  votosPreferenciales: Array<VotoPreferencialPorCorregirBean>;

}
