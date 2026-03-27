import {MesaBean} from '../model/mesaBean';
import {IOrganizacionPolitica} from './organizacionPolitica.interface';
import {IMiembroMesaEscrutinioRequest} from './miembroMesaEscritunio.interface';

export interface IPersonero{
  id?: number;
  documentoIdentidad: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  mesa: MesaBean;
  agrupacionPolitica: IOrganizacionPolitica;
  organizacion?: string;
  apellidos?: string;
  tipoFiltro?: number;
  activo: number;

}

export interface IPersoneroRequest{
  personeros: Array<IPersonero>;
  tipoFiltro?: number;
  mesa: MesaBean;
  actaId?: number;
  acronimoProceso?: string;
}

export interface IRegistroPersonero{
  mesaId: number;
  type: string;
  mesa: string;
  electoresHabiles: number;
  electoresAusentes: number;
  electoresOmisos: number;
  localVotacion: string;
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  paginas?: any[];
  secciones?: MiembroMesaEscrutinioSeccionesDto;
  fileId?: any;
  actaId?: number;
  data?: Array<IMiembroMesaEscrutinioRequest>;
  archivoEscrutinioId?: number;
  archivoInstalacionId?: number;
}

export interface MiembroMesaEscrutinioSeccionesDto{
  archivoPresidente: ArchivosRectanguloDto;
  archivoSecretario: ArchivosRectanguloDto;
  archivoTercerMiembro: ArchivosRectanguloDto;
}

export interface ArchivosRectanguloDto{
  fileId: number;
  systemValue: string;
}
