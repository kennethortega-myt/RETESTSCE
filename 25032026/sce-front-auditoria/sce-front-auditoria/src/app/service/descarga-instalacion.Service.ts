import {Injectable} from "@angular/core";
import {DescargaInstalacionServiceApi} from "../service-api/descarga-instalacion-service-api.service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DescargaInstalacionService{
  constructor(private readonly descargaInstalacionServiceApi: DescargaInstalacionServiceApi) {
  }

  downloadInstalador(fileName: string): Observable<any>{
    return this.descargaInstalacionServiceApi.downloadInstalador(fileName);
  }
}
