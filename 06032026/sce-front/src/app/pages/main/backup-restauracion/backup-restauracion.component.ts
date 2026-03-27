import { BackupRestauracionService } from "src/app/service/backup-restore.service";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { BackupRestauracionBase } from "../backup-restauracion-base/backup-restauracion-base";


@Component({
    selector: 'app-backrestore',
    templateUrl: './backup-restauracion.component.html'
})
export class BackupRestauracionComponent extends BackupRestauracionBase {
  constructor(
    private readonly backrestoreService: BackupRestauracionService,
    route: ActivatedRoute,
    dialogo: MatDialog
  ) {
    super(route, dialogo);
  }

  protected iniciarComponenteEspecifico(): void {
    // No hay lógica específica para este componente
  }

  protected validarAntesDelBackup(): boolean {
    // No hay validaciones específicas para este componente
    return true;
  }

  protected ejecutarBackup(): void {
    this.enProceso = true;
    this.backrestoreService.backup().subscribe({
      next: response => this.procesarRespuestaBackup(response),
      error: error => this.manejarErrorBackup(error)
    });
  }

  protected ejecutarRestore(event: Event): void {
    if (!this.validarArchivoRestore(event)) {
      return;
    }

    this.enProceso = true;
    this.backrestoreService.restore(this.selectedFile).subscribe({
      next: response => this.procesarRespuestaRestore(response),
      error: error => this.manejarErrorRestore(error)
    });
  }

  protected obtenerServicioBackupRestore(): any {
    return this.backrestoreService;
  }
}
