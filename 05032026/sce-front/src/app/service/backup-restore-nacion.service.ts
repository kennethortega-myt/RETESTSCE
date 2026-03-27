import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { ProcesoElectoralResponseBean } from "../model/procesoElectoralResponseBean";
import { BackupRestauracionNacionApi } from "../service-api/backup-restore-nacion.service-api.service";

@Injectable({
    providedIn: 'root',
})
export class BackupRestauracionNacionService {
    constructor(private readonly backupRestauracionApi: BackupRestauracionNacionApi) {
    }

    backup(acronimo: string): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.backup(acronimo);
    }

    restore(acronimo:string, file: File): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.restore(acronimo, file);
    }

    validarUsuariosConectados(): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.validarUsuariosConectados();
    }

    obtenerProcesos(): Observable<GenericResponseBean<Array<ProcesoElectoralResponseBean>>>{
        return this.backupRestauracionApi.obtenerProcesos();
    }
}
