import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {GeneralService} from "../../../service/general-service.service";
import {ParametroService} from "../../../service/parametro.service";
import {IDetalleParametro, IParametro} from "../../../interface/parametro.inteface";
import {AuthComponent} from '../../../helper/auth-component';
import {Usuario} from '../../../model/usuario-bean';
import {FormControl} from '@angular/forms';
import {ProcesoElectoralResponseBean} from '../../../model/procesoElectoralResponseBean';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MonitoreoNacionService} from '../../../service/monitoreo-nacion.service';
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-parametros',
  templateUrl: './parametros.component.html'
})
export class ParametrosComponent extends AuthComponent implements AfterViewInit, OnInit {

  search: string = '';
  public usuario: Usuario;
  listParametros: IParametro[] = [];
  @ViewChild(MatTable, {static: true}) table: MatTable<any> =
    Object.create(null);
  procesoFormControl = new FormControl();
  dataSource = new MatTableDataSource(this.listParametros);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator =
    Object.create(null);
  listProceso: Array<ProcesoElectoralResponseBean>;
  totalRegistro: number = 0;
  page: number = 0;
  pageSize: number = 10;
  clearSearch: boolean = false;
  listTipoDato = [{id:1,name:'Numérico'},{id:2,name:'Texto'},{id:3,name:'Booleano'},{id:4,name:'Otros'}];
  detalleEditar: string;
  acronimo: string;
  proceso: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isNacion : boolean = false;


  constructor(private parametroService: ParametroService, private generalService: GeneralService,private monitoreoService: MonitoreoNacionService,) {
      super();
    this.listProceso = [];
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.isNacion = this.usuario.perfil.descripcion === 'ADM_NAC';
     if(this.isNacion){
      this.monitoreoService
        .obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.success) {
          this.listProceso = response.data;
        }
      });
    }else{
      this.cargarParametros(this.page, this.pageSize, this.search);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  buscar() {
    if (!this.search && this.acronimo) {
        return;
    }
    this.clearSearch = true;
    this.cargarParametros(0, 100, this.search);
  }

  clear() {
    this.clearSearch = false;
    this.search = '';
    this.cargarParametros(this.page, this.pageSize, this.search);
  }

  cargarDetalle(dataParametro: IParametro) {
    this.parametroService.listDetalleParametro(dataParametro.id, this.isNacion, this.acronimo).subscribe(response => {
      if (response.success) {
        dataParametro.detalles = response.data;
      }
    }, error => {
    })
  }

  editarDetalle(detalle: IDetalleParametro) {
    if(detalle.activo === 0){
      this.generalService.openDialogoGeneral({
        mensaje: "No puede editar un parámetro inactivo",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }
    detalle.isEditar = true;
    this.detalleEditar = JSON.stringify(detalle);
  }

  cancelarDetalle(detalle: IDetalleParametro) {
    const tempDetalle = JSON.parse(this.detalleEditar);
    detalle.valor = tempDetalle.valor;
    detalle.tipoDato = tempDetalle.tipoDato;
    detalle.isEditar = false;
    console.log('hola')
  }

  guardarDetalle(detalle: IDetalleParametro) {
    if(detalle.nombre === 'p_frecuencia_respaldo' && Number(detalle.valor) < 5 && 0 < Number(detalle.valor)){
      this.generalService.openDialogoGeneral({
        mensaje: "El valor mínimo permitido es 5",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }
    if(detalle.activo){
      detalle.activo = 1
    }else {
      detalle.activo = 0;
    }
    this.parametroService.saveDetalle(detalle,this.isNacion, this.acronimo).subscribe(response => {
      if (response.success) {
        this.generalService.openDialogoGeneral({
          mensaje: "Parámetro actualizado correctamente",
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: false
        });
        detalle.isEditar = false;
      }
    })
  }

  actualizarEstado(detalle: IDetalleParametro) {
    console.log(detalle);
    if(detalle.activo){
      detalle.activo = 1
    }else {
      detalle.activo = 0;
    }
    this.parametroService.actualziarEstado(detalle,this.isNacion, this.acronimo).subscribe(response => {
      if (response.success) {
        this.generalService.openDialogoGeneral({
          mensaje: "Parámetro actualizado correctamente",
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: false
        });
        detalle.isEditar = false;
      }
    })
  }

  validarValor(detalle: IDetalleParametro){
    if(detalle.tipoDato ===  1){
      detalle.valor = "";
    }
  }

  getRowIndex(index: number): number {
    return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
  }

  eventosPaginador(event: PageEvent) {
    this.totalRegistro = event.length;
    this.pageSize = event.pageSize;
    this.page = event.pageIndex;
    this.cargarParametros(this.page, this.pageSize, this.search);
  }

  private cargarParametros(page, size, search) {
    this.parametroService.parametros$.subscribe(data => {
      this.listParametros = data.list;
      this.totalRegistro = data.total;
    });
    this.parametroService.listParametros(page, size,this.isNacion, this.acronimo, search);
  }

  seleccionarProceso() {

    if (+this.procesoFormControl.value.id > 0) {
       this.proceso = this.procesoFormControl.value;
      this.acronimo = this.procesoFormControl.value.acronimo;
      this.cargarParametros(0, 100, '');
    }
  }

}
