import {Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { AvanceOmisos } from 'src/app/model/reportes/avance-omisos';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { MatDialog } from '@angular/material/dialog';
import {FiltroElectoresOmisosBean} from '../../../../../model/filtroElectoresOmisosBean';
import {ReporteMesasSinOmisosService} from '../../../../../service/reporte/reporte-mesas-sin-omisos.service';
import {generarPdf} from '../../../../../transversal/utils/funciones';

@Component({
  selector: 'app-mesas-sin-omisos-miembros-mesa',
  templateUrl: './mesas-sin-omisos-miembros-mesa.component.html',
})

export class MesasSinOmisosMiembrosMesaComponent extends AuthComponent implements OnInit, OnDestroy {
  displayedColumns1: string[] = ['ubigeo', 'departamento', 'provincia', 'distrito', 'TotalMesas' , 'MesasRegistradas','TotalElectores', 'TotalOmisos', 'porAvanceMesas'];
  listaAvanceOmisos: AvanceOmisos[] = [
    { ubigeo: '010301', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'JUNBILLA', totalMesas: 3, mesasRegistradas: 1, totalElectores: 856, totalOmisos: 2, porAvanceMesas: 33.333},
    { ubigeo: '010302', departamento: 'AMAZONAS', provincia: 'BONGARA', distrito:'COROSHA', totalMesas: 3, mesasRegistradas: 0, totalElectores: 3, totalOmisos: 2, porAvanceMesas: 0.000},
  ];

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public pdfBlob: Blob;  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Mesas sin omisos de miembros de mesa";

  private destroy$: Subject<boolean> = new Subject<boolean>();
  private destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private utilityService: UtilityService,    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private renderer: Renderer2,
    private reporteMesasSinOmisosService: ReporteMesasSinOmisosService  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{disabled: false }],
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
        }
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (elecciones) => {
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

  buscarReporte(): void {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    this.isShowReporte = true;
    sessionStorage.setItem('loading','true');    let filtros: FiltroElectoresOmisosBean = this.mapearCampos();

    this.reporteMesasSinOmisosService.obtenerReporteMesasSinOmisosNacion(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de mesas sin omisos de miembros de mesa.", IconPopType.ERROR);
        }
      })
  }

  generarReporte(response: GenericResponseBean<string>) {

    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');

    sessionStorage.setItem('loading', 'false');

    if (response.success) {
      generarPdf(response.data, this.midivReporte);

    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  mapearCampos(): FiltroElectoresOmisosBean {
    let filtros: FiltroElectoresOmisosBean = new FiltroElectoresOmisosBean();
    filtros.esquema = this.form.get('proceso').value.nombreEsquemaPrincipal
    filtros.idProceso = this.form.get('proceso').value.id;
    filtros.proceso = this.form.get('proceso').value.nombre;    filtros.idEleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id;
    filtros.eleccion = this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.nombre;
    filtros.idCentroComputo = this.form.get('centroComputo').value.id;
    filtros.codigoCentroComputo = this.form.get('centroComputo').value.codigo;
    filtros.tipoReporteActorElectoral = 2; // Miembros de mesa
    filtros.tipoReporte = 2;
    filtros.acronimo = this.form.get('proceso').value.acronimo;
    return filtros;
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
