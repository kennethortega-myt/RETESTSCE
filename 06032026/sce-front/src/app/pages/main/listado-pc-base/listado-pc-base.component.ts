import { OnInit, ViewChild, DestroyRef, inject, Directive } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccesoPcResponse } from 'src/app/interface/accesoPcResponse.interface';
import { AccesoPcRequest } from 'src/app/interface/accesoPcRequest.interface';
import { AutorizacionNacionResponseBean } from 'src/app/model/autorizacionNacionResponseBean';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { PageResponse } from 'src/app/interface/pageResponse.interface';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { descargarPdf } from 'src/app/transversal/utils/funciones';
import { Utility } from 'src/app/helper/utility';

@Directive()
export abstract class ListadoPcBaseComponent implements OnInit {

  @ViewChild('MatPaginator') paginator!: MatPaginator;

  destroyRef: DestroyRef = inject(DestroyRef);
  protected utilityService = inject(UtilityService);

  // Método abstracto: cada subclase provee su servicio
  protected abstract get accesoPcService(): any;

  // Propiedades compartidas
  tituloComponente: string = 'Listado de PC';
  displayedColumns: string[] = ['position', 'fecha', 'usuario', 'ip', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'accion'];
  dataSource: AccesoPcResponse[] = [];
  totalElements: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [10, 20, 50, 100];
  isLoading: boolean = false;
  accesoPcSeleccionado: AccesoPcResponse | null = null;

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ========== TODOS LOS MÉTODOS IDÉNTICOS ==========
  cargarDatos(): void {
    this.utilityService.setLoading(true);
    this.accesoPcService.listarPaginado(this.pageIndex, this.pageSize)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.listarPaginadoCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(
            this.tituloComponente,
            "Ocurrió un error al listar accesos PC",
            IconPopType.ERROR
          );
        }
      });
  }

  listarPaginadoCorrecto(response: GenericResponseBean<PageResponse<AccesoPcResponse>>): void {
    this.utilityService.setLoading(false);
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
      return;
    }
    this.dataSource = response.data.content;
    this.totalElements = response.data.totalElements;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.cargarDatos();
  }

  eliminarPc(acceso: AccesoPcResponse): void {
    this.accesoPcSeleccionado = acceso;
    const accesoPcRequest: AccesoPcRequest = {
      idAccesoPc: acceso.id,
      ipAccesoPc: acceso.ipAccesoPc
    };
    this.utilityService.setLoading(true);
    this.accesoPcService.consultaAutorizacion(accesoPcRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.consultaAutorizacionCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(
            this.tituloComponente,
            "Ocurrió un error al consultar autorización",
            IconPopType.ERROR
          );
        }
      });
  }

  consultaAutorizacionCorrecto(response: GenericResponseBean<AutorizacionNacionResponseBean>): void {
    this.utilityService.setLoading(false);
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
      return;
    }
    if (!response.data.autorizado) {
      if (response.data.solicitudGenerada) {
        this.utilityService.mensajePopup(
          this.tituloComponente,
          response.data.mensaje,
          IconPopType.ALERT
        );
        return;
      } else {
        this.utilityService.popupConfirmacionConAccion(
          null,
          'Para eliminar la PC, debe solicitar autorización a Nación,\n¿Desea generar la solicitud ahora?',
          () => this.generarSolicitudAutorizacion()
        );
      }
    } else {
      this.actualizarEstadoConfirmado();
    }
  }

  generarSolicitudAutorizacion(): void {
    this.utilityService.setLoading(true);
    const accesoPcRequest: AccesoPcRequest = {
      idAccesoPc: this.accesoPcSeleccionado.id,
      ipAccesoPc: this.accesoPcSeleccionado.ipAccesoPc
    };
    this.accesoPcService.solicitarAutorizacion(accesoPcRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.solicitarAutorizacionCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(
            this.tituloComponente,
            "Ocurrió un error al solicitar autorización",
            IconPopType.ERROR
          );
        }
      });
  }

  solicitarAutorizacionCorrecto(response: GenericResponseBean<boolean>): void {
    this.utilityService.setLoading(false);
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
      return;
    }
    this.utilityService.mensajePopupCallback(
      this.tituloComponente,
      'Se solicitó autorización a Nación correctamente.',
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.limpiar();
        this.cargarDatos();
      }
    );
  }

  actualizarEstadoConfirmado(): void {
    this.utilityService.setLoading(true);
    const accesoPcRequest: AccesoPcRequest = {
      idAccesoPc: this.accesoPcSeleccionado.id,
      ipAccesoPc: this.accesoPcSeleccionado.ipAccesoPc
    };
    this.accesoPcService.actualizarEstado(accesoPcRequest)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.actualizarEstadoCorrecto.bind(this),
        error: (error) => {
          this.utilityService.setLoading(false);
          this.utilityService.mensajePopup(
            this.tituloComponente,
            "Ocurrió un error al intentar eliminar.",
            IconPopType.ERROR
          );
        }
      });
  }

  actualizarEstadoCorrecto(response: GenericResponseBean<boolean>): void {
    this.utilityService.setLoading(false);
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
      return;
    }
    this.utilityService.mensajePopupCallback(
      this.tituloComponente,
      'Se eliminó la PC correctamente.',
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.limpiar();
        this.cargarDatos();
      }
    );
  }

  limpiar(): void {
    this.accesoPcSeleccionado = null;
  }

  getNumeroFila(index: number): number {
    return (this.pageIndex * this.pageSize) + index + 1;
  }

  imprimirReporte(): void {
    sessionStorage.setItem('loading', 'true');

    this.accesoPcService.getReporteListadoPcs()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading', 'false');
          if (response.success){
            this.generarReporte(response);
          } else {
            this.utilityService.mensajePopup(this.tituloComponente, response.message, IconPopType.ALERT);
          }
        },
        error: () => {
          sessionStorage.setItem('loading', 'false');
          this.utilityService.mensajePopup(
            this.tituloComponente,
            "No fue posible obtener el reporte.",
            IconPopType.ERROR
          );
        }
      });
  }

  private generarReporte(response: GenericResponseBean<string>): void {
    const pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
    descargarPdf(pdfBlob, 'ListadoPcs.pdf');
  }
}
