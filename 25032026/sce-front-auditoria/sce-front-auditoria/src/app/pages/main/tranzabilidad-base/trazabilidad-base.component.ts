// trazabilidad-base.component.ts

import {PopMensajeData} from '../../../interface/popMensajeData.interface';
import {PopMensajeComponent} from '../../shared/pop-mensaje/pop-mensaje.component';
import {MatDialog} from "@angular/material/dialog";
import {FormGroup} from '@angular/forms';
import {ElementRef, QueryList} from '@angular/core';

export abstract class TrazabilidadBaseComponent {

  protected abstract formTrazabilidad: FormGroup;
  protected abstract inputRefs: QueryList<ElementRef<HTMLInputElement>>;
  protected abstract dialog: MatDialog;
  protected abstract getControlesALimpiar(): string[];

  limpiarInputs(): void {
    this.getControlesALimpiar().forEach(controlName => {
      const control = this.formTrazabilidad.get(controlName);
      if (control) {
        control.setValue('');
      }
    });
    this.inputRefs?.first?.nativeElement.focus();
  }

  mensajePopup2(title: string, mensaje: string, icon: string): void {
    const popMensaje: PopMensajeData = {
      title,
      mensaje,
      icon,
      success: true
    };

    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.limpiarInputs();
        }
      });
  }

  getClass(index: number, item: any, lengthTotal): string{
    let classes = '';
    if(index === 0 ) {
      classes += 'full ';
    }

    if(item.codEstadoActa === 'HOC' || item.codEstadoActa === 'IOC') {
      classes += 'red ';
    }

    if (index === lengthTotal - 1){
      classes += 'full contabilizada '
    }

    return classes.trim();
  }

  onKeyNumeActa(event){
    if(event.keyCode != 8 && event.keyCode != 9){//BACKSPACE
      if(event.target.value.length ===6){
        if (this.inputRefs.toArray()[1]){
          this.inputRefs.toArray()[1].nativeElement.focus();
        }
      }
    }
  }
}

