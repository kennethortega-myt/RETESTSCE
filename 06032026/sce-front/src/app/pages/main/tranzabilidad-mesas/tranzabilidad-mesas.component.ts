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
  selector: 'app-tranzabilidad-mesas',
  templateUrl: './tranzabilidad-mesas.component.html',
  styleUrls: ['./tranzabilidad-mesas.component.scss']
})
export class TranzabilidadMesasComponent extends TrazabilidadBaseComponent implements AfterViewInit{

  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;

  destroyRef:DestroyRef = inject(DestroyRef);
  formTrazabilidad: FormGroup;
  public trazabilidadBean: TrazabilidadBean;
  public trazabilidadBeanList: TrazabilidadBean[];
  currentTrazabilidadBean: TrazabilidadBean | null = null;
  isConsulta: boolean;
  tituloComponente: string = "Trazabilidad de Mesas";
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
      numMesaFormControl: [{value:'',disabled: false}]
    });

    this.trazabilidadBean = new TrazabilidadBean();
    this.trazabilidadBeanList = [];
    this.isConsulta = true;
  }

  buscarMesa(){
    this.currentTrazabilidadBean = null;
    if(!this.sonValidosLosDatosMesa()) return;
    let mesa = this.formTrazabilidad.get('numMesaFormControl').value
    sessionStorage.setItem('loading','true');
    this.trazabilidadService.trazabilidadMesa(mesa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.trazabilidadMesaCorrecto.bind(this),
        error: this.trazabilidadMesaIncorrecto.bind(this)
      });

  }

  trazabilidadMesaCorrecto(response: GenericResponseBean<TrazabilidadBean[]>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.mensajePopup2(this.tituloComponente, response.message, IconPopType.ALERT);
      this.resetearVariables();

    }else{
      this.limpiarInputs();
      this.isConsulta = false;
      console.log(response.data);
      this.trazabilidadBeanList = response.data;
    }
  }

  trazabilidadMesaIncorrecto(err:any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup2(this.tituloComponente, err.error.message,IconPopType.ERROR);
    this.resetearVariables()
  }

  // Manejo al abrir un panel
  onOpened(item: any) {
    this.currentTrazabilidadBean = item; // Actualizamos el objeto actual
  }

  // Manejo al cerrar un panel
  onClosed(item: any) {
    // Limpiar el objeto actual solo si el panel cerrado era el actual
    if (this.currentTrazabilidadBean === item) {
      this.currentTrazabilidadBean = null;
    }
  }

  resetearVariables(){
    this.isConsulta=true;
    this.trazabilidadBean = new TrazabilidadBean();
  }

  sonValidosLosDatosMesa() :boolean{
    if(!this.formTrazabilidad.get('numMesaFormControl').value ||
      this.formTrazabilidad.get('numMesaFormControl').value === ''){
      this.utilityService.mensajePopup(this.tituloComponente, "Ingrese el número de mesa.", IconPopType.ALERT);
      return false;
    }
    if(this.formTrazabilidad.get('numMesaFormControl').value.length != 6){
      this.utilityService.mensajePopup(this.tituloComponente, "El número de mesa no cuenta con 6 dígitos.", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  protected override getControlesALimpiar(): string[] {
    return ['numMesaFormControl'];
  }

  ngAfterViewInit() {
    if (this.inputRefs && this.inputRefs.length > 0) {
      this.inputRefs.first.nativeElement.focus();
    }
  }

  protected readonly Constantes = Constantes;
}
