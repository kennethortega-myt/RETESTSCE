export interface IRelativeCoordinatesInterface{
  areas: Array<IareaCoordinates>;
  image: string;
  abreviatura :string;
}

export interface IareaCoordinates{
  bottomRight:ICoordenada;
  name: string;
  topLeft:ICoordenada;
  id?:number
  width?: number;

  height?: number;
}

export interface ICoordenada{
  x:number;
  y:number;
}
