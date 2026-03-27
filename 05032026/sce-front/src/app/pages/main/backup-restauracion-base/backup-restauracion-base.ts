import {Component, DestroyRef, inject, OnInit} from "@angular/core";
import {AuthComponent} from "../../../helper/auth-component";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { DialogoConfirmacionComponent } from "../dialogo-confirmacion/dialogo-confirmacion.component";
import { PopMensajeData } from "src/app/interface/popMensajeData.interface";
import { PopMensajeComponent } from "../../shared/pop-mensaje/pop-mensaje.component";
import {IconPopType} from '../../../model/enum/iconPopType';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  template: '' // Componente abstracto
})
export abstract class BackupRestauracionBase extends AuthComponent implements OnInit {

  destroyRef = inject(DestroyRef);

  tituloComponent = "Respaldo";
  accion: string | null = null;
  enProceso: boolean = false;
  finalizado: boolean = false;
  selectedFile: File | null = null;

  constructor(
    protected readonly route: ActivatedRoute,
    public dialogo: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.accion = params.get('accion');
        this.iniciarComponente();
      });
  }

  iniciarComponente(): void {
    this.enProceso = false;
    this.finalizado = false;
    this.iniciarComponenteEspecifico();
  }

  // Método abstracto que cada componente hijo debe implementar
  protected abstract iniciarComponenteEspecifico(): void;

  // Método abstracto para validar antes del backup
  protected abstract validarAntesDelBackup(): boolean;

  // Método abstracto para realizar el backup
  protected abstract ejecutarBackup(): void;

  // Método abstracto para realizar el restore
  protected abstract ejecutarRestore(event: Event): void;

  // Método abstracto para obtener el servicio
  protected abstract obtenerServicioBackupRestore(): any;

  confirmacionBackup() {
    if (!this.validarAntesDelBackup()) {
      return;
    }

    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `¿Desea realizar un backup de la base de datos?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.obtenerServicioBackupRestore().validarUsuariosConectados().subscribe(response => {
            if (response.success) {
              this.ejecutarBackup();
            } else {
              this.dialogo
                .open(DialogoConfirmacionComponent, {
                  data: response.message + ' ¿Desea continuar?'
                })
                .afterClosed()
                .subscribe((confirmadobk: boolean) => {
                  if (confirmadobk) {
                    this.ejecutarBackup();
                  }
                });
            }
          });
        }
      });
  }

  confirmacionRestore(event: Event) {
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `¿Desea realizar una restauracion de la base de datos?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.obtenerServicioBackupRestore().validarUsuariosConectados().subscribe(response => {
            if (response.success) {
              this.ejecutarRestore(event);
            } else {
              this.dialogo
                .open(DialogoConfirmacionComponent, {
                  data: response.message + ' ¿Desea continuar?'
                })
                .afterClosed()
                .subscribe((confirmadobk: boolean) => {
                  if (confirmadobk) {
                    this.ejecutarRestore(event);
                  }
                });
            }
          });
        }
      });
  }

  protected procesarRespuestaBackup(response: any): void {
    this.enProceso = false;
    if (response.success && response.data) {
      const base64Data: string = response.data as string;
      const byteArray = this.base64ToUint8Array(base64Data);
      const blob = new Blob([byteArray], { type: 'application/sql' });

      let url: string = '';
      const a = document.createElement('a');
      try {
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = response.message;
        document.body.appendChild(a);
        a.click();
        this.finalizado = true;
      } catch (error){
        this.mensajePopup(this.tituloComponent, 'No se pudo generar la URL del archivo', IconPopType.ERROR);
        console.error(error);
      } finally {
        if(a.parentNode) {
          document.body.removeChild(a);
        }
        if(url){
          window.URL.revokeObjectURL(url);
        }
      }
    } else {
      this.mensajePopup(this.tituloComponent, response.message, IconPopType.ERROR);
    }
  }

  protected manejarErrorBackup(error: any): void {
    this.enProceso = false;
    this.mensajePopup(this.tituloComponent, "Error al realizar el backup. Por favor, inténtelo de nuevo más tarde.", IconPopType.ERROR);
    console.error('Error al realizar el backup:', error);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes: Uint8Array = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }catch (error) {
      console.error('Error al decodificar base64:', error);
      return new Uint8Array(0);
    }

  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  protected validarArchivoRestore(event: Event): boolean {
    event.preventDefault();
    if (this.selectedFile) {
      const fileName = this.selectedFile.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'sql') {
        this.mensajePopup(this.tituloComponent, "El archivo seleccionado no es un archivo .sql.", IconPopType.ERROR);
        return false;
      }
      return true;
    } else {
      this.mensajePopup(this.tituloComponent, "No se ha seleccionado ningún archivo.", IconPopType.ERROR);
      return false;
    }
  }

  protected procesarRespuestaRestore(response: any): void {
    this.enProceso = false;
    if (response.success) {
      this.finalizado = true;
    } else {
      this.mensajePopup(this.tituloComponent, response.message, IconPopType.ERROR);
    }
  }

  protected manejarErrorRestore(error: any): void {
    this.enProceso = false;
    this.mensajePopup(this.tituloComponent, "Error al restaurar la base de datos. Por favor, inténtelo de nuevo más tarde.", IconPopType.ERROR);
    console.error('Error al restaurar:', error);
  }

  mensajePopup(title: string, mensaje: string, icon: string) {
    let popMensaje: PopMensajeData = {
      title: title,
      mensaje: mensaje,
      icon: icon,
      success: true
    }
    this.dialogo.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }
}
