import {Injectable} from "@angular/core";
import {ControlHojaAsistenciaMMServiceApi} from "../service-api/control-hoja-asistencia-mm-service-api.service";
import {Observable} from "rxjs";
import {DigitizationListMesasBean} from "../model/digitizationListMesasBean";

@Injectable({
  providedIn: 'root',
})
export class ControlHojaAsistenciaMmService{
  constructor(private readonly controlHojaAsistenciaMMServiceApi: ControlHojaAsistenciaMMServiceApi) {
  }

  listaMiembrosMesa():Observable<Array<DigitizationListMesasBean>>{
    return this.controlHojaAsistenciaMMServiceApi.listaMiembrosMesa();
  }

  aprobarlistaMM(mesaId: number, tipoDoc: string):Observable<boolean>{
    return this.controlHojaAsistenciaMMServiceApi.aprobarlistaMM(mesaId,tipoDoc);
  }

  rechazarlistaMM(mesaId: number, tipoDoc: string):Observable<boolean>{
    return this.controlHojaAsistenciaMMServiceApi.rechazarlistaMM(mesaId,tipoDoc);
  }
}
