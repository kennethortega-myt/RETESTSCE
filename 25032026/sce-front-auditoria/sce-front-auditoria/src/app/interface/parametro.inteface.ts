export interface IParametro{
  id: number;
  parametro: string;
  activo: number;
  usuarioCreacion: string;
  fechaCreacion: number;
  usuarioModificacion?: string | null;
  fechaModificacion?: number | null;
  detalles?: Array<IDetalleParametro>;

}

export interface IDetalleParametro{
  id: number;
  nombre: string;
  valor: string;
  tipoDato: number;
  parametro: IParametro;
  descripcion: string;
  activo: number;
  usuarioCreacion: string;
  fechaCreacion: number;
  usuarioModificacion?: string | null;
  fechaModificacion?: number | null;
  isEditar?: boolean;
}
