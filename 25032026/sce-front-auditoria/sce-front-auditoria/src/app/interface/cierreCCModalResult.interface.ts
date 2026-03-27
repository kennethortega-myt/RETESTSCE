import {CierreCentroComputoRequestBean} from '../model/cierreCentroComputoRequestBean';

export interface CierreCCModalResult{
  action: 'cerrar' | 'salir';
  data?: CierreCentroComputoRequestBean;
  correlativo?: string;
}
