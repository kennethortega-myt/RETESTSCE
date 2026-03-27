import {ReaperturaCentroComputoRequestBean} from '../model/reaperturaCentroComputoRequestBean';
import {ReaperturaModalAction} from '../model/enum/reaperturaModalAction.enum';

export interface ReaperturaCCModalResult{
  action: ReaperturaModalAction;
  data?: ReaperturaCentroComputoRequestBean
}
