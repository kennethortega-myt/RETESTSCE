import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {firstValueFrom} from "rxjs";

import {Constantes} from "../../../helper/constantes";
import {ControlDigitalizacionService} from "../../../service/control-digitalizacion.service";
import {DigitizationListMesasBean} from "../../../model/digitizationListMesasBean";
import {ControlListaElectoresService} from "../../../service/control-lista-electores.service";
import {UtilityService} from '../../../helper/utilityService';
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {IconPopType} from '../../../model/enum/iconPopType';
import {IGenericInterface} from '../../../interface/general.interface';

@Component({
  selector: 'app-lista-electores',
  templateUrl: './lista-electores.component.html',
  styleUrls: ['./lista-electores.component.scss']
})
export class ListaElectoresComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @ViewChild('paginatorCompleto', { static: true }) paginatorCompleto!: MatPaginator;
  @ViewChild('paginatorParcial', { static: true }) paginatorParcial!: MatPaginator;

  protected readonly Constantes = Constantes;

  columnas = ['numero','mesa','estado','paginas'];

  dataSourceCompleto = new MatTableDataSource<DigitizationListMesasBean>([]);
  dataSourceParcial = new MatTableDataSource<DigitizationListMesasBean>([]);

  destroyRef:DestroyRef = inject(DestroyRef);
  tituloComponente= "Control de Digitalización de Lista de Electores";

  listaTotalLe: DigitizationListMesasBean[] = [];
  listaLeCompletaYConPerdidaParcial: DigitizationListMesasBean[] = [];
  listaLeDigitalizadasParcialmente: DigitizationListMesasBean[] = [];

  mesaSeleccionada: DigitizationListMesasBean = new DigitizationListMesasBean();
  selectedPDFBlob!: Blob;

  isConsulta = false;
  isMostrarArchivo = false;
  isShowInicio = true;

  totalPages = 0;
  selectedPages = new Set<number>();

  actualizarPaginasRevisadas = (info: { total: number; revisadas: Set<number> }) => {
    this.totalPages = info.total;
    this.selectedPages = info.revisadas;
  }

  constructor(
    private readonly dialog: MatDialog,
    private readonly utilityService: UtilityService,
    private readonly controlListaElectoresService: ControlListaElectoresService,
    private readonly controlDigitalizacionService: ControlDigitalizacionService
  ) {}

  get isLoading() {
    return this.utilityService.isLoading();
  }

  ngOnInit() {
    this.cargarDocumentos();
  }

  ngAfterViewInit() {
    this.dataSourceCompleto.paginator = this.paginatorCompleto;
    this.dataSourceCompleto.sort = this.sort;
    this.dataSourceParcial.paginator = this.paginatorParcial;
  }

  public async cargarDocumentos() {
    this.utilityService.setLoading(true);
    try {
      this.listaTotalLe = await firstValueFrom(this.controlListaElectoresService.listaLE());

      this.listaLeCompletaYConPerdidaParcial = this.listaTotalLe.filter(item =>
        [Constantes.CE_ESTADO_MESA_DIGITALIZADO, Constantes.CE_ESTADO_MESA_DIGTAL_DIGITALIZADA_CON_PERDIDA_PARCIAL].includes(item.estado)
      );

      this.listaLeDigitalizadasParcialmente = this.listaTotalLe.filter(item =>
        item.estado === Constantes.CE_ESTADO_MESA_DIGITALIZADO_PARCIAL
      );

      this.dataSourceCompleto.data = this.listaLeCompletaYConPerdidaParcial;
      this.dataSourceParcial.data = this.listaLeDigitalizadasParcialmente;
      this.isShowInicio = this.listaTotalLe.length === 0;

      if (this.isShowInicio) {
        this.utilityService.mensajePopup(this.tituloComponente,"No existen registros.",IconPopType.ALERT);
        this.limpiarDatos();
      }
    } catch (error) {
      this.utilityService.mensajePopup(this.tituloComponente, this.utilityService.manejarMensajeError(error), IconPopType.ERROR);
      this.limpiarDatos();
    } finally {
      this.utilityService.setLoading(false);
    }
  }


  limpiarDatos() {
    this.listaTotalLe = [];
    this.listaLeCompletaYConPerdidaParcial = [];
    this.listaLeDigitalizadasParcialmente = [];
    this.dataSourceCompleto.data = [];
    this.dataSourceParcial.data = [];
    this.mesaSeleccionada = new DigitizationListMesasBean();
    this.isShowInicio = true;
    this.isMostrarArchivo = false;
  }

  onKeyDown(event: KeyboardEvent, row: DigitizationListMesasBean) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.verMesa(row); // mismo comportamiento que el click
      event.preventDefault(); // evita que la página se desplace con Space
    }
  }

  verMesa(mesa: DigitizationListMesasBean) {
    this.mesaSeleccionada = mesa;
    this.utilityService.setLoading(true);
    this.controlDigitalizacionService.getFile(mesa.filePdfId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.utilityService.setLoading(false);
          this.isMostrarArchivo = true;
          this.selectedPDFBlob = response;
        },
        error: (error) => {
          this.utilityService.setLoading(false);
          this.isMostrarArchivo = false;
          this.utilityService.mensajePopup(this.tituloComponente,this.utilityService.manejarMensajeError(error),IconPopType.ALERT);
        }
      });
  }


  confirAprobarLE() {
    const faltantes = this.obtenerPaginasFaltantes();
    if (faltantes.length) {
      this.utilityService.mensajePopup(this.tituloComponente,`Faltan por revisar páginas: ${faltantes.join(', ')}`,IconPopType.ALERT);
      return;
    }
    this.confirmarAccion(() => this.enviarAccion('aprobarlistaElectores'));
  }

  confirRechazarLE() {
    this.confirmarAccion(() => this.enviarAccion('rechazarlistaElectores'));
  }

  private enviarAccion(metodo: 'aprobarlistaElectores'|'rechazarlistaElectores') {
    if (!this.mesaSeleccionada.mesaId) {
      this.utilityService.mensajePopup(this.tituloComponente,"Debe seleccionar una lista de electores.",IconPopType.ALERT);
      return;
    }

    this.utilityService.setLoading(true);
    this.controlListaElectoresService[metodo](this.mesaSeleccionada.mesaId,'LE')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => this.respuestaCorrecta(resp),
        error: (err) => this.respuestaIncorrecta(err)
      });
  }

  private respuestaCorrecta(response: IGenericInterface<boolean>) {
    this.utilityService.setLoading(false);
    const popMensaje: PopMensajeData = {
      title: this.tituloComponente,
      mensaje: response.message,
      icon: IconPopType.CONFIRM,
      success: true
    };
    this.dialog.open(PopMensajeComponent, { data: popMensaje })
      .afterClosed()
      .subscribe(() => this.siguienteMesaAsync());
  }

  private respuestaIncorrecta(error: any) {
    this.utilityService.setLoading(false);
    this.utilityService.mensajePopup(this.tituloComponente,this.utilityService.manejarMensajeError(error),IconPopType.ERROR);
  }

  private async siguienteMesaAsync() {
    await this.cargarDocumentos();
    if (!this.mesaSeleccionada.mesaId) return;

    let siguiente: DigitizationListMesasBean | undefined;

    if (this.mesaSeleccionada.estado === Constantes.CE_ESTADO_MESA_DIGITALIZADO_PARCIAL) {
      siguiente = this.listaLeDigitalizadasParcialmente[0];
      if (!siguiente) {
        siguiente = this.listaLeCompletaYConPerdidaParcial[0];
      }
    } else if (
      [Constantes.CE_ESTADO_MESA_DIGITALIZADO, Constantes.CE_ESTADO_MESA_DIGTAL_DIGITALIZADA_CON_PERDIDA_PARCIAL]
        .includes(this.mesaSeleccionada.estado)
    ) {
      siguiente = this.listaLeCompletaYConPerdidaParcial[0];
      if (!siguiente) {
        siguiente = this.listaLeDigitalizadasParcialmente[0];
      }
    }
    if (siguiente) {
      this.verMesa(siguiente);
    } else {
      this.limpiarDatos();
    }
  }



  private obtenerPaginasFaltantes(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1)
      .filter(p => !this.selectedPages.has(p));
  }

  private confirmarAccion(callback: () => void) {
    this.dialog.open(DialogoConfirmacionComponent, { data: `¿Está seguro de continuar?` })
      .afterClosed()
      .subscribe((confirmado: boolean) => { if (confirmado) callback(); });
  }


}
