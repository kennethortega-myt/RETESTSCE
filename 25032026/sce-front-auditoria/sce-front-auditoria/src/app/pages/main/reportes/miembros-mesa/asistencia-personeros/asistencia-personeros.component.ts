import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, Subject, switchMap, tap } from 'rxjs';
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
import { Utility } from 'src/app/helper/utility';
import { FiltroAsistenciaMiembroMesa } from 'src/app/model/reportes/filtro-asistencia-mm';
import { AsistenciaPersonerosService } from 'src/app/service/reporte/asistencia-personeros.service';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-asistencia-personeros',
  templateUrl: './asistencia-personeros.component.html'
})
export class AsistenciaPersonerosComponent extends AuthComponent implements OnInit, OnDestroy{
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
  public tituloAlert="Asistencia de Personeros";
  mostrarFiltro: boolean = false;
  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2,
    private readonly asistenciaPersonerosService: AsistenciaPersonerosService
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
      mesa: [{ value: null, disabled: false }],
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
          this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
        }
      })
  }

  valueChangedCentroComputo(): void {
    this.form.get('centroComputo').valueChanges
      .pipe(
        switchMap(centroComputo => {
          let idEleccion = this.form.get('eleccion').value.id;
          return this.monitoreoService.obtenerUbigeoNivelUnoPorEleccionYCentroComputo(idEleccion, centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo
            )
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (ccs) => {
          this.listNivelUbigeoUno = ccs.data;
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

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.asistenciaPersonerosService.getReporteAsistenciaPersoneros(this.filtroAsistenciaMiembroMesa)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.generarReporte(response);
      },
      error: () => {
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de asistencia de personeros.", IconPopType.ERROR);
      }
    })

  }

  generarReporte(response: GenericResponseBean<string>){
    this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
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

  get filtroAsistenciaMiembroMesa(): FiltroAsistenciaMiembroMesa {
      const proceso = this.form.get('proceso').value;
      const cc = this.form.get('centroComputo').value;
      const mesa = this.form.get('mesa').value;
      return {
        usuario: this.usuario.nombre,
        esquema: proceso.nombreEsquemaPrincipal,
        idProceso: proceso.id,
        idEleccion : this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id,
        idCentroComputo : cc.id === 0 ? null : cc.id,
        mesa: (mesa == null || mesa.trim() === '') ? null : mesa,
        proceso: proceso.nombre,
        eleccion: this.form.get('eleccion').value.nombre,
        ubigeo: getUbigeo(this.form),
        codigoCentroComputo: cc.codigo,
        acronimo: proceso.acronimo
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
