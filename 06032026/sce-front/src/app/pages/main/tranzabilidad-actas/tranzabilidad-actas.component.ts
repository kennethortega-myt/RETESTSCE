import {
  AfterViewInit,
  Component,
  DestroyRef, ElementRef,
  inject,
  QueryList,
  ViewChildren
} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {TrazabilidadBean} from "../../../model/trazabilidadBean";
import {TrazabilidadService} from "../../../service/trazabilidad-service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {Constantes} from "../../../helper/constantes";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {TrazabilidadBaseComponent} from "../tranzabilidad-base/trazabilidad-base.component";

@Component({
  selector: 'app-tranzabilidad-actas',
  templateUrl: './tranzabilidad-actas.component.html',
  styleUrls: ['./tranzabilidad-actas.component.scss']
})
export class TranzabilidadActasComponent extends TrazabilidadBaseComponent implements AfterViewInit{

  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;

  destroyRef:DestroyRef = inject(DestroyRef);
  formTrazabilidad: FormGroup;
  public trazabilidadBean: TrazabilidadBean;
  isConsulta: boolean;
  tituloComponente: string = "Trazabilidad de Actas";
  protected dialog: MatDialog;



  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly trazabilidadService: TrazabilidadService,
    private readonly utilityService: UtilityService,
    dialog: MatDialog,
  ) {
    super();
    this.dialog = dialog;
    this.formTrazabilidad = this.formBuilder.group({
      numActaFormControl: [{value:'',disabled: false}],
      numCopiaFormControl: [{value:'',disabled: false}]
    });

    this.trazabilidadBean = new TrazabilidadBean();
    this.isConsulta = true;
  }


  buscarActa(){
    if(!this.sonValidosLosDatos()) return;

    let numActa = this.formTrazabilidad.get('numActaFormControl').value
    let numCopia = this.formTrazabilidad.get('numCopiaFormControl').value

    sessionStorage.setItem('loading','true');
    this.trazabilidadService.trazabilidadActa(numActa+numCopia.toUpperCase())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.trazabilidadActaCorrecto.bind(this),
        error: this.trazabilidadActaIncorrecto.bind(this)
      });

  }

  trazabilidadActaCorrecto(response: GenericResponseBean<TrazabilidadBean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.mensajePopup2(this.tituloComponente, response.message, IconPopType.ALERT);
      this.resetearVariables();

    }else{
      this.limpiarInputs();
      this.isConsulta = false;
      console.log(response.data);
      this.trazabilidadBean = response.data;
    }
  }

  trazabilidadActaIncorrecto(err:any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup2(this.tituloComponente, err.error.message,IconPopType.ERROR);
    this.resetearVariables()
  }

  resetearVariables(){
    this.isConsulta=true;
    this.trazabilidadBean = new TrazabilidadBean();
  }

  sonValidosLosDatos() :boolean{
    if(!this.formTrazabilidad.get('numActaFormControl').value ||
      this.formTrazabilidad.get('numActaFormControl').value === ''){
      this.utilityService.mensajePopup(this.tituloComponente, "Ingrese el número del acta.", IconPopType.ALERT);
      return false;
    }
    if(this.formTrazabilidad.get('numActaFormControl').value.length != 6){
      this.utilityService.mensajePopup(this.tituloComponente, "El número de acta no cuenta con 6 dígitos.", IconPopType.ALERT);
      return false;
    }
    if(!this.formTrazabilidad.get('numCopiaFormControl').value ||
      this.formTrazabilidad.get('numCopiaFormControl').value === ''){
      this.utilityService.mensajePopup(this.tituloComponente, "Ingrese el número de copia.", IconPopType.ALERT);
      return false;
    }
    if(this.formTrazabilidad.get('numCopiaFormControl').value.length != 3){
      this.utilityService.mensajePopup(this.tituloComponente, "El número de copia no cuenta con 3 dígitos.", IconPopType.ALERT);
      return false;
    }

    const regex = /^\d*$/;
    const onlyNumbers = regex.test(this.formTrazabilidad.get('numCopiaFormControl').value.substring(0,2)); // true
    if(!onlyNumbers){
      this.utilityService.mensajePopup(this.tituloComponente, "Los dos primeros dígitos de la copia deben ser números.", IconPopType.ALERT);
      return false;
    }

    const regex2 = /^[a-zA-Z]+$/;
    const onlyNumbers2 = regex2.test(this.formTrazabilidad.get('numCopiaFormControl').value.substring(2,3)); // true
    if(!onlyNumbers2){
      this.utilityService.mensajePopup(this.tituloComponente, "El último dígito de la copia debe ser una letra.", IconPopType.ALERT);
      return false;
    }
    return true;
  }



  protected override getControlesALimpiar(): string[] {
    return ['numActaFormControl', 'numCopiaFormControl'];
  }



  ngAfterViewInit() {
    if (this.inputRefs && this.inputRefs.length > 0) {
      this.inputRefs.first.nativeElement.focus();
    }
  }

  protected readonly Constantes = Constantes;
}
