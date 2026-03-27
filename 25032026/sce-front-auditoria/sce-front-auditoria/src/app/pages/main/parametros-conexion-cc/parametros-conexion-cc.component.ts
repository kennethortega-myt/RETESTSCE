import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {GeneralService} from "../../../service/general-service.service";
import {AuthComponent} from '../../../helper/auth-component';
import {Usuario} from '../../../model/usuario-bean';
import {FormControl} from '@angular/forms';
import {ProcesoElectoralResponseBean} from '../../../model/procesoElectoralResponseBean';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {MonitoreoNacionService} from '../../../service/monitoreo-nacion.service';
import {ParametroConexionService } from 'src/app/service/parametro-conexion.service';
import {IDetalleParametroConexion, IEditParametroConexion } from 'src/app/interface/parametro-conexion';
import {IconPopType, TitlePop} from 'src/app/model/enum/iconPopType';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReportesNacionService } from 'src/app/service/reportes-nacion.service';

@Component({
  selector: 'app-parametros-cc',
  templateUrl: './parametros-conexion-cc.component.html',
  styleUrls: ['./parametros-conexion-cc.component.scss']
})
export class ParametrosConexionCcComponent extends AuthComponent implements AfterViewInit, OnInit {

  search: string = '';

  public usuario: Usuario;
  listParametros: IDetalleParametroConexion[] = [];
  @ViewChild(MatTable, {static: true}) table: MatTable<any> =
    Object.create(null);
  procesoFormControl = new FormControl();
  centroComputoFormControl = new FormControl();
  dataSource = new MatTableDataSource(this.listParametros);
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator =
    Object.create(null);
  listProceso: Array<ProcesoElectoralResponseBean>;
  listCentrosComputo: Array<CentroComputoBean>;
  totalRegistro: number = 0;
  acronimo: string;
  proceso: any;
  centroComputo: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isNacion : boolean = false;
  tituloComponente: string = 'Parámetros de Conexión';
  pageIndex = 0;
  pageSize = 10;
  pagedParametros = [];
  private destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private parametroService: ParametroConexionService,
    private generalService: GeneralService,
    private monitoreoService: MonitoreoNacionService,
    private reporteNacionService: ReportesNacionService,
    private utilityService:UtilityService) {
      super();
    this.listProceso = [];
    this.listCentrosComputo = [];
    this.centroComputo = { id: null };
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
      this.cargarParametros(this.acronimo);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }


  buscar() {

    let resultadoMensaje = this.sonValidosLosDatos();
    if(resultadoMensaje) {
        this.utilityService.mensajePopup(this.tituloComponente,resultadoMensaje, IconPopType.ALERT);
        return;
    }

    if (!this.acronimo) {
      return;
    }

    this.cargarParametros(this.acronimo, this.centroComputo?.id > 0 ? this.centroComputo.id : null);
  }

  cargarDetalle(detalle: IDetalleParametroConexion) {
    this._cargarDetalle(this.acronimo, detalle);
  }

  editarDetalle(parametroEdit: IEditParametroConexion) {
    parametroEdit.isEditar = true;
  }

  cancelarDetalle(parametroEdit: IEditParametroConexion) {
    parametroEdit.isEditar = false;
  }

  guardarDetalle(parametroEdit: IEditParametroConexion) {

    if(this.validar(parametroEdit)){
      this.parametroService.updateCentroComputo(
        this.acronimo,
        parametroEdit.idCentroComputo,
        parametroEdit.protocolo,
        parametroEdit.ip,
        parametroEdit.puerto
      ).subscribe(response => {
        if (response.success) {
          this.generalService.openDialogoGeneral({
            mensaje: "Parámetro de conexión actualizado correctamente",
            icon: IconPopType.CONFIRM,
            title: TitlePop.INFORMATION,
            success: false
          });
          parametroEdit.isEditar = false;
        }
      })
    }


  }

  ping(detalle: IDetalleParametroConexion) {
    if(this.validar(detalle)){
      this.parametroService.pingConexion(
        this.acronimo,
        detalle.idCentroComputo,
        detalle.protocolo,
        detalle.ip,
        detalle.puerto
      ).subscribe(response => {
        if (response.success) {
          this.generalService.openDialogoGeneral({
            mensaje: "Conexión exitosa",
            icon: IconPopType.CONFIRM,
            title: TitlePop.INFORMATION,
            success: false
          });
        } else {
          this.generalService.openDialogoGeneral({
            mensaje: "Conexión fallida",
            icon: IconPopType.ERROR,
            title: TitlePop.INFORMATION,
            success: false
          });
        }
      })
    }
  }

  private cargarParametros(acronimo:any, idCentroComputo:any = null) {
    this.parametroService.obtenerCentrosComputo(acronimo, idCentroComputo).subscribe(response => {
      if (response.success) {
        this.listParametros = response.data;
        this.applyPaging();
      } else {
        this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: false
        });
      }
    })

  }

  private _cargarDetalle(idProceso:any, parametro:IDetalleParametroConexion) {
    this.parametroService.obtenerCentrosComputo(idProceso, parametro.idCentroComputo).subscribe(response => {
      if (response.success) {
        parametro.detalle = response.data;;
      } else {
        this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: false
        });
      }
    })

  }

  seleccionarProceso() {
    if (+this.procesoFormControl.value.id > 0) {
      this.proceso = this.procesoFormControl.value;
      this.acronimo = this.procesoFormControl.value.acronimo;
      this.cargarParametros(this.acronimo);

      this.reporteNacionService.getCentrosComputo(this.acronimo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(response => {
        if (response.success) {
          this.listCentrosComputo = [...response.data].sort((a, b) => a.id - b.id);
        }
      })
    }
  }

  seleccionarCentroComputo() {
    if (+this.centroComputoFormControl.value.id > 0) {
      this.centroComputo = this.centroComputoFormControl.value;
    } else {
      this.centroComputo = { id: null };
    }

    this.cargarParametros(this.acronimo, this.centroComputo?.id);
  }

  validar(detalle: any):boolean {
    if (!detalle.protocolo || !detalle.ip || !detalle.puerto) {
      this.generalService.openDialogoGeneral({
        mensaje: 'Todos los campos son obligatorios',
        icon: IconPopType.ERROR,
        title: 'Validación',
        success: false
      });
      return false;
    }

    const puertoNum = Number(detalle.puerto);
    if (Number.isNaN(puertoNum) || puertoNum < 1 || puertoNum > 65535) {
      this.generalService.openDialogoGeneral({
        mensaje: 'El puerto debe ser un número válido entre 1 y 65535',
        icon: IconPopType.ERROR,
        title: 'Validación',
        success: false
      });
      return false;
    }

    return true;
  }

  actualizarEstado(detalle: IDetalleParametroConexion) {
      this.parametroService.actualizarEstado(
        this.acronimo,
        detalle.idCentroComputo,
        detalle.esActivo
      ).subscribe(response => {
        if (response.success) {
          this.generalService.openDialogoGeneral({
            mensaje: "Estado de configuración actualizado correctamente",
            icon: IconPopType.CONFIRM,
            title: TitlePop.INFORMATION,
            success: false
          });
        }
        this.cargarParametros(this.acronimo);
      })
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.applyPaging();
  }

  applyPaging() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedParametros = this.listParametros.slice(start, end);
  }

  sonValidosLosDatos() :string | null{
    if(!this.procesoFormControl.value ||
      this.procesoFormControl.value === 0){
      return "Seleccione un proceso";
    }
    return null;
  }

}
