
export class OtroDocumentoDto {
  idOtroDocumento: number;
  codigoCentroComputo:string;
  numeroDocumento:string;
  abrevTipoDocumento:string;
  nombreTipoDocumento: string;
  estadoDigitalizacion :string;
  estadoDocumento:string;
  descEstadoDocumento:string;
  idArchivo:number;
  nombreArchivo:string;
  activo:number;
  numeroPaginas:string;
  fechaRegistro:string;
  fechaSceScanner:number;
  listaPaginas: Array<string>;
  detOtroDocumentoDtoList: DetOtroDocumentoDto[]
}

export class DetOtroDocumentoDto {
  idDetOtroDocumento: number;
  idMesa:number;
  numeroMesa:string;
  abrevTipoDocumento:string;
  descTipoDocumento:string;
  abrevTipoPerdida:string;
  descTipoPerdida:string;
  activo:number;

  constructor(init?: Partial<DetOtroDocumentoDto>) {
    Object.assign(this, init);
  }
}

export class ResumenOtroDocumentoDto {
  numeroTotalDocumentos : number;
  mumeroDocumentosAsociados : number;
  numeroDocumentosPendientesDeAsociar: number;
  numeroDocumentosAnulados: number;
  otroDocumentoDtoList : OtroDocumentoDto[]
}
