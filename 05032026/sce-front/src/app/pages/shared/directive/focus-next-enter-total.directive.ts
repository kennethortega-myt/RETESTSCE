import {Directive, ElementRef, HostListener, Input} from "@angular/core";
import {FocusElementVeri, MessageVerificacionActasService} from '../../../message/message-verificacion-actas.service';
import {VerificationVoteItemBean} from '../../../model/verificationVoteItemBean';

@Directive({
  selector: '[sceFocusNextEnterTotal]'
})
export class FocusNextEnterTotalDirective {
  @Input() rowIndex: number;
  @Input() colIndex: number;
  @Input() seccionVotoItems: VerificationVoteItemBean[]; // Recibir los datos como input

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

    if (!leftContainer) return;
    if (!this.seccionVotoItems) return;

    // Buscar el siguiente índice editable basándose en los datos reales
    const nextEditableIndex = this.findNextEditableIndexFromData(this.rowIndex);

    if (nextEditableIndex !== -1) {
      const nextInputId = `mat-input-total-${nextEditableIndex}`;

      // Intentar hacer focus directamente
      this.focusInputWithRetry(nextInputId, 0, key);
    } else {
      this.handleEndOfTable(key);
    }
  }

  /**
   * Busca el siguiente índice editable basándose en los datos reales
   */
  private findNextEditableIndexFromData(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this.seccionVotoItems.length; i++) {
      const item = this.seccionVotoItems[i];
      if (item.isEditable) {
        return i;
      }
    }
    return -1; // No hay más elementos editables
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
      const leftContainer = document.getElementById('left-container');
      if (leftContainer) {
        leftContainer.scrollTop += 150;

        setTimeout(() => {
          this.focusInputWithRetry(inputId, attempt + 1, key);
        }, 150);
      }
    } else {
      // Después de varios intentos, asumir que es el final
      this.handleEndOfTable(key);
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
