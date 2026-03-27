export const ACCIONES_TABLA = {
  ELIMINAR: 'eliminar',
  VER_PLOMO: 'verPlomo',
  VER_CELESTE: 'verCeleste',
  CARGO: 'cargo',
  OFICIO: 'oficio',
  TRANSMITIR: 'transmitir'
} as const;

export type TipoAccionTabla = typeof ACCIONES_TABLA[keyof typeof ACCIONES_TABLA];
