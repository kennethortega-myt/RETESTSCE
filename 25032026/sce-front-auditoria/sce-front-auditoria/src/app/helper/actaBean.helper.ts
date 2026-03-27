// src/app/helpers/acta.helper.ts

import { ActaBean } from 'src/app/model/resoluciones/acta-jee-bean';

export function crearActaBeanMinimo(data: {
  actaId: number;
  idArchivoEscrutinio: string;
  idArchivoInstalacionSufragio: string;
  idArchivoEscrutinioFirmado:string;
  idArchivoInstalacionFirmado:string;
  idArchivoSufragioFirmado:string;
  staeIntegrada: boolean;
}): ActaBean {
  return {
    actaId: data.actaId,
    idArchivoEscrutinio: data.idArchivoEscrutinio,
    idArchivoInstalacionSufragio: data.idArchivoInstalacionSufragio,
    idArchivoEscrutinioFirmado: data.idArchivoEscrutinioFirmado,
    idArchivoInstalacionFirmado: data.idArchivoInstalacionFirmado,
    idArchivoSufragioFirmado: data.idArchivoSufragioFirmado,
    // Rellenamos con valores por defecto para cumplir con ActaBean
    index: 0,
    mesaId: 0,
    cantidadColumnas: 0,
    resolucionId: 0,
    mesa: '',
    copia: '',
    eleccion: '',
    codigoEleccion: '',
    codigoProceso: '',
    estadoActa: '',
    estadoComputo: '',
    estadoResolucion: '',
    estadoDigitalizacion: '',
    estadoMesa: '',
    estadoDigitacion: '',
    tipoResolverExtraviadaSiniestrada: '',
    descripcionEstadoActa: '',
    descripcionEstadoMesa: '',
    electoresHabiles: 0,
    cvas: '',
    ubigeo: '',
    localVotacion: '',
    fecha: '',
    imagenEscrutinio: '',
    horaEscrutinio: '',
    imagenInstalacion: '',
    horaInstalacion: '',
    errorMaterial: '',
    tipoErrorM: '',
    votosImpugnados: '',
    ilegibilidad: '',
    tipoIlegible: '',
    detalleIlegible: '',
    actasIncompletas: '',
    solNulidad: '',
    actaSinDatos: '',
    actaSinFirma: '',
    observacion: '',
    observacionesJNE: '',
    tipoLote: '',
    extraviada: '',
    siniestrada: '',
    obsMesa: '',
    tipoTransmision: 0,
    tipoComboNulos: '',
    agrupacionesPoliticas: [],
    staeIntegrada: data.staeIntegrada,
    flujoAutomatizado: false
  };
}
