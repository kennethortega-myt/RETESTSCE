import {IAgrupacionPolitica} from './agrupacionPolitica.interface';

export interface IFormGroupStrategy {
  configurarFormControls(agrupacionesPoliticas: IAgrupacionPolitica[], cantVotosPrefe: number): void;
  changeVoto(fileId: number, i: number, j?: number): void;
  pasarVotosNulos(isChecked: boolean): void;
}
