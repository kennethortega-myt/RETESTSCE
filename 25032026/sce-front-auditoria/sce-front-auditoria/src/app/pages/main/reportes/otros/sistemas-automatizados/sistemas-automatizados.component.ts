import { Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
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
import { descargarPdf, generarPdf, getUbigeo } from 'src/app/transversal/utils/funciones';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { DetCatalogoEstructuraBean } from 'src/app/model/DetCatalogoEstructuraBean';
import { FiltroSistemasAutomatizados } from 'src/app/model/reportes/sistemas-automatizados';
import { SistemasAutomatizadosService } from 'src/app/service/reporte/sistemas-automatizados.service';

@Component({
  selector: 'app-sistemas-automatizados',
  templateUrl: './sistemas-automatizados.component.html',
})
export class SistemasAutomatizadosComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = '';
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpes: Array<AmbitoBean>;
  public listEstado: Array<DetCatalogoEstructuraBean>;
  public listNivelUbigeoUno: Array<UbigeoDTO>;
  public listNivelUbigeoDos: Array<UbigeoDTO>;
  public listNivelUbigeoTres: Array<UbigeoDTO>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public estadosPermitidos = ['I', 'P', 'C'];
  public readonly form: FormGroup;

  private readonly tituloAlert = "Sistemas Automatizados";
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly utilityService: UtilityService,
    private readonly sistemasAutomatizadosService: SistemasAutomatizadosService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      ambitoElectoral: [{ disabled: false }],
      estado: [{ value: '0', disabled: false }],
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
          this.obtenerEstados();
        }
      });


  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangedEleccion();
    this.valueChangedAmbitoElectoral();
    this.valueChangedCentroComputo();
    this.valueChangedNivelUbigeoUno();
    this.valueChangedNivelUbigeoDos();
  }

  obtenerEstados() {
    this.monitoreoService.obtenerTipoEstadoReporte(this.form.get('proceso').value.nombreEsquemaPrincipal,
            'c_estado_stae',
            this.form.get('proceso').value.acronimo)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          {
            next: (response) => {
              this.listEstado = response.data
                  .filter(estado => this.estadosPermitidos.includes(estado.codigo));
            }
          }
        );
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
          if(this.listEleccion?.length){
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
          return this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
                centroComputo.id,
                this.form.get('proceso').value.nombreEsquemaPrincipal,
                this.form.get('proceso').value.acronimo)
          }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listOdpes = response.data;
          this.form.get('ambitoElectoral').setValue(this.listOdpes[0]);
        }
      });
  }

  valueChangedAmbitoElectoral() {
      this.form.get('ambitoElectoral').valueChanges
        .pipe(
          switchMap(ambitoElectoral => {
            let idEleccion = this.form.get('eleccion').value.id;
            return this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, ambitoElectoral.id,
                this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo);
          }),
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

    this.sistemasAutomatizadosService.getReporteSistemasAutomatizados(this.filtroActas)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response) => {
        this.generarReporte(response);
      },
      error: () => {
        sessionStorage.setItem('loading','false');
        this.isShowReporte = false;
        this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de sistemas automatizados.", IconPopType.ERROR);
      }
    })

  }

  get filtroActas(): FiltroSistemasAutomatizados {
      const cc = this.form.get('centroComputo').value;
      const odpe = this.form.get('ambitoElectoral').value;
      return {
        esquema: this.form.get('proceso').value.nombreEsquemaPrincipal,
        idProceso: this.form.get('proceso').value.id,
        idEleccion: this.form.get('eleccion').value.id,
        idCentroComputo: cc.id ,
        idAmbitoElectoral: odpe.id,
        ubigeo: getUbigeo(this.form),
        estado: this.form.get('estado').value === '0' ? null : this.form.get('estado').value.codigo,
        proceso: this.form.get('proceso').value.nombre,
        usuario: this.usuario.nombre,
        centroComputo: `${cc.codigo} - ${cc.nombre}`,
        odpe:  `${odpe.codigo} - ${odpe.nombre}`,
        acronimo: this.form.get('proceso').value.acronimo,
        eleccion: this.form.get('eleccion').value.nombre,
      }
    }

  generarReporte(response: GenericResponseBean<string>){
    this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');

    sessionStorage.setItem('loading','false');

    if (response.success){
      generarPdf(response.data, this.midivReporte);
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  imprimirReporte() {
    descargarPdf(this.pdfBlob, 'SistemasAutomatizados.pdf');
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

}
