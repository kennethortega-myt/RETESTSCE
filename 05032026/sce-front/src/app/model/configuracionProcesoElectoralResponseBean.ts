import { DatosGeneralesResponseBean } from "./datosGeneralesResponseBean";

export class ConfiguracionProcesoElectoralResponseBean {
  id:number;
  nombre: string;
  acronimo: string;
  logo: any;
  nombreDbLink: string;
  nombreEsquemaPrincipal: string;
  nombreEsquemaBdOnpe: string;
  fechaConvocatoria: Date;
  activo:number;
  vigente:number;
  usuario: string;
  tipoEleccion: DatosGeneralesResponseBean[];
  etapa:number;
  isEditar: boolean;
  existePrincipal: boolean;
}
