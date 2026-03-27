import {Directive, ElementRef, EventEmitter, HostListener, Output} from "@angular/core";

@Directive({
  selector: '[sceNoEspacioInicio]'
})
export class NoEspacioInicioDirective{
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter();
  value:any;

  // Valida letras , numeros y caracteres especiales ° / . _ (espacio)
  constructor(public element: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initalValue = this.element.nativeElement.value;
    let clean = initalValue;
    let indice = initalValue.indexOf(' ');
    if(indice == 0){
      clean = '';
    }
    this.element.nativeElement.value = clean;
    if ( initalValue !== this.element.nativeElement.value) {
      this.ngModelChange.emit(this.element.nativeElement.value);
      event.stopPropagation();
    }
  }
}
