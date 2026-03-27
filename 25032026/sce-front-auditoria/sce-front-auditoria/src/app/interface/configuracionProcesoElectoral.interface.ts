import {IDatosGeneralResponse} from "./general.interface";

export interface ConfiguracionProcesoElectoralInterface{
  id?:number;
  nombre: string;
  acronimo: string;
  logo?: any;
  nombreEsquemaPrincipal: string;
  nombreDbLink:string;
  nombreEsquemaBdOnpe: string;
  fechaConvocatoria: Date;
  activo: number;
  usuario?: string;
  tipoEleccion?: Array<IDatosGeneralResponse>;
  vigente?:number;
  etapa?: number;
  isEditar?: boolean;
  existePrincipal?:boolean;

}
