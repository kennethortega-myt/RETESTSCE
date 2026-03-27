import {Component, DestroyRef, inject, OnInit, ViewChild} from "@angular/core";
import {AuthComponent} from "../../../../helper/auth-component";
import {MatTableDataSource} from "@angular/material/table";
import {ActaBean} from "../../../../model/resoluciones/acta-jee-bean";
import {Usuario} from "../../../../model/usuario-bean";
import {FormControl, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ResolucionService} from "../../../../service/resolucion.service";
import {GeneralService} from "../../../../service/general-service.service";
import {IGenericInterface} from "../../../../interface/general.interface";
import {MatPaginator} from "@angular/material/paginator";
import {DialogoConfirmacionComponent} from "../../dialogo-confirmacion/dialogo-confirmacion.component";
import {
  PopReporteCargoEntregaComponent
} from "../envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component";
import {UtilityService} from "../../../../helper/utilityService";
import {IconPopType} from "../../../../model/enum/iconPopType";
import { GenericResponseBean } from "src/app/model/genericResponseBean";
import { DigitizationGetFilesResponse } from "src/app/model/digitizationGetFilesResponse";
import { ACCIONES_TABLA } from "src/app/pages/shared/tabla-actas/tabla-actas-acciones.constant";

@Component({
  selector: 'app-actas-devueltas',
  templateUrl: './actas-devueltas.component.html',
  styleUrls: ['./actas-devueltas.component.scss']
})
export class ActasDevueltasComponent extends AuthComponent implements OnInit{

  destroyRef:DestroyRef = inject(DestroyRef);
  @ViewChild('refNumeCopia') refNumeCopia;
  @ViewChild('refNumeActa') refNumeActa;
  @ViewChild('paginator') paginator: MatPaginator;

  dataSource: MatTableDataSource<ActaBean>;
  public usuario: Usuario;
  displayedColumns: string[] = ['position', 'acta', 'copia','eleccion', 'estado', 'acciones'];
  actaFormControl = new FormControl({value:"", disabled:false}, Validators.minLength(6));
  copiaFormControl = new FormControl({value:"", disabled:false}, Validators.minLength(3));
  ACCIONES_TABLA = ACCIONES_TABLA;

  tituloComponente: string = "Registro de Actas Devueltas";

  constructor(
    private readonly resolucionService: ResolucionService,
    private readonly generalService : GeneralService,
    private readonly dialog: MatDialog,
    private readonly utilityService: UtilityService
  ) {
    super();
  }

  ngOnInit() {
    this.usuario = this.authentication();

    this.dataSource = new MatTableDataSource([]);
    if(this.paginator) this.dataSource.paginator = this.paginator;
  }

  limpiarInputs(){
    this.copiaFormControl.reset();
    this.actaFormControl.reset();
  }

  agregarActa() {
    if(!this.sonValidosLosDatos()) {
      this.limpiarInputs();
      return;
    }

    let nroActa = this.actaFormControl.value;
    let nroCopia = this.copiaFormControl.value;

    sessionStorage.setItem('loading','true');
    this.resolucionService.validarActaDevueltaJEE(nroActa,nroCopia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.validarActaDevueltaJEECorrecto.bind(this),
        error: this.validarActaDevueltaJEEIncorrecto.bind(this)
      });
  }

  validarActaDevueltaJEECorrecto(response: IGenericInterface<ActaBean>){
    sessionStorage.setItem('loading','false');
    this.limpiarInputs();
    if(response.success){
      this.dataSource.data = [...this.dataSource.data, response.data];
      if(this.paginator) this.dataSource.paginator = this.paginator;
      if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
    } else {
      if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);

    }
  }

  validarActaDevueltaJEEIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.limpiarInputs();
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.utilityService.mensajePopup(this.tituloComponente,mensaje,IconPopType.ALERT);
    if(this.refNumeActa)this.refNumeActa.nativeElement.focus();
  }

  limpiarDatos() {
    this.actaFormControl.reset();
    this.copiaFormControl.reset();
    this.dataSource.data = [];
    if(this.paginator) this.dataSource.paginator = this.paginator;
    if (this.refNumeActa) this.refNumeActa.nativeElement.focus();
  }

  sonValidosLosDatos() :boolean{
    let nroActa = this.actaFormControl.value;
    let nroCopia = this.copiaFormControl.value;
    if (!nroActa || nroActa == '') {
      this.utilityService.mensajePopup(this.tituloComponente,"Ingrese un número de acta.",IconPopType.ALERT);
      return false;
    }

    if (nroActa.length != 6) {
      this.utilityService.mensajePopup(this.tituloComponente,"El número de acta no cuenta con 6 dígitos.",IconPopType.ALERT);
      return false;
    }

    if (nroCopia.length != 3) {
      this.utilityService.mensajePopup(this.tituloComponente,"El número de copia no cuenta con 3 dígitos.",IconPopType.ALERT);
      return false;
    }

    const regex = /^\d*$/;
    const onlyNumbers = regex.test(nroCopia.substring(0,2)); // true
    if(!onlyNumbers){
      this.utilityService.mensajePopup(this.tituloComponente,"Los dos primeros dígitos de la copia deben ser números.",IconPopType.ALERT);
      return false;
    }

    const regex2 = /^[a-zA-Z]+$/;
    const onlyNumbers2 = regex2.test(nroCopia.substring(2,3)); // true
    if(!onlyNumbers2){
      this.utilityService.mensajePopup(this.tituloComponente,"El último dígito de la copia debe ser una letra.",IconPopType.ALERT);
      return false;
    }

    if (!nroCopia || nroCopia == '') {
      this.utilityService.mensajePopup(this.tituloComponente,"Ingrese un número de copia.",IconPopType.ALERT);
      return false;
    }

    const actabean: ActaBean | undefined = this.dataSource.data.find(e => e.mesa === nroActa && e.copia  === nroCopia);
    if (actabean) {
      this.utilityService.mensajePopup(this.tituloComponente,"El acta " + nroActa +"-" +  nroCopia + " ya se encuentra clasificada.",IconPopType.ALERT);
      return false;
    }

    return true;
  }

  generarCargoEntrega(){
    if(this.dataSource.data.length == 0){
      this.utilityService.mensajePopup(this.tituloComponente,"No se han agregado actas devueltas",IconPopType.ALERT);
      return;
    }

    let mensajeCargoEntre = "";
    if (this.dataSource.data.length == 1){
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para la acta devuelta?`;
    }else{
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para las actas devueltas?`;
    }

    this.dialog.open(DialogoConfirmacionComponent, {
      disableClose: true,
      data: mensajeCargoEntre
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {

          sessionStorage.setItem('loading','true');
          this.resolucionService.generarCargoEntregaActaDevuelta(this.dataSource.data)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: this.generarCargoEntregaActaDevueltaCorrecto.bind(this),
              error: this.generarCargoEntregaActaDevueltaIncorrecto.bind(this)
            });
        }
      });
  }

mostrarActaComoPdf(response: GenericResponseBean<DigitizationGetFilesResponse>) {
  if (response.success) {
    const base64Pdf = response.data.acta1File;

    const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
      width: '1200px',
      maxWidth: '80vw',
      disableClose: true,
      data: {
        dataBase64: base64Pdf,
        success: true,
        nombreArchivoDescarga: "Acta_Sobre.pdf"
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.limpiarDatos();
    });
  } else {
    this.utilityService.mensajePopup(
      this.tituloComponente,
      response.message,
      IconPopType.ALERT
    );
  }
}


  generarCargoEntregaActaDevueltaCorrecto(response: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');
    if(response.success){
      const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        disableClose: true,
        data: {
          dataBase64: response.data,
          success: true,
          nombreArchivoDescarga : "Reporte_cargo_entrega_actas_devueltas.pdf"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.limpiarDatos();
      });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  generarCargoEntregaActaDevueltaIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.utilityService.mensajePopup(this.tituloComponente,mensaje,IconPopType.ALERT);
  }

  eliminarActa(indice: number) {
    let actaBean: ActaBean = this.dataSource.data[indice];
    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Desea eliminar el acta ` + actaBean.mesa + `-` + actaBean.copia + ` de la lista?`,
      ()=> this.confirmarEliminarActa(indice, actaBean)
    );
  }

  confirmarEliminarActa(indice: number, actaBean: ActaBean){
    this.dataSource.data = this.dataSource.data.filter((_, i) => i !== indice);
    if(this.paginator) this.dataSource.paginator = this.paginator;
    this.utilityService.mensajePopup(this.tituloComponente,"Se eliminó el acta "+ actaBean.mesa + '-' + actaBean.copia+".",IconPopType.CONFIRM);
  }

  onKeyNumeActa(event){
    if(event.keyCode != 8 && event.keyCode != 9){//BACKSPACE
      if(event.target.value.length ===6){
        if(this.refNumeCopia)
          this.refNumeCopia.nativeElement.focus();
      }
    }
  }

  agregarActaOn(event) {
    if (event.keyCode === 13) {
      this.agregarActa();
    }
  }
}
