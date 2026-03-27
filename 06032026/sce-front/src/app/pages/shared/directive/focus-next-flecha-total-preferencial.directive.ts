import {Directive, ElementRef, HostListener, Input} from '@angular/core';
import {FocusElementVeri, MessageVerificacionActasService} from '../../../message/message-verificacion-actas.service';
import {VerificationVoteItemBean} from '../../../model/verificationVoteItemBean';

@Directive({
  selector: '[sceFocusNextFlechaTotalPreferencial]'
})
export class FocusNextFlechaTotalPreferencialDirective{
  @Input() rowIndex: number;
  @Input() colIndex: number;
  @Input() isPreferencial: boolean = false;
  @Input() seccionVotoItems: VerificationVoteItemBean[];

  constructor(
    private readonly el: ElementRef,
    private readonly messageVerificacionActasService: MessageVerificacionActasService
  ) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    this.messageVerificacionActasService.setFocus(FocusElementVeri.NINGUNO);

    if (!arrowKeys.includes(event.key)) return;

    event.preventDefault();

    const formTotal = document.getElementById('left-container');
    const formPreferential = document.getElementById('right-container');

    if (!formTotal || !formPreferential || !this.seccionVotoItems) return;

    let targetInput: HTMLInputElement | null = null;

    if (!this.isPreferencial) {
      // Estamos en tabla de votos totales
      targetInput = this.handleTotalTableNavigation(event.key);
    } else {
      // Estamos en tabla de votos preferenciales
      targetInput = this.handlePreferencialTableNavigation(event.key);
    }

    if (targetInput) {
      targetInput.focus();
      this.scrollToElementIfNeeded(targetInput);

    }
  }

  /**
   * Maneja la navegación cuando el focus está en la tabla de votos totales
   */
  private handleTotalTableNavigation(key: string): HTMLInputElement | null {
    const totalRows = this.seccionVotoItems.length;

    switch (key) {
      case 'ArrowUp':
        if (this.rowIndex > 0) {
          return this.getInputById(`mat-input-total-${this.rowIndex - 1}`);
        }
        break;

      case 'ArrowDown':
        if (this.rowIndex < totalRows - 1) {
          return this.getInputById(`mat-input-total-${this.rowIndex + 1}`);
        } else {
          // Última fila, ir al botón continuar
          this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
          return null;
        }

      case 'ArrowRight': {
        // Buscar primer input de votos preferenciales en la misma fila
        const firstPrefInput = this.findPreferencialInputInRow(this.rowIndex);
        if (firstPrefInput) {
          return firstPrefInput;
        }

        // Si no hay preferenciales, ir a la siguiente fila de totales
        if (this.rowIndex < totalRows - 1) {
          return this.getInputById(`mat-input-total-${this.rowIndex + 1}`);
        } else {
          // No hay siguiente fila, ir al botón continuar
          this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
          return null;
        }
      }

      case 'ArrowLeft':
        // Ir al último input de votos preferenciales de la fila anterior
        if (this.rowIndex > 0) {
          return this.findPreferencialInputInRow(this.rowIndex - 1, true);
        }
        break;
    }

    return null;
  }

  /**
   * Maneja la navegación cuando el focus está en la tabla de votos preferenciales
   */
  private handlePreferencialTableNavigation(key: string): HTMLInputElement | null {
    const totalRows = this.seccionVotoItems.length;
    const currentRowPrefs = this.seccionVotoItems[this.rowIndex]?.votoPreferencial || [];

    switch (key) {
      case 'ArrowUp':
        if (this.rowIndex > 0) {
          return this.getInputById(`mat-input-pref-${this.rowIndex - 1}-${this.colIndex}`);
        }
        break;

      case 'ArrowDown':
        if (this.rowIndex < totalRows - 1) {
          return this.getInputById(`mat-input-pref-${this.rowIndex + 1}-${this.colIndex}`);
        }
        break;

      case 'ArrowRight':
        // Verificar si estamos en el último input de la fila
        if (this.colIndex >= currentRowPrefs.length - 1) {
          // Último input de la fila, ir al primer input de la siguiente fila de totales
          if (this.rowIndex < totalRows - 1) {
            return this.getInputById(`mat-input-total-${this.rowIndex + 1}`);
          } else {
            // Última fila, ir al botón continuar
            this.messageVerificacionActasService.setFocus(FocusElementVeri.CONTINUAR);
            return null;
          }
        } else {
          // No es el último, ir al siguiente input de la misma fila
          return this.getInputById(`mat-input-pref-${this.rowIndex}-${this.colIndex + 1}`);
        }

      case 'ArrowLeft':
        // Verificar si estamos en el primer input de la fila
        if (this.colIndex <= 0) {
          // Primer input de la fila, ir al input de totales de la misma fila
          return this.getInputById(`mat-input-total-${this.rowIndex}`);
        } else {
          // No es el primero, ir al input anterior de la misma fila
          return this.getInputById(`mat-input-pref-${this.rowIndex}-${this.colIndex - 1}`);
        }
    }

    return null;
  }

  private findPreferencialInputInRow(rowIndex: number, fromEnd: boolean = false): HTMLInputElement | null {
    if (rowIndex < 0 || rowIndex >= this.seccionVotoItems.length) return null;

    const prefs = this.seccionVotoItems[rowIndex]?.votoPreferencial;
    if (!prefs?.length) return null;

    if (fromEnd) {
      for (let j = prefs.length - 1; j >= 0; j--) {
        const input = this.getInputById(`mat-input-pref-${rowIndex}-${j}`);
        if (input) return input;
      }
    } else {
      for (let j = 0; j < prefs.length; j++) {
        const input = this.getInputById(`mat-input-pref-${rowIndex}-${j}`);
        if (input) return input;
      }
    }

    return null;
  }

  /**
   * Obtiene un input por su ID
   */
  private getInputById(inputId: string): HTMLInputElement | null {
    const input = document.getElementById(inputId) as HTMLInputElement;
    return input && input.type === 'text' ? input : null;
  }

  /**
   * Hace scroll para asegurar que el elemento esté visible
   */
  private scrollToElementIfNeeded(element: HTMLElement) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest'
    });

    this.centerElementHorizontally(element);
  }

  private centerElementHorizontally(element: HTMLElement): void {
    const rightContainer = document.getElementById('right-container');
    if (!rightContainer) return;

    // Solo para elementos de la tabla preferencial
    if (!element.id.includes('pref')) return;

    const itemElement = element.closest('.item');
    if (!itemElement) return;

    // Calcular scroll horizontal para centrar
    const containerRect = rightContainer.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();

    const scrollLeft = rightContainer.scrollLeft;
    const itemLeft = itemRect.left - containerRect.left + scrollLeft;
    const itemWidth = itemRect.width;
    const containerWidth = rightContainer.clientWidth;

    // Centrar el elemento
    const targetScroll = itemLeft - (containerWidth / 2) + (itemWidth / 2);
    const maxScroll = rightContainer.scrollWidth - containerWidth;
    const finalScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    // Aplicar scroll horizontal con un pequeño delay
    setTimeout(() => {
      rightContainer.scrollTo({
        left: finalScroll,
        behavior: 'smooth'
      });
    }, 100);
  }
}
