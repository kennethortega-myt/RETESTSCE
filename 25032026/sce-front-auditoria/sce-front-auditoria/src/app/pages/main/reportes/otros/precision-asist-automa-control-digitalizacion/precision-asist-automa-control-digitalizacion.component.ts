import {Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AuthComponent} from '../../../../../helper/auth-component';
import {ProcesoElectoralResponseBean} from '../../../../../model/procesoElectoralResponseBean';
import {EleccionResponseBean} from '../../../../../model/eleccionResponseBean';
import {CentroComputoBean} from '../../../../../model/centroComputoBean';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MonitoreoNacionService} from '../../../../../service/monitoreo-nacion.service';
import {Usuario} from '../../../../../model/usuario-bean';
import {catchError, of, Subject, switchMap} from 'rxjs';
import {IconPopType} from '../../../../../model/enum/iconPopType';
import {UtilityService} from '../../../../../helper/utilityService';
import {
  PrecisionAsistAutomaControlDigitalizacionService
} from '../../../../../service/reporte/precision-asist-automa-control-digitalizacion.service';
import {
  FiltroPrecisionAsistAutomaControlDigitalizacion
} from '../../../../../model/reportes/filtro-precision-asist-automa-control-digitalizacion';
import {GenericResponseBean} from '../../../../../model/genericResponseBean';
import {generarPdf} from '../../../../../transversal/utils/funciones';

@Component({
  selector: 'app-precision-asist-automa-control-digitalizacion',
  templateUrl: './precision-asist-automa-control-digitalizacion.component.html'
})
export class PrecisionAsistAutomaControlDigitalizacionComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listTipoReporte: any[];
  public usuario: Usuario;
  public tituloAlert="Precisión Asistente Automatizado";
  public isShowReporte: boolean;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private utilityService: UtilityService,
    private precisionAsistAutomaControlDigitalizacionService: PrecisionAsistAutomaControlDigitalizacionService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listTipoReporte = [
      {id: 1, nombre: 'En Porcentajes'},
      {id: 2, nombre: 'En Cifras'},
    ];

    this.form = this.formBuilder.group({
      proceso: [{value:'0', disabled:false}],
      eleccion: [{value:'0', disabled:false}],
      centroComputo: [{value:'0', disabled:false}],
      tipoReporte: [{value:'0', disabled:false}]
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();

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
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    let filtros: FiltroPrecisionAsistAutomaControlDigitalizacion = new FiltroPrecisionAsistAutomaControlDigitalizacion;
    filtros.idProceso = proceso.id;
    filtros.idEleccion = this.form.get('eleccion').value.id;
    filtros.idCentroComputo = cc.id === 0 ? null : cc.id;
    filtros.tipoReporte = this.form.get('tipoReporte').value.id;
    filtros.proceso = proceso.nombre;
    filtros.centroComputo = this.form.get('centroComputo').value.nombre;
    filtros.centroComputoCod = this.form.get('centroComputo').value.codigo;
    filtros.eleccion = this.form.get('eleccion').value.nombre;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.precisionAsistAutomaControlDigitalizacionService.getPrecisionAsistAutomaControlDigitalizacionPDF(filtros, proceso.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de precisión del asistente automatizado en el control de digitalización.", IconPopType.ERROR);
        }
      });

  }

  sonValidosLosDatosMinimos() :boolean {
    if (!this.form.get('proceso').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }

    if (!this.form.get('eleccion').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }

    if (!this.form.get('centroComputo').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo.", IconPopType.ALERT);
      return false;
    }
    return true;
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
