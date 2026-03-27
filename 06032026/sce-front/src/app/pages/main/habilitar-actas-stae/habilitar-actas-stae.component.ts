import {AfterViewInit, Component, DestroyRef, ElementRef, inject, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {HabilitarActasStaeService} from "../../../service/habilitar-actas-stae.service";
import {MatTableDataSource} from "@angular/material/table";
import {ActaBean} from "../../../model/resoluciones/acta-jee-bean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {MatPaginator} from "@angular/material/paginator";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {Constantes} from '../../../helper/constantes';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-habilitar-actas-stae',
  templateUrl: './habilitar-actas-stae.component.html',
  styleUrls: ['./habilitar-actas-stae.component.scss']
})
export class HabilitarActasStaeComponent implements AfterViewInit{

  @ViewChild('numMesaInput') numMesaInput: ElementRef;
  formHabilitar: FormGroup;
  destroyRef:DestroyRef = inject(DestroyRef);
  public tituloAlert="Habilitar Actas STAE";
  @ViewChild(MatPaginator) paginatorStae: MatPaginator;

  isConsulta: boolean;

  listMesasStae: Array<ActaBean>;
  dataSource: MatTableDataSource<ActaBean>;

  numMesa: string;

  displayedColumns2: string[] = ['numero', 'mesa', 'eleccion', 'tipo-transmision','acciones'];

  constructor(private readonly formBuilder: FormBuilder,
              public dialog: MatDialog,
              private readonly habilitarActasStaeService: HabilitarActasStaeService,
              private readonly utilityService:UtilityService) {

    this.isConsulta = true;
    this.listMesasStae = [];
    this.numMesa="";
    this.dataSource= new MatTableDataSource<ActaBean>(this.listMesasStae);

    this.formHabilitar = this.formBuilder.group({
      numMesaFormControl: [{value:'',disabled: false}]
    });
  }

  agregarMesa() {
    const numMesa = this.formHabilitar.get('numMesaFormControl')?.value?.trim();

    if (!numMesa || numMesa.length !== Constantes.LONGITUD_MESA) {
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese un número de mesa válido.", IconPopType.ALERT);
      return;
    }

    this.utilityService.setLoading(true);

    this.habilitarActasStaeService.validaHabilitarActasStae(numMesa.toUpperCase())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.utilityService.setLoading(false))
      )
      .subscribe({
        next: (response: GenericResponseBean<Array<ActaBean>>) => this.validaHabilitarActasStaeCorrecto(response),
        error: (error: any) => this.validaHabilitarActasStaeIncorrecto(error)
      });
  }

  private validaHabilitarActasStaeCorrecto(response: GenericResponseBean<Array<ActaBean>>) {
    this.formHabilitar.get('numMesaFormControl')?.setValue('');

    const newItems = response.data.filter(newItem =>
      !this.listMesasStae.some(existingItem =>
        existingItem.mesa === newItem.mesa && existingItem.eleccion === newItem.eleccion
      )
    );

    if (newItems.length === 0) {
      this.utilityService.mensajePopup(this.tituloAlert, "No hay nuevos elementos para agregar", IconPopType.ALERT);
      return;
    }

    this.listMesasStae = [...this.listMesasStae, ...newItems];
    this.dataSource.data = this.listMesasStae;
    this.isConsulta = false;

    setTimeout(() => {
      if (this.paginatorStae) {
        this.dataSource.paginator = this.paginatorStae;
      }
    });

    this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.CONFIRM);
  }

  private validaHabilitarActasStaeIncorrecto(error: any) {
    this.utilityService.mensajePopup(
      this.tituloAlert,
      this.utilityService.manejarMensajeError(error),
      IconPopType.ERROR
    );
  }


  quitaMesa(index: number){
    let indiceCorrecto = this.getCorrectIndex(index);
    if (indiceCorrecto >= 0 && indiceCorrecto < this.listMesasStae.length){
      this.listMesasStae.splice(indiceCorrecto,1);
      this.dataSource.data= this.listMesasStae;
    }
    if (this.listMesasStae.length == 0){
      this.isConsulta = true;
    }

  }

  requisitosParaGrabar(): boolean {
    // Verificar si existe al menos una mesa con tipoTransmision distinto de null
    const existeAlMenosUna = this.listMesasStae.some(i => i.tipoTransmision != null);

    if (!existeAlMenosUna) {
      this.utilityService.mensajePopup(
        this.tituloAlert,
        "Debe seleccionar el tipo de transmisión en al menos un acta.",
        IconPopType.ALERT
      );
      return false;
    }

    return true;
  }

  confirmarGrabar(){
    if (!this.requisitosParaGrabar()) return;

    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarHabilitarActasStae();
        }
      });
  }

  grabarHabilitarActasStae() {
    this.utilityService.setLoading(true);

    const mesasFiltradas = this.listMesasStae.filter(m => m.tipoTransmision != null);

    this.habilitarActasStaeService.habilitarActasStae(mesasFiltradas)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.utilityService.setLoading(false))
      )
      .subscribe({
        next: (response) => this.habilitarActasStaeCorrecto(response),
        error: (error) => this.habilitarActasStaeIncorrecto(error)
      });
  }

  habilitarActasStaeCorrecto(response: GenericResponseBean<ActaBean>) {
    this.listMesasStae = [];
    this.dataSource.data = this.listMesasStae;
    this.isConsulta = true;

    setTimeout(() => {
      if (this.paginatorStae) {
        this.dataSource.paginator = this.paginatorStae;
      }
    });

    this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.CONFIRM);
  }

  habilitarActasStaeIncorrecto(error: any) {
    this.utilityService.mensajePopup(
      this.tituloAlert,
      this.utilityService.manejarMensajeError(error),
      IconPopType.ALERT
    );
  }

  getCorrectIndex(i: number): number {
    if (this.paginatorStae) {
      return i + this.paginatorStae.pageIndex * this.paginatorStae.pageSize;
    }
    return i;
  }

  onRadioChange(event: any, index: number) {
    this.listMesasStae[index].tipoTransmision = event.value;
  }

  // Método para seleccionar todos los tipos de transmisión
  seleccionarTodos(event: any) {
    const isChecked = event.checked;
    if (isChecked) {
      // Seleccionar todos como "STAE contingencia"
      this.listMesasStae.forEach(acta => {
        acta.tipoTransmision = Constantes.N_TIPO_TRANSMISION_CONTINGENCIA;
      });
    } else {
      // Deseleccionar todos
      this.listMesasStae.forEach(acta => {
        acta.tipoTransmision = null;
      });
    }
    // Actualizar la vista
    this.dataSource.data = [...this.listMesasStae];
  }

  // Verificar si todos están seleccionados
  get todosSeleccionados(): boolean {
    return this.listMesasStae.length > 0 && 
           this.listMesasStae.every(acta => acta.tipoTransmision === Constantes.N_TIPO_TRANSMISION_CONTINGENCIA);
  }

  // Verificar si algunos están seleccionados (para el estado indeterminado)
  get algunosSeleccionados(): boolean {
    const seleccionados = this.listMesasStae.filter(acta => acta.tipoTransmision === Constantes.N_TIPO_TRANSMISION_CONTINGENCIA).length;
    return seleccionados > 0 && seleccionados < this.listMesasStae.length;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorStae;

    setTimeout(() => {
      if (this.numMesaInput) {
        this.numMesaInput.nativeElement.focus();
      }
    });
  }

  protected readonly Constantes = Constantes;
}
