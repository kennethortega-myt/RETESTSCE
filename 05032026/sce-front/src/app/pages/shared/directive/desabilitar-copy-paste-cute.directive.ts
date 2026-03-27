import {Directive, HostListener} from "@angular/core";

@Directive({
  selector: '[sceDesabilitarCopyPasteCute]',
})
export class DesabilitarCopyPasteCuteDirective{
  constructor() { }

  // Bloquear pegar
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault(); // Bloquea pegar
  }

  // Bloquear copiar
  @HostListener('copy', ['$event'])
  onCopy(event: ClipboardEvent) {
    event.preventDefault(); // Bloquea copiar
  }

  // Bloquear cortar
  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    event.preventDefault(); // Bloquea cortar
  }

  // Bloquear combinaciones de teclas (Ctrl + C, Ctrl + V, Ctrl + X)
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) &&
      (event.key === 'c' || event.key === 'v' || event.key === 'x')) {
      event.preventDefault(); // Bloquea las combinaciones Ctrl + C, Ctrl + V, Ctrl + X
    }
  }

  // Bloquear menú contextual (clic derecho)
  @HostListener('contextmenu', ['$event'])
  onContextMenu(event: MouseEvent) {
    event.preventDefault(); // Bloquea el menú contextual
  }
}
