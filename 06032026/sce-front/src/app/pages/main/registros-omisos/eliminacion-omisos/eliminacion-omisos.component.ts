import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormsModule} from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {Usuario} from '../../../../model/usuario-bean';
import {Router} from '@angular/router';
import {UtilityService} from '../../../../helper/utilityService';
import {
  PopupHabilitacionExitosaComponent
} from '../../reprocesar-mesa/popup-habilitacion-exitosa/popup-habilitacion-exitosa.component';
import {IconPopType} from '../../../../model/enum/iconPopType';
import {AuthComponent} from '../../../../helper/auth-component';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MaterialModule} from '../../../../material/material.module';
import {NgIf} from '@angular/common';
import {SharedModule} from '../../../shared/shared.module';
import {MesaBean} from '../../../../model/mesaBean';
import {OmisosMesaService} from '../../../../service/omisos-mesa.service';
import {AutorizacionWrapperComponent} from '../../componentes/autorizacion-wrapper/autorizacion-wrapper.component';
import {AutorizacionWrapperService} from '../../../../service/autorizacion-wrapper.service';
import {Constantes} from '../../../../helper/constantes';

@Component({
  selector: 'app-eliminacion-omisos',
  standalone: true,
  templateUrl: './eliminacion-omisos.component.html',
  imports: [MatFormFieldModule, MatTableModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatCheckboxModule, MaterialModule, SharedModule, NgIf, AutorizacionWrapperComponent],
})
export class EliminacionOmisosComponent extends AuthComponent implements OnInit {
  displayedColumns: string[] = ['position', 'mesa', 'accion'];
  dataSource = new MatTableDataSource<MesaBean>();

  public mesaControl: FormControl;
  readonly dialog = inject(MatDialog);
  destroyRef:DestroyRef = inject(DestroyRef);


  habilitarBtn: boolean;
  private usuario: Usuario;
  autorizado: boolean;
  idAutorizacion:string;
  public tituloComponent: string = "Eliminar omisos";
  listData: Array<MesaBean> = [];


  constructor(public  readonly  router: Router,
              private readonly  utilityService:UtilityService,
              private readonly  eliminarOmisosService: OmisosMesaService,
              private readonly autorizacionWrapperService: AutorizacionWrapperService) {

    super();
    this.habilitarBtn = true;
    this.mesaControl = new FormControl<string>("");
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.autorizacionWrapperService.validaAutorizacionIngresoModulo(this.tituloComponent, Constantes.TIPO_AUTORIZACION_ELIMINAR_OMISOS);
  }

  openDialog() {
    this.dialog.open(PopupHabilitacionExitosaComponent, {width: '550px', maxWidth: '80vw'});
  }

  buscarMesa(){

    if(this.mesaControl.value.length < 6){
      this.utilityService.mensajePopup(this.tituloComponent, "Ingresa una mesa válida.", IconPopType.ALERT);
      return;
    }

    const filter = this.listData.filter(me => me.mesa === this.mesaControl.value);
    if (filter.length > 0) {
      this.utilityService.mensajePopup(this.tituloComponent, "La mesa ya se encuentra registrada.", IconPopType.ALERT);
      return;
    }

    this.eliminarOmisosService.buscarMesaEliminarOmisos(this.mesaControl.value).subscribe(response => {
      if(response.success){
        const mesa: MesaBean = response.data;
        this.listData.push(mesa);
        this.dataSource = new MatTableDataSource(this.listData);
        this.utilityService.mensajePopup(this.tituloComponent,"La mesa " + mesa.mesa + " se agregó correctamente ", IconPopType.CONFIRM);
        this.reniciar()
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

  reniciar(){
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
   this.eliminarOmisosService.save(this.listData).subscribe(response => {
      if(response.success){
        this.utilityService.mensajePopup(this.tituloComponent,"La eliminación de omisos se realizó con éxito. ", IconPopType.CONFIRM);
        this.listData = [];
        this.dataSource = new MatTableDataSource(this.listData);
        this.reniciar();
      }
    }, error => {
      if (error.error && error.error.message) {
        this.utilityService.mensajePopup(this.tituloComponent, error.error.message, IconPopType.ALERT);
      } else {
        this.utilityService.mensajePopup(this.tituloComponent,"Error interno al llamar al servicio de eliminar osmisos.", IconPopType.ERROR);
      }
    })
  }
}
