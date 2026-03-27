import {VotoPreferencialBean} from "../votoPreferencialBean";
import {VotoOpcionBean} from '../votoOpcionBean';

export class ActaJeeBean {
    total: number;
    totalNormales: number;
    totalPendientes: number;
    totalObservadas: number;
    totalEnviadasJne: number;
    fechaRegistro: string;
    actas: Array<ActaBean>;
}

export class ActaBean {
  index: number;
  actaId: number;
  mesaId: number;
  idArchivoEscrutinio:string;
  idArchivoInstalacionSufragio:string;
  cantidadColumnas: number;
  resolucionId:number;
  mesa: string;
  copia: string;
  eleccion: string;
  codigoEleccion: string;
  codigoProceso:string;
  estadoActa: string;
  estadoComputo :string;
  estadoResolucion:string;
  estadoDigitalizacion:string;
  estadoMesa:string;
  estadoDigitacion:string;
  tipoResolverExtraviadaSiniestrada:string;
  descripcionEstadoActa:string;
  descripcionEstadoMesa:string;
  electoresHabiles:number;
  cvas:string;
  ubigeo:string;
  localVotacion:string;
  fecha: string;
  imagenEscrutinio: string;
  horaEscrutinio:string;
  imagenInstalacion: string;
  horaInstalacion:string;
  errorMaterial: string;
  tipoErrorM: string;
  votosImpugnados: string;
  ilegibilidad: string;
  tipoIlegible: string;
  detalleIlegible: string;
  actasIncompletas:string;
  solNulidad:string;
  actaSinDatos:string;
  actaSinFirma:string;
  observacion: string;
  observacionesJNE:string;
  tipoLote: string;
  extraviada: string;
  siniestrada: string;
  obsMesa: string;
  tipoTransmision: number;
  tipoComboNulos:string;
  agrupacionesPoliticas: AgrupolBean[]
}

export class AgrupolBean {
  idAgrupol: number;
  codiAgrupol:string;
  idDetActa: string;
  nombreAgrupacionPolitica: string;
  votos: string;
  posicionActa:number;
  posicion:number;
  errorMaterial:string;
  ilegible:string;
  activo:number;
  estado:number;
  votosPreferenciales: Array<VotoPreferencialBean>;
  votosOpciones: Array<VotoOpcionBean>
}

export class AplicarActaBean {
  idResolucion: number;
  actaId: number;
  mesa: string;
  copia: string;
  codigoEleccion:string;
  codigoProceso:string
  siguiente : boolean;
}
