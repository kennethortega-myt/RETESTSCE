export class FiltroReporteModeloDos {

    proceso: {
        id: number,
        codigo: string,
        nombre: string,
        esquema: string
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
    ubigeoNivelUno: {
        id: number,
        codigo: string,
        nombre: string
    };
    ubigeoNivelDos: {
        id: number,
        codigo: string,
        nombre: string
    };
    ubigeoNivelTres: {
        id: number,
        codigo: string,
        nombre: string
    };
    preferencial: number;
    mesa: string;
}
