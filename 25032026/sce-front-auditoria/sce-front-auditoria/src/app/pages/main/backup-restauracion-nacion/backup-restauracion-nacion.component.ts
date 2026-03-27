import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Usuario } from "src/app/model/usuario-bean";
import { FormControl } from "@angular/forms";
import { ProcesoElectoralResponseBean } from "src/app/model/procesoElectoralResponseBean";
import { Subject, takeUntil } from "rxjs";
import { BackupRestauracionNacionService } from "src/app/service/backup-restore-nacion.service";
import { BackupRestauracionBase } from '../backup-restauracion-base/backup-restauracion-base';
import {IconPopType} from '../../../model/enum/iconPopType';



@Component({
    selector: 'app-backrestore',
    templateUrl: './backup-restauracion-nacion.component.html'
})
export class BackupRestauracionNacionComponent extends BackupRestauracionBase {
  public usuario: Usuario;
  procesoFormControl = new FormControl(0);
  listProceso: Array<ProcesoElectoralResponseBean>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  acronimoProcesoSelected: string = '';

  constructor(
    private readonly backrestoreNacionService: BackupRestauracionNacionService,
    route: ActivatedRoute,
    dialogo: MatDialog
  ) {
    super(route, dialogo);
    this.listProceso = [];
  }

  protected iniciarComponenteEspecifico(): void {
    this.acronimoProcesoSelected = "";
    this.usuario = this.authentication();
    this.backrestoreNacionService
      .obtenerProcesos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response.success) {
          this.listProceso = response.data;
        } else {
          // this.utilityService.mensajePopup(this.tituloComponente,"Hubo un problema al cargar la lista de actas.",IconPopType.ALERT)
        }
      });
  }

  protected validarAntesDelBackup(): boolean {
    if (this.acronimoProcesoSelected == '') {
      this.mensajePopup(this.tituloComponent, "Seleccione un proceso electoral", IconPopType.ERROR);
      return false;
    }
    return true;
  }

  protected ejecutarBackup(): void {
    this.enProceso = true;
    this.backrestoreNacionService.backup(this.acronimoProcesoSelected).subscribe({
      next: response => this.procesarRespuestaBackup(response),
      error: error => this.manejarErrorBackup(error)
    });
  }

  protected ejecutarRestore(event: Event): void {
    if (!this.validarArchivoRestore(event)) {
      return;
    }

    this.enProceso = true;
    this.backrestoreNacionService.restore(this.acronimoProcesoSelected, this.selectedFile).subscribe({
      next: response => this.procesarRespuestaRestore(response),
      error: error => this.manejarErrorRestore(error)
    });
  }

  protected obtenerServicioBackupRestore(): any {
    return this.backrestoreNacionService;
  }

  seleccionarProceso() {
    if (!this.procesoFormControl.value || this.procesoFormControl.value == 0) {
      this.acronimoProcesoSelected = '';
    }
    if (+this.procesoFormControl.value > 0) {
      const procesoEncontrado = this.listProceso.find(p => p.id === this.procesoFormControl.value);
      if (procesoEncontrado) {
        this.acronimoProcesoSelected = procesoEncontrado.acronimo;
      } else {
        this.acronimoProcesoSelected = '';
      }
    }
  }
}
