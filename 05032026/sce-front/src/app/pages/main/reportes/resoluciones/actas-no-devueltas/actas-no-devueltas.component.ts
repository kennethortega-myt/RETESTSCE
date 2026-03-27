import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, combineLatest, filter, of, Subject, switchMap, tap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { generarPdf, getUbigeo } from 'src/app/transversal/utils/funciones';
import { ActasNoDevueltasService } from 'src/app/service/reporte/actas-no-devueltas.service';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-actas-no-devueltas',
  templateUrl: './actas-no-devueltas.component.html'
})
export class ActasNoDevueltasComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public listTipoReporte: any[];
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Actas no devueltas";

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2,
    private readonly actasNoDevueltasService: ActasNoDevueltasService,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      odpe: [{ disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      tipoReporte: [{ value: '0', disabled: false }],
    });

    this.listTipoReporte = [
      {id: 1, nombre: 'Todas las actas'},
      {id: 2, nombre: 'Por acta'},
    ];

  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
    this.form.get('tipoReporte').setValue(this.listTipoReporte[0]);
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
          return combineLatest([this.monitoreoService.obtenerUbigeoNivelUnoPorEleccionYCentroComputo(
            idEleccion,centroComputo.id, this.form.get('proceso').value.nombreEsquemaPrincipal , this.form.get('proceso').value.acronimo),
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
              centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo) ])
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ([ubigeo, odpes]) => {
          this.listNivelUbigeoUno = ubigeo.data;
          this.listOdpe = odpes.data;
          this.form.get('odpe').setValue(this.listOdpe[0]);

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

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;
    this.actasNoDevueltasService.getReporteActasNoDevueltasNacion(this.filtroActas, this.form.get('proceso').value.acronimo)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Actas no devueltas.", IconPopType.ERROR);
        }
      }
    );
  }

  generarReporte(response: GenericResponseBean<string>){

    sessionStorage.setItem('loading','false');
    for (const child of Array.from(this.midivReporte.nativeElement.childNodes)) {
      this.renderer.removeChild(this.midivReporte.nativeElement, child);
    }

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

  get filtroActas() {
    const ubigeo = getUbigeo(this.form);
    const cc = this.form.get('centroComputo').value;
    const odpe = this.form.get('odpe').value;
    return {
      esquema: this.form.get('proceso').value.nombreEsquemaPrincipal,
      idProceso: this.form.get('proceso').value.id,
      idEleccion: this.form.get('eleccion').value.id,
      idCentroComputo: cc.id === 0 ? null : cc.id,
      ubigeo: ubigeo === '000000' ? null : ubigeo,
      tipoImpresion: this.form.get('tipoReporte').value.id,
      proceso: this.form.get('proceso').value.nombre,
      usuario: this.usuario.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      odpe:  `${odpe.codigo} - ${odpe.nombre}`,
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
