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
import { FiltroOrganizacionesPoliticas } from 'src/app/model/reportes/filtroOrganizacionesPoliticas';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ReporteAutoridadesConsultaService } from 'src/app/service/reporte-autoridades-consulta.service';
import { descargarPdf, generarPdf } from 'src/app/transversal/utils/funciones';
import { Utility } from 'src/app/helper/utility';

@Component({
  selector: 'app-autoridades-consulta-nacion',
  templateUrl: './autoridades-consulta-nacion.component.html',
})
export class AutoridadesConsultaNacionComponent extends AuthComponent implements OnInit, OnDestroy {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public pdfBlob: Blob;
  public mensaje: string = '';
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Autoridades en Consulta";

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,    
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly renderer: Renderer2, 
    private readonly reporteAutoridadesConsultaService: ReporteAutoridadesConsultaService,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
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
          if(this.listCentrosComputo && this.listCentrosComputo.length > 0){
            this.form.get('centroComputo').setValue(this.listCentrosComputo[0]);
          }
        }
      })
  }

  buscarReporte(): void {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    let filtros: FiltroOrganizacionesPoliticas = new FiltroOrganizacionesPoliticas();
    filtros.schema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtros.idProceso = this.form.get('proceso').value.id;
    filtros.idEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
    filtros.centroComputo = this.form.get('centroComputo').value.id === 0 ? null : this.form.get('centroComputo').value.codigo;    //C46002
    filtros.proceso = this.form.get('proceso').value.nombre;
    filtros.usuario = this.usuario.nombre;
    filtros.ccDescripcion = this.form.get('centroComputo').value.codigo + ' - ' + this.form.get('centroComputo').value.nombre;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');

    this.reporteAutoridadesConsultaService.getReporteAutoridadesEnConsultaPdfNacion(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Autoridades en Consulta.", IconPopType.ERROR);
        }
      })
  }

  generarReporte(response: GenericResponseBean<string>){
    this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');
    
    sessionStorage.setItem('loading','false');

    if (response.success){
      generarPdf(response.data, this.midivReporte);
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  imprimirReporte() {
      descargarPdf(this.pdfBlob, 'AutoridadesEnConsulta.pdf');
    }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ||
      this.form.get('proceso').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.form.get('eleccion').value ||
      this.form.get('eleccion').value === '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }

    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
