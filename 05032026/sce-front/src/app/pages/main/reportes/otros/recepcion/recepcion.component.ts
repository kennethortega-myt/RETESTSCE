import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { RecepcionService } from 'src/app/service/reporte/recepcion.service';
import { FiltroRecepcion } from 'src/app/model/reportes/recepcion';


@Component({
  selector: 'app-recepcion',
  templateUrl: './recepcion.component.html',
  styleUrl: './recepcion.component.scss'
})
export class RecepcionComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Reporte de Recepción";
  private destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;
  readonly maxDate = new Date();
  minDate: Date = new Date();
  public mostrarFiltroEleccion = false;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private renderer: Renderer2,
    private recepcionService: RecepcionService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      fechaDesde: [{ value: null, disabled: false }],
      fechaHasta: [{ value: null, disabled: false }],
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

  buscarReporte(): void {
      this.isShowReporte = false;
      if(!this.sonValidosLosDatosMinimos()) return;

      this.isShowReporte = true;
      sessionStorage.setItem('loading','true');

      this.recepcionService.getReporteRecepcionPdf(this.filtroRecepcion)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.generarReporte(response);
          },
          error: () => {
            sessionStorage.setItem('loading','false');
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Recepción.", IconPopType.ERROR);
          }
        });
    }

  generarReporte(response: GenericResponseBean<string>){

    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');

    sessionStorage.setItem('loading','false');

    if (response.success){
      generarPdf(response.data, this.midivReporte);
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  get filtroRecepcion(): FiltroRecepcion {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;

    let fechaInicial: Date = this.form.get('fechaDesde').value;
    let fechaFin: Date = this.form.get('fechaHasta').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      acronimo: proceso.acronimo,
      idProceso: proceso.id,
      idEleccion : this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id,
      proceso: proceso.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      codigoCentroComputo: cc.codigo === this.listCentrosComputo[0].codigo ? null : cc.codigo, //Si es NACION mandamos null
      fechaInicial: fechaInicial,
      fechaFin: fechaFin
    }
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

    const fechaInicial: Date = this.form.get('fechaDesde').value;
    const fechaFin: Date = this.form.get('fechaHasta').value;

    if(!fechaInicial) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una fecha inicial.", IconPopType.ALERT);
      return false;
    }

    if(!fechaFin) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una fecha fin.", IconPopType.ALERT);
      return false;
    }

    if(fechaInicial > fechaFin) {
      this.utilityService.mensajePopup(this.tituloAlert, "La fecha fin tiene que ser mayor o igual a la fecha inicial.", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  ngOnDestroy() {
  }

}


