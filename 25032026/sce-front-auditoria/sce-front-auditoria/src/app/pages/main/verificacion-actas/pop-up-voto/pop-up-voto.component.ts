import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Output, Renderer2,
  ViewChild
} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopVotoData} from "../../../../interface/popVotoData";
import {VerificationVoteItemBean} from "../../../../model/verificationVoteItemBean";
import {FormControl, FormGroup} from "@angular/forms";
import {distinctUntilChanged} from "rxjs";
import {VerificationVotePreferencialItemBean} from "../../../../model/verificationVotePreferencialItemBean";
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';

@Component({
  selector: 'app-pop-up-voto',
  templateUrl: './pop-up-voto.component.html',
  styleUrls: ['./pop-up-voto.component.scss']
})
export class PopUpVotoComponent implements OnInit,OnDestroy, AfterViewInit{

  @ViewChild('voteInput') voteInput!: ElementRef;
  formGroup: FormGroup;

  filePng: string;
  systemValue: string;
  votos: Array<VerificationVoteItemBean>;
  fileId: number;
  cantVotosPref: number;
  indexI: number;
  indexJ: number;
  isEditable: boolean = false;
  desabilitarAccion: boolean = false;

  isFocused: boolean = false;

  @Output() inputValueChange = new EventEmitter<{indexI: number, indexJ: number, value: string, fileId: number}>();
  @Output() closePopup = new EventEmitter<{indexI: number, indexJ: number}>();

  constructor(
    public dialogRef: MatDialogRef<PopUpVotoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopVotoData,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly renderer: Renderer2
  ) {
    this.filePng = data.filePng;
    this.systemValue = data.systemValue;
    this.indexI = data.indexI;
    this.votos = data.votos;
    this.fileId = data.fileId;
    this.cantVotosPref = data.cantVotosPref;
    this.indexJ = data.indexJ;
    this.isEditable = this.votos[this.indexI].isEditable;
  }

  ngOnInit() {
    this.formGroup = new FormGroup({
      inputValueForm: new FormControl(this.data.inputValue)
    });
    // Suscribirse a los cambios del valor del control
    this.formGroup.get('inputValueForm').valueChanges
      .pipe(distinctUntilChanged()) // Evita llamadas repetidas
      .subscribe(value => {
        this.changeVoto();
      });

  }

  ngAfterViewInit(): void {
    this.renderer.setAttribute(this.voteInput.nativeElement,'tabindex','-1');//para quitar el focus
  }

  findLastEditableInputInRow(votosPref:  VerificationVotePreferencialItemBean[], indexI: number){
    let resultado = false;
    for (let j= votosPref.length-1; j>=0 ; j--){
      if (votosPref[j].isEditable){
        this.indexJ = j;
        resultado = true;
        break;
      }
    }
    return resultado;
  }

  findPreviousEditableInputInSameRow(votosPref:  VerificationVotePreferencialItemBean[],indexJ){
    let resultado = false;
    for (let j = indexJ-1;j>=0; j--){
      if (votosPref[j].isEditable){
        this.indexJ = j;
        resultado = true;
        break;
      }
    }
    return resultado;
  }

  atras(){
    this.desabilitarAccion=false;

    let resultado = false;

    while (this.indexI >= 0){
      if (this.indexI == 0 && this.indexJ == -1){
        return;
      }
      if (this.indexJ == -1){
        this.indexI--;
        if (this.indexI>=this.votos.length-3){
          resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
          if (resultado) break;
        }else{
          resultado = this.findLastEditableInputInRow(this.votos[this.indexI].votoPreferencial, this.indexI);
          if (resultado) break;

          // Si no hay inputs editables en Preferenciales, pasar al siguiente input en Votos Totales
          resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
          if (resultado) break;

          if (this.indexI ==0){
            //quedarse en el primer input
            resultado = true;
            break;
          }
        }

      }else{
        resultado = this.findPreviousEditableInputInSameRow(this.votos[this.indexI].votoPreferencial,this.indexJ)
        if (resultado) break;

        resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
        if (resultado) break;


        if (this.indexI == 0){
          //quedarse en el primer input
          resultado = true;
          this.indexJ=-1
          break;
        }
        // Si no hay inputs editables en la fila actual, retroceder a la fila anterior
        this.indexI--;
        // Si no hay inputs editables en Preferenciales, pasar al siguiente input en Votos Totales
        resultado = this.findLastEditableInputInRow(this.votos[this.indexI].votoPreferencial,this.indexI);
        if (resultado) break;

        resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
        if (resultado) break;


      }
    }
    if (resultado){
      this.updateData();
    }

  }

  @HostListener('document:keydown', ['$event'])
  manejarEventoTeclado(event: KeyboardEvent) {
    if (this.isEnterOrTab(event)) {
      this.handleEnterOrTab(event);
    } else if (this.isNumber_or_i_Key(event)) {
      this.handleNumberOrIKey(event);
    }
  }

  private isEnterOrTab(event: KeyboardEvent): boolean {
    return event.key === 'Enter' || event.key === 'Tab';
  }

  private handleEnterOrTab(event: KeyboardEvent) {
    if (this.indexI < this.votos.length - 1) {
      this.siguiente();
    }
    event.preventDefault(); // Evita que se cierre el pop con Enter
  }

  private handleNumberOrIKey(event: KeyboardEvent) {
    if (!this.isFocused) {
      if (this.fileId == null || this.fileId === -1 || this.systemValue === '') {
        return;
      }
      const value = event.key === 'i' || event.key === 'I' ? '#' : event.key;
      this.formGroup.get('inputValueForm').setValue(value);
      this.onFocus();
    }
  }

  isNumber_or_i_Key(event: KeyboardEvent): boolean{
    const char = event.key;
    return (char >= '0' && char <= '9') || char =='i' || char =='I';
  }

  siguiente(){
    this.onBlur();
    this.desabilitarAccion=false;

    let resultado = false;
    while (this.indexI < this.votos.length){

      if (this.indexJ == -1){
        if (this.indexI >= this.votos.length-3){
          if (this.indexI === this.votos.length-1){
            //quedarse en el ultimo input
            resultado = true;
            break;
          }
          resultado = this.findEditableInputInRowTotal(this.votos,++this.indexI);
          if (resultado) break;
        }else{
          resultado = this.findEditableInputInRow(this.votos[this.indexI].votoPreferencial,this.indexI);
          if (resultado) break;

          // Si no hay inputs editables en Preferenciales, pasar al siguiente input en Votos Totales
          resultado = this.findEditableInputInRowTotal(this.votos,++this.indexI);
          if (resultado) break;
        }
      }else{
        resultado = this.findNextEditableInputInSameRow(this.votos[this.indexI].votoPreferencial,this.indexJ)
        if (resultado) break;

        //siguiente fila
        this.indexI++;
        if (this.indexI >= this.votos.length-3){
          this.indexJ=-1
          resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
          if (resultado) break;
        }else{
          resultado = this.findEditableInputInRowTotal(this.votos,this.indexI);
          if (resultado) break;

          // Si no hay inputs editables en Preferenciales, pasar al siguiente input en Votos Totales
          resultado = this.findEditableInputInRow(this.votos[this.indexI].votoPreferencial,this.indexI);
          if (resultado) break;
        }

      }

    }

    if(resultado){
      this.updateData();
    }

  }

  findEditableInputInRowTotal(rows: VerificationVoteItemBean[], indexI: number): boolean {
    if (rows[indexI].isEditable){
      this.indexI = indexI;
      this.indexJ = -1; // Actualizar el índice encontrado
      return true; // Devolver true para detener la búsqueda
    }
    return false;
  }

  findEditableInputInRow(rows: VerificationVotePreferencialItemBean[], indexI: number): boolean | undefined {
    const found = rows.find((row, j) => {
      if (row.isEditable) {
        this.indexJ = j; // Actualizar el índice encontrado
        return true; // Devolver true para detener la búsqueda
      }
      return false;
    });

    return !!found; // Devuelve true si se encontró, false de lo contrario
  }

  findNextEditableInputInSameRow(rows:  VerificationVotePreferencialItemBean[], indexJ: number): boolean | undefined{


    let encontrado = false;
    for (let j = indexJ+1; j < rows.length; j++) {
      if (rows[j].isEditable) {
        this.indexJ = j;
        encontrado = true;
        break;
      }
    }
    return encontrado;
  }

  siguienteVotosTotales(){
    //estamos en tabla de votos totales
    if (this.votos[this.indexI].votoPreferencial && this.votos[this.indexI].votoPreferencial.length > 0 &&
      this.votos[this.indexI].fileId != null){
      //pasamos a votos preferenciales
      this.indexJ++;
    }else{
      //pasamos siguien fila
      this.indexI++;
    }
  }

  siguienteVotosPreferenciales(){
    //estamos en tabla de votos preferenciales
    if (this.indexJ<this.cantVotosPref-1){
      this.indexJ++;
    }else{
      //pasamos siguiente fila de votos totales
      this.indexJ=-1;
      this.indexI++;
    }
  }

  changeVoto(){
    this.inputValueChange.emit({indexI: this.indexI, indexJ: this.indexJ, value: this.formGroup.get('inputValueForm').value, fileId: this.fileId})
  }

  async loadImage(fileId: number) {
    try {
      const blob = await this.verificacionActaService.getFileV2(fileId);
      this.filePng = URL.createObjectURL(blob);
    } catch (error) {
      this.filePng = '../../../../../assets/img/doc/no_imagen_voto.png';
    }
  }


  private async updateData(): Promise<void> {
    if (this.indexJ ==-1){
      const votoTotal = this.votos[this.indexI];
      if (votoTotal.filePngUrl){
        this.filePng = votoTotal.filePngUrl;
      }else{
        this.filePng = "'../../../../../assets/loader/loader.svg'";
        this.desabilitarAccion = true;
        await this.loadImage(votoTotal.fileId);
        this.desabilitarAccion = false;
      }
      this.systemValue = votoTotal.systemValue;
      this.fileId = votoTotal.fileId;
      this.formGroup.get('inputValueForm').setValue(votoTotal.userValue);

    }else{
      const votoPref = this.votos[this.indexI].votoPreferencial[this.indexJ];
      if (votoPref.filePngUrl){
        this.filePng = votoPref.filePngUrl;
      }else{
        this.filePng = "'../../../../../assets/loader/loader.svg'";
        this.desabilitarAccion = true;
        await this.loadImage(votoPref.fileId);
        this.desabilitarAccion = false;
      }
      this.systemValue = votoPref.systemValue;
      this.fileId = votoPref.fileId;
      this.formGroup.get('inputValueForm').setValue(votoPref.userValue);
    }
  }

  public cerrar():void{
    this.closePopup.emit({indexI: this.indexI, indexJ: this.indexJ});
    this.dialogRef.close();
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

  ngOnDestroy() {
    //mv

  }
}
