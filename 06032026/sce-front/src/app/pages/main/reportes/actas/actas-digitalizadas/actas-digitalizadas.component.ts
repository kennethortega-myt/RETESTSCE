import { Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild} from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroActasDigitalizadas } from 'src/app/model/reportes/actas-digitalizadas';
import { ActasDigitalizadasService } from 'src/app/service/reporte/actas-digitalizadas.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import {Constantes} from '../../../../../helper/constantes';
import { Utility } from '../../../../../helper/utility';

@Component({
  selector: 'app-actas-digitalizadas',
  templateUrl: './actas-digitalizadas.component.html',
  styleUrls: ['./actas-digitalizadas.component.scss']
})
export class ActasDigitalizadasComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Actas Digitalizadas";
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;
  public excelBlob: Blob;

  readonly maxDate = new Date();
  minDate: Date = new Date();

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    public dialog: MatDialog,
    private readonly actasDigitalizadasService: ActasDigitalizadasService,
    private readonly renderer: Renderer2,
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listOdpe = [];
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      odpe: [{ value: '0', disabled: false }],
      fechaDesde: [{ value: '', disabled: false }],
      horaDesde: [{ value: '', disabled: false }],
      fechaHasta: [{ value: '', disabled: false }],
      horaHasta: [{ value: '', disabled: false }],
    });

    this.minDate.setFullYear(1900);
    this.minDate.setMonth(1);
    this.minDate.setDate(1);
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
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
      this.form.get('fechaDesde').setValue(new Date());
      this.form.get('horaDesde').setValue('00:00');
      this.form.get('fechaHasta').setValue(new Date());
      this.form.get('horaHasta').setValue('23:59');
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedCentroComputo();
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
          if(this.listEleccion && this.listEleccion.length > 0) {
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
            this.form.get('proceso').value.acronimo
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listCentrosComputo = response.data;
          this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
        }
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        switchMap(centroComputo =>
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (odpes) => {
          this.listOdpe = odpes.data;
          this.form.get('odpe').setValue(this.listOdpe[0]);
        }
      });
  }

  buscarReporte(): void {
      this.isShowReporte = false;
      if(!this.sonValidosLosDatosMinimos()) return;

      this.isShowReporte = true;
      sessionStorage.setItem('loading','true');

      this.actasDigitalizadasService.getReporteActasDigitalizadasPdfNacion(this.filtroActasDigitalizadas, this.form.get('proceso').value.acronimo)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.generarReporte(response);
          },
          error: () => {
            sessionStorage.setItem('loading','false');
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de actas digitalizadas.", IconPopType.ERROR);
          }
        });
    }

    generarReporte(response: GenericResponseBean<string>){

      for (const child of Array.from(this.midivReporte.nativeElement.childNodes)) {
        this.renderer.removeChild(this.midivReporte.nativeElement, child);
      }

      sessionStorage.setItem('loading','false');

      if (response.success){
        generarPdf(response.data, this.midivReporte);
      } else {
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      }
    }

  descargarExcel(){
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.actasDigitalizadasService.getReporteActasDigitalizadasExcelNacion(this.filtroActasDigitalizadas, this.form.get('proceso').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          if (response.success){
            this.excelBlob = Utility.base64toBlob(response.data,'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            const blobUrl = URL.createObjectURL(this.excelBlob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.target = '_blank';
            a.download = 'seguimientoDigitalizacionDeActas.xlsx';
            document.body.appendChild(a);
            a.click();
          }else{
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert,
              this.utilityService.manejarMensajeError(response), IconPopType.ALERT);
          }
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de seguimiento de digitalización.", IconPopType.ERROR);
        }
      });
  }

  get filtroActasDigitalizadas(): FiltroActasDigitalizadas {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    const odpe = this.form.get('odpe').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion : this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id,
      idCentroComputo : cc.id === 0 ? null : cc.id,
      idOdpe : odpe.id === 0 ? null : odpe.id,
      fechaInicial : this.dateTimeInicial,
      fechaFin : this.dateTimeFin,
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      odpe: `${odpe.codigo} - ${odpe.nombre}`,
    }
  }

  get dateTimeInicial() {
    let inicio: Date = this.form.get('fechaDesde').value;
    const timeDesde = this.form.get('horaDesde').value.split(':');

    inicio.setHours(timeDesde[0]);
    inicio.setMinutes(timeDesde[1]);

    return inicio;
  }

  get dateTimeFin(){
    let fin: Date = this.form.get('fechaHasta').value;
    const timeHasta = this.form.get('horaHasta').value.split(':');
    fin.setHours(timeHasta[0]);
    fin.setMinutes(timeHasta[1]);

    return fin;
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }
    if(!this.form.get('eleccion').value){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }

    if(this.dateTimeInicial > this.dateTimeFin){
      this.utilityService.mensajePopup(this.tituloAlert, "La fecha desde no puede ser mayor a la fecha hasta.", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  protected readonly Constantes = Constantes;
}

