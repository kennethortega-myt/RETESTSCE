import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {environment} from 'src/environments/environment';
import {Constantes} from '../helper/constantes';
import {ItemBean} from '../model/item-bean';
import {IGenericInterface} from "../interface/general.interface";
import {GenericResponseBean} from "../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../model/procesoElectoralResponseBean";
import {EleccionResponseBean} from "../model/eleccionResponseBean";
import {FiltroUbigeoDepartamentoBean} from "../model/FiltroUbigeoDepartamentoBean";
import {UbigeoDepartamentoBean} from "../model/UbigeoDepartamentoBean";
import {FiltroUbigeoProvinciaBean} from "../model/filtroUbigeoProvinciaBean";
import {UbigeoProvinciaBean} from "../model/ubigeoProvinciaBean";
import {FiltroUbigeoDistritoBean} from "../model/filtroUbigeoDistritoBean";
import {UbigeoDistritoBean} from "../model/ubigeoDistritoBean";
import {AmbitoBean} from "../model/ambitoBean";
import {ProcesoAmbitoBean} from "../model/procesoAmbitoBean";
import {CentroComputoBean} from "../model/centroComputoBean";
import {ProvinciaBean} from "../model/provincia-bean";
import {DistritoBean} from "../model/distrito";
import {CentEducativoBean} from "../model/cent-educativo-bean";
import {map, takeUntil} from "rxjs/operators";
import {LocalVotacionBean} from "../model/localVotacionBean";
import {MesaBean} from "../model/mesaBean";
import {AuthService} from "../service/auth-service.service";
import { AmbitoElectoralBean } from '../model/comunes/ambitoElectoralBean';
import {OrcDetalleCatalogoEstructuraBean} from "../model/orcDetalleCatalogoEstructuraBean";

@Injectable({
  providedIn: 'root',
})
export class GeneralServiceApi {
  private readonly urlServidor: string;
  private readonly urlServidorNacion: string;
  private readonly baseUrlSeguridad: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.baseUrlSeguridad = environment.apiUrlSeguridad;
    this.urlServidor = environment.apiUrlORC;
    this.urlServidorNacion = environment.apiUrl;
  }

  obtenerProcesoNacion(): Observable<Array<ItemBean>> {
    return this.httpClient.get<Array<ItemBean>>(
      this.urlServidorNacion + Constantes.CB_GENERAL_CONTROLLER_OBTENER_PROCESOS,
      {}
    );
  }


  obtenerProcesos(): Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>> {
    return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(
      this.urlServidor + Constantes.CB_PROCESO_CONTROLLER_LIST_PROCESOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      })
      .pipe(
        map(response => {

          if(response.data && Array.isArray(response.data)){
            response.data = response.data.map(proceso => ({
              ...proceso,
              dfechaConvocatoria: new Date(proceso.dfechaConvocatoria as any)
            }));
          }
          return response;
        })
      );
  }

  obtenerElecciones(idProceso: number): Observable<GenericResponseBean<Array<EleccionResponseBean>>> {
    return this.httpClient.get<GenericResponseBean<Array<EleccionResponseBean>>>(
      this.urlServidor + "proceso/" + idProceso + Constantes.CB_PROCESO_CONTROLLER_LIST_ELECCIONES,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }


  obtenerEleccionNacion(idProceso: string): Observable<Array<ItemBean>> {
    return this.httpClient.get<Array<ItemBean>>(
      this.urlServidorNacion +
      Constantes.CB_GENERAL_CONTROLLER_OBTENER_ELECCIONES +
      '?idProceso=' +
      idProceso,
      {}
    );
  }

  obtenerDetCatalogoEstructura(cMaestro: string, cColumna: string): Observable<IGenericInterface<OrcDetalleCatalogoEstructuraBean[]>> {
    return this.httpClient.get<IGenericInterface<OrcDetalleCatalogoEstructuraBean[]>>(
      this.urlServidor + Constantes.CB_GENERAL_CONTROLLER_DET_CATALOGO_ESTRUCTURA + '?c_maestro=' + cMaestro + '&c_columna=' + cColumna,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  getDepartamento(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean): Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDepartamentoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DEPARTAMENTO, filtroUbigeoDepartamentoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getProvincia(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean): Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoProvinciaBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_PROVINCIA, filtroUbigeoProvinciaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getDistrito(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean): Observable<GenericResponseBean<Array<UbigeoDistritoBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDistritoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DISTRITO, filtroUbigeoDistritoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getListAmbitos(): Observable<GenericResponseBean<Array<AmbitoBean>>> {
    return this.httpClient.get<GenericResponseBean<Array<AmbitoBean>>>(
      this.urlServidor + Constantes.CB_AMBITO_CONTROLLER_LIST_AMBITOS,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getTipoAmbitoPorProceso(idProceso: string): Observable<GenericResponseBean<ProcesoAmbitoBean>> {
    return this.httpClient.get<GenericResponseBean<ProcesoAmbitoBean>>(
      this.urlServidor + "proceso/" + idProceso + Constantes.CB_PROCESO_CONTROLLER_TIPO_AMBITO_POR_PROCESO,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getCentrosComputo(): Observable<GenericResponseBean<Array<CentroComputoBean>>> {
    return this.httpClient.get<GenericResponseBean<Array<CentroComputoBean>>>(
      this.urlServidor + Constantes.CB_CENTRO_COMPUTO_CONTROLLER_LIST_CENTROS_COMPUTO);
  }

  obtenerDepartamento(): Observable<Array<ItemBean>> {
    return this.httpClient.get<Array<ItemBean>>('assets/data/departamentos.json');
  }


  obtenerProvincia(idDepartamento: string): Observable<Array<ProvinciaBean>> {
    let listaProvincia = new Array<ProvinciaBean>();
    let parametro = "";
    if (+idDepartamento === 0) {
      parametro = "";
    } else {
      parametro = "" + idDepartamento;
    }

    this.obtenerProvinciaAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        for(const d of response){
          if (d.ID_DEPARTAMENTO == parametro) {
            listaProvincia.push(d);
          }
        }
      });

    return of(listaProvincia);
  }

  obtenerProvinciaAll(): Observable<Array<ProvinciaBean>> {
    return this.httpClient.get<Array<ProvinciaBean>>('assets/data/provincias.json');
  }

  obtenerDistrito(idDepartamento: string, idProvincia: string): Observable<Array<DistritoBean>> {
    let listaDistrito = new Array<DistritoBean>();
    this.obtenerDistritoAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(response => {
        for(const d of response){
          if (d.ID_DEPARTAMENTO == idDepartamento && d.ID_PROVINCIA == idProvincia) {
            listaDistrito.push(d);
          }
        }
      });
    return of(listaDistrito);
  }

  obtenerLocalVotacionPorUbigeo(ubigeo: string): Observable<GenericResponseBean<Array<LocalVotacionBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<LocalVotacionBean>>>(
      this.urlServidor + "ubigeos/locales-votacion", {"idUbigeo": ubigeo},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerMesaPorLocalVotacion(idLocalVotacion: number): Observable<GenericResponseBean<Array<MesaBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<MesaBean>>>(
      this.urlServidor + "ubigeos/mesas", {"idLocalVotacion": idLocalVotacion},
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerDistritoAll(): Observable<Array<DistritoBean>> {
    return this.httpClient.get<Array<DistritoBean>>('assets/data/distrito.json');
  }

  obtenerLocalVotacion(): Observable<Array<CentEducativoBean>> {
    return this.httpClient.get<Array<CentEducativoBean>>('assets/data/centros.json');
  }

  cerrarSesion(userName :string): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
    this.baseUrlSeguridad + '/' + Constantes.CB_USUARIO_CONTROLLER_CERRAR_SESION,
      {},
      {
        headers: {'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  cerrarSesionActiva(userName :string): Observable<GenericResponseBean<string>> {
    return this.httpClient.post<GenericResponseBean<string>>(
      this.baseUrlSeguridad + '/' + Constantes.CB_USUARIO_CONTROLLER_CERRAR_SESION_ACTIVA,
      {
        'usuario': userName
      },
      {}
    );
  }

  procesoVigente(): Observable<GenericResponseBean<any>> {
    return this.httpClient.get<GenericResponseBean<any>>(
      this.urlServidorNacion + "/configuracionProcesoElectoral/vigente",
      {
        headers: {'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  getDepartamentoPorProceso(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean): Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDepartamentoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DEPARTAMENTO_PROCESO, filtroUbigeoDepartamentoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getProvinciaPorProceso(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean): Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoProvinciaBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_PROVINCIA_PROCESO, filtroUbigeoProvinciaBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  getDistritoPorProceso(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean): Observable<GenericResponseBean<Array<UbigeoDistritoBean>>> {
    return this.httpClient.post<GenericResponseBean<Array<UbigeoDistritoBean>>>(
      this.urlServidor + Constantes.CB_UBIGEO_CONTROLLER_GET_DISTRITO_PROCESO, filtroUbigeoDistritoBean,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      });
  }

  obtenerAmbitoElectoralPorCentroComputo(idCentroComputo:number): Observable<GenericResponseBean<Array<AmbitoElectoralBean>>> {

      return this.httpClient.get<GenericResponseBean<Array<AmbitoElectoralBean>>>(
        this.urlServidorNacion + "/" + Constantes.CB_AMBITO_ELECTORAL_CONTROLLER_GET_AMBITO_ELECTORAL_POR_CENTRO_COMPUTO + idCentroComputo );
  }
}
