import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, Subject, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { FiltroProductividadDigitador, UsuarioDigitador } from 'src/app/model/reportes/FiltrosProductividadDigitador';
import { ProductividadDigitadorService } from 'src/app/service/reporte/productividad-digitador.service';

@Component({
  selector: 'app-productividad-digitador',
  templateUrl: './productividad-digitador.component.html',
})
export class ProductividadDigitadorComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = '';
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listUsuarios: UsuarioDigitador [];
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Productividad por Digitador";
  public isNacionUser: boolean;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private productividadDigitadorService: ProductividadDigitadorService,
    private monitoreoService: MonitoreoNacionService,
    private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      usuario: [{ value: '0', disabled: false }],
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
          if(this.listProceso && this.listProceso.length > 0){
            this.form.get('proceso').setValue(this.listProceso[0]);
          }
        }
      });
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
        switchMap(
          cc => this.productividadDigitadorService.getUsuariosDigitador(
            this.form.get('proceso').value.acronimo,
            cc.id
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listUsuarios = response.data;
          this.form.get('usuario').setValue('0');
        }
      })
  }

  buscarReporte(): void {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;
    this.productividadDigitadorService.getReporteProductividadDigitadorPdf(this.filtroProductividad, this.form.get('proceso').value.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {

          this.generarReporte(response);
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Productividad de Digitador.", IconPopType.ERROR);
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

  get filtroProductividad() : FiltroProductividadDigitador {
    const cc = this.form.get('centroComputo').value;
    const proceso = this.form.get('proceso').value;
    const eleccion = this.form.get('eleccion').value;
    return {
      esquema : proceso.nombreEsquemaPrincipal,
      idProceso : proceso.id,
      idEleccion : eleccion.id,
      idCentroComputo : cc.id,
      proceso : proceso.nombre,
      usuario: this.usuario.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      usuarioDigitador: this.form.get('usuario').value?.codigoUsuario,
      eleccion: eleccion.nombre
    }
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }

    if(!this.form.get('centroComputo').value ||
      this.form.get('centroComputo').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un centro de cómputo", IconPopType.ALERT);
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
