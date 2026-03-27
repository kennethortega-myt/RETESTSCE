import { Component, DestroyRef, ElementRef, inject, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteActasEnviadasJEENacion } from 'src/app/model/reportes/filtroReporteActasEnviadasJEENacion';
import { ReporteActasEnviadasJeeNacionService } from 'src/app/service/reporte/reporte-actas-enviadas-jee-nacion.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { FiltroReporteActasEnviadasJEENacionModel } from './componentes/filtro-reporte-actas-enviadas-jee-nacion/filtro-reporte-actas-enviadas-jee-nacion.model';

@Component({
  selector: 'app-total-actas-enviadas-jee-nacion',
  templateUrl: './total-actas-enviadas-jee.component.html'
})
export class TotalActasEnviadasJeeComponent {
  protected mensajeDefault: string = 'Por favor, presione la opción CONSULTAR para realizar la búsqueda.';
  protected tituloAlert = "Reporte Total de Actas Enviadas al JEE por Centro de Cómputo";
  protected mensaje: string = this.mensajeDefault;
  protected isShowReporte: boolean;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  protected filtroReporteModeloTres: FiltroReporteActasEnviadasJEENacion;

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  constructor(
    private readonly reporteActasEnviadasJeeNacionService: ReporteActasEnviadasJeeNacionService,
    private readonly utilityService: UtilityService,
    private readonly renderer: Renderer2) {
  }

  buscarReporte(filtro: FiltroReporteActasEnviadasJEENacionModel): void {
    if (!this.sonValidosLosDatosMinimos(filtro)) return;

    this.mensaje = '';
    let filtros: FiltroReporteActasEnviadasJEENacion = this.mapearCampos(filtro);
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');
    this.reporteActasEnviadasJeeNacionService.obtenerReporte(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getReportePdfCorrecto.bind(this),
        error: this.getReportePdfIncorrecto.bind(this)
      });
  }

  mapearCampos(filtro: FiltroReporteActasEnviadasJEENacionModel): FiltroReporteActasEnviadasJEENacion {
    let filtros: FiltroReporteActasEnviadasJEENacion = new FiltroReporteActasEnviadasJEENacion();
    filtros.esquema = filtro.proceso.esquema;
    filtros.idProceso = filtro.proceso.id;
    filtros.proceso = filtro.proceso.nombre;
    filtros.idEleccion = filtro.eleccion.id;
    filtros.idAmbitoElectoral = filtro.ambitoElectoral.id;
    filtros.codigoAmbitoElectoral = filtro.ambitoElectoral.codigo;
    filtros.idCentroComputo = filtro.centroComputo.id;
    filtros.codigoCentroComputo = filtro.centroComputo.codigo;
    filtros.tipoConsulta = 1;
    filtros.tipoAgrupado = 2;
    filtros.nombreCentroComputo = filtro.centroComputo.nombre;
    filtros.nombreEleccion = filtro.eleccion.nombre;
    filtros.nombreAmbitoElectoral = filtro.ambitoElectoral.nombre;
    filtros.acronimo = filtro.proceso.acronimo
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
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de total de actas enviadas al JEE.", IconPopType.ERROR);
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

  sonValidosLosDatosMinimos(filtro: FiltroReporteActasEnviadasJEENacionModel): boolean {
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
}
