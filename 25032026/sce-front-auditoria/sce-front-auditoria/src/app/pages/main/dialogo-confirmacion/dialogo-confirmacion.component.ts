import {Component, Inject, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {AlineacionType} from '../../../model/enum/alineacionType';

@Component({
  selector: 'app-dialogo-confirmacion',
  templateUrl: './dialogo-confirmacion.component.html',
  styleUrls: ['./dialogo-confirmacion.component.css']
})
export class DialogoConfirmacionComponent implements AfterViewInit {

  @ViewChild('botonNo') botonNo!: ElementRef;
  @ViewChild('botonSi') botonSi!: ElementRef;

  mensaje: string;
  alineacion: string = AlineacionType.CENTER;

constructor(
    public dialogo: MatDialogRef<DialogoConfirmacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  if (typeof data === 'string') {
    this.mensaje = data;
  } else {
    this.mensaje = data.mensaje;
    this.alineacion = data.alineacion || AlineacionType.CENTER;
  }

}

    cerrarDialogo(): void {
      this.dialogo.close(false);
    }
    confirmado(): void {
      this.dialogo.close(true);
    }


  handleBotonNoKeydown(event: KeyboardEvent) {
    if ((event.key === 'Tab' && !event.shiftKey) ||
      event.key === 'ArrowRight') {
      event.preventDefault();
      this.botonSi.nativeElement.focus();
    }
  }

  // Manejar eventos de teclado en el botón SÍ
  handleBotonSiKeydown(event: KeyboardEvent) {
    if ((event.key === 'Tab' && event.shiftKey) ||
      event.key === 'ArrowLeft') {
      event.preventDefault();
      this.botonNo.nativeElement.focus();
    }
  }

  ngAfterViewInit() {
    if (this.botonSi) {
      setTimeout(() => {
        this.botonNo.nativeElement.focus();
      }, 0);
    }
  }

}
