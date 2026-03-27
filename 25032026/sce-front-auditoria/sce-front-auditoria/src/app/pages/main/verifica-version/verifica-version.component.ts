import { MatDialog } from '@angular/material/dialog';
import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import { ModalComponent } from '../verifica-version/modal/modal.component';
import { ModalReporteComponent } from '../verifica-version/modal-reporte/modal-reporte.component';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {VerificaVersionService} from "../../../service/verifica-version.service";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-verifica-version',
  templateUrl: './verifica-version.component.html',
  styleUrls: ['./verifica-version.component.scss']
})
export class VerificaVersionComponent implements OnInit{

  destroyRef:DestroyRef = inject(DestroyRef);
  isVisibleBtnPuestaCero: boolean;
  isVisibleBtnProcesar: boolean;
  isVisibleBtnReporte: boolean;
  isVisiblePersonaje: boolean;
  mensajePersonaje: string
  tituloComponent: string = "Verificación de Versión";


  constructor(public dialog: MatDialog,
              private readonly verificaVersionService:VerificaVersionService,
              private readonly utilityService:UtilityService
              ) {
    this.isVisibleBtnPuestaCero = true;
    this.isVisibleBtnProcesar = false;
    this.isVisibleBtnReporte = false;
    this.isVisiblePersonaje = true;
    this.mensajePersonaje = "";
  }

  ngOnInit() {
    this.mensajePersonaje = "Haga clic en Puesta a cero para realizar la verificación de versión."
  }

  reporteVerificaVersion(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionService.reporteVerificaVersion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reporteVerificaVersionCorrecto.bind(this),
        error: this.reporteVerificaVersionIncorrecto.bind(this)
      });
  }

  reporteVerificaVersionCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.ALERT);
    }else{
      this.openModal2(response.data)
    }
  }
  reporteVerificaVersionIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');

    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"Error al generar el reporte.",IconPopType.ERROR);
    }

  }

  confirmarProcesarPuestaCero(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de procesar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.procesarPuestaCero();
        }
      });
  }

  procesarPuestaCero(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionService.procesarVerificaVersionOrc()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.procesarVerificaVersionOrcCorrecto.bind(this),
        error: this.procesarVerificaVersionOrcIncorrecto.bind(this)
      });
  }

  procesarVerificaVersionOrcCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.ALERT);
    }else{
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.CONFIRM);
      this.isVisibleBtnProcesar = false;
      this.isVisibleBtnReporte = true;
      this.isVisiblePersonaje = false;
    }
  }

  procesarVerificaVersionOrcIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');

    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"Error al procesar la puesta a cero.",IconPopType.ERROR);
    }

  }

  confirmarPuestaCeroVerifica(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de realizar la puesta a cero de Verificación de Versión?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.puestaCeroVerifica();
        }
      });
  }

  puestaCeroVerifica(){
    sessionStorage.setItem('loading','true');
    this.verificaVersionService.puestaCeroVerificaOrc()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.puestaCeroVerificaOrcCorrecto.bind(this),
        error: this.puestaCeroVerificaOrcIncorrecto.bind(this)
      });
  }

  puestaCeroVerificaOrcCorrecto(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.ALERT);
    }else{
      this.utilityService.mensajePopup(this.tituloComponent,response.message,IconPopType.CONFIRM);
      this.isVisibleBtnPuestaCero = false;
      this.isVisibleBtnProcesar = true;
      this.mensajePersonaje = "Se realizó el llenado de nueva información en la base de datos."
    }
  }
  puestaCeroVerificaOrcIncorrecto(response:HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloComponent,response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloComponent,"No se pudo realizar la puesta a cero en verífica versión.",IconPopType.ERROR);
    }

  }

  openModal(mensaje: string): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '566px',
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        mensaje: mensaje
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.isVisibleBtnPuestaCero = false;
      this.isVisibleBtnProcesar = true;
      this.mensajePersonaje = "Se realizó el llenado de nueva información en la base de datos."
    });
  }

  openModalProcesar(mensaje: string): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '566px',
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        mensaje: mensaje
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró');
      this.isVisibleBtnProcesar = false;
      this.isVisibleBtnReporte = true;
      this.isVisiblePersonaje = false;
    });
  }




  openModal2(data :any): void {
    const dialogRef = this.dialog.open(ModalReporteComponent, {
      backdropClass: 'modalBackdrop',
      maxHeight: '100vh',
      panelClass: 'modalPanel',
      width: '1200px',
      maxWidth: '80vw',
      data: {
        dataBase64: data,
        nombreArchivoDescarga: this.utilityService.formatNombreArchivoVerificaVersion("Reporte-Verificacion-Version"),
        success: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      //nada
    });
  }


}
