import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDatosGeneralResponse } from 'src/app/interface/general.interface';

@Component({
  selector: 'app-menu-lateral',
  templateUrl: './menu-lateral.component.html',
  styleUrls: ['./menu-lateral.component.scss']
})
export class MenuLateralComponent implements OnInit{

  @Input() titulo: string = "";
  @Input() subTitulo: string = "";
  @Input() data: Array<any> = [];
  @Input() placeholderInput: string = "";
  @Input() mostrarInput: boolean = true;
  @Output() newDataEvent: EventEmitter<string> = new EventEmitter();
  @Output() menuSeleccionado: EventEmitter<IDatosGeneralResponse> = new EventEmitter();

  formGroupParent: FormGroup;

  @Input() idMenuSeleccionado: number = 0;

  constructor( public formBuilder: FormBuilder){
    this.formGroupParent = new FormGroup({});
  }

  ngOnInit() {
    this.formGroupParent = this.formBuilder.group({
        newData: new FormControl('', [
          Validators.required,
          this.noWhitespaceValidator
        ])
    });
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  seleccionarMenu(datos: IDatosGeneralResponse){
    this.idMenuSeleccionado = datos.id;
    this.menuSeleccionado.emit(datos);
  }

  enviarData(){
    if(this.formGroupParent.valid){
      this.newDataEvent.emit(this.formGroupParent.get('newData')?.value);
      this.formGroupParent.get('newData')?.setValue("");
    }
  }

}
