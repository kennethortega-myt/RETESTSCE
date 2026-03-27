import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, of, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { MatDialog } from '@angular/material/dialog';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { generarPdf } from 'src/app/transversal/utils/funciones';
import { FiltroAutoridadesRevocadas } from 'src/app/model/reportes/filtro-autoridades-revocadas';
import { AutoridadesRevocadasService } from 'src/app/service/reporte/autoridades-revocadas.service';


@Component({
  selector: 'app-autoridades-revocadas',
  templateUrl: './autoridades-revocadas.component.html'
})
export class AutoridadesRevocadasComponent extends AuthComponent implements OnInit {
  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listCentrosComputo: Array<CentroComputoBean>;
  public listOdpe: Array<AmbitoBean>;
  public listAutoridad: any[];
  public usuario: Usuario;
  public isShowReporte: boolean;
  public tituloAlert="Autoridades Revocadas";
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly autoridadesRevocadasService: AutoridadesRevocadasService,
    private readonly formBuilder: FormBuilder,
    private readonly utilityService: UtilityService,
    public dialog: MatDialog,    
  ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listCentrosComputo = [];
    this.listOdpe = [];
    this.listAutoridad = [
      { id: 0, nombre: 'AMBOS'},
      { id: 18, nombre: 'REGIDOR'},
      { id: 19, nombre: 'ALCALDE'}
    ];
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      eleccion: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      odpe: [{ value: '0', disabled: false }],
      autoridad: [{ value: this.listAutoridad[0], disabled: false}],
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
            this.form.get('proceso').value.acronimo,
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
        switchMap(centroComputo =>
            this.monitoreoService.obtenerAmbitoElectoralPorIdCentroComputo(
              centroComputo.id,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('proceso').value.acronimo)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (odpes) => {
          this.listOdpe = odpes.data;
          this.form.get('odpe').setValue(this.listOdpe[0]);
        }
      });
  }

  buscarReporte(): void {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;
    this.autoridadesRevocadasService.getReporteAutoridadesRevocadas(this.filtroAutoridadesRevocadas)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {

          this.generarReporte(response);
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Autoridades Revocadas.", IconPopType.ERROR);
        }
      })
  }

  generarReporte(response: GenericResponseBean<string>){

    sessionStorage.setItem('loading','false');

    if (response.success){
      generarPdf(response.data, this.midivReporte);
    } else {
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  get filtroAutoridadesRevocadas(): FiltroAutoridadesRevocadas {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    const odpe = this.form.get('odpe').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion : this.form.get('eleccion').value == "0" ? null : this.form.get('eleccion').value.id,
      idCentroComputo : cc.id === 0 ? null : cc.id,
      idAmbitoElectoral : odpe.id === 0 ? null : odpe.id,
      idCargo: this.form.get('autoridad').value.id === 0 ? null : this.form.get('autoridad').value.id,
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      centroComputo: `${cc.codigo} - ${cc.nombre}`,
      odpe: `${odpe.codigo} - ${odpe.nombre}`,
    }
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.form.get('proceso').value ){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso.", IconPopType.ALERT);
      return false;
    }
    if(!this.form.get('eleccion').value){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección.", IconPopType.ALERT);
      return false;
    }
    return true;
  }
}
