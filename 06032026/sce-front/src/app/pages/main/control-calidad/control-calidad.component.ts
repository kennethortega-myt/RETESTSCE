import { Component, DestroyRef, inject, OnDestroy, OnInit} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { GeneralService } from 'src/app/service/general-service.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, Subject, switchMap, tap } from 'rxjs';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { UtilityService } from 'src/app/helper/utilityService';
import { ControlCalidadSumaryResponse } from 'src/app/model/control-calidad/ControlCalidadSumaryResponse';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { ControlCalidadService } from 'src/app/service/control-calidad.service';
import { ControlCalidadPaso } from 'src/app/model/enum/control-calidad.enum';
import { ResolucionActa } from 'src/app/model/control-calidad/ResolucionActa';
import { PopupRechazarCcComponent } from './popup-rechazar-cc/popup-rechazar-cc.component';
import { DataPopupRechazarCC, DatosActaRechazar } from 'src/app/model/control-calidad/DataPopupRechazar';
import { DatosActaAceptar } from 'src/app/model/control-calidad/DataPaso3';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import { Constantes } from 'src/app/helper/constantes';

@Component({
  selector: 'app-control-calidad',
  templateUrl: './control-calidad.component.html',
  styleUrl: './control-calidad.component.scss'
})
export class ControlCalidadComponent implements OnInit, OnDestroy{

  public form: FormGroup;
  listProceso: ProcesoElectoralResponseBean[];
  listEleccion: EleccionResponseBean[];

  readonly dialog = inject(MatDialog);
  readonly tituloMenu = 'Control de Calidad';

  pasosControlCalidad = ControlCalidadPaso;
  pasoActual = ControlCalidadPaso.paso0;

  actaPendienteSeleccionada: ActaPendienteControlCalidad;
  listaResoluciones: ResolucionActa[] = [];
  revisoPaso2: boolean = false;
  revisoPaso3: boolean = false;
  revisoActa: boolean = false;
  uniqueSetIdsResolRevisados = new Set();
  hayErrorCargaImagenes: boolean = false;

  destroy$: Subject<boolean> = new Subject<boolean>();
  destroyRef: DestroyRef = inject(DestroyRef);

  summary: ControlCalidadSumaryResponse = {
    pendiente: 0,
    validado: 0
  };
  listaActasPendientes: ActaPendienteControlCalidad[];

  constructor(
    private formBuilder: FormBuilder,
    private readonly generalService: GeneralService,
    private readonly controlCalidadService: ControlCalidadService,
    private readonly utilityService: UtilityService,
    private readonly messageControlCalidadService: MessageControlCalidadService,
  ){
    this.form = this.formBuilder.group({
      proceso: [null, [Validators.required] ],
      eleccion: [null, [Validators.required] ],
    });
  }

  ngOnInit(): void {
    this.inicializarPeticiones();
    this.suscribeRevisionPasos();
  }

  inicializarPeticiones() {
    this.cargarProcesos();
    this.eventChanged();
    this.suscribeHayErrorCargaImagenes();
  }

  cargarProcesos() {
    sessionStorage.setItem('loading', 'true');
    const mensajeError = 'Ocurrió un error al cargar la lista de procesos.';
      this.generalService.obtenerProcesos()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success && response.data && response.data?.length > 0){
              this.listProceso= response.data;
              this.procesoControl.setValue(this.listProceso[0]);
            }else{
              this.utilityService.mensajePopup(this.tituloMenu, mensajeError, IconPopType.ALERT);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu, mensajeError, IconPopType.ERROR);
          }
        });
  }

  eventChanged(): void {
    this.valueChangedProceso();
    this.valueChangeEleccion();
  }

  valueChangedProceso(): void {
    const errorElecciones = 'No fue posible obtener las elecciones para el proceso seleccionado.';
      this.procesoControl.valueChanges
        .pipe(
          tap( () => {
            sessionStorage.setItem('loading', 'true');
            this.limpiarControlCalidad();
          }),
          switchMap(proceso => {
              return this.generalService.obtenerElecciones(proceso.id)
                      .pipe( catchError( () => of(null) ))
            }
          ),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (elecciones) => {
            sessionStorage.setItem('loading', 'false');
            if(!elecciones){
              this.utilityService.mensajePopup(this.tituloMenu,
                errorElecciones,
                IconPopType.ERROR);
              this.listEleccion = [];
              return;
            }
            this.listEleccion = elecciones.data;
            if(this.listEleccion && this.listEleccion.length > 0) {
              this.eleccionControl.setValue(this.listEleccion[0]);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
                errorElecciones,
                IconPopType.ERROR);
          }
        })
  }

  valueChangeEleccion() {
    this.eleccionControl.valueChanges
      .subscribe(
        {
          next: () => {
            this.limpiarControlCalidad();
            sessionStorage.setItem('loading', 'false');
          }
        }
      );
  }

  verificarActas() {
    this.limpiarControlCalidad();
    this.utilityService.setLoading(true);    
    if(this.sonValidosLosDatos()){
      const codigoEleccion = this.eleccionControl.value.ccodigo;
      
      this.controlCalidadService.obtenerActasPendientes(codigoEleccion)      
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {            
            this.utilityService.setLoading(false);  
            if(response && response.length > 0) {              
              this.listaActasPendientes = response;
              this.pasoActual = this.pasosControlCalidad.paso0;
              this.cargarResumen();  
            } else {
              this.utilityService.mensajePopup(this.tituloMenu, 
              'No existen actas para realizar el control de calidad, vuelva a intentarlo dentro de un momento.', 
              IconPopType.ALERT);
            }
            
          },
          error: () => {
            this.utilityService.setLoading(false);
            this.utilityService.mensajePopup(this.tituloMenu,
              'No se pudo cargar las actas pendientes de control de calidad',
              IconPopType.ERROR);
          }
        }
      );

    }
  }

  cargarResumen() {
    const codigoEleccion = this.eleccionControl.value.ccodigo;
    this.controlCalidadService.obtenerResumen(codigoEleccion)
      .subscribe(
        {
          next: (response) => {
            this.summary = response;
          },
          error: () => {            
            this.utilityService.mensajePopup(this.tituloMenu,
              'No se pudo cargar el resumen de control de calidad',
              IconPopType.ERROR);
          }
        }
      );
  }

  sonValidosLosDatos():boolean{
    if(!this.procesoControl.valid){
      this.utilityService.mensajePopup(this.tituloMenu, 'Seleccione el proceso', IconPopType.ALERT);
      return false;
    }
    if(!this.eleccionControl.valid){
      this.utilityService.mensajePopup(this.tituloMenu, 'Seleccione la elección', IconPopType.ALERT);
      return false;
    }
    return true;
  } 
  
  seleccionarActa(actaSeleccionada: ActaPendienteControlCalidad) {      
    this.actaPendienteSeleccionada = actaSeleccionada;
    sessionStorage.setItem('loading', 'true');    
    this.controlCalidadService.consultaAutorizacion(this.actaPendienteSeleccionada.idActa, Constantes.CONTROL_CALIDAD_TIPO_DOCUMENTO_ACTA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if (response.success) {
              if (response.data.autorizado) {
                this.observarActa(this.actaPendienteSeleccionada.idActa);                
              } else {
                if (response.data.solicitudGenerada) {
                  this.utilityService.mensajePopup(this.tituloMenu,
                      "Existe una solicitud pendiente que fue enviada a Nación para aprobar el ingreso al módulo, espere por favor.",
                      IconPopType.ALERT);
                } else {
                  this.validarAutorizacionRechazar(this.actaPendienteSeleccionada.idActa);                    
                }
              }
            }
          },
          error: (error) => {
            sessionStorage.setItem('loading', 'false');
            if (error.error && error.error.message) {
              this.utilityService.mensajePopup(this.tituloMenu,error.error.message, IconPopType.ALERT);
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,"Error interno al llamar al servicio de autorizaciones de Nación.", IconPopType.ERROR);
            };
        }
        }
      );
  }

  iniciarControlCalidad() {
    this.limpiarActa();
      setTimeout(
        () => {
          if(this.actaPendienteSeleccionada) {
            this.pasoActual = this.pasosControlCalidad.paso1;            
          }
        }, 10
      );
  }  

  aceptarControlCalidadDialog() {
    if(this.validarRevision()){
      this.utilityService.popupConfirmacionConAccion(
        null,
        `¿Desea aceptar el control de calidad del acta ${this.numeroActaCompleto} ?`,
        ()=> this.aceptarControlCalidad()
      );
    }
  }

  aceptarControlCalidad() {
    sessionStorage.setItem('loading', 'true');

    const dataAceptar: DatosActaAceptar = {
      idActa: this.actaPendienteSeleccionada?.idActa,
      idsResoluciones: this.listaResoluciones?.map(resol => resol.idResolucion),
    }

    this.controlCalidadService.aceptar(dataAceptar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success){
              this.aceptarActaCorrectamente();
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,
                response.message,
                IconPopType.ALERT);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
              'Ocurrió un error al aceptar el acta.',
              IconPopType.ERROR);
          }
        }
      );
  }

  aceptarActaCorrectamente() {
    this.utilityService.mensajePopupCallback(this.tituloMenu,
      'Se aceptó el control de calidad correctamente.',
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.verificarActas();
      }
    );
  }

  rechazarDialog() {
    const dataRechazar: DataPopupRechazarCC = {
      acta: this.actaPendienteSeleccionada,
      listaResoluciones: this.listaResoluciones,
    }

    const dialogRef = this.dialog.open(PopupRechazarCcComponent,
      {
        data: dataRechazar,
        width: '550px',
        maxWidth: '80vw'
      });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.solicitarAutorizacionRechazar(result);
      }
    });
  }

  solicitarAutorizacionRechazar(datosRechazar: DatosActaRechazar) {
    this.utilityService.setLoading(true);
        
    forkJoin(
      datosRechazar.idsResoluciones
      .map(id => this.controlCalidadService.solicitarAutorizacion(id, 
        Constantes.CONTROL_CALIDAD_TIPO_DOCUMENTO_RESOLUCION,
        this.actaPendienteSeleccionada.idActa))
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: () => {
          this.utilityService.setLoading(false);            
          this.solicitarAutorizacionRechazarOk();            
        },
          error: () => this.utilityService.setLoading(false)
      }
    );
  }

  solicitarAutorizacionRechazarOk() {
    this.utilityService.mensajePopupCallback(this.tituloMenu,
                'Se solicitó autorización a Nación correctamente.',
                IconPopType.CONFIRM,
                (confirmado: boolean) => {
                  this.limpiarActa();
                  this.actaPendienteSeleccionada = null;                  
                }
              );
  }

  validarAutorizacionRechazar(idActa: number) {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.obtenerResolucionesActa(idActa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            this.listaResoluciones = response;
            if(this.listaResoluciones && this.listaResoluciones.length > 0) {
              this.consultarAutorizacionRechazar();
            } else {              
              this.iniciarControlCalidad();
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
              'No se pudo cargar las resoluciones del acta.',
              IconPopType.ERROR);
          }
        }
      );
  }

  consultarAutorizacionRechazar() {
    this.utilityService.setLoading(true);
    
    forkJoin(
      this.listaResoluciones
      .map( resol => this.controlCalidadService.consultaAutorizacion(resol.idResolucion, Constantes.CONTROL_CALIDAD_TIPO_DOCUMENTO_RESOLUCION))
    )
    .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            this.utilityService.setLoading(false);

            const haySolPendientes = response.some(r => r.data?.solicitudGenerada && !r.data?.autorizado);            

            if(haySolPendientes) {
              this.utilityService.mensajePopup(this.tituloMenu,
                      "Existe solicitudes pendientes que fueron enviadas a Nación para aprobar el rechazo de las resoluciones, espere por favor.",
                      IconPopType.ALERT);
            } else {
              let resolucionesAutorizados: number[] = [];

              response.forEach((r, index) => {
                if(r.data?.autorizado) {
                  resolucionesAutorizados.push(this.listaResoluciones[index].idResolucion);
                }
              });

              if(resolucionesAutorizados.length > 0) {
                const datosRechazar: DatosActaRechazar = {
                  idActa: this.actaPendienteSeleccionada.idActa,
                  idsResoluciones: resolucionesAutorizados
                }
                this.rechazarActa(datosRechazar);
              } else {
                this.iniciarControlCalidad();
              }
            }
          },
          error: (error) => {
            this.utilityService.setLoading(false);
            if (error.error && error.error.message) {
              this.utilityService.mensajePopup(this.tituloMenu,error.error.message, IconPopType.ALERT);
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,"Error interno al llamar al servicio de autorizaciones de Nación.", IconPopType.ERROR);
            };
        }
        }
      );
  }

  rechazarActa(datosRechazar: DatosActaRechazar) {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.rechazar(datosRechazar)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success) {
              this.rechazarActaCorrectamente(datosRechazar);
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,
              'No se pudo rechazar las resoluciones seleccionadas.',
              IconPopType.ALERT);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
              'Ocurrió un error al rechazar las resoluciones.',
              IconPopType.ERROR);
          }
        }
      );
  }

  rechazarActaCorrectamente(datosRechazar: DatosActaRechazar) {
    let mensaje = 'La resolución se rechazó correctamente.';

    if(datosRechazar?.idsResoluciones?.length > 0) {
      mensaje = 'Las resoluciones fueron rechazadas correctamente.';
    }

    this.utilityService.mensajePopupCallback(this.tituloMenu,
      mensaje,
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.verificarActas();
      }
    );
  }

  observarDialog() {
    if(this.validarRevision()){
      this.dialog.open(DialogoConfirmacionComponent, {
          data: 'Para observar el acta debe solicitar autorización Nación,\n¿Desea generar la solicitud ahora?'
        })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.solicitarAutorizacionObservar();
          }
        });
    }
  }

  solicitarAutorizacionObservar() {
    this.utilityService.setLoading(true);
    this.controlCalidadService.solicitarAutorizacion(this.actaPendienteSeleccionada.idActa, 
      Constantes.CONTROL_CALIDAD_TIPO_DOCUMENTO_ACTA, 
      this.actaPendienteSeleccionada.idActa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            this.utilityService.setLoading(false);
            if (response.success) {
              this.solicitarAutorizacionObservarOk();
            }
          },
           error: () => this.utilityService.setLoading(false)
        }
      );
  }

  solicitarAutorizacionObservarOk() {
    this.utilityService.mensajePopupCallback(this.tituloMenu,
                'Se solicitó autorización a Nación correctamente.',
                IconPopType.CONFIRM,
                (confirmado: boolean) => {
                  this.limpiarActa();
                  this.actaPendienteSeleccionada = null;                  
                }
              );
  }

  observarActa(idActa: number) {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.observar(idActa)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success){
              this.observarActaCorrectamente();
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,
                'No se pudo observar el acta.',
                IconPopType.ALERT);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
              'Ocurrió un error al observar el acta.',
              IconPopType.ERROR);
          }
        }
      );
  }

  observarActaCorrectamente() {
    this.utilityService.mensajePopupCallback(this.tituloMenu,
      'El acta se observó correctamente.',
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.verificarActas();
      }
    );
  }

  cancelarDialog() {
    this.utilityService.popupConfirmacionConAccion(
        null,
        `¿Desea finalizar el control de calidad de todas las actas pendientes?`,
        ()=> this.cancelarControlCalidad()
      );
  }

  cancelarControlCalidad() {
    sessionStorage.setItem('loading', 'true');
    this.controlCalidadService.cancelar(this.listaActasPendientes.map(acta => acta.idActa))    
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response.success){
              this.cancelarcontrolCorrectamente();
            } else {
              this.utilityService.mensajePopup(this.tituloMenu,
                response.message,
                IconPopType.ALERT);
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.utilityService.mensajePopup(this.tituloMenu,
              'Ocurrió un error al cancelar el acta.',
              IconPopType.ERROR);
          }
        }
      );
  }

  cancelarcontrolCorrectamente() {
    this.utilityService.mensajePopupCallback(this.tituloMenu,
      'Se canceló el control de calidad correctamente.',
      IconPopType.CONFIRM,
      (confirmado: boolean) => {
        this.limpiarControlCalidad();        
      }
    );
  }

  goToPreviousStep() {
    switch(this.pasoActual) {
      case this.pasosControlCalidad.paso2:
        this.pasoActual = this.pasosControlCalidad.paso1;
        break;
      case this.pasosControlCalidad.paso3:
        this.pasoActual = this.pasosControlCalidad.paso2;
        break;
      default:
        this.pasoActual = this.pasosControlCalidad.paso0;
        break;
    }
  }

  goToNextStep() {
    switch(this.pasoActual) {
      case this.pasosControlCalidad.paso1:
        this.pasoActual = this.pasosControlCalidad.paso2;
        break;
      case this.pasosControlCalidad.paso2:
        this.pasoActual = this.pasosControlCalidad.paso3;
        break;
      default:
        this.pasoActual = this.pasosControlCalidad.paso0;
        break;
    }
  }

  limpiarControlCalidad() {
    this.listaActasPendientes = [];
    this.actaPendienteSeleccionada = null;
    this.listaResoluciones = [];
    this.summary = {
      pendiente: 0,
      validado: 0
    }
    this.limpiarActa();
  }

  limpiarActa() {
    this.messageControlCalidadService.srcImagenesPaso1.next(null);
    this.messageControlCalidadService.srcImagenesPaso2.next(null);
    this.messageControlCalidadService.srcImagenesAgrupolPaso3.next(null);
    this.messageControlCalidadService.srcImagenesPrefPaso3.next(null);
    this.messageControlCalidadService.dataPaso3.next(null);
    this.messageControlCalidadService.hayErrorImagenes.next(false);
    this.pasoActual = this.pasosControlCalidad.paso0;
    this.revisoPaso2 = false;
    this.revisoPaso3 = false;
    this.messageControlCalidadService.revisoPaso2.next(false);
    this.messageControlCalidadService.revisoPaso3.next(false);
    this.messageControlCalidadService.revisoActa.next(false);
    this.messageControlCalidadService.revisoResoluciones.next(null);
    this.uniqueSetIdsResolRevisados = new Set();
    setTimeout( () => this.utilityService.setLoading(false), 300);
  }

  suscribeHayErrorCargaImagenes() {
    this.messageControlCalidadService.hayErrorImagenes
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (hayError) => {
            this.hayErrorCargaImagenes = hayError;
          }
        }
      );
  }

  suscribeRevisionPasos() {
    this.messageControlCalidadService.revisoPaso2
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (reviso) => {
          this.revisoPaso2 = reviso;
        }
      }
    );

    this.messageControlCalidadService.revisoPaso3
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (reviso) => {
          this.revisoPaso3 = reviso;
        }
      }
    );

    this.messageControlCalidadService.revisoActa
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (reviso) => {
          this.revisoActa = reviso;
        }
      }
    );

    this.messageControlCalidadService.revisoResoluciones
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (idResol) => {
          this.uniqueSetIdsResolRevisados.add(idResol);
        }
      }
    );
  }

  validarRevision(): boolean {
    if(!this.revisoPaso2) {
      this.utilityService.mensajePopup(this.tituloMenu,
              'Se debe realizar el control de calidad en el paso 2.',
              IconPopType.ALERT);
      return false;
    }

    if(!this.revisoPaso3) {
      this.utilityService.mensajePopup(this.tituloMenu,
              'Se debe realizar el control de calidad de todos los votos en el paso 3.',
              IconPopType.ALERT);
      return false;
    }

    if(!this.revisoActa) {
      this.utilityService.mensajePopup(this.tituloMenu,
              'Se debe realizar el control de calidad del acta, hacer click en "VER ACTA".',
              IconPopType.ALERT);
      return false;
    }

    if(this.listaResoluciones.length > 0 && this.listaResoluciones.length !== this.uniqueSetIdsResolRevisados.size) {

      const resolFaltantes = this.listaResoluciones
                        .filter(resol => !this.uniqueSetIdsResolRevisados.has(resol.idResolucion));

      this.utilityService.mensajePopup(this.tituloMenu,
              `Se debe realizar el control de calidad de la Resolución ${resolFaltantes[0].nombreResolucion}.\n
              Revisar todos los votos.`,
              IconPopType.ALERT);
      return false;
    }


    return true;
  }

  get eleccionControl(): AbstractControl{
    return this.form.get('eleccion');
  }

  get procesoControl(): AbstractControl {
    return this.form.get('proceso');
  }

  get showButtonPrevious() {
    return this.pasoActual === this.pasosControlCalidad.paso2 || this.pasoActual === this.pasosControlCalidad.paso3;
  }

  get showButtonNext() {
    return this.pasoActual === this.pasosControlCalidad.paso1 || this.pasoActual === this.pasosControlCalidad.paso2;
  }

  get isPaso3() {
    return this.pasoActual == this.pasosControlCalidad.paso3;
  }

  get showSectionResolActa() {
    return this.pasoActual !== this.pasosControlCalidad.paso0 && !!this.actaPendienteSeleccionada;
  }

  get disableButtonRechazar() {
    return this.hayErrorCargaImagenes || !(this.listaResoluciones && this.listaResoluciones.length > 0);
  }

  get numeroActaCompleto(): string {
    return `${this.actaPendienteSeleccionada.mesa} - ${this.actaPendienteSeleccionada.copia}${this.actaPendienteSeleccionada.digitoChequeo}`;
  }

  get hayActasPendientes(): boolean {
    return !!this.listaActasPendientes && this.listaActasPendientes.length > 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
