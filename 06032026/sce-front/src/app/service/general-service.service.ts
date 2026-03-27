import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GeneralServiceApi } from '../service-api/general-service-api.service';
import { ItemBean } from '../model/item-bean';
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
import {LocalVotacionBean} from "../model/localVotacionBean";
import {MesaBean} from "../model/mesaBean";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PopMensajeData} from "../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../pages/shared/pop-mensaje/pop-mensaje.component";
import {OrcDetalleCatalogoEstructuraBean} from "../model/orcDetalleCatalogoEstructuraBean";

@Injectable({
  providedIn: 'root',
})
export class GeneralService {

  public dialogoGeneral: MatDialogRef<PopMensajeComponent>;
  constructor(
    private readonly generalServiceApi: GeneralServiceApi,
    private readonly dialogo: MatDialog,
  ) {}


  obtenerProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
    return this.generalServiceApi.obtenerProcesos();
  }

  obtenerElecciones(idProceso: number):Observable<GenericResponseBean<Array<EleccionResponseBean>>>{
    return this.generalServiceApi.obtenerElecciones(idProceso);
  }

  obtenerUsuarioSession(){
    return "jcisnerosp";
  }

  obtenerDetCatalogoEstructura(cMaestro:string, cColumna: string): Observable<IGenericInterface<OrcDetalleCatalogoEstructuraBean[]>> {
    return this.generalServiceApi.obtenerDetCatalogoEstructura(cMaestro, cColumna);
  }

  getDepartamento(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean):Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>>{
    return this.generalServiceApi.getDepartamento(filtroUbigeoDepartamentoBean);
  }
  getProvincia(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean):Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>>{
    return this.generalServiceApi.getProvincia(filtroUbigeoProvinciaBean);
  }
  getDistrito(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean):Observable<GenericResponseBean<Array<UbigeoDistritoBean>>>{
    return this.generalServiceApi.getDistrito(filtroUbigeoDistritoBean);
  }

  getListAmbitos(): Observable<GenericResponseBean<Array<AmbitoBean>>>{
    return this.generalServiceApi.getListAmbitos();
  }

  getTipoAmbitoPorProceso(idProceso: string):Observable<GenericResponseBean<ProcesoAmbitoBean>>{
    return this.generalServiceApi.getTipoAmbitoPorProceso(idProceso);
  }

  getCentrosComputo():Observable<GenericResponseBean<Array<CentroComputoBean>>>{
    return this.generalServiceApi.getCentrosComputo();
  }

  obtenerDepartamento() : Observable<Array<ItemBean>>{
    return this.generalServiceApi.obtenerDepartamento();
  }


  obtenerProvincia(idDepartamento: string) : Observable<Array<ProvinciaBean>>{
    return this.generalServiceApi.obtenerProvincia(idDepartamento);
  }

  obtenerDistrito(idDepartamento: string, idProvincia:string) : Observable<Array<DistritoBean>>{
    return this.generalServiceApi.obtenerDistrito(idDepartamento, idProvincia);
  }

  obtenerLocalVotacionPorUbigeo( ubigeo: string): Observable<GenericResponseBean<Array<LocalVotacionBean>>>{
    return this.generalServiceApi.obtenerLocalVotacionPorUbigeo(ubigeo);
  }

  obtenerMesaPorLocalVotacion(idLocalVotacion: number): Observable<GenericResponseBean<Array<MesaBean>>>{
    return this.generalServiceApi.obtenerMesaPorLocalVotacion(idLocalVotacion);
  }

  obtenerLocalVotacion() : Observable<Array<CentEducativoBean>>{
    return this.generalServiceApi.obtenerLocalVotacion();
  }

  cerrarSesion(userName: string): Observable<GenericResponseBean<string>> {
    return this.generalServiceApi.cerrarSesion(userName);
  }

  cerrarSesionActiva(userName :string): Observable<GenericResponseBean<string>> {
    return this.generalServiceApi.cerrarSesionActiva(userName);
  }

  procesoVigente(): Observable<GenericResponseBean<any>> {
    return this.generalServiceApi.procesoVigente();
  }

  openDialogoGeneral = async (pop: PopMensajeData) => {
    this.dialogoGeneral = this.dialogo.open(PopMensajeComponent, {
      width: '20%',
      disableClose: true,
      data: pop
    });
    return this.dialogoGeneral;
  }

  getDepartamentoPorProceso(filtroUbigeoDepartamentoBean: FiltroUbigeoDepartamentoBean):Observable<GenericResponseBean<Array<UbigeoDepartamentoBean>>>{
    return this.generalServiceApi.getDepartamentoPorProceso(filtroUbigeoDepartamentoBean);
  }
  getProvinciaPorProceso(filtroUbigeoProvinciaBean: FiltroUbigeoProvinciaBean):Observable<GenericResponseBean<Array<UbigeoProvinciaBean>>>{
    return this.generalServiceApi.getProvinciaPorProceso(filtroUbigeoProvinciaBean);
  }
  getDistritoPorProceso(filtroUbigeoDistritoBean: FiltroUbigeoDistritoBean):Observable<GenericResponseBean<Array<UbigeoDistritoBean>>>{
    return this.generalServiceApi.getDistritoPorProceso(filtroUbigeoDistritoBean);
  }
  obtenerAmbitoElectoralPorCentroComputo(idCentroComputo:number): Observable<any>{
    return this.generalServiceApi.obtenerAmbitoElectoralPorCentroComputo(idCentroComputo);
  }

}
