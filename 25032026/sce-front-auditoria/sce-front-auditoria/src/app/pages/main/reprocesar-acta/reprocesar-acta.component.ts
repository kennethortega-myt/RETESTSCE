import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef, inject,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import { ModalGuardarReproComponent } from './modal-guardar-repro/modal-guardar-repro.component';
import {FormBuilder, FormGroup} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {ReprocesarActaService} from "../../../service/reprocesar-acta.service";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {ActaReprocesadaListBean} from "../../../model/actaReprocesadaListBean";
import {MatTableDataSource} from "@angular/material/table";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {TabAutorizacionBean} from "../../../model/tabAutorizacionBean";
import {PuestaCeroService} from "../../../service/puesta-cero.service";
import {IconPopType} from "../../../model/enum/iconPopType";
import {UtilityService} from "../../../helper/utilityService";
import { PopMensajeData } from 'src/app/interface/popMensajeData.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reprocesar-acta',
  templateUrl: './reprocesar-acta.component.html',
  styleUrls: ['./reprocesar-acta.component.scss']
})

export class ReprocesarActaComponent implements OnInit, AfterViewInit{

  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;

  destroyRef:DestroyRef = inject(DestroyRef);
  formReprocesar: FormGroup;
  isConsulta: boolean;
  listActasReprocesar: Array<ActaReprocesadaListBean>;
  dataSource: MatTableDataSource<ActaReprocesadaListBean>;
  bloquearAgregar: boolean = false;
  autorizado: boolean;
  mensajeAcceso: string;
  public tituloAlert="Reprocesar Acta";

  constructor(
    public router: Router,
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly reprocesarActaService: ReprocesarActaService,
    private readonly puestaCeroService: PuestaCeroService,
    private readonly utilityService:UtilityService) {

    this.isConsulta=true;
    this.listActasReprocesar=[];
    this.dataSource= new MatTableDataSource<ActaReprocesadaListBean>(this.listActasReprocesar);

    this.formReprocesar = this.formBuilder.group({
      numActaFormControl: [{value:'',disabled: false}],
      numCopiaFormControl: [{value:'',disabled: false}]
    });
  }

  ngOnInit() {
   this.validaAutorizacionIngresoModulo();
  }

  validaAutorizacionIngresoModulo(): void {
    this.reprocesarActaService.validarAccesoAlModulo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.mensajeAcceso = response.data.mensaje;
            if (response.data.autorizado) {
              this.autorizado = true;
              this.setearInicio();
              this.listProcesar();
            } else if (response.data.solicitudGenerada) {
              const popMensaje: PopMensajeData = {
                title: this.tituloAlert,
                mensaje: response.data.mensaje,
                icon: IconPopType.ALERT,
                success: true
              };

              this.dialog.open(PopMensajeComponent, { data: popMensaje })
                .afterClosed()
                .subscribe(confirmado => {
                  if (confirmado) {
                    this.router.navigateByUrl('/inicio');
                  }
                });

            } else {
              this.dialog.open(DialogoConfirmacionComponent, {
                data: 'Para continuar debe solicitar acceso, ¿Desea generar una solicitud ahora?'
              })
                .afterClosed()
                .subscribe(confirmado => {
                  if (confirmado) {
                    this.solicitarAccesoNacion();
                  }
                });
            }

          }
        },
        error: (error) => {
          const mensaje = error?.error?.message
            ? error.error.message
            : "Error interno al llamar al servicio de autorizaciones de nación.";
          this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
        }
      });
  }


  solicitarAccesoNacion(){
    this.reprocesarActaService.solicitarAccesoAlModulo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(response => {
        if (response.success) {
          this.validaAutorizacionIngresoModulo();
        }
      });
  }

  agregarActa(){
    if(!this.sonValidosLosDatos()) return;

    let numActa = this.formReprocesar.get('numActaFormControl').value
    let numCopia = this.formReprocesar.get('numCopiaFormControl').value

    sessionStorage.setItem('loading','true');
    this.reprocesarActaService.getActaReprocesar(numActa+numCopia.toUpperCase())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getActaReprocesarCorrecto.bind(this),
        error: this.getActaReprocesarIncorrecto.bind(this)
      });
  }

  getActaReprocesarCorrecto(response: GenericResponseBean<ActaReprocesadaListBean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }else{
      this.limpiarInputs();
      let indice = this.listActasReprocesar.findIndex(value =>
        value.mesa+value.copia+value.digitoChequeo==response.data.mesa+response.data.copia+response.data.digitoChequeo)
      if (indice==-1){
        this.isConsulta = false;
        this.listActasReprocesar.push(response.data);
        this.dataSource.data = this.listActasReprocesar;
      }else{
        this.utilityService.mensajePopup(this.tituloAlert, `El acta ${response.data.mesa} - ${response.data.copia}${response.data.digitoChequeo} ya fue agregada`, IconPopType.ALERT);
      }
    }
  }
  getActaReprocesarIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloAlert, this.utilityService.manejarMensajeError(error), IconPopType.ALERT);
  }

  limpiarInputs(){
    this.formReprocesar.get('numActaFormControl').setValue('');
    this.formReprocesar.get('numCopiaFormControl').setValue('')
    this.inputRefs.first.nativeElement.focus();
  }

  sonValidosLosDatos() :boolean{
    if(!this.formReprocesar.get('numActaFormControl').value ||
      this.formReprocesar.get('numActaFormControl').value === ''){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese el número del acta.", IconPopType.ALERT);
      return false;
    }
    if(this.formReprocesar.get('numActaFormControl').value.length != 6){
      this.utilityService.mensajePopup(this.tituloAlert, "El número de acta no cuenta con 6 dígitos.", IconPopType.ALERT);
      return false;
    }
    if(!this.formReprocesar.get('numCopiaFormControl').value ||
      this.formReprocesar.get('numCopiaFormControl').value === ''){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese el número de copia.", IconPopType.ALERT);
      return false;
    }
    if(this.formReprocesar.get('numCopiaFormControl').value.length != 3){
      this.utilityService.mensajePopup(this.tituloAlert, "El número de copia no cuenta con 3 dígitos.", IconPopType.ALERT);
      return false;
    }

    const regex = /^\d*$/;
    const onlyNumbers = regex.test(this.formReprocesar.get('numCopiaFormControl').value.substring(0,2)); // true
    if(!onlyNumbers){
      this.utilityService.mensajePopup(this.tituloAlert, "Los dos primeros dígitos de la copia deben ser números.", IconPopType.ALERT);
      return false;
    }

    const regex2 = /^[a-zA-Z]+$/;
    const onlyNumbers2 = regex2.test(this.formReprocesar.get('numCopiaFormControl').value.substring(2,3)); // true
    if(!onlyNumbers2){
      this.utilityService.mensajePopup(this.tituloAlert, "El último dígito de la copia debe ser una letra.", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  quitaActa(index: number){
    if (index >= 0 && index < this.listActasReprocesar.length){
      this.listActasReprocesar.splice(index,1);
      this.dataSource.data= this.listActasReprocesar;
    }
    if (this.listActasReprocesar.length == 0){
      this.isConsulta = true;
    }

  }

  ngAfterViewInit() {
    if (this.inputRefs && this.inputRefs.length > 0) {
      this.inputRefs.first.nativeElement.focus();
    }
  }

  onKeyNumeActa(event){
    if(event.keyCode != 8 && event.keyCode != 9){//BACKSPACE
      if(event.target.value.length ===6){
        if (this.inputRefs.toArray()[1]){
          this.inputRefs.toArray()[1].nativeElement.focus();
        }
      }
    }
  }

  validarLista() :boolean{
    if(this.listActasReprocesar.length == 0){
      this.utilityService.mensajePopup(this.tituloAlert, "Ingrese al menos una acta a reprocesar.", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  confirmarGrabarSinAuth(){
    if(!this.validarLista()) return;
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarListaActas();
        }
      });
  }
  confirmarGrabar(): void {
    if(!this.validarLista()) return;
    this.puestaCeroService.autorizacion("RA")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.autorizacionCorrecto.bind(this),
        error: this.autorizacionIncorrecto.bind(this)
      });

  }

  autorizacionCorrecto(response: GenericResponseBean<TabAutorizacionBean>){
    if (!response.success){
      this.dialog.open(PopMensajeComponent, {
        data: {
          title: "Reprocesar Acta",
          mensaje: response.message,
          icon: IconPopType.ALERT
        }
      })
        .afterClosed()
        .subscribe(value => {

          for(let acta of this.listActasReprocesar){
            acta.autorizacionId =  response.data.id;
            acta.procesar = "SI";
          }
         this.updateListaProcesar();
        });
    }else{
      this.dialog
        .open(DialogoConfirmacionComponent, {
          data: `¿Está seguro de continuar?`
        })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.grabarListaActas();
          }
        });
  }
  }

  autorizacionIncorrecto(response: any){
    this.utilityService.mensajePopup(this.tituloAlert, "Error al solicitar la autorización.", IconPopType.ERROR);
  }
  grabarListaActas(){
    sessionStorage.setItem('loading','true');
    this.reprocesarActaService.reprocesarActas(this.listActasReprocesar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reprocesarActasCorrecto.bind(this),
        error: this.reprocesarActasIncorrecto.bind(this)
      });
  }

  updateListaProcesar(){
    sessionStorage.setItem('loading','true');
    this.reprocesarActaService.updateReprocesar(this.listActasReprocesar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.updateReprocesarActasCorrecto.bind(this),
        error: this.reprocesarActasIncorrecto.bind(this)
      });
  }

  reprocesarActasCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, "Error al obtener el acta a reprocesar.", IconPopType.ALERT);
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, "Se reprocesó con éxito.", IconPopType.CONFIRM);
      this.setearInicio();
    }

  }

  updateReprocesarActasCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, "Error al obtener el acta a reprocesar.", IconPopType.ALERT);
    }else{
      this.utilityService.mensajePopup(this.tituloAlert, "Se guardó con éxito.", IconPopType.CONFIRM);

    }

  }

  setearInicio(){
    this.listActasReprocesar = [];
    this.dataSource.data = this.listActasReprocesar;
    this.isConsulta=true;
    this.bloquearAgregar = false;
  }

  listProcesar(){
    this.reprocesarActaService.listReprocesarActas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.listReprocesarCorrecto.bind(this),
        error: this.listReprocesarIncorrecto.bind(this)
      });
  }


  listReprocesarCorrecto(response: GenericResponseBean<any>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, "Error al obtener el acta a reprocesar.", IconPopType.ALERT);
    }else{
      if(response.data.length > 0){
        this.bloquearAgregar = true;
      }
      this.isConsulta = false;

      this.listActasReprocesar = response.data;
      this.dataSource.data = this.listActasReprocesar;
    }

  }
  reprocesarActasIncorrecto(){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloAlert, "Error al intentar grabar la lista de actas.", IconPopType.ERROR);
  }
  listReprocesarIncorrecto(){
    sessionStorage.setItem('loading','false');
  }

  displayedColumns2: string[] = ['numero', 'mesa', 'eleccion','acciones'];

  openDialog2() {

    const dialogRef = this.dialog.open(ModalGuardarReproComponent, {


    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
