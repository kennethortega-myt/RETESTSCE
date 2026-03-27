export interface IUsuario {
  id: number; // Correspondiente a Long en Java
  usuario: string;
  tipoDocumento: number | null;
  documento: string | null;
  perfil: string;
  nombrePerfil: string;
  acronimoProceso: string;
  nombreCentroComputo: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  correo: string | null;
  centroComputo: string;
  sesionActiva: number; // Correspondiente a Integer en Java (puede ser null)
  actasAsignadas: number | null;
  actasAtendidas: number | null;
  activo: number | null;
  usuarioCreacion: string | null;
  fechaCreacion: Date | null;
  usuarioModificacion: string | null;
  fechaModificacion: Date | null;
  desincronizadoSasa: boolean | null;
  personaAsignada: number | null;
}

export type UsuarioDetailResponse = {
  usuario: IUsuario;
  usuarioSasa: UsuarioSasa | null;
};

export type UsuarioSasa = {
  id: number;
  usuario: string;
  estado: number;
  bloqueado: number;
  fechaBloqueo: string | null;
  persona: {
    id: number | null;
    nombres: string | null;
    numeroDocumento: string | null;
    apellidoPaterno: string | null;
    apellidoMaterno: string | null;
    tipoDocumento: number | null;
    correo: string | null;
    estado: number | null;
  };
};

export type UsuarioUpdateRequestData = {
  tipoDocumento: number | null;
  documento: string | null;
  nombres: string | null;
  apellidoPaterno: string | null;
  apellidoMaterno: string | null;
  correo: string | null;
  activo: number | null;
};

export type UsuarioListFilter = {
  acronimoProceso?: string;
  centroComputo?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;
  perfil?: string;
  usuario?: string;
  documento?: string;
  personaAsignada?: number;
  desincronizado?: number;
};