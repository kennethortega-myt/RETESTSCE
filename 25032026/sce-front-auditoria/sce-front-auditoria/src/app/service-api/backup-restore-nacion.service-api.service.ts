import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AuthService } from "../service/auth-service.service";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { Constantes } from "../helper/constantes";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";

@Injectable({
    providedIn: "root"
})
export class BackupRestauracionNacionApi {
    private readonly urlServidor: string;

    constructor(private readonly httpClient: HttpClient, public auth: AuthService) {
        this.urlServidor = environment.apiUrl+'/';;
    }

    backup(acronimo:string): Observable<GenericResponseBean<string>> {
        return this.httpClient.get<GenericResponseBean<string>>(
            this.urlServidor + Constantes.CB_BACKUP_RESTORE_CONTROLLER_BACKUP,
          {
            headers:  { 'Authorization': "Bearer " + this.auth.getCToken(), 'X-Tenant-Id': acronimo}
          }
        );
    }

    restore(acronimo:string, file: File): Observable<GenericResponseBean<string>> {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);

        const headers = new HttpHeaders({
            'Authorization': "Bearer " + this.auth.getCToken(),
            'X-Tenant-Id': acronimo
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

    obtenerProcesos():Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
        return this.httpClient.get<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>(
        this.urlServidor + 'configuracionProcesoElectoral');
    }
}
