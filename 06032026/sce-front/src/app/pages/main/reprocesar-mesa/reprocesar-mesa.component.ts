import {Component, DestroyRef, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {FormBuilder, FormControl, FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { PopupHabilitacionExitosaComponent } from './popup-habilitacion-exitosa/popup-habilitacion-exitosa.component';

import {
  MatDialog,
} from '@angular/material/dialog';
import {IconPopType} from '../../../model/enum/iconPopType';
import {AuthComponent} from '../../../helper/auth-component';
import {PuestaCeroService} from '../../../service/puesta-cero.service';
import {Router} from '@angular/router';
import {UtilityService} from '../../../helper/utilityService';
import {Usuario} from '../../../model/usuario-bean';
import {ReprocesarMesaService} from '../../../service/reprocesar-mesa.service';
import {MaterialModule} from '../../../material/material.module';
import {
  IReprocesarMesaRequest,
  IReprocesarMesaTable,
  ITipoDocumento
} from '../../../interface/reprocesarMesa.interface';
import {NgClass} from '@angular/common';
import {SharedModule} from '../../shared/shared.module';
import {AutorizacionWrapperService} from '../../../service/autorizacion-wrapper.service';
import {AutorizacionWrapperComponent} from '../componentes/autorizacion-wrapper/autorizacion-wrapper.component';
import {Constantes} from '../../../helper/constantes';

@Component({
  selector: 'app-reprocesar-mesa',
  standalone: true,
  imports: [MatFormFieldModule, MatTableModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatCheckboxModule, MaterialModule, NgClass, SharedModule, AutorizacionWrapperComponent],
  templateUrl: './reprocesar-mesa.component.html'
})
export class ReprocesarMesaComponent  extends AuthComponent implements OnInit, OnDestroy {

  public mesaControl: FormControl;
  readonly dialog = inject(MatDialog);
  destroyRef:DestroyRef = inject(DestroyRef);
  displayedColumns: string[] = ['position', 'mesa', 'LE', 'HA', 'MMAE', 'PER', 'ACCION'];
  dataSource = new MatTableDataSource<IReprocesarMesaTable>();
  habilitarBtn: boolean;
  private usuario: Usuario;
  mensajeAcceso: string;
  autorizado: boolean;
  idAutorizacion:string;
  public tituloComponent: string = "Reprocesar Mesa";
  listTipoDocumentos = signal<ITipoDocumento[]>([]);
  listData: Array<IReprocesarMesaTable> = [];
  request: IReprocesarMesaRequest;
  listRequest: IReprocesarMesaRequest[] = [];

  constructor(private puestaCeroService: PuestaCeroService,
              public router: Router,
              private utilityService:UtilityService,
              private repreocesarService: ReprocesarMesaService,
              private formBuilder: FormBuilder,
              private autorizacionWrapperService: AutorizacionWrapperService) {

    super();
    this.habilitarBtn = true;
    this.mesaControl = new FormControl<string>("");
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.autorizacionWrapperService.validaAutorizacionIngresoModulo("Reprocesar mesa", Constantes.TIPO_AUTORIZACION_REPROCESAR_MESA);
  }

  openDialog() {
    this.dialog.open(PopupHabilitacionExitosaComponent, {width: '550px', maxWidth: '80vw'});
  }

  ngOnDestroy(): void {
  }

  buscarMesa(){

    if(this.mesaControl.value.length < 6){
      this.utilityService.mensajePopup(this.tituloComponent, "Ingresa una mesa válida.", IconPopType.ALERT);
      return;
    }

    const filter = this.listData.filter(me => me.mesa === this.mesaControl.value);
    if (filter.length > 0) {
      this.utilityService.mensajePopup(this.tituloComponent, "Mesa ya se encuentra registrado", IconPopType.ALERT);
      return;
    }

    this.repreocesarService.buscarMesaReprocesar(this.mesaControl.value).subscribe(response => {
      if(response.success){
        this.listTipoDocumentos.set(response.data.tipoDocumentos);
        this.request = response.data;
      }else{
        this.utilityService.mensajePopup(this.tituloComponent, response.message, IconPopType.ALERT);
      }
    }, error => {
      if (error.error && error.error.message) {
        this.utilityService.mensajePopup(this.tituloComponent, error.error.message, IconPopType.ALERT);
      } else {
        this.utilityService.mensajePopup(this.tituloComponent,"Error interno al llamar al servicio de reprocesar mesa.", IconPopType.ERROR);
      }
    });
  }

  agregarMesa(){
    let item : IReprocesarMesaTable = {
      mesa: this.request.mesa.mesa,
      PER: false,
      HA: false,
      MMAE: false,
      LE: false,
      position: this.request.mesa.id
    }
    for (let tipo of this.listTipoDocumentos()) {
      if(tipo.codigo === "PR" && tipo.reprocesar){
          item.PER = true;
      }
      if(tipo.codigo === "ME" && tipo.reprocesar){
        item.MMAE = true;
      }
      if(tipo.codigo === "LE" && tipo.reprocesar){
        item.LE = true;
      }
      if(tipo.codigo === "MM" && tipo.reprocesar){
        item.HA = true;
      }
    }
    if(!item.PER && !item.MMAE && !item.LE && !item.HA){
      this.utilityService.mensajePopup(this.tituloComponent,"Debe seleccionar al menos un tipo de documento ", IconPopType.ALERT);
      return;
    }
    this.request.tipoDocumentos = [...this.listTipoDocumentos()];
    item.data = this.request;
    this.listData.push(item);
    this.dataSource = new MatTableDataSource(this.listData);
    this.utilityService.mensajePopup(this.tituloComponent,"La mesa " + item.mesa + " se agregó correctamente ", IconPopType.CONFIRM);
    this.reniciar()
  }

  update(reprocesar: boolean, index: number) {
    this.listTipoDocumentos.update(lista => {
      const copia = [...lista];
      copia[index] = {
        ...copia[index],
        reprocesar
      };
      return copia;
    });
  }

  reniciar(){
    this.listTipoDocumentos.set([]);
    this.mesaControl.setValue("");
  }

  eliminar(elemento: any) {
    const index = this.listData.indexOf(elemento);
    if (index > -1) {
      this.listData.splice(index, 1);
      this.listData = [...this.listData];
      this.dataSource = new MatTableDataSource(this.listData);
    }
  }

  guardarInformacion(){
    this.repreocesarService.save(this.listData.map(d=> d.data)).subscribe(response => {
      if(response.success){
        this.utilityService.mensajePopup(this.tituloComponent,"La habilitación se realizó con éxito. ", IconPopType.CONFIRM);
        this.listData = [];
        this.dataSource = new MatTableDataSource(this.listData);
        this.reniciar();
      }
    }, error => {
      if (error.error && error.error.message) {
        this.utilityService.mensajePopup(this.tituloComponent, error.error.message, IconPopType.ALERT);
      } else {
        this.utilityService.mensajePopup(this.tituloComponent,"Error interno al llamar al servicio de reprocesar mesa.", IconPopType.ERROR);
      }
    })
  }

}









