import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GenericResponseBean } from "../model/genericResponseBean";
import { BackupRestauracionApi } from "../service-api/backup-restore.service-api.service";
import {IRespaldoDto} from '../interface/general.interface';

@Injectable({
    providedIn: 'root',
})
export class BackupRestauracionService {
    constructor(private readonly backupRestauracionApi: BackupRestauracionApi) {
    }

    backup(): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.backup();
    }

    restore(file: File): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.restore(file);
    }

    validarUsuariosConectados(): Observable<GenericResponseBean<string>> {
        return this.backupRestauracionApi.validarUsuariosConectados();
    }

  listar(): Observable<GenericResponseBean<Array<IRespaldoDto>>> {
    return this.backupRestauracionApi.listar();
  }
  descargar(nombre: string) {
    return this.backupRestauracionApi.descargar(nombre);
  }
}
