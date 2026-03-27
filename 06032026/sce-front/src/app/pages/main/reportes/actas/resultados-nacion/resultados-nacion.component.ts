import { Component, DestroyRef, inject, OnInit} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { catchError, filter, of, switchMap, tap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroResultados, ResultadosActasContabilizadas, ResultadosActasContabilizadasCPR, ResumenActasContabilizadas } from 'src/app/model/reportes/resultados-actas-contabilizadas';
import { UbigeoDTO } from 'src/app/model/ubigeoElectoralBean';
import { Usuario } from 'src/app/model/usuario-bean';
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ResultadosActasContabilizadasService } from 'src/app/service/reporte/resultados-actas-contabilizadas.service';
import { PopReportePuestaCeroComponent } from '../../../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import { MatDialog } from '@angular/material/dialog';
import { getUbigeo } from 'src/app/transversal/utils/funciones';
import { Constantes } from 'src/app/helper/constantes';
import { Utility } from 'src/app/helper/utility';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

@Component({
  selector: 'app-resultados-nacion',
  templateUrl: './resultados-nacion.component.html',
})

export class ResultadosNacionComponent extends AuthComponent implements OnInit {

  resumenActas: ResumenActasContabilizadas;

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
  public tituloAlert="Resultados";
  public resultadosActasContabilizadas: ResultadosActasContabilizadas;
  public resultadosActasContabilizadasCPR: ResultadosActasContabilizadasCPR;
  public porcentajeAvance: string;

  private destroyRef: DestroyRef = inject(DestroyRef);
  public form: FormGroup;

  public COD_ELEC_REVOCATORIA_ID = Constantes.COD_ELEC_REVOCATORIA_ID;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService,
    private resultadosActasContabilizadasService: ResultadosActasContabilizadasService,
    public dialog: MatDialog,
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
    this.listTipoReporte = [
      {id: 1, nombre: 'RESUMIDO'},
      {id: 2, nombre: 'DETALLADO'},
    ];

    this.form = this.formBuilder.group({
      proceso: [{ disabled: false }],
      eleccion: [{ disabled: false }],
      centroComputo: [{ disabled: false }],
      odpe: [{ disabled: false }],
      tipoReporte: [{ value: 1, disabled: false }],
      nivelUbigeoUno: [{ value: '0', disabled: false }],
      nivelUbigeoDos: [{ value: '0', disabled: false }],
      nivelUbigeoTres: [{ value: '0', disabled: false }],
    });
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.inicializarPeticiones();
    this.eventChanged();

    this.form.get('tipoReporte').setValue(this.listTipoReporte[0]);
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
          if(this.listEleccion && this.listEleccion.length){
            this.form.get('eleccion').setValue(this.listEleccion[0]);
          }
        }
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
          this.isShowReporte = false;
          this.resultadosActasContabilizadas = null;
          this.listCentrosComputo = response.data;
          if(this.listCentrosComputo && this.listCentrosComputo.length){
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
          if(this.listOdpe && this.listOdpe.length){
            this.form.get('odpe').setValue(this.listOdpe[0]);
          }
        }
      });
  }

  valueChangedOdpe(): void {
    this.form.get('odpe').valueChanges
    .pipe(
      switchMap(odpe => {
          const idEleccion = this.form.get('eleccion').value.id;
          if(this.usarDistritoElectoral) {
            return this.monitoreoService.obtenerDistritoElectoralPorAmbito(odpe.id,
                        this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo);
          } else {
            return this.monitoreoService.obtenerUbigeoNivelUnoPorAmbitoElectoral(idEleccion, odpe.id,
                        this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo);
          }
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
        switchMap(nivelUbigeoUno => {
          const idEleccion = this.form.get('eleccion').value.id;
          if(this.usarDistritoElectoral) {
            return this.monitoreoService.obtenerNivelUbigeoDosPorDistritoElec(nivelUbigeoUno, this.form.get('proceso').value.nombreEsquemaPrincipal, this.form.get('proceso').value.acronimo);
          } else {
            return this.monitoreoService.obtenerProvinciasNacion(nivelUbigeoUno,
              this.form.get('eleccion').value.id,
              this.form.get('proceso').value.acronimo,
              this.form.get('proceso').value.nombreEsquemaPrincipal,
              this.form.get('centroComputo').value.id);
          }
        }
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

  buscarReporte() {
    if(!this.sonValidosLosDatosMinimos()) return;

    const tipoReporte: number = this.form.get('tipoReporte').value.id;

    if(this.form.get('eleccion').value.id === this.COD_ELEC_REVOCATORIA_ID) {
      if(tipoReporte === 1) {
        sessionStorage.setItem('loading','true');
        this.resultadosActasContabilizadasService.getResultadosActasContabilizadasCPRNacion(this.filtroResultadosActasCPR)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            sessionStorage.setItem('loading','false');
            if(response.success){
              this.resultadosActasContabilizadasCPR = response.data;
              this.resumenActas = this.resultadosActasContabilizadasCPR.resumenActas;
              this.porcentajeAvance = `AL ${this.resumenActas.porcentajeAvance} %`;
              this.isShowReporte = true;
            } else {
              this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
              this.isShowReporte = false;
            }
            sessionStorage.setItem('loading','false');

          },
          error: () => {
            sessionStorage.setItem('loading','false');
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la información.", IconPopType.ERROR);
          }
        });
      } else {
        this.utilityService.popupConfirmacion(null, 'Ud. ha seleccionado un tipo de consulta que no puede ser mostrado por pantalla, se mostrará PDF.',
          (confirmado: boolean)=>{
            if (confirmado){
              sessionStorage.setItem('loading','true');
              this.resultadosActasContabilizadasService.getResultadosActasContabilizadasNacionPDF(this.filtroResultadosActasCPR)
              .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: (response) => {
                    sessionStorage.setItem('loading','false');
                    this.isShowReporte = false;
                    this.descargarPdf(response);
                  },
                  error: () => {
                    sessionStorage.setItem('loading','false');
                    this.isShowReporte = false;
                    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de resultados de actas contabilizadas.", IconPopType.ERROR);
                  }
                });
            }
          });
      }

    } else {
      if(tipoReporte === 1) {
        sessionStorage.setItem('loading','true');
        this.resultadosActasContabilizadasService.getResultadosActasContabilizadasNacion(this.filtroResultadosActas)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            sessionStorage.setItem('loading','false');
            if(response.success){
              this.resultadosActasContabilizadas = response.data;
              this.resumenActas = this.resultadosActasContabilizadas.resumenActas;
              this.porcentajeAvance = `AL ${this.resumenActas.porcentajeAvance} %`;
              this.isShowReporte = true;
            } else {
              this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
              this.isShowReporte = false;
            }
            sessionStorage.setItem('loading','false');

          },
          error: () => {
            sessionStorage.setItem('loading','false');
            this.isShowReporte = false;
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la información.", IconPopType.ERROR);
          }
        });
      } else {
        this.utilityService.popupConfirmacion(null, 'Ud. ha seleccionado un tipo de consulta que no puede ser mostrado por pantalla, se mostrará PDF.',
          (confirmado: boolean)=>{
            if (confirmado){
              sessionStorage.setItem('loading','true');
              this.resultadosActasContabilizadasService.getResultadosActasContabilizadasNacionPDF(this.filtroResultadosActas)
              .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: (response) => {
                    sessionStorage.setItem('loading','false');
                    this.isShowReporte = false;
                    this.descargarPdf(response);
                  },
                  error: () => {
                    sessionStorage.setItem('loading','false');
                    this.isShowReporte = false;
                    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de resultados de actas contabilizadas.", IconPopType.ERROR);
                  }
                });
            }
          });
      }
    }
  }

  imprimir() {
    this.isShowReporte = true;
    if(!this.sonValidosLosDatosMinimos()) return;
    sessionStorage.setItem('loading','true');

    this.resultadosActasContabilizadasService.getResultadosActasContabilizadasNacionPDF(this.filtroResultadosActas)
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading','false');
          this.descargarPdf(response);
        },
        error: () => {
          sessionStorage.setItem('loading','false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de resultados de actas contabilizadas.", IconPopType.ERROR);
        }
      });
  }

  descargarPdf(response: GenericResponseBean<string>){
    if (response.success){
      this.dialog.open(PopReportePuestaCeroComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: response.data,
          nombreArchivoDescarga: 'Resultado-actas-contabilizadas.pdf',
          success: true
        }
      });

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
    }
  }


  get filtroResultadosActas(): FiltroResultados {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    const odpe = this.form.get('odpe').value;

    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      codigoEleccion: this.form.get('eleccion').value.codigo,
      idCentroComputo: cc?.id,
      idOdpe: odpe?.id,
      tipoReporte: this.form.get('tipoReporte').value.id,
      ubigeo: this.codigoUbigeo,
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      acronimo: proceso.acronimo,
      centroComputo: `${cc?.codigo} ${cc?.nombre}`,
      odpe: `${odpe?.codigo} ${odpe?.nombre}`,
    }
  }

  get filtroResultadosActasCPR(): FiltroResultados {
    const proceso = this.form.get('proceso').value;
    const cc = this.form.get('centroComputo').value;
    const odpe = this.form.get('odpe').value;
    return {
      usuario: this.usuario.nombre,
      esquema: proceso.nombreEsquemaPrincipal,
      idProceso: proceso.id,
      idEleccion: this.form.get('eleccion').value.id,
      codigoEleccion: this.form.get('eleccion').value.codigo,
      idCentroComputo: cc.id === 0 ? null : cc.id,
      idOdpe: odpe.id === 0 ? null : odpe.id,
      tipoReporte: this.form.get('tipoReporte').value.id,
      ubigeo: getUbigeo(this.form),
      proceso: proceso.nombre,
      eleccion: this.form.get('eleccion').value.nombre,
      cc: this.form.get('centroComputo').value.codigo,
      acronimo: proceso.acronimo,
      centroComputo: `${cc?.codigo} ${cc?.nombre}`,
      odpe: `${odpe?.codigo} ${odpe?.nombre}`,
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

    if(!this.form.get('tipoReporte').value ||
      this.form.get('tipoReporte').value === '0'){
        this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un tipo de reporte.", IconPopType.ALERT);
      return false;
    }

    const tipoEleccion = this.form.get('eleccion').value.id;

    if(this.usarDistritoElectoral) {
      if(!this.form.get('nivelUbigeoUno').value ||
        this.form.get('nivelUbigeoUno').value === '0'){
          this.utilityService.mensajePopup(this.tituloAlert, `Seleccione un ${this.nombreNivelUbigeoUno}.`, IconPopType.ALERT);
        return false;
      }
    }

    if(tipoEleccion === Constantes.COD_ELEC_REVOCATORIA_ID) {
      if(!this.form.get('nivelUbigeoUno').value || this.form.get('nivelUbigeoUno').value === '0' ||
        !this.form.get('nivelUbigeoDos').value || this.form.get('nivelUbigeoDos').value === '0' ||
        !this.form.get('nivelUbigeoTres').value || this.form.get('nivelUbigeoTres').value === '0' ){
          this.utilityService.mensajePopup(this.tituloAlert, "Seleccione el ubigeo completo (hasta distrito).", IconPopType.ALERT);
        return false;
      }
    }
    return true;
  }

  get usarDistritoElectoral(): boolean {
    const tipoEleccion = this.form.get('eleccion').value.id;
    return tipoEleccion === Constantes.COD_ELEC_DIPUTADOS_ID || tipoEleccion === Constantes.COD_ELEC_SENADO_MULTIPLE_ID;
  }

  get nombreNivelUbigeoUno(): string {
    if(this.usarDistritoElectoral) {
      return 'Distrito Electoral';
    } else {
      return 'Departamento';
    }
  }

  get codigoUbigeo() :string {
    const departamento: string = this.form.get('nivelUbigeoUno').value == "0" ? null : '' + this.form.get('nivelUbigeoUno').value;
    const provincia: string = this.form.get('nivelUbigeoDos').value == "0" ? null : '' + this.form.get('nivelUbigeoDos').value;
    const distrito: string = this.form.get('nivelUbigeoTres').value == "0" ? null : '' + this.form.get('nivelUbigeoTres').value;
    let ubigeo = '000000';

    if(distrito) {
      ubigeo = distrito.padStart(6, '0');
    } else if(provincia){
      ubigeo = provincia.padStart(6, '0');
    } else if(departamento) {
      if(this.usarDistritoElectoral) {
        ubigeo = this.listNivelUbigeoUno.find(de => `${de.id}` === departamento)?.codigo;
      } else {
        ubigeo = departamento.padStart(6, '0');
      }
    }
    return ubigeo;
  }

  get labelNivelUbigeoUno(): string {
    if(this.usarDistritoElectoral) {
      return 'Distrito Electoral:';
    } else {
      return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.UNO);
    }
  }

  get labelNivelUbigeoDos(): string {
    if(this.isDEextranjero){
      return 'País:';
    }
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.DOS);
  }

  get labelNivelUbigeoTres(): string {
    if(this.isDEextranjero){
      return 'Estado:';
    }
    return Utility.labelFiltroUbigeo(this.form.get('nivelUbigeoUno').value, NivelUbigeo.TRES);
  }

  get isDEextranjero(): boolean {
    const nivelUbigeoUno = this.form.get('nivelUbigeoUno').value;
    if(this.usarDistritoElectoral) {
      const del = this.listNivelUbigeoUno.find(de => de.id === nivelUbigeoUno)?.codigo;
      return !!del && del.toString() === Constantes.DISTRITO_ELECTORAL_EXTRANJEROS;
    }
    return false;
  }

  get subTitle(): string {
    const avance = this.resumenActas?.porcentajeAvance;
    if(avance && avance === 100) {
      return 'Resultado de actas contabilizadas';
    }

    return 'Avance de resultado de actas contabilizadas';
  }

}
