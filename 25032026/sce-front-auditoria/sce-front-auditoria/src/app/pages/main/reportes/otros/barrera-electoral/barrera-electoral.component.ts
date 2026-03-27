import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { catchError, of, switchMap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Constantes } from 'src/app/helper/constantes';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { AgrupacionPolitica } from 'src/app/model/reportes/agrupacion-politica';
import { FiltroBarreraElectoral } from 'src/app/model/reportes/barrera-electoral';
import { Usuario } from 'src/app/model/usuario-bean';
import { BarreraElectoralService } from 'src/app/service/barrera-electoral.service';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ProbablesCandidatosService } from 'src/app/service/probables-candidatos.service';
import { generarPdf } from 'src/app/transversal/utils/funciones';

@Component({
  selector: 'app-barrera-electoral',  
  templateUrl: './barrera-electoral.component.html',
})
export class BarreraElectoralComponent extends AuthComponent implements OnInit {

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;  
  public listOdpe: Array<AmbitoBean>;  
  public listAgrupol: Array<AgrupacionPolitica>;  
  public isShowReporte: boolean;
  public usuario: Usuario;
  public tituloAlert = 'Barrera Electoral';    
  public form: FormGroup;
  private destroyRef: DestroyRef = inject(DestroyRef);
  private codigoDENacion = Constantes.DISTRITO_ELECTORAL_NACION;
  
  constructor(
        private monitoreoService: MonitoreoNacionService,        
        private readonly probablesCandidatosService: ProbablesCandidatosService,
        private readonly barreraElectoralService: BarreraElectoralService,
        private formBuilder: FormBuilder,
        private utilityService: UtilityService,
        public dialog: MatDialog,        
      ) {
    super();
    this.listProceso = [];
    this.listEleccion = [];    
    this.isShowReporte = false;

    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],      
      distritoElectoral: [{ value: '0', disabled: false }],        
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
          this.eleccionesBuild(elecciones.data);
        },
      })
  }

  private eleccionesBuild(elecciones: EleccionResponseBean[]) {
    this.listEleccion = elecciones.filter(e => e.codigo === Constantes.COD_ELEC_PAR || e.codigo === Constantes.COD_ELEC_DIPUTADOS);

    let eleccionSenadores: EleccionResponseBean = new EleccionResponseBean();
    eleccionSenadores.ccodigo = Constantes.COD_ELEC_SENADO_MULTIPLE;
    eleccionSenadores.id = Constantes.COD_ELEC_SENADO_MULTIPLE;
    eleccionSenadores.nombre = 'SENADORES';
    this.listEleccion.push(eleccionSenadores);
    this.form.get('eleccion').setValue(this.listEleccion[0]);
  }

  valueChangedEleccion(): void {
    this.form.get('eleccion').valueChanges
      .pipe(
        switchMap(
          eleccion => this.probablesCandidatosService.obtenerAgrupolPorDE(this.proceso.acronimo, 
                      eleccion.id, 
                      this.codigoDENacion)            
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listAgrupol = response.data;
        }
      })
  }    

  consultarBarreraElectoral() {
    this.isShowReporte = false;
    if(!this.sonValidosLosDatosMinimos()) return;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;
    this.barreraElectoralService.obtenerBarreraElectoralPDF(this.form.get('proceso').value.acronimo, this.barreraFiltro)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {          
          this.generarReporte(response);          
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de Barrera Electoral.", IconPopType.ERROR);
        }
      });
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

  get barreraFiltro() : FiltroBarreraElectoral {
    return {
      esquema: this.proceso.nombreEsquemaPrincipal,
      distritoElectoral: this.codigoDENacion,
      idEleccion: this.form.get('eleccion').value.id,
      agrupacionPolitica: this.form.get('agrupol').value.codigoAgrupol,      
      proceso: this.proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre
    }
  }

  get proceso(): ProcesoElectoralResponseBean{
    return this.form.get('proceso').value;
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
}
