import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { GeneralService } from "../../../service/general-service.service";
import { AuthComponent } from '../../../helper/auth-component';
import { Usuario } from '../../../model/usuario-bean';
import { FormControl } from '@angular/forms';
import { ProcesoElectoralResponseBean } from '../../../model/procesoElectoralResponseBean';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MonitoreoNacionService } from '../../../service/monitoreo-nacion.service';
import { IJuradoELectoralEspecial } from 'src/app/interface/juradoElectoralEspecial.inteface';
import { JuradoElectoralService } from 'src/app/service/juradoElectoral.service';
import { OrcDetalleCatalogoEstructuraBean } from 'src/app/model/orcDetalleCatalogoEstructuraBean';
import { UtilityService } from 'src/app/helper/utilityService';
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-jurado-electoral-especial',
  templateUrl: './jurado-electoral-especial.html'
})
export class JuradoElectoralEspecialComponent extends AuthComponent implements AfterViewInit, OnInit {
  displayedColumns: string[] = [
  'numero',
  'codigoCC',
  'nombreCC',
  'jee',
  'direccion',
  'apellidoPaterno',
  'apellidoMaterno',
  'nombres',
  'acciones'
];

  search: string = '';
  public usuario: Usuario;
  listJuradoElectoral: IJuradoELectoralEspecial[] = [];
  @ViewChild(MatTable, { static: true }) table: MatTable<any> =
    Object.create(null);
  procesoFormControl = new FormControl();
  dataSource = new MatTableDataSource(this.listJuradoElectoral);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator =
    Object.create(null);
  listProceso: Array<ProcesoElectoralResponseBean>;
  listODPEJEE: Array<OrcDetalleCatalogoEstructuraBean>;
  totalRegistro: number = 0;
  page: number = 0;
  pageSize: number = 10;
  clearSearch: boolean = false;
  juradoBackup: string;
  acronimo: string;
  proceso: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  isNacion: boolean = false;
  constructor(
    private readonly juradoElectoralService: JuradoElectoralService,
    private readonly generalService: GeneralService,
    private readonly utilityService: UtilityService,
    private readonly monitoreoService: MonitoreoNacionService) {
    super();
    this.listProceso = [];
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.isNacion = this.usuario.perfil.descripcion === 'ADM_NAC';
    if (this.isNacion) {
      this.displayedColumns = ['numero','codigoCC','nombreCC','jee','direccion','apellidoPaterno','apellidoMaterno','nombres']
      this.monitoreoService
        .obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe((response) => {
          if (response.success) {
            this.listProceso = response.data;
          }
        });
    } else {
      this.cargarJuradoElectorales(this.page, this.pageSize, this.search);
      this.listarODPEs();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  clear() {
    this.clearSearch = false;
    this.search = '';
    this.cargarJuradoElectorales(this.page, this.pageSize, this.search);
  }

  editarJEE(jurado: IJuradoELectoralEspecial) {
    jurado.isEdit = true;
    this.juradoBackup = JSON.stringify(jurado);
  }

  cancelarJEE(jurado: IJuradoELectoralEspecial) {
    const respaldo = JSON.parse(this.juradoBackup);
    jurado.direccion = respaldo.direccion;
    jurado.apellidoPaterno = respaldo.apellidoPaterno;
    jurado.apellidoMaterno = respaldo.apellidoMaterno;
    jurado.nombreRepresentante = respaldo.nombreRepresentante;
    jurado.idCentroComputo = respaldo.idCentroComputo;
    jurado.codigoCentroComputo = respaldo.codigoCentroComputo;
    jurado.nombreCentroComputo = respaldo.nombreCentroComputo;
    jurado.idJEE = respaldo.idJEE;
    jurado.nombreJEE = respaldo.nombreJEE;
    jurado.isEdit = false;
  }

  guardarJEE(jurado: IJuradoELectoralEspecial): void {
    jurado.usuarioModificacion = this.usuario.nombre;
    this.juradoElectoralService.save(jurado, this.isNacion, this.acronimo).subscribe({
      next: (res) => {
        if (res.success) {
          jurado.isEdit = false;
          this.generalService.openDialogoGeneral({
            mensaje: 'JEE actualizado correctamente',
            title: TitlePop.INFORMATION,
            icon: IconPopType.CONFIRM,
            success: true
          });
          this.cargarJuradoElectorales(this.page, this.pageSize, this.search);
        } else {
          this.generalService.openDialogoGeneral({
            mensaje: res.message || 'Ocurrió un error al guardar',
            title: TitlePop.ERROR,
            icon: IconPopType.ALERT,
            success: false
          });
        }
      },
      error: (err) => {
        this.generalService.openDialogoGeneral({
          mensaje: 'Error del servidor: ' + this.utilityService.manejarMensajeError(err),
          title: TitlePop.ERROR,
          icon: IconPopType.ALERT,
          success: false
        });
      }
    });
  }

  getRowIndex(index: number): number {
    return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
  }

  eventosPaginador(event: PageEvent) {
    this.totalRegistro = event.length;
    this.pageSize = event.pageSize;
    this.page = event.pageIndex;
    this.cargarJuradoElectorales(this.page, this.pageSize, this.search);
  }

  private cargarJuradoElectorales(page, size, search) {
    this.juradoElectoralService.parametros$.subscribe(data => {
      this.listJuradoElectoral = data.list;
      this.totalRegistro = data.total;
    });
    this.juradoElectoralService.listJuradoElectorales(page, size, this.isNacion, this.acronimo, search);
  }

  listarODPEs() {
    this.juradoElectoralService.listarJEE(
      "mae_jurado_electoral_especial",
      "c_id_jee",
      this.isNacion,
      this.acronimo
    ).subscribe({
      next: (res) => {
        sessionStorage.setItem('loading', 'false');
        this.listODPEJEE = res.data;
      },
      error: (error) => {
        sessionStorage.setItem('loading', 'false');
        const mensaje = this.utilityService.manejarMensajeError(error);
      }
    });
  }

  buscar() {
    if (!this.search && this.acronimo) {
      return;
    }
    this.clearSearch = true;
    this.cargarJuradoElectorales(0, 100, this.search);
  }

  seleccionarProceso(){
    if (+this.procesoFormControl.value.id > 0) {
      this.proceso = this.procesoFormControl.value;
      this.acronimo = this.procesoFormControl.value.acronimo;
      this.cargarJuradoElectorales(0, 100, '');
      this.listarODPEs();
    }
  }
}
