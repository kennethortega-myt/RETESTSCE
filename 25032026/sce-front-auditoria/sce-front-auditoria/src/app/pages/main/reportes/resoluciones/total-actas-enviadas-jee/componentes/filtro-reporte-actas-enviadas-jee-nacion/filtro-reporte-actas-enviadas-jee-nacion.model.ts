export class FiltroReporteActasEnviadasJEENacionModel {

  proceso: {
    id: number,
    codigo: string,
    nombre: string,
    esquema: string,
    acronimo?: string;
  };
  eleccion: {
    id: number,
    codigo: string,
    nombre: string
  };
  centroComputo: {
    id: number,
    codigo: string,
    nombre: string
  };
  ambitoElectoral: {
    id: number,
    codigo: string,
    nombre: string
  };
  preferencial: number;
  tipoConsulta: {
    id: number,
    codigo: string,
    nombre: string
  };
  agrupado: {
    id: number,
    codigo: string,
    nombre: string
  };
}
