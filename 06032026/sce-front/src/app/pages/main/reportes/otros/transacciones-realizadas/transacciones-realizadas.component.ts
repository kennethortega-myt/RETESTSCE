import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, Subject, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Utility } from 'src/app/helper/utility';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroTransaccionesRealizadas } from 'src/app/model/reportes/transaccionesRealizadas';
import { Usuario } from 'src/app/model/usuario-bean';
import { UsuarioReporteTransaccionesBean } from 'src/app/model/usuarioReporteTransaccionesBean';
import { GlobalService } from 'src/app/service/global.service';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ReporteTransaccionesRealizadasService } from 'src/app/service/reporte/reporte-transacciones-realizadas.service';
import { descargarPdf, generarPdf } from 'src/app/transversal/utils/funciones';

@Component({
  selector: 'app-transacciones-realizadas',
  templateUrl: './transacciones-realizadas.component.html',
})
export class TransaccionesRealizadasComponent extends AuthComponent implements OnInit, OnDestroy{
  selectedDate: Date | null = null;
  selectedTime: string | null = null; // Hora en formato 'HH:mm'

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = '';
  public usuario: Usuario;
  public tituloAlert="Reporte transacciones realizadas";
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listUsuarios: Array<UsuarioReporteTransaccionesBean>;
  public isShowReporte: boolean;
  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;
  readonly maxDate = new Date();
  minDate: Date = new Date();

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly reporteTransaccionesService: ReporteTransaccionesRealizadasService,
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2,
    private readonly globalService: GlobalService
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      usuario: [{ value: '0', disabled: false }],
      fechaDesde: null,
      horaDesde: null,
      fechaHasta: null,
      horaHasta: null,
      soloConAutorizacion: false
    });

    this.minDate.setFullYear(1900);
    this.minDate.setMonth(1);
    this.minDate.setDate(1);
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();
    this.form.get('fechaDesde').setValue(new Date());
    this.form.get('fechaHasta').setValue(new Date());
  }

  inicializarPeticiones() {
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.listProceso = response.data;
          this.form.get('proceso').setValue(this.listProceso[0]);

          this.reporteTransaccionesService.listarUsuarios({acronimo: this.form.get('proceso').value.acronimo, esquema:this.form.get('proceso').value.nombreEsquemaPrincipal})
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response) =>{
              this.listUsuarios = response.data;
            }
          });
        }
      });


  }

  get filtroTransacciones(): FiltroTransaccionesRealizadas {
    const proceso = this.form.get('proceso').value;

    return {
      usuario: this.form.get('usuario').value.id,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      codigoCentroComputo: this.form.get('centroComputo').value.codigo,
      nombreCentroComputo: this.form.get('centroComputo').value.nombre,
      fechaDesde: this.form.get('fechaDesde').value,
      horaDesde: this.form.get('horaDesde').value,
      fechaHasta: this.form.get('fechaHasta').value,
      horaHasta: this.form.get('horaHasta').value,
      soloConAutorizacion: this.form.get('soloConAutorizacion').value,
      proceso: this.form.get('proceso').value.nombre,
      esquema: this.form.get('proceso').value.nombreEsquemaPrincipal,
      acronimo:this.form.get('proceso').value.acronimo
    }
  }

  consultar(): void {
    this.isShowReporte = false;

    // Validación: fechaHasta debe ser mayor o igual que fechaDesde
    const fechaDesde = this.form.get('fechaDesde').value;
    const fechaHasta = this.form.get('fechaHasta').value;
    if (fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)) {
      this.utilityService.mensajePopup(this.tituloAlert, "La fecha 'Hasta' debe ser mayor o igual que la fecha 'Desde'.", IconPopType.ALERT);
      return;
    }

    if(!this.sonValidosLosDatosMinimos()) return;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;
    this.reporteTransaccionesService.getReporteTransaccionesRealizadas(this.filtroTransacciones)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Transacciones realizadas.", IconPopType.ERROR);
        }
      }
    );
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
    descargarPdf(this.pdfBlob, 'ReporteTransacciones.pdf');
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

    return true;
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
          if(this.listEleccion && this.listEleccion.length){
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
          if(this.globalService.isNacionUser) {
            this.listCentrosComputo = response.data.filter(cc => cc.id === 0);
          } else {
            this.listCentrosComputo = response.data;
          }


          this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
