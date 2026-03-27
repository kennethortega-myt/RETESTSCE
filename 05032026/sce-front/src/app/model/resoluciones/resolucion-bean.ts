import {ActaBean} from "./acta-jee-bean";

export class DigitizationListResolucionItem {
  id: number;
  idArchivo:number;
  nombreArchivo:string;
  numeroResolucion: string;
  fechaRegistro:Date;
  numeroPaginas:number;
  estadoDigitalizacion:string;
  listaPaginas: Array<string>;
}



export class ResumenResoluciones {
    numResolucionesAplicadas : number;
    numResolucionesAnuladas : number;
    numResolucionesSinAplicar : number;
    numResolucionesSinAplicarAsociadas: number;
    numTotalResoluciones : number;
    //resoluciones : ResolucionBean[]
    resoluciones : ResolucionAsociadosRequest[]
}

export class ResolucionAsociadosRequest {
    id: number;
    idArchivo:number;
    nombreArchivo:string;
    procedencia: number;
    fechaResolucion: Date;
    fechaResolucion2: Date;
    fechaRegistro:Date;
    numeroExpediente: string;
    numeroResolucion: string;
    tipoResolucion: number;
    tipoPasarNulos: string;
    descripcionTipoResolucion:string;
    estadoResolucion:string;
    estadoDigitalizacion:string;
    descripcionEstadoResolucion:string;
    numeroPaginas:number;
    descripcionEstadoDigitalizacion:string;
    usuarioAsociado :string;
    actasAsociadas:ActaBean[];
}

export class ResolucionDevueltasRequest {
    id: number;
    idArchivo: number;
    nombreArchivo: string;
    procedencia: number;
    fechaResolucion: Date;
    fechaResolucion2: Date;
    fechaRegistro: Date;
    numeroExpediente: string;
    numeroResolucion: string;
    tipoResolucion: number;
    tipoPasarNulos: string;
    descripcionTipoResolucion: string;
    estadoResolucion: string;
    estadoDigitalizacion: string;
    descripcionEstadoResolucion: string;
    numeroPaginas: number;
    descripcionEstadoDigitalizacion: string;
    mesa: string;
    numeroActa: string;
    codigoEleccion: string;
    codigoProceso: string;
}
