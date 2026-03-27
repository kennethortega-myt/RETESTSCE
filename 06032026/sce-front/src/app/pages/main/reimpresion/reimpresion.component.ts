import {
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {UtilityService} from "../../../helper/utilityService";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {MatTableDataSource} from "@angular/material/table";
import {ReimpresionCargoBean} from "../../../model/reimpresionCargoBean";
import {AuthComponent} from "../../../helper/auth-component";
import {MatPaginator} from "@angular/material/paginator";
import {IconPopType} from "../../../model/enum/iconPopType";
import {ResolucionService} from "../../../service/resolucion.service";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {IGenericInterface} from "../../../interface/general.interface";
import {
  PopReporteCargoEntregaComponent
} from "../resolucion/envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component";
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-reimpresion',
  templateUrl: './reimpresion.component.html'
})
export class ReimpresionComponent extends AuthComponent implements OnInit, OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);
  @ViewChild('refNumeMesa') refNumeMesa;
  @ViewChild('paginator') paginator: MatPaginator;

  isConsulta: boolean;
  formReimpresion: FormGroup;
  tituloComponente: string = "Reimpresión de Cargos";

  dataSource: MatTableDataSource<ReimpresionCargoBean>;
  displayedColumns: string[] = ['position', 'acta','eleccion','descripcionCargo','nombreArchivo', 'acciones'];
  mesaFormControl = new FormControl({value:"", disabled:false}, Validators.minLength(6));

  tipoCargo: number = 0;
  nombreArchivoDescarga: string = "";
  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly dialog: MatDialog,
    private readonly utilityService: UtilityService,
    private readonly resolucionService: ResolucionService
  ) {
    super();
  }
  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    if(this.paginator) this.dataSource.paginator = this.paginator;
  }

  limpiarInputs(){
    this.mesaFormControl.reset();
  }

  buscarMesa(){
    if(!this.sonValidosLosDatos()) {
      this.limpiarInputs();
      return;
    }

    let nroMesa = this.mesaFormControl.value;

    sessionStorage.setItem('loading','true');
    this.resolucionService.getReimpresionCargos(nroMesa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.ReimpresionCargosCorrecto.bind(this),
        error: this.ReimpresionCargosIncorrecto.bind(this)
      });


  }

  getDisplayIndex(index: number): number {
    if (!this.paginator) {
      return index + 1;
    }
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }

  ReimpresionCargosCorrecto(response: GenericResponseBean<Array<ReimpresionCargoBean>>){
    sessionStorage.setItem('loading','false');
    this.limpiarInputs();
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
      this.dataSource.data = [];
      if(this.paginator) this.dataSource.paginator = this.paginator;
    }else{
      this.dataSource.data = response.data;
      if(this.paginator) this.dataSource.paginator = this.paginator;
    }
  }

  ReimpresionCargosIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(response);
    this.utilityService.mensajePopup(this.tituloComponente,mensaje, IconPopType.ALERT);
  }

  sonValidosLosDatos() :boolean{
    let nroMesa = this.mesaFormControl.value;
    if (!nroMesa || nroMesa == '') {
      this.utilityService.mensajePopup(this.tituloComponente,"Ingrese un número de mesa.",IconPopType.ALERT);
      return false;
    }

    if (nroMesa.length != 6) {
      this.utilityService.mensajePopup(this.tituloComponente,"El número de mesa no cuenta con 6 dígitos.",IconPopType.ALERT);
      return false;
    }
    return true;
  }

  ngOnDestroy() {
    //metodo vacio
  }

  descargarCargo(e: any) {
    this.tipoCargo = e.tipoCargo;
    this.nombreArchivoDescarga = e.nombreArchivo;

    this.resolucionService
      .generarResolucionPopup( e.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
          next: this.generarResolucionPopupCorrecto.bind(this),
          error: this.generarResolucionPopupIncorrecto.bind(this)
        }
      );
  }

  generarResolucionPopupCorrecto(res: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');

    if(res.success) {
      const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: res.data,
          success: true,
          nombreArchivoDescarga: this.nombreArchivoDescarga+".pdf"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,"No se pudo descargar el archivo.", IconPopType.ALERT);
    }
  }

  generarResolucionPopupIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponente,"Error al descargar el archivo.", IconPopType.ERROR);
  }
}
