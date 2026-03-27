import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-shared-backup-restore',
  templateUrl: './backup-restauracion-formulario.component.html'
})
export class BackupRestauracionFormularioComponent {
  @Input() accion: string = '';
  @Input() finalizado: boolean = false;
  @Input() enProceso: boolean = false;
  @Input() listProceso: any[] = [];
  @Input() procesoFormControl: any;
  @Input() showProcessSelector: boolean = false;

  @Output() confirmacionBackupEvent = new EventEmitter<void>();
  @Output() confirmacionRestoreEvent = new EventEmitter<Event>();
  @Output() fileSelectedEvent = new EventEmitter<Event>();
  @Output() seleccionarProcesoEvent = new EventEmitter<void>();

  confirmacionBackup() {
    this.confirmacionBackupEvent.emit();
  }

  confirmacionRestore(event: Event) {
    this.confirmacionRestoreEvent.emit(event);
  }

  onFileSelected(event: Event) {
    this.fileSelectedEvent.emit(event);
  }

  seleccionarProceso() {
    this.seleccionarProcesoEvent.emit();
  }
}
