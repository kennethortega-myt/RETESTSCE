import {AgrupolPorCorregirBean} from "../model/agrupolPorCorregirBean";

export interface PopActasCorregirVotoData{
  indexI: number;
  indexJ: number;
  votos: Array<AgrupolPorCorregirBean>;
  cantVotosPref: number;
}
