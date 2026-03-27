import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../service/auth-service.service";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { Constantes } from "../helper/constantes";
import {IRespaldoDto} from '../interface/general.interface';

@Injectable({
    providedIn: "root"
})
export class BackupRestauracionApi {
    private readonly urlServidor: string;

    constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
        this.urlServidor = environment.apiUrlORC;
    }

    backup(): Observable<GenericResponseBean<string>> {
        return this.httpClient.get<GenericResponseBean<string>>(
            this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_BACKUP,
          {
            headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
          }
        );
    }

    restore(file: File): Observable<GenericResponseBean<string>> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        const headers = new HttpHeaders({
            'Authorization': "Bearer " + this.auth.getCToken()
        });

        return this.httpClient.post<GenericResponseBean<string>>(
            this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_RESTORE,
            formData,
            { headers: headers }
        );
    }

    validarUsuariosConectados(): Observable<GenericResponseBean<string>> {
        return this.httpClient.get<GenericResponseBean<string>>(
            this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_VALIDAR,
          {
            headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
          }
        );
    }

  listar(): Observable<GenericResponseBean<Array<IRespaldoDto>>> {
    return this.httpClient.get<GenericResponseBean<Array<IRespaldoDto>>>(
      this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_LISTAR,
      {
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }

  descargar(nombre:string){
    return this.httpClient.get(
      this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_DOWNLOAD,
      {
        params: {id: nombre},
        responseType: "blob",
        observe: 'events',
        reportProgress: true,
        headers:  { 'Authorization': "Bearer " + this.auth.getCToken()}
      }
    );
  }
}
