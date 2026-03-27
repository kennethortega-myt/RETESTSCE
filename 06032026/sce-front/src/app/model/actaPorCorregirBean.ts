import {ActasPorCorregirListBean} from "./actasPorCorregirListBean";
import {AgrupolPorCorregirBean} from "./agrupolPorCorregirBean";
import {ItemPorCorregirBean} from "./itemPorCorregirBean";

export class ActaPorCorregirBean{
  acta: ActasPorCorregirListBean;
  agrupacionesPoliticas: Array<AgrupolPorCorregirBean>;
  cvas: ItemPorCorregirBean;
  observaciones: Array<ItemPorCorregirBean>;

}
