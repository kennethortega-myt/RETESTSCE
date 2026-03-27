import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {FocusElementVeri, MessageVerificacionActasService} from '../../../message/message-verificacion-actas.service';
import {VerificationVoteItemBean} from '../../../model/verificationVoteItemBean';

@Directive({
  selector: '[sceFocusNextEnterTotalPreferencial]'
})
export class FocusNextEnterTotalPreferencialDirective{
  @Input() rowIndex: number;
  @Input() colIndex: number;
  @Input() seccionVotoItems: VerificationVoteItemBean[];
  @Input() isPreferencial: boolean = false;

  constructor(
    private readonly el: ElementRef,
    private readonly messageVerificacionActasService: MessageVerificacionActasService
  ) {}

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.tab', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    event.preventDefault();
    this.moveToNextInput(event.key);
  }

  private moveToNextInput(key: string) {
    const leftContainer = document.getElementById('left-container');
    const rightContainer = document.getElementById('right-container');

    if (!leftContainer || !rightContainer) return;
    if (!this.seccionVotoItems) return;

    // Buscar el siguiente input editable
    const nextInputInfo = this.findNextEditableInput();

    if (nextInputInfo) {
      // Intentar hacer focus directamente
      this.focusInputWithRetry(nextInputInfo.inputId, 0, key);
    } else {
      this.handleEndOfTable(key);
    }
  }

  /**
   * Busca el siguiente input editable basándose en la lógica requerida
   */
  private findNextEditableInput(): { inputId: string; isPreferencial: boolean } | null {
    if (!this.isPreferencial) {
      const nextPrefInput = this.findNextPreferencialInCurrentRow(this.rowIndex, 0);
      if (nextPrefInput) {
        return nextPrefInput;
      }
      return this.findNextInputInRows(this.rowIndex +1);
    } else {
      const nextPrefInRow = this.findNextPreferencialInCurrentRow(this.rowIndex, this.colIndex + 1);
      if (nextPrefInRow) {
        return nextPrefInRow;
      }

      return this.findNextInputInRows(this.rowIndex +1);
    }
  }

  /**
   * Busca el siguiente input editable en votos preferenciales de una fila específica
   */
  private findNextPreferencialInCurrentRow(rowIndex: number, startColIndex: number): { inputId: string; isPreferencial: boolean } | null {
    if (rowIndex >= this.seccionVotoItems.length) return null;

    const item = this.seccionVotoItems[rowIndex];
    if (!item.votoPreferencial?.length) return null;

    // Buscar desde startColIndex en adelante
    for (let j = startColIndex; j < item.votoPreferencial.length; j++) {
      const votoPref = item.votoPreferencial[j];
      if (votoPref.isEditable) {
        return {
          inputId: `mat-input-pref-${rowIndex}-${j}`,
          isPreferencial: true
        };
      }
    }

    return null;
  }

  private findNextInputInRows(startRowIndex: number): { inputId: string; isPreferencial: boolean } | null {
    for (let i = startRowIndex; i < this.seccionVotoItems.length; i++) {
      const item = this.seccionVotoItems[i];
      // Primero: verificar el total de esta fila
      if (item.isEditable) {
        return {
          inputId: `mat-input-total-${i}`,
          isPreferencial: false
        };
      }

      // Si el total no es editable, verificar preferenciales de esta fila
      const prefResult = this.findNextPreferencialInCurrentRow(i, 0);
      if (prefResult) {
        return prefResult;
      }
    }
    return null;
  }

  /**
   * Intenta hacer focus en un input con reintentos para elementos no renderizados
   */
  private focusInputWithRetry(inputId: string, attempt: number, key: string) {
    const maxAttempts = 3;
    const input = document.getElementById(inputId) as HTMLInputElement;

    if (input && !input.readOnly) {
      input.focus();
      this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO);
      this.scrollToElementIfNeeded(input);
    } else if (attempt < maxAttempts) {
      // El elemento no está renderizado, hacer scroll y reintentar
      this.scrollContainersIfNeeded(inputId);

      setTimeout(() => {
        this.focusInputWithRetry(inputId, attempt + 1, key);
      }, 150);
    } else {
      // Después de varios intentos, asumir que es el final
      this.handleEndOfTable(key);
    }
  }

  /**
   * Hace scroll en los contenedores apropiados según el tipo de input
   */
  private scrollContainersIfNeeded(inputId: string) {
    const isPreferencial = inputId.includes('pref');

    if (isPreferencial) {
      // Para inputs preferenciales, hacer scroll en el contenedor derecho
      const rightContainer = document.getElementById('right-container');
      if (rightContainer) {
        rightContainer.scrollTop += 150;
      }
    } else {
      // Para inputs totales, hacer scroll en el contenedor izquierdo
      const leftContainer = document.getElementById('left-container');
      if (leftContainer) {
        leftContainer.scrollTop += 150;
      }
    }
  }

  private scrollToElementIfNeeded(element: HTMLElement) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });
  }

  private handleEndOfTable(key: string) {
    this.messageVerificacionActasService.setFocus(FocusElementVeri.INPUT_VOTO_LAST);
    if (key === 'Enter') {
      this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
    } else {
      this.messageVerificacionActasService.setFocus(FocusElementVeri.SIN_DATOS);
    }
  }
}
