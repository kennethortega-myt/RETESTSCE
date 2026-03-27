import {Directive, ElementRef, HostListener} from "@angular/core";
import {NgControl} from "@angular/forms";

@Directive({
  selector: '[sceNumerosHashN]'
})
export class NumerosHashNDirective{
  constructor(private readonly el: ElementRef, private readonly control: NgControl) { }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    let initialValue: string = this.el.nativeElement.value;
    let textoFiltrado: string ='';
    if(initialValue.length===1 && (initialValue=='#'|| initialValue=='i' || initialValue=='I')){
      initialValue='#';
      textoFiltrado = initialValue.replace(/[^#]/g, '');
    }else if(initialValue.length===1 && (initialValue=='n'|| initialValue=='N')){
      initialValue='N';
      textoFiltrado = initialValue.replace(/[^N]/g, '');
    }
    else if(initialValue.length===2 &&  initialValue.startsWith("#")){
      textoFiltrado = '#';
    }else if(initialValue.length===2 && (initialValue.startsWith("n") || initialValue.startsWith("N"))){
      textoFiltrado = 'N';
    }
    else{
      textoFiltrado = initialValue.replace(/\D/g, '');
    }

    this.control.control?.setValue(textoFiltrado);
    event.preventDefault();
  }
}
