import {Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild} from '@angular/core';
import {AuthComponent} from '../../../../../helper/auth-component';
import {ProcesoElectoralResponseBean} from '../../../../../model/procesoElectoralResponseBean';
import {EleccionResponseBean} from '../../../../../model/eleccionResponseBean';
import {CentroComputoBean} from '../../../../../model/centroComputoBean';
import {UbigeoDTO} from '../../../../../model/ubigeoElectoralBean';
import {Usuario} from '../../../../../model/usuario-bean';
import {catchError, filter, of, switchMap, tap} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MonitoreoNacionService} from '../../../../../service/monitoreo-nacion.service';
import {UtilityService} from '../../../../../helper/utilityService';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {IconPopType} from '../../../../../model/enum/iconPopType';
import {FiltroReporteMesasObservaciones} from '../../../../../model/reportes/filtroReporteMesasObservaciones';
import {generarPdf, getUbigeo} from '../../../../../transversal/utils/funciones';
import {GenericResponseBean} from '../../../../../model/genericResponseBean';
import {Utility} from '../../../../../helper/utility';
import {NivelUbigeo} from '../../../../../model/enum/nivel-ubigeo.enum';
import {
  AvanceDigitalizacionHojaAsistenciaService
} from '../../../../../service/reporte/avance-digitalizacion-hoja-asistencia.service';

@Component({
  selector: 'app-avance-digitalizacion',
  templateUrl: './avance-digitalizacion.component.html'
})
export class AvanceDigitalizacionComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = '';
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public mostrarFiltro: boolean = false;
  public readonly form: FormGroup;
  private readonly tituloAlert = "Avance Digitalización de Hojas de Asistencia";
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly avanceDigitalizacionHojaAsistenciaService: AvanceDigitalizacionHojaAsistenciaService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
    });
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
    this.valueChangedCentroComputo();
    this.valueChangedNivelUbigeoUno();
    this.valueChangedNivelUbigeoDos();
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
            this.form.get('proceso').value.acronimo
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listCentrosComputo = response.data;
          if(this.listCentrosComputo && this.listCentrosComputo.length > 0){
            this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
          }
        }
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        switchMap(centroComputo => {
            let idEleccion = this.form.get('eleccion').value.id;
            return this.monitoreoService.obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion,centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listNivelUbigeoUno = response.data;
          this.form.get('nivelUbigeoUno').setValue('0');

        }
      });
  }

  valueChangedNivelUbigeoUno(): void {
    this.form.get('nivelUbigeoUno').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listNivelUbigeoDos = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(nivelUbigeoUno =>
          this.monitoreoService.obtenerProvinciasNacion(nivelUbigeoUno,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('centroComputo').value.id)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: any) => {
          this.listNivelUbigeoDos = response.data;
        }

      });
  }

  valueChangedNivelUbigeoDos() {
    this.form.get('nivelUbigeoDos')!.valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoTres').setValue('0');
        }),
        filter(value => {
          this.listNivelUbigeoTres = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(nivelUbigeoDos =>
          this.monitoreoService.obtenerDistritosNacion(
            nivelUbigeoDos,
            this.form.get('eleccion').value.id,
            this.form.get('proceso').value.acronimo,
            this.form.get('proceso').value.nombreEsquemaPrincipal,
            this.form.get('centroComputo').value.id)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: any) => {
          this.listNivelUbigeoTres = response.data;
        }
      });
  }

  buscarReporte(): void {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    let filtro: FiltroReporteMesasObservaciones = new FiltroReporteMesasObservaciones();
    filtro.esquema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtro.idProceso = this.form.get('proceso').value.id;
    filtro.idEleccion = this.form.get('eleccion').value.id;
    filtro.eleccion = this.form.get('eleccion').value.nombre;
    filtro.idCentroComputo = this.form.get('centroComputo').value.id === 0 ? null : this.form.get('centroComputo').value.id;
    filtro.codigoCentroComputo = this.form.get('centroComputo').value.id === 0 ? null : this.form.get('centroComputo').value.codigo;
    filtro.ubigeo = getUbigeo(this.form);
    filtro.proceso = this.form.get('proceso').value.nombre;
    filtro.usuario = this.usuario.nombre;
    filtro.departamento = this.form.get('nivelUbigeoUno').value === '0' ? 'TODOS'
      : this.listNivelUbigeoUno.find(uno => uno.id === this.form.get('nivelUbigeoUno').value)?.nombre;
    filtro.provincia = this.form.get('nivelUbigeoDos').value === '0' ? 'TODOS'
      : this.listNivelUbigeoDos.find(dos => dos.id === this.form.get('nivelUbigeoDos').value)?.nombre;
    filtro.distrito = this.form.get('nivelUbigeoTres').value === '0' ? 'TODOS'
      : this.listNivelUbigeoTres.find(tres => tres.id === this.form.get('nivelUbigeoTres').value)?.nombre;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.avanceDigitalizacionHojaAsistenciaService.getReporteAvanceDigitalizacionHojaAsistenciaNacion(filtro,
        this.form.get('proceso').value.acronimo
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de avance de digitalización de hojas de asistencia.", IconPopType.ERROR);
        }
      })
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

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.form.get('eleccion').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('centroComputo').value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de Cómputo", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  get labelNivelUbigeoUno(): string {
    const seleccionado = this.form.get('nivelUbigeoUno')?.value;
    if (seleccionado && seleccionado !== '0') {
      return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.UNO);
    }
    return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.UNO);
  }
  
  get labelNivelUbigeoDos(): string {
    const seleccionado = this.form.get('nivelUbigeoUno')?.value;
    if (seleccionado && seleccionado !== '0') {
      return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.DOS);
    }
    return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.DOS);
  }
  
  get labelNivelUbigeoTres(): string {
    const seleccionado = this.form.get('nivelUbigeoUno')?.value;
    if (seleccionado && seleccionado !== '0') {
      return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.TRES);
    }
    return Utility.labelFiltroUbigeo(this.listNivelUbigeoUno, NivelUbigeo.TRES);
  }

}
