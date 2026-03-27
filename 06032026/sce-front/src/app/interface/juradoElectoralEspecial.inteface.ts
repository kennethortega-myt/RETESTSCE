export interface IJuradoELectoralEspecial{
  id: number;
  idCentroComputo: number;
  codigoCentroComputo: string;
  nombreCentroComputo: string;
  idJEE: string;
  nombreJEE: string;
  direccion: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreRepresentante: string;
  usuarioModificacion?: string | null;
  isEdit?: boolean;
}
