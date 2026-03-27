export interface IArchivo {
  id?: number;

  guid?: string;

  nombre: string;

  nombreOriginal: string;

  formato: string;

  peso: string;

  ruta?: string;

  activo?: number;

  usuario?: string;
}
