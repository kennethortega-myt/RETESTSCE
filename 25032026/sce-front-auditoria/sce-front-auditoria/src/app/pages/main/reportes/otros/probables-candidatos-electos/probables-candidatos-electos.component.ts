import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { catchError, filter, of, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Constantes } from 'src/app/helper/constantes';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { DistritoElectoralResponseBean } from 'src/app/model/distritoElectoralResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { AgrupacionPolitica } from 'src/app/model/reportes/agrupacion-politica';
import { FiltroProbablesCandidatos } from 'src/app/model/reportes/filtro-probables-candidatos';
import { ProbableCandidatoElecto } from 'src/app/model/reportes/probables-candidatos-electos';
import { Usuario } from 'src/app/model/usuario-bean';
import { ModalGenericoReporteComponent } from 'src/app/pages/shared/modal-generico-reporte/modal-generico-reporte.component';
import { CifraRepartidoraService } from 'src/app/service/cifraRepartidoraService';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ProbablesCandidatosService } from 'src/app/service/probables-candidatos.service';

@Component({
  selector: 'app-probables-candidatos-electos',
  templateUrl: './probables-candidatos-electos.component.html',
  styleUrl: './probables-candidatos-electos.component.scss'
})
export class ProbablesCandidatosElectosComponent extends AuthComponent implements OnInit {

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;
  public listOdpe: Array<AmbitoBean>;
  public listDistritosElectorales: Array<DistritoElectoralResponseBean>;  
  public listAgrupol: Array<AgrupacionPolitica>;
  public listaProbablesCandidatos: ProbableCandidatoElecto[] = [];
  public isShowReporte: boolean;
  public usuario: Usuario;
  public tituloAlert = 'Posibles candidatos electos';
  public form: FormGroup;
  private destroyRef: DestroyRef = inject(DestroyRef);
  displayedColumns1: string[] = ['distritoElecDesc', 'agrupolDesc',	'nombreElecto', 'numeroDni', 'votosAgrupol',
	                                'ordenCandidato',	'ordenObtenido', 'estadoCandidato',	'cargoCandidato'];

  constructor(
      private monitoreoService: MonitoreoNacionService,
      private readonly cifraRepartidoraService: CifraRepartidoraService,
      private readonly probablesCandidatosService: ProbablesCandidatosService,
      private formBuilder: FormBuilder,
      private utilityService: UtilityService,
      public dialog: MatDialog,
    ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listDistritosElectorales = [];
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      distritoElectoral: [{ value: '0', disabled: false }],
      cargo: [{ value: '0', disabled: false }],
      agrupol: [{ value: '0', disabled: false }],
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
    this.valueChangedDistritoElectoral();
  }

  valueChangedProceso(): void {
    this.form.get('proceso').valueChanges
      .pipe(
        switchMap(proceso => {
            return this.monitoreoService.obtenerEleccionesPreferencialesNacion(proceso.id, proceso.acronimo)
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
          eleccion => this.cifraRepartidoraService
            .obtenerListdistritoElectoral(this.proceso.acronimo,
                        eleccion.codigo === Constantes.COD_ELEC_SENADO_MULTIPLE ? Constantes.COD_ELEC_DIPUTADOS :  eleccion.codigo)            
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listDistritosElectorales = response.data;
          if(this.listDistritosElectorales && this.listDistritosElectorales.length > 0) {
            this.form.get('distritoElectoral').setValue(this.listDistritosElectorales[0]);
          }
        }
      })
  }

  valueChangedDistritoElectoral(): void {
    this.form.get('distritoElectoral').valueChanges
      .pipe(
        switchMap(
          de => this.probablesCandidatosService.obtenerAgrupolPorDE(this.proceso.acronimo,
                      this.form.get('eleccion').value.id,
                      de.codigo)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listAgrupol = response.data;
        }
      })
  }



  consultarProbablesCandidatos() {
        this.probablesCandidatosService.obtenerProbablesCandidatosElectos(this.proceso.acronimo, this.filtroProbablesCandidatos)
          .pipe(
            filter(value => {
              this.listaProbablesCandidatos = [];
              return true;
            }),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe({
            next: response => {
              if (response.success) {
                this.listaProbablesCandidatos = response.data;
                this.isShowReporte = true;
              }
            }
          });
  }

  imprimirReporte() {
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.probablesCandidatosService.obtenerProbablesCandidatosElectosPDF(this.proceso.acronimo, this.filtroProbablesCandidatos)
      .pipe(
        filter(value => {
          return true;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.descargarPdf(response);
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de probables candidatos electos.", IconPopType.ERROR);
        }
      })
  }

  descargarPdf(response: GenericResponseBean<string>) {
      if (response.success) {
        setTimeout(() => {
          this.dialog.open(ModalGenericoReporteComponent, {
            width: '1200px',
            maxWidth: '80vw',
            data: {
              pdfBlob: response.data,
              nombreArchivoDescarga: 'Probables-candidatos-electos.pdf',
              success: true
            }
          });

        }, 300);

      } else {
        this.isShowReporte = false;
        sessionStorage.setItem('loading', 'false');
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
      }
    }

  get filtroProbablesCandidatos(): FiltroProbablesCandidatos {

    return {
      esquema: this.proceso.nombreEsquemaPrincipal,
      distritoElectoral: this.form.get('distritoElectoral').value.codigo,
      idEleccion: this.form.get('eleccion').value.id,
      agrupacionPolitica: this.form.get('agrupol').value.codigoAgrupol,
      cargo: null,
      proceso: this.proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre
    }
  }


  get proceso(): ProcesoElectoralResponseBean{
    return this.form.get('proceso').value;
  }

}
