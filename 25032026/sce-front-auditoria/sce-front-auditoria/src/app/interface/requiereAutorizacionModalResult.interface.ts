import {TabAutorizacionBean} from '../model/tabAutorizacionBean';

export interface RequiereAutorizacionModalResult{
  action: 'solicitar' | 'salir';
  data?: TabAutorizacionBean
}
