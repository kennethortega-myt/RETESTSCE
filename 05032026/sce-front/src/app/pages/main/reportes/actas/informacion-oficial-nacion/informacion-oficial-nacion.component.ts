import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { filter, Subject, takeUntil } from 'rxjs';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { FiltroReporteInformacionOficial } from 'src/app/model/reportes/filtroReporteInformacionOficial';
import { ReporteInformacionOficialBean } from 'src/app/model/reportes/reporteInformacionOficialBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { FiltroReporteModeloUno } from 'src/app/pages/shared/filtro-reporte-modelo-uno/filtro-reporte-modelo-uno.model';
import { ReporteInformacionOficialService } from 'src/app/service/reporte/reporte-informacion-oficial.service';
import {
  PopReportePuestaCeroComponent
} from '../../../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';

const ELEMENT_DATA1 = [
  { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'JUNBILLA', ElectoresHabiles: '3', Ciudadanos: '1', ausentismo: '856', porParticipacion: '66.667 %', porAusentismo: '33.333 %' },
  { ubigeo: '010302', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'COROSHA', ElectoresHabiles: '3', Ciudadanos: '0', ausentismo: '3', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010303', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'CUIPES', ElectoresHabiles: '2', Ciudadanos: '1', ausentismo: '2', porParticipacion: '66.667 %', porAusentismo: '33.333 %' },
  { ubigeo: '010304', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'CHISQUILLA', ElectoresHabiles: '2', Ciudadanos: '0', ausentismo: '2', porParticipacion: '266.667 %', porAusentismo: '33.333 %' },
  { ubigeo: '010305', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'CHURUJA', ElectoresHabiles: '2', Ciudadanos: '1', ausentismo: '2', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010306', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'FLORIDA', ElectoresHabiles: '15', Ciudadanos: '0', ausentismo: '15', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010307', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'RECTA', ElectoresHabiles: '2', Ciudadanos: '0', ausentismo: '2', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010308', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'SAN CARLOS', ElectoresHabiles: '2', Ciudadanos: '0', ausentismo: '2', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010309', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'SHIPASBAMBA', ElectoresHabiles: '5', Ciudadanos: '0', ausentismo: '2', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
  { ubigeo: '010310', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'JAZAN', ElectoresHabiles: '16', Ciudadanos: '1', ausentismo: '5,856', porParticipacion: '66.667 %', porAusentismo: '33.333 %' },
  { ubigeo: '010311', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'LAMUD', ElectoresHabiles: '20', Ciudadanos: '1', ausentismo: '1,648', porParticipacion: '66.667 %', porAusentismo: '16.667 %' },
  { ubigeo: '010312', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito: 'CAMPORREDONDO', ElectoresHabiles: '6', Ciudadanos: '0', ausentismo: '847', porParticipacion: '66.667 %', porAusentismo: '0.000 %' },
];

@Component({
  selector: 'app-informacion-oficial-nacion',
  templateUrl: './informacion-oficial-nacion.component.html',
  styleUrls: ['./informacion-oficial-nacion.component.scss']
})
export class InformacionOficialNacionComponent {
  protected isShowReporte: boolean;
  protected usuario: Usuario;
  protected filtroReporteModeloUno: FiltroReporteModeloUno;
  protected tituloAlert = "Información Oficial";  protected displayedColumns1: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'ElectoresHabiles', 'Ciudadanos', 'ausentismo', 'porParticipacion', 'porAusentismo'];
  protected dataSource1 = ELEMENT_DATA1;
  protected mensaje: string = 'Por favor, seleccione la opción CONSULTAR para realizar la búsqueda.';
  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  protected filtroCombo: FiltroReporteModeloUno = new FiltroReporteModeloUno();
  protected listConsulta: Array<ReporteInformacionOficialBean> = [];
  protected totalData: any = {};
  constructor(
    private readonly reporteInformacionOficialService: ReporteInformacionOficialService,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog,
  ) {
    this.initializeTotalData();
  }

  initializeTotalData(): void {
    this.totalData = {
      descripcion: 'TOTAL',
      electoresHabiles: 0,
      ciudadanoVotaron: 0,
      ausentismoCifras: 0,
      porcentajeParticipacion: 0,
      porcentajeAusentismo: 0
    };
  }

  consultar(filtro: FiltroReporteModeloUno): void {
    if (!this.sonValidosLosDatosMinimos(filtro)) return;

    let filtros: FiltroReporteInformacionOficial = this.mapearCampos(filtro);
    sessionStorage.setItem('loading', 'true');
    this.reporteInformacionOficialService.consultaInformacionOficialNacion(filtros)
      .subscribe({
        next: response => {
          this.listConsulta = response.data;
          this.calculateTotals();
          this.mensaje = '';
          sessionStorage.setItem('loading', 'false');
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
        }
      });
  }

  mapearCampos(filtro: FiltroReporteModeloUno): FiltroReporteInformacionOficial {
    let filtros: FiltroReporteInformacionOficial = new FiltroReporteInformacionOficial();
    if (filtro.ambitoElectoral != null) {
      filtros.idAmbitoElectoral = filtro.ambitoElectoral.id == 0 ? null :  filtro.ambitoElectoral.id;
      filtros.codigoAmbitoElectoral = filtro.ambitoElectoral.codigo;
      filtros.ambitoElectoral = filtro.ambitoElectoral.nombre;
    }

    if (filtro.eleccion != null) {
      filtros.idEleccion = filtro.eleccion.id == 0 ? null : filtro.eleccion.id;
      filtros.eleccion = filtro.eleccion.nombre;
      filtros.codigoEleccion = filtro.eleccion.id == 0 ? null : filtro.eleccion.codigo;
    }

    if (filtro.centroComputo != null) {
      filtros.idCentroComputo = filtro.centroComputo.id == 0 ? null : filtro.centroComputo.id;
      filtros.centroComputo = filtro.centroComputo.nombre;
      filtros.codigoCentroComputo = filtro.centroComputo.codigo;
    }

    filtros.idProceso = filtro.proceso.id;
    filtros.proceso = filtro.proceso.nombre;
    filtros.esquema = filtro.proceso.esquema;
    filtros.acronimo = filtro.proceso.acronimo;

    if (filtro.ubigeoNivelUno != null) {
      filtros.idUbigeoNivelUno = filtro.ubigeoNivelUno.id;
      filtros.ubigeoNivelUno = filtro.ubigeoNivelUno.toString() == '0' ? 'TODOS' : filtro.ubigeoNivelUno.nombre;
      filtros.codigoUbigeoNivelUno = filtro.ubigeoNivelUno.toString() == '0' ? null : filtro.ubigeoNivelUno.codigo;
    }

    if (filtro.ubigeoNivelDos != null) {
      filtros.idUbigeoNivelDos = filtro.ubigeoNivelDos.id;
      filtros.ubigeoNivelDos = filtro.ubigeoNivelDos.toString() == '0' ? 'TODOS' : filtro.ubigeoNivelDos.nombre;
      filtros.codigoUbigeoNivelDos = filtro.ubigeoNivelDos.toString() == '0' ? null : filtro.ubigeoNivelDos.codigo;
    }

    if (filtro.ubigeoNivelTres != null) {
      filtros.idUbigeoNivelTres = filtro.ubigeoNivelTres.id;
      filtros.ubigeoNivelTres = filtro.ubigeoNivelTres.toString() == '0' ? 'TODOS' : filtro.ubigeoNivelTres.nombre;
      filtros.codigoUbigeoNivelTres = filtro.ubigeoNivelTres.toString() == '0' ? null : filtro.ubigeoNivelTres.codigo;
    }
    this.filtroCombo = filtro;
    return filtros;
  }

  sonValidosLosDatosMinimos(filtro: FiltroReporteModeloUno): boolean {

    if (filtro.eleccion == null) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un elección", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  imprimir(): void {

      if (!this.sonValidosLosDatosMinimos(this.filtroCombo)) return;
      sessionStorage.setItem('loading', 'true');

      this.mensaje = '';
      let filtros: FiltroReporteInformacionOficial = this.mapearCampos(this.filtroCombo);

      this.reporteInformacionOficialService.obtenerReporteInformacionOficialNacion(filtros)
        .pipe(
          filter(value => {
            return true;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: response => {
            this.descargarPdf(response);
          },
          error: err => {
            sessionStorage.setItem('loading', 'false');
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de resultados de información oficial.", IconPopType.ERROR);
          }
        })
    }

    descargarPdf(response: GenericResponseBean<string>) {
        if (response.success) {
         const timestamp = new Date().toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }).replace(/[/]/g, '-').replace(',', '');

          this.dialog.open(PopReportePuestaCeroComponent, {
            width: '1200px',
            maxWidth: '80vw',
            data: {
              dataBase64: response.data,
              nombreArchivoDescarga: `Informacion-Oficial-${timestamp}.pdf`,
              success: true
            }
          });
          sessionStorage.setItem('loading', 'false');

        } else {
          this.isShowReporte = false;
          sessionStorage.setItem('loading', 'false');
          this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
        }
      }

      calculateTotals(): void {
        if (this.listConsulta && this.listConsulta.length > 0) {
          const totals = this.listConsulta.reduce((acc, item) => {
            acc.electoresHabiles += item.electoresHabiles || 0;
            acc.ciudadanoVotaron += item.ciudadanoVotaron || 0;
            acc.ausentismoCifras += item.ausentismoCifras || 0;
            return acc;
          }, {
            electoresHabiles: 0,
            ciudadanoVotaron: 0,
            ausentismoCifras: 0
          });

          // Calculate percentages
          const porcentajeParticipacion = totals.electoresHabiles > 0
            ? (totals.ciudadanoVotaron / totals.electoresHabiles) * 100
            : 0;
          const porcentajeAusentismo = totals.electoresHabiles > 0
            ? (totals.ausentismoCifras / totals.electoresHabiles) * 100
            : 0;          this.totalData = {
            ubigeo: '',
            departamento: '',
            provincia: '',
            distrito: 'TOTAL',
            electoresHabiles: totals.electoresHabiles,
            ciudadanoVotaron: totals.ciudadanoVotaron,
            ausentismoCifras: totals.ausentismoCifras,
            porcentajeParticipacion: porcentajeParticipacion,
            porcentajeAusentismo: porcentajeAusentismo
          };
        }
      }
}
