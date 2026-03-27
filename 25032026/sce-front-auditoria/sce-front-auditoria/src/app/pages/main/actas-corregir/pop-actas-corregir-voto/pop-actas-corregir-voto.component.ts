import {
  AfterViewInit,
  Component,
  ElementRef, EventEmitter, HostListener,
  Inject,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopActasCorregirVotoData} from "../../../../interface/popActasCorregirVotoData";
import {AgrupolPorCorregirBean} from "../../../../model/agrupolPorCorregirBean";
import {FormControl, FormGroup} from "@angular/forms";
import {distinctUntilChanged} from "rxjs";

@Component({
  selector: 'app-pop-actas-corregir-voto',
  templateUrl: './pop-actas-corregir-voto.component.html',
  styleUrls: ['./pop-actas-corregir-voto.component.scss']
})
export class PopActasCorregirVotoComponent implements OnInit, AfterViewInit {

  @ViewChild('voteInput') voteInput!: ElementRef;
  @ViewChild('voteInputPrimeraDig') voteInputPrimeraDig!: ElementRef;
  @ViewChild('voteInputSegunDig') voteInputSegunDig!: ElementRef;
  formGroup: FormGroup;

  primeraDigValue: string;
  segundaDigValue: string;
  indexI: number;
  indexJ: number;
  votos: Array<AgrupolPorCorregirBean>;
  fileId: number;
  cantVotosPref: number;

  isFocused: boolean = false;

  @Output() inputValueChange = new EventEmitter<{indexI: number, indexJ: number, terceraDigvalue: string, fileId: number}>();
  @Output() closePopup = new EventEmitter<{indexI: number, indexJ: number}>();
  constructor(
    public dialogRef: MatDialogRef<PopActasCorregirVotoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopActasCorregirVotoData,
    private readonly renderer: Renderer2
  ) {
    this.indexI = data.indexI;
    this.indexJ = data.indexJ;
    this.votos = data.votos;
    this.cantVotosPref = data.cantVotosPref;
    this.primeraDigValue = this.votos[this.indexI].primeraDigitacion;
    this.segundaDigValue = this.votos[this.indexI].segundaDigitacion;
    this.fileId = this.votos[this.indexI].idDetActa;
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      inputValueForm: new FormControl(this.votos[this.indexI].terceraDigitacion)
    });
    // Suscribirse a los cambios del valor del control
    this.formGroup.get('inputValueForm').valueChanges
      .pipe(distinctUntilChanged()) // Evita llamadas repetidas
      .subscribe(value => {
        this.changeVoto();
      });
  }

  @HostListener('document:keydown', ['$event'])
  manejarEventoTeclado(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Tab') {
      if(this.indexI < this.votos.length - 1){
        this.siguiente();
      }
      event.preventDefault();//para evitar que se cierre el pop con el enter
    } else if (this.isNumber_or_i_Key(event)){
      if(!this.isFocused){
        if (this.fileId==null|| (this.primeraDigValue=='null' && this.segundaDigValue=='null')){
          return;
        }
        if (event.key === 'i' || event.key==='I'){
          this.formGroup.get('inputValueForm').setValue('#');
        }else{
          this.formGroup.get('inputValueForm').setValue('');
          this.formGroup.get('inputValueForm').setValue(event.key);
        }
        this.onFocus();
      }
    }
  }

// Manejo de las teclas Enter y Tab
  private handleEnterOrTabKey(event: KeyboardEvent) {
    if (this.indexI < this.votos.length - 1) {
      this.siguiente();
    }
    event.preventDefault(); // Evita que se cierre el pop con Enter
  }

// Manejo de números y la tecla 'i'
  private handleNumberOrIKey(event: KeyboardEvent) {
    if (this.isFocused) {
      return;
    }

    if (this.fileId === null || (this.primeraDigValue === 'null' && this.segundaDigValue === 'null')) {
      return;
    }

    if (event.key === 'i' || event.key === 'I') {
      this.formGroup.get('inputValueForm').setValue('#');
    } else {
      this.formGroup.get('inputValueForm').setValue(event.key);
    }

    this.onFocus();
  }

  isNumber_or_i_Key(event: KeyboardEvent): boolean{
    const char = event.key;
    return (char >= '0' && char <= '9') || char =='i' || char =='I';
  }

  ngAfterViewInit() {
    this.renderer.setAttribute(this.voteInput.nativeElement,'tabindex','-1');//para quitar el focus
    this.renderer.setAttribute(this.voteInputPrimeraDig.nativeElement,'tabindex','-1');
    this.renderer.setAttribute(this.voteInputSegunDig.nativeElement,'tabindex','-1');
  }

  atras(){
    if (this.indexJ ===-1){
      //pasamos a votos preferenciales
      this.indexI--;
      //si no tiene votos preferenciales, se mantiene en votos totales
      this.indexJ = this.votos[this.indexI].votosPreferenciales &&
      this.votos[this.indexI].votosPreferenciales.length > 0 &&
      this.votos[this.indexI].primeraDigitacion != 'null' &&
      this.votos[this.indexI].segundaDigitacion != 'null' ? this.cantVotosPref -1 : -1;
    }else{
      this.indexJ--;
    }
    this.updateData();

  }

  private updateData(): void {
    if (this.indexJ ==-1){
      this.primeraDigValue = this.votos[this.indexI].primeraDigitacion;
      this.segundaDigValue = this.votos[this.indexI].segundaDigitacion;
      this.fileId = this.votos[this.indexI].idDetActa;
      if (this.primeraDigValue!='null'&& this.segundaDigValue!='null'){
        this.formGroup.get('inputValueForm').setValue(this.votos[this.indexI].terceraDigitacion);
      }else{
        this.formGroup.get('inputValueForm').setValue('');
      }

    }else{
      this.primeraDigValue = this.votos[this.indexI].votosPreferenciales[this.indexJ].primeraDigitacion;
      this.segundaDigValue = this.votos[this.indexI].votosPreferenciales[this.indexJ].segundaDigitacion;
      this.fileId = this.votos[this.indexI].votosPreferenciales[this.indexJ].idDetActaPreferencial;
      if (this.primeraDigValue!='null'&& this.segundaDigValue!='null'){
        this.formGroup.get('inputValueForm').setValue(this.votos[this.indexI].votosPreferenciales[this.indexJ].terceraDigitacion);
      }else{
        this.formGroup.get('inputValueForm').setValue('');
      }
    }

  }

  private setFocus(): void {
    this.renderer.selectRootElement(this.voteInput.nativeElement).focus();

  }

  siguiente(){
    this.onBlur();

    if (this.indexJ == -1){
      if (this.votos[this.indexI].votosPreferenciales && this.votos[this.indexI].votosPreferenciales.length > 0 &&
        this.votos[this.indexI].primeraDigitacion != 'null' && this.votos[this.indexI].segundaDigitacion != 'null'){
        //pasamos a votos preferenciales
        this.indexJ++;
      }else{
        //pasamos siguien fila
        this.indexI++;
      }
    } else if (this.indexJ<this.cantVotosPref-1){
      // En votos preferenciales - avanzar
      this.indexJ++;
    }else{
      //pasamos siguiente fila de votos totales
      this.indexJ=-1;
      this.indexI++;
    }
    this.updateData();
  }

  changeVoto(){
    this.inputValueChange.emit({indexI: this.indexI, indexJ: this.indexJ, terceraDigvalue: this.formGroup.get('inputValueForm').value, fileId: this.fileId})
  }

  onFocus(){
    setTimeout(() => {
      this.renderer.selectRootElement(this.voteInput.nativeElement).focus();
    }, 0);
    this.isFocused = true;
  }

  onBlur(): void {
    this.renderer.selectRootElement(this.voteInput.nativeElement).blur();
    this.isFocused = false;

  }

  public cerrar():void{
    this.closePopup.emit({indexI: this.indexI, indexJ: this.indexJ});
    this.dialogRef.close();

  }
}
