import {HttpErrorResponse} from '@angular/common/http';
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Usuario } from 'src/app/model/usuario-bean';
import { environment } from 'src/environments/environment';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DescargaInstalacionService} from "../../../service/descarga-instalacion.Service";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import { ModalImgComponent } from './modal-img/modal-img.component';
import {IconPopType} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-descarga-instalacion',
  templateUrl: './descarga-instalacion.component.html',
})
export class DescargaInstalacionComponent extends AuthComponent implements OnInit {



    steps = [
      { imageUrl: '../assets/img/pasos/intall_02-100.jpg', description: 'Bienvenido al asistente de instalación de SCE-Scanner' },
      { imageUrl: '../assets/img/pasos/intall_03-100.jpg', description: 'Seleccione la carpeta de destino' },
      { imageUrl: '../assets/img/pasos/intall_04-100.jpg', description: 'Seleccione la carpeta del Menú inicio' },
      { imageUrl: '../assets/img/pasos/intall_05-100.jpg', description: 'Seleccione las tareas adicionales' },

      { imageUrl: '../assets/img/pasos/intall_06-100.jpg', description: 'Listo para instalar' },
      { imageUrl: '../assets/img/pasos/intall_07-100.jpg', description: 'Instalando... espere que termine el proceso de instalación' },
      { imageUrl: '../assets/img/pasos/intall_08-100.jpg', description: 'Completando la instalación de SCE-Scanner' },
      { imageUrl: '../assets/img/pasos/intall_09-100.jpg', description: 'Pantalla de inicio' },

      // Otras imágenes...
    ];

    openModal(index: number): void {
      const dialogRef = this.dialog.open(ModalImgComponent, {
        maxWidth: '100%',
        data: {
          steps: this.steps,
          currentIndex: index
        }
      });
    }



  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public usuario: Usuario;
  public progresoDownload:number = 0;
  public baseUrl: string;
  public fileName: string = 'setup-sce-scanner.zip';

  constructor(
    private readonly dialog: MatDialog,
    private readonly descargaInstalacionService:DescargaInstalacionService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.usuario = this.authentication();

    this.baseUrl = environment.apiUrlORC;
    this.progresoDownload = 0;
  }

  downloadFile() {
    sessionStorage.setItem('loading','true');

    this.descargaInstalacionService.downloadInstalador(this.fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.downloadInstaladorCorrecto.bind(this),
        error: this.downloadInstaladorIncorrecto.bind(this)
      });

  }

  downloadInstaladorCorrecto(response: any){
    sessionStorage.setItem('loading','false');
    if (response == null){
      this.mensajePopup("Descarga e Instalación", "No cumple con el tipo de archivo .zip.", IconPopType.ALERT);
    }else{
      this.saveFile(response);
    }

  }

  downloadInstaladorIncorrecto(response: HttpErrorResponse){
    console.log("josjose")
    console.log(response);
    sessionStorage.setItem('loading','false');

    if (response?.error?.message) {
      this.mensajePopup("Descarga e Instalación",response.error.message, IconPopType.ALERT);
    } else {
      this.mensajePopup("Descarga e Instalación", "No se encontró el archivo instalador.zip", IconPopType.ALERT);
    }

  }

  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  saveFile(data: Blob) {
    const a = document.createElement('a');
    const file = new Blob([data], { type: 'application/octet-stream' });
    a.href = URL.createObjectURL(file);
    a.download = this.fileName;
    a.click();
  }

}
