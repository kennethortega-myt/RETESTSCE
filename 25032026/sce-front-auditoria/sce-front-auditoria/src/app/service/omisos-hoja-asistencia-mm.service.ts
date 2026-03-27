import {Injectable} from "@angular/core";
import {OmisosHojaAsistenciaMmServiceApi} from "../service-api/omisos-hoja-asistencia-mm-service-api.service";
import {Observable} from "rxjs";
import {GenericResponseBean} from "../model/genericResponseBean";
import {VerificationMmBean} from "../model/verificationMmBean";
import {PadronBean} from "../model/padronBean";

@Injectable({
  providedIn: 'root',
})
export class OmisosHojaAsistenciaMmService{
  constructor(private readonly omisosHojaAsistenciaMmServiceApi: OmisosHojaAsistenciaMmServiceApi) {
  }

  getRandomMiembrosMesa(reprocesar: boolean, tipoDenuncia: string): Observable<GenericResponseBean<VerificationMmBean>>{
    return this.omisosHojaAsistenciaMmServiceApi.getRandomMiembrosMesa(reprocesar, tipoDenuncia);
  }

  saveMiembrosMesa(data: VerificationMmBean, reprocesar: boolean): Observable<GenericResponseBean<boolean>>{
    return this.omisosHojaAsistenciaMmServiceApi.saveMiembrosMesa(data, reprocesar);
  }

  rechazarMiembrosMesa(mesaId: number): Observable<GenericResponseBean<boolean>>{
    return this.omisosHojaAsistenciaMmServiceApi.rechazarMiembrosMesa(mesaId)
  }

  consultaPadron(dni: string, mesa:string, omitirMesa?: boolean): Observable<GenericResponseBean<PadronBean>>{
    return this.omisosHojaAsistenciaMmServiceApi.consultaPadron(dni, mesa, omitirMesa)
  }
}
