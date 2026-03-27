import { Component, DestroyRef, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteDetalleAvanceRegistroUbigeo } from 'src/app/model/reportes/filtroReporteDetalleAvanceRegistroUbigeo';
import { FiltroReporteModeloUno } from 'src/app/pages/shared/filtro-reporte-modelo-uno/filtro-reporte-modelo-uno.model';
import { ReporteDetalleAvanceRegistrosUbigeoMiembroDeMesaService } from 'src/app/service/reporte/reporte-detalle-avance-registros-ubigeo-mm.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';

@Component({
  selector: 'app-detalle-avance-registro-ubigeo',
  templateUrl: './detalle-avance-registro-ubigeo.component.html'
})
export class DetalleAvanceRegistroUbigeoComponent {

  protected mensajeDefault: string = 'Por favor, presione la opción CONSULTAR para realizar la búsqueda.';
  protected tituloAlert = "Reporte Detalle de Avance de Registros por Ubigeo Miembro de Mesa";
  protected mensaje: string = this.mensajeDefault;
  protected isShowReporte: boolean;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  constructor(
    private readonly utilityService: UtilityService,
    private readonly renderer: Renderer2,
    private readonly reporteDetalleAvanceRegistrosUbigeoMiembroDeMesaService: ReporteDetalleAvanceRegistrosUbigeoMiembroDeMesaService
  ) { }

  buscarReporte(filtro: FiltroReporteModeloUno): void {
    if (!this.sonValidosLosDatosMinimos(filtro)) return;
    this.mensaje = '';
    let filtros: FiltroReporteDetalleAvanceRegistroUbigeo = this.mapearCampos(filtro);
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');
    this.reporteDetalleAvanceRegistrosUbigeoMiembroDeMesaService.obtenerReporte(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReportePdfCorrecto.bind(this),
        error: this.getReportePdfIncorrecto.bind(this)
      });
  }

  sonValidosLosDatosMinimos(filtro: FiltroReporteModeloUno): boolean {
    if (filtro.proceso == null) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if (filtro.ambitoElectoral == null) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un odpe", IconPopType.ALERT);
      return false;
    }
    if (filtro.eleccion == null) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  mapearCampos(filtro: FiltroReporteModeloUno): FiltroReporteDetalleAvanceRegistroUbigeo {
    let filtros: FiltroReporteDetalleAvanceRegistroUbigeo = new FiltroReporteDetalleAvanceRegistroUbigeo();
    filtros.esquema = filtro.proceso.esquema;
    filtros.idProceso = filtro.proceso.id;
    filtros.proceso = filtro.proceso.nombre;
    filtros.acronimo = filtro.proceso.acronimo;
    filtros.idEleccion = filtro.eleccion.id;
    filtros.idAmbitoElectoral = filtro.ambitoElectoral.id;
    filtros.codigoAmbitoElectoral = filtro.ambitoElectoral.codigo;
    filtros.idCentroComputo = filtro.centroComputo.id;
    filtros.codigoCentroComputo = filtro.centroComputo.codigo;
    filtros.ubigeoNivelUno = filtro.ubigeoNivelUno.codigo ?? "000000";
    filtros.ubigeoNivelDos = filtro.ubigeoNivelDos==undefined?"000000":filtro.ubigeoNivelDos.codigo;
    filtros.ubigeoNivelTres = filtro.ubigeoNivelTres==undefined?"000000":filtro.ubigeoNivelTres.codigo;
    return filtros;
  }
  getReportePdfCorrecto(response: GenericResponseBean<string>) {
    sessionStorage.setItem('loading', 'false');
    if (response.success) {
      this.generarReporte(response)
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      this.mensaje = this.mensajeDefault;
    }
  }

  getReportePdfIncorrecto(error: any) {
    this.isShowReporte = false;
    sessionStorage.setItem('loading', 'false');
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de detalle de avance de registros por ubigeo.", IconPopType.ERROR);
  }

  generarReporte(response: GenericResponseBean<string>) {
    setTimeout(() => {
      this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');

      sessionStorage.setItem('loading', 'false');

      if (response.success) {
        generarPdf(response.data, this.midivReporte);

      } else {
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      }
    }, 300)
  }
}
