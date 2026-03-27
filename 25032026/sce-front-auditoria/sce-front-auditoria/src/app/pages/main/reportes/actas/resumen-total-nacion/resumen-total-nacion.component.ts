import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { PopReportePuestaCeroComponent } from '../../../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import { MatDialog } from '@angular/material/dialog';
import { DetalleResumenTotal, FiltroResumenTotal } from 'src/app/model/reportes/resumen-total';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { ResumenTotalService } from 'src/app/service/reporte/resumen-total.service';


@Component({
  selector: 'app-resumen-total-nacion',
  templateUrl: './resumen-total-nacion.component.html',
})
export class ResumenTotalNacionComponent extends AuthComponent implements OnInit {
  displayedColumns1: string[] = ['codigo', 'cc', 'hpc', 'totalmesasinstalar', 'totalmesasinstaladas' , 'totalmesasnoinstaladas','actassiniestradas','actasextraviadas','actasprocesadas', 'actascontabilizadas'];
  displayedColumns1Total: string[] = ['codigo', 'cc', 'hpc', 'totalmesasinstalar', 'totalmesasinstaladas' , 'totalmesasnoinstaladas','actassiniestradas','actasextraviadas','actasprocesadas', 'actascontabilizadas'];
  displayedColumns2: string[] = ['codigo', 'cc', 'digitalizacion','transmision','registro'];

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public listHabilitado: any[];
  public listTipoReporte: any[];
  public usuario: Usuario;
  public isShowReporte: boolean;
  public readonly form: FormGroup;
  public mostrarPorcentaje: boolean = false;
  public resumenTotal: DetalleResumenTotal[];

  private readonly tituloAlert = "Resumen Total";
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog,
    private readonly resumenTotalService: ResumenTotalService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listOdpe = [];
    this.isShowReporte = false;
    this.listHabilitado = [
      {id: '0', nombre: 'TODOS'},
      {id: '1', nombre: 'SI'},
      {id: '2', nombre: 'NO'},
    ];

    this.listTipoReporte = [
      {id: 1, nombre: 'En Porcentajes'},
      {id: 2, nombre: 'En Cifras'},
    ];

    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      // odpe: [{ value: '0', disabled: false }],
      habilitado: [{ value: '0', disabled: false }],
      tipoReporte: [{ value: '0', disabled: false }],
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();

    this.form.get('habilitado').setValue(this.listHabilitado[0]);
    this.form.get('tipoReporte').setValue(this.listTipoReporte[1]);
  }

  inicializarPeticiones() {
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.listProceso = response.data;
          this.form.get('proceso').setValue(this.listProceso[0]);
        }
      });
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        switchMap(proceso => {
            return this.monitoreoService.obtenerEleccionesNacion(proceso.id, proceso.acronimo)
            .pipe(
              catchError(err => {
                return of(null);
              })
            )
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (elecciones) => {
          if(!elecciones){
            this.utilityService.mensajePopup(this.tituloAlert, 'No fue posible obtener las elecciones para el proceso seleccionado.', IconPopType.ERROR);
            this.listEleccion = [];
            return;
          }
          this.listEleccion = elecciones.data;
          if(this.listEleccion && this.listEleccion.length > 0){
            this.form.get('eleccion').setValue(this.listEleccion[0]);
          }
        },
      })
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        switchMap(
          eleccion => this.monitoreoService.obtenerCentroComputoPorIdEleccion(eleccion.id,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('proceso').value.acronimo,
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listCentrosComputo = response.data;
          if(this.listCentrosComputo?.length){
            this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
          }
        }
      })
  }

  buscarReporte() {
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');

    this.resumenTotalService.getResumentTotalCentroComputoNacion(this.filtroResumenTotal, this.form.get('proceso').value?.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          if(response.success){
            this.resumenTotal = response.data;
            this.isShowReporte = true;
            this.mostrarPorcentaje = (this.form.get('tipoReporte').value.id === 1);
          } else {
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
          }

        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la información.", IconPopType.ERROR);
        }
      });

  }

  imprimir() {
    this.isShowReporte = true;
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');

    this.resumenTotalService.getResumentTotalCentroComputoNacionPDF(this.filtroResumenTotal, this.form.get('proceso').value?.acronimo)
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          this.descargarPdf(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de resumen total.", IconPopType.ERROR);
        }
      });
  }

  descargarPdf(response: GenericResponseBean<string>){
    if (response.success){
      this.dialog.open(PopReportePuestaCeroComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: response.data,
          nombreArchivoDescarga: 'Resumen-total-cc.pdf',
          success: true
        }
      });

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
    }
  }

  get filtroResumenTotal(): FiltroResumenTotal {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      codigoEleccion: this.form.get('eleccion').value.codigo,
      idCentroComputo: cc.id === 0 ? null : cc.id,
      habilitado: this.form.get('habilitado').value.id,
      tipoReporte: this.form.get('tipoReporte').value.id,
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      estado: this.form.get('habilitado').value.nombre
    }
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('eleccion').value){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('centroComputo').value){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo.", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  getColor(detalle: DetalleResumenTotal): string {
    if((!detalle.codigoCc || detalle.codigoCc.trim() === '') && detalle.centroComputo.trim() === 'TOTAL') {
      return 'bg_total';
    } else {
      return '';
    }
  }

}
