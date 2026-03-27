import { Component, OnDestroy, OnInit, ViewChild, ElementRef, inject, DestroyRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { catchError, Subject, switchMap, of, combineLatest, tap, filter } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { CentroComputoBean } from 'src/app/model/comunes/centroComputoBean';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { UtilityService } from 'src/app/helper/utilityService';
import { ComparacionDigitacionAsistAutomaService } from 'src/app/service/reporte/comparacion-digitacion-asist-automa.service';
import { Usuario } from 'src/app/model/usuario-bean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroComparacionDigitacionAsistAutoma } from 'src/app/model/reportes/filtro-comparacion-digitacion-asist-automa-';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-comparacion-digitacion-asist-automa',
  templateUrl: './comparacion-digitacion-asist-automa.component.html'
})
export class ComparacionDigitacionAsistAutomaComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpes: Array<AmbitoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public usuario: Usuario;
  public tituloAlert="Comparación de Digitación del Asistente Automatizado.";
  public isShowReporte: boolean;

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly comparacionDigitacionAsistAutomaService: ComparacionDigitacionAsistAutomaService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2
  ){
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.form = this.formBuilder.group({
      proceso: [{value:'0', disabled:false}],
      eleccion: [{value:'0', disabled:false}],
      ambitoElectoral: [{ value: '-1', disabled: false }],
      centroComputo: [{value:'0', disabled:false}],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      mesa: [{ value: null, disabled: false }]
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
    this.valueChangedAmbitoElectoral();
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
          if(this.listEleccion?.length > 0){
            this.form.get('eleccion')?.setValue(this.listEleccion[0]);
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
            this.form.get('centroComputo')?.setValue(this.listCentrosComputo[0]);
          }
        }
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        tap(() => {
          this.form.get('ambitoElectoral').setValue('-1', { emitEvent: false });
          this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
          this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
        }),
        filter(value => {
          this.listOdpes = [];
          this.listNivelUbigeoUno = [];
          this.listNivelUbigeoDos = [];
          this.listNivelUbigeoTres = [];
          if (value == 0) {
            return false;
          } else {
            return true;
          }
        }),
        switchMap(centroComputo => {
            //let idEleccion = this.form.get('eleccion').value.id;
            return combineLatest([
              this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
                centroComputo.id, 
                this.form.get('proceso').value.nombreEsquemaPrincipal,
                this.form.get('proceso').value.acronimo)
            ])
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([ambitoElectoral]) => {
          this.obtenerAmbitoElectoralCorrecto(ambitoElectoral);
        }
      });
  }

  valueChangedAmbitoElectoral() {
      this.form.get('ambitoElectoral').valueChanges
        .pipe(
          tap(() => {
            this.form.get('nivelUbigeoUno').setValue('0', { emitEvent: false });
            this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
            this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
          }),
          filter(value => {
              this.listNivelUbigeoUno = [];
              this.listNivelUbigeoDos = [];
              this.listNivelUbigeoTres = [];
              if (value == 0) {
                return false;
              } else {
                return true;
              }
            }
          ),
          switchMap(ambitoElectoral => {
            let idEleccion = this.form.get('eleccion').value.id;
            return combineLatest([
              this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id,
                this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo)
            ])
          }),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: ([nivelUbigeoUno]) => {
            this.obtenerUbigeoNivelUnoCorrecto(nivelUbigeoUno);
          }
        });
    }
  
    valueChangedNivelUbigeoUno(): void {
      this.form.get('nivelUbigeoUno').valueChanges
        .pipe(
          tap(() => {
            this.form.get('nivelUbigeoDos').setValue('0', { emitEvent: false });
            this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
          }),
          filter(value => {
            this.listNivelUbigeoDos = [];
            this.listNivelUbigeoTres = [];
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
              this.form.get('centroComputo').value.id
            )
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: this.obtenerUbigeoNivelDosCorrecto.bind(this),
        });
    }
  
    valueChangedNivelUbigeoDos() {
      this.form.get('nivelUbigeoDos')?.valueChanges
        .pipe(
          tap(() => {
            this.form.get('nivelUbigeoTres').setValue('0', { emitEvent: false });
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
          next: this.obtenerUbigeoNivelTresCorrecto.bind(this)
        });
    }

    obtenerAmbitoElectoralCorrecto(response) {
    if (response.success) {
      this.listOdpes = response.data;
      let primerElemento = this.listOdpes[0];
      this.form.get('ambitoElectoral').setValue(primerElemento);
    }
  }

  obtenerUbigeoNivelUnoCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response.success) {
      this.listNivelUbigeoUno = response.data;      
    }
  }

  obtenerUbigeoNivelDosCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoDos = response.data;      
    }
  }

  obtenerUbigeoNivelTresCorrecto(response: GenericResponseBean<Array<UbigeoDTO>>) {
    if (response) {
      this.listNivelUbigeoTres = response.data;      
    }
  }

  buscarReporte() {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    const depa = this.form.get('nivelUbigeoUno')?.value;
    const prov = this.form.get('nivelUbigeoDos')?.value;
    const dist = this.form.get('nivelUbigeoTres')?.value;
    let filtros: FiltroComparacionDigitacionAsistAutoma = new FiltroComparacionDigitacionAsistAutoma;
    filtros.idProceso = proceso.id;
    filtros.idEleccion = this.form.get('eleccion').value.id;
    filtros.idAmbito = this.form.get('ambitoElectoral').value.id === 0 ? null : this.form.get('ambitoElectoral').value.id;
    filtros.idCentroComputo = cc.id === 0 ? null : cc.id;
    filtros.proceso = proceso.nombre;
    filtros.eleccion = this.form.get('eleccion').value.nombre;
    filtros.centroComputo = this.form.get('centroComputo').value.nombre;
    filtros.centroComputoCod = this.form.get('centroComputo').value.codigo;
    filtros.ubigeo = [dist, prov, depa].find(v => v && v !== "0") || "000000";
    filtros.mesa = this.form.get('mesa').value;
    filtros.departamento = depa == "0" ? "000000" : depa;
    filtros.provincia = prov == "0" ? "000000" : prov;
    filtros.distrito = dist == "0" ? "000000" : dist;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.comparacionDigitacionAsistAutomaService.getComparacionDigitacionAsistAutomaPDF(filtros, proceso.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de "+this.tituloAlert+".", IconPopType.ERROR);
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
    this.midivReporte.nativeElement.childNodes.forEach(
      child => this.renderer.removeChild(this.midivReporte.nativeElement, child)
    );

    sessionStorage.setItem('loading','false');

    if (response.success){
      generarPdf(response.data, this.midivReporte);
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  get labelNivelUbigeoUno(): string {
      return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.UNO);
    }
  
    get labelNivelUbigeoDos(): string {
      return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.DOS);
    }
  
    get labelNivelUbigeoTres(): string {
      return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.TRES);
    }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
