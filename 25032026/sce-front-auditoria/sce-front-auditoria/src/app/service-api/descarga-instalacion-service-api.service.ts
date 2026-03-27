import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {AuthService} from '../service/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class DescargaInstalacionServiceApi{
  private readonly urlServidor: string;

  constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
    this.urlServidor = environment.apiUrlORC;
  }

  downloadInstalador(fileName: string): Observable<any>{
    return this.httpClient.get(`${this.urlServidor}instalador/download/instalador`,{
      responseType:"blob",
      headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
    })
      .pipe(
        map(res =>this.validarDescargaBlob(res)));

  }

  validarDescargaBlob(data: any) {
    if (data.type === "application/octet-stream" && data.size > 0) {
      return new Blob([data], { type: "application/octet-stream" });
    } else {
      return null;
    }
  }
}
