export interface IGenericInterface<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IDatosGeneralResponse {
  id: number;
  nombre: string;
  img?: string;
  archivo?: any;
  principal?: any;
  codigo?: any;
}

export interface IDatosGeneralRequest {
  id?: number;
  nombre: string;
  activo: number;
  usuario: string;
}

export interface GenericRequestInterface {
  id?: number;
  estado?: number;
}

export interface IDocumentoElectoralRequest {
  id?: number;
  nombre: string;
  abreviatura?: string;
  tipoImagen?: number;
  escanerAmbasCaras?: number;
  tamanioHoja?: number;
  multipagina?: number;
  codigoBarraOrientacion?: number;
  activo: number;
  usuario: string;
}

export interface IDocumentoElectoralResponse {
  id: number;
  nombre: string;
  img?: string;
  archivo?: any;
  activo?: number;
  abreviatura?: string;
  tipoImagen?: number;
  escanerAmbasCaras?: number;
  tamanioHoja?: number;
  multipagina?: number;
  codigoBarraOrientacion?: number;
  codigo?: string;
}

export interface SearchFilterResponse<T> {
  page: number;
  size: number;
  list: Array<T>;
  total: number;
  totalPages: number;
}

export interface IComboResponse {
  id: number;
  descripcion: string;
}

export interface IRespaldoDto{
  nombreArchivo: string;
  fechaHora: string;
}
