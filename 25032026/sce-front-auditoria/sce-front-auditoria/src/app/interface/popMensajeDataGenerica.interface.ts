export interface PopMensajeDataGenerica<T>{
  mensaje: T;
  title:string;
  icon:string;
  success: boolean;
  isQuestion?: boolean;
}
