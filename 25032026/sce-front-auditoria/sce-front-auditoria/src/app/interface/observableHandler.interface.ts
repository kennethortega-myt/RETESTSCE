export interface IObservacionHandler {
  changeObservacion(i: number, event: any): void;
  confirmarSinDatos(): void;
  cancelarSinDatos(event: any): void;
}
