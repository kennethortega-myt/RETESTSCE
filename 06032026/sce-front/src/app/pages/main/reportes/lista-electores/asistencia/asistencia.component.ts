import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, Subject, switchMap, tap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { generarPdf, getUbigeo } from 'src/app/transversal/utils/funciones';
import { FiltroAsistencia } from 'src/app/model/reportes/asistencia';
import { ListaParticipantesService } from 'src/app/service/reporte/lista-participantes.service';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-asistencia',
  templateUrl: './asistencia.component.html'
})
export class AsistenciaComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public listTipoReporte: any[];
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Asistencia";

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;
  mostrarFiltro: boolean = false;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    private readonly renderer: Renderer2,
    private readonly listaParticipantesService: ListaParticipantesService
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listOdpe = [];
    this.listNivelUbigeoUno = [];
    this.listNivelUbigeoDos = [];
    this.listNivelUbigeoTres = [];
    this.isShowReporte = false;


    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      odpe: [{ disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      numeroMesa: [{ value: '', disabled: false }],
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
    this.valueChangedOdpe();
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
          this.isShowReporte = false;
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
          return this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo
            )
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (odpes) => {
          this.listOdpe = odpes.data;
          if(this.listOdpe && this.listOdpe.length > 0){
            this.form.get('odpe').setValue(this.listOdpe[0]);
          }
        }
      });
  }

  valueChangedOdpe(): void {
    this.form.get('odpe').valueChanges
    .pipe(
      switchMap(odpe => {
          let idEleccion = this.form.get('eleccion').value.id;
          return this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, odpe.id,
            this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo)
        }
      ),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (odpes) => {
        this.listNivelUbigeoUno = odpes.data;
        this.form.get('nivelUbigeoUno').setValue('0');
      }
    });
  }

  valueChangedNivelUbigeoUno(): void {
    this.form.get('nivelUbigeoUno').valueChanges
      .pipe(
        tap(() => {
          this.form.get('nivelUbigeoDos').setValue('0');
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
    this.listaParticipantesService.getReporteListaParticipantesNacion(this.filtroAsistencia, this.form.get('proceso').value.acronimo)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Lista de participantes.", IconPopType.ERROR);
        }
      }
    );
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

  get filtroAsistencia(): FiltroAsistencia {
    const proceso = this.form.get('proceso').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      idCentroComputo: this.form.get('centroComputo').value.id,
      ubigeo: getUbigeo(this.form),
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      mesa: this.form.get('numeroMesa').value,
      codigoCentroComputo: this.form.get('centroComputo').value.codigo,
    }
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('eleccion').value ||
      this.form.get('eleccion').value === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('centroComputo').value ||
      this.form.get('centroComputo').value === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo.", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('odpe').value ||
      this.form.get('odpe').value === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una ODPE.", IconPopType.ALERT);
      return false;
    }

    return true;
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
