import {Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AuthComponent} from "../../../../helper/auth-component";
import {ResolucionService} from "../../../../service/resolucion.service";
import {GeneralService} from "../../../../service/general-service.service";
import {MatDialog} from "@angular/material/dialog";
import {EleccionResponseBean} from "../../../../model/eleccionResponseBean";
import {Subject} from "rxjs";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {Constantes} from "../../../../helper/constantes";
import {Utility} from "../../../../helper/utility";
import {MatTableDataSource} from "@angular/material/table";
import {ResolucionAsociadosRequest, ResumenResoluciones} from "../../../../model/resoluciones/resolucion-bean";
import {PopAsociadasComponent} from "../pop-asociadas/pop-asociadas.component";
import {Usuario} from "../../../../model/usuario-bean";
import {PopReporteCargoEntregaComponent} from "../envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {IconPopType} from "../../../../model/enum/iconPopType";
import {DialogoConfirmacionComponent} from "../../dialogo-confirmacion/dialogo-confirmacion.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UtilityService} from "../../../../helper/utilityService";
import {IGenericInterface} from "../../../../interface/general.interface";
import {MatPaginator} from "@angular/material/paginator";
import {GenericResponseBean} from '../../../../model/genericResponseBean';
import {TabResolucionBean} from '../../../../model/resoluciones/tabResolucionBean';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Component({
  selector: 'app-lista-resoluciones',
  templateUrl: './lista-resoluciones.component.html',
  styleUrls: ['./lista-resoluciones.component.scss']
})
export class ListaResolucionesComponent extends AuthComponent implements OnInit, OnDestroy{

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  destroyRef:DestroyRef = inject(DestroyRef);
  procesoFormControlTab2 = new FormControl("0");
  eleccionFormControlTab2 = new FormControl("0");
  listEleccionTab2: Array<EleccionResponseBean>;
  listProcesoTab2: Array<ProcesoElectoralResponseBean>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  totalResolucionesProcesadas = Utility.rellenarCerosAIzquierda(0, 4);
  totalResolucionesAnuladas = Utility.rellenarCerosAIzquierda(0, 4);
  totalResolucionesSinProcesar = Utility.rellenarCerosAIzquierda(0, 4);
  totalResolucionesEnProceso = Utility.rellenarCerosAIzquierda(0, 4);
  totalResoluciones = Utility.rellenarCerosAIzquierda(0, 4);
  resumenResoluciones : ResumenResoluciones;
  dataSourceResoluciones: MatTableDataSource<ResolucionAsociadosRequest> = new  MatTableDataSource<ResolucionAsociadosRequest>([]);
  protected readonly Constantes = Constantes;
  isDisabled:boolean = true;
  displayedColumns_listreso: string[] = ['resolucion', 'tiporesolucion', 'actas', 'estado','usuarioAsociado','fecha', 'acciones'];
  public usuario: Usuario;
  isVisible:boolean =false;
  public numeroResolucion = "";

  public formGroupAcciones: FormGroup;
  public tituloComponenteListaReso = "Lista de Resoluciones JEE/JNE";

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly resolucionService: ResolucionService,
    private readonly generalService : GeneralService,
    private readonly dialog: MatDialog,
    private readonly utilityService: UtilityService,
    private readonly sanitizer: DomSanitizer
  ) {
    super();
    this.formGroupAcciones = this.formBuilder.group({
      nroResolucionFormControl: ['']
    });
  }


  ngOnInit(): void {
    this.usuario = this.authentication();

    this.generalService.obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe(
      (response)=>{
        if(response.success){
          this.listProcesoTab2 = response.data;
        }else{
          this.mensajePopup("problemas al cargar lista de procesos.",IconPopType.ALERT);
        }
      });


  }

  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Lista de Resoluciones JEE/JNE",
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    });
  }


  obtenerEleccionTab2() {
    if (!this.procesoFormControlTab2.value || this.procesoFormControlTab2.value == '0') {
      this.listEleccionTab2 = [];
      this.isVisible=false;
      this.dataSourceResoluciones.data = [];


      this.totalResoluciones=Utility.rellenarCerosAIzquierda(0, 4);
      this.totalResolucionesProcesadas=Utility.rellenarCerosAIzquierda(0, 4);
      this.totalResolucionesAnuladas=Utility.rellenarCerosAIzquierda(0, 4);
      this.totalResolucionesSinProcesar = Utility.rellenarCerosAIzquierda(0, 4);
      this.totalResolucionesEnProceso = Utility.rellenarCerosAIzquierda(0, 4);
      return;
    }
    if (+this.procesoFormControlTab2.value > 0) {
      //se busca las resoluciones sin importar la eleccion seleccionada, suficiente con el proceso
      this.buscarResolucionByNumero();
    }
  }

  onFormSubmit(event: Event): void {
    event.preventDefault(); // Prevenir el envío predeterminado del formulario
    event.stopPropagation(); // Detener la propagación del evento
  }


  listarResumenResoluciones(nroResolucion:string){
    this.utilityService.setLoading(true);
    this.resolucionService.resumenResoluciones(nroResolucion)
      .subscribe({
        next: (res) => {
          this.utilityService.setLoading(false);

          if (res.data.resoluciones.length === 0) {
            this.mensajePopup("No se encontraron resoluciones", IconPopType.ALERT);
          }

          this.isVisible = true;
          this.resumenResoluciones = res.data;
          this.dataSourceResoluciones.data = this.resumenResoluciones.resoluciones;

          setTimeout(() => {
            if (this.paginator) {
              this.dataSourceResoluciones.paginator = this.paginator;
            }
          });

          this.totalResolucionesProcesadas = Utility.rellenarCerosAIzquierda(this.resumenResoluciones.numResolucionesAplicadas, 4);
          this.totalResolucionesAnuladas = Utility.rellenarCerosAIzquierda(this.resumenResoluciones.numResolucionesAnuladas, 4);
          this.totalResolucionesSinProcesar = Utility.rellenarCerosAIzquierda(this.resumenResoluciones.numResolucionesSinAplicar, 4);
          this.totalResolucionesEnProceso = Utility.rellenarCerosAIzquierda(this.resumenResoluciones.numResolucionesSinAplicarAsociadas, 4);
          this.totalResoluciones = Utility.rellenarCerosAIzquierda(this.resumenResoluciones.numTotalResoluciones, 4);
          this.dataSourceResoluciones = new MatTableDataSource(this.resumenResoluciones.resoluciones);
        },
        error: (error) => {
          this.utilityService.setLoading(false);
          let mensaje = this.utilityService.manejarMensajeError(error);
          this.mensajePopup(mensaje, IconPopType.ERROR);
          this.isVisible = false;
        }
      });

  }


  buscarResolucionByNumero(){
    this.listarResumenResoluciones(this.formGroupAcciones.get('nroResolucionFormControl').value);
  }

  generarResolucionPopupCorrecto(res: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');

    if(res.success) {
      const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: res.data,
          success: true,
          nombreArchivoDescarga: this.numeroResolucion+".pdf"
        }
      });

      dialogRef.afterClosed().subscribe(result => {
      });
    }else{
      this.mensajePopup("No se pudo descargar el archivo.",IconPopType.ALERT);
    }
  }

  generarResolucionPopupIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup("Error al descargar el archivo",IconPopType.ALERT);
  }

  descargar(e:any){
    this.numeroResolucion = e.numeroResolucion;
    sessionStorage.setItem('loading','true');
    this.resolucionService
      .generarResolucionPopup( e.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.generarResolucionPopupCorrecto.bind(this),
        error: this.generarResolucionPopupIncorrecto.bind(this)
        }
      );
  }



  expanded: { [key: string]: boolean } = {};

  toggleExpand(id: string) {
    this.expanded[id] = !this.expanded[id];
  }


  getActasAsociadasArray(element: any): string[] {
    return element.actasAsociadas.map((actaBean: any) => {
      if (element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_ACTAS_EXTRAVIADAS ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_ACTAS_SINIESTRADAS ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_MESAS_NO_INSTALADAS) {
        return `${actaBean.mesa}-${actaBean.eleccion}`;
      }

      if (element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_ACTAS_ENVIADAS_A_JEE) {
        return (actaBean.estadoActa === Constantes.ESTADO_ACTA_EXTRAVIADA ||
          actaBean.estadoActa === Constantes.ESTADO_ACTA_SINIESTRADA)
          ? `${actaBean.mesa}-${actaBean.descripcionEstadoActa}-${actaBean.eleccion}`
          : `${actaBean.mesa}-${actaBean.copia}-${actaBean.eleccion}`;
      }

      if (element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_REPROCESADAS_JNE ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_REPROCESADAS_ONPE ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_INFUNDADAS_XUBIGEO ||
        element.tipoResolucion === Constantes.CATALOGO_TIPO_RESOL_ANULACION_ACTAS_X_UBIGEO) {
        return `${actaBean.mesa}-${actaBean.copia}-${actaBean.eleccion}`;
      }

      return '';
    }).filter(item => item !== '');
  }

  getActasAsociadasHtml(element: any, expanded: boolean): SafeHtml {
    const actas = this.getActasAsociadasArray(element);
    const limit = 5; // número de items visibles cuando está colapsado

    const visibles = expanded ? actas : actas.slice(0, limit);
    let html = '<ul>';

    visibles.forEach(item => {
      html += `<li>${item}</li>`;
    });

    if (!expanded && actas.length > limit) {
      html += `<li>...</li>`;
    }

    html += '</ul>';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }



  tituloComponente: string = "Cargo de Entrega de Mesa no Instalada";

  tipoReporte:number;

  descargarCargoEntregaMesasNoInstaladasExtSin(resolucionBean:ResolucionAsociadosRequest){
    if(resolucionBean.actasAsociadas.length == 0){
      this.utilityService.mensajePopup(this.tituloComponente,"No se han agregado actas devueltas",IconPopType.ALERT);
      return;
    }

    let mensajeCargoEntre = "";
    if (resolucionBean.actasAsociadas.length == 1){
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para el acta seleccionada?`;
    }else{
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para las actas seleccionadas?`;
    }

    this.dialog.open(DialogoConfirmacionComponent, {
      data: mensajeCargoEntre
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.tipoReporte = resolucionBean.tipoResolucion;
          sessionStorage.setItem('loading','true');
          resolucionBean.fechaResolucion=null;
          this.resolucionService.generarCargoEntregaMesaNoInstaladaExtSin(resolucionBean)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: this.generarCargoEntregaMesaNoInstaladaCorrecto.bind(this),
              error: this.generarCargoEntregaMesaNoinstaladaIncorrecto.bind(this)
            });
        }
      });
  }


  descargarCargoEntregaInfundadas(resolucionBean:ResolucionAsociadosRequest){
    if(resolucionBean.actasAsociadas.length == 0){
      this.utilityService.mensajePopup(this.tituloComponente,"No se han agregado actas para generar cargo de entrega.",IconPopType.ALERT);
      return;
    }

    let mensajeCargoEntre = "";
    if (resolucionBean.actasAsociadas.length == 1){
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para el acta seleccionada?`;
    }else{
      mensajeCargoEntre = `¿Desea generar el cargo de entrega para las actas seleccionadas?`;
    }

    this.dialog.open(DialogoConfirmacionComponent, {
      data: mensajeCargoEntre
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.tipoReporte = resolucionBean.tipoResolucion;
          sessionStorage.setItem('loading','true');
          resolucionBean.fechaResolucion=null;
          this.resolucionService.generarCargoEntregaInfundada(resolucionBean)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: this.generarCargoEntregaMesaNoInstaladaCorrecto.bind(this),
              error: this.generarCargoEntregaInfundadaIncorrecto.bind(this)
            });
        }
      });
  }

  generarCargoEntregaMesaNoInstaladaCorrecto(response: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');
    let nombreArchivoAdescargar = "Reporte_cargo_entrega.pdf";
    if(this.tipoReporte!=null){
      switch (this.tipoReporte){
        case 6:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_mesas_no_instaladas.pdf";
          break;
        case  1:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_extraviadas.pdf";
          break;
        case   3:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_siniestrada.pdf";
          break;
        case   4:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_actas_anuladas_por_ubigeo.pdf";
          break;
        case   7:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_resoluciones_infundadas.pdf";
          break;
        case   8:
          nombreArchivoAdescargar = "Reporte_cargo_entrega_resoluciones_infundadas_xubigeo.pdf";
          break;
      }
    }

    if(response.success){
      const dialogRef = this.dialog.open(PopReporteCargoEntregaComponent, {
        width: '1200px',
        maxWidth: '80vw',
        data: {
          dataBase64: response.data,
          success: true,
          nombreArchivoDescarga : nombreArchivoAdescargar
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        this.buscarResolucionByNumero();
      });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  generarCargoEntregaMesaNoinstaladaIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponente,e.error.message,IconPopType.ALERT);
  }

  generarCargoEntregaInfundadaIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup('Cargo de Entrega de Resoluciones Infundadas',e.error.message,IconPopType.ALERT);
  }

  openDialogEliminarReso(resolucionBean:ResolucionAsociadosRequest){

    const mensaje = `¿Está seguro de anular la resolución?`;

    this.utilityService.popupConfirmacion(null, mensaje, (confirmado: boolean) => {
      if (confirmado) {
        sessionStorage.setItem('loading','true');
        this.resolucionService.anularResolucion(resolucionBean.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.anularResolucionCorrecto.bind(this),
            error: this.anularResolucionIncorrecto.bind(this)
          });
      }
    });
  }

  anularResolucionCorrecto(response: GenericResponseBean<TabResolucionBean>){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponenteListaReso,response.message, IconPopType.CONFIRM);
    this.obtenerEleccionTab2();
  }

  anularResolucionIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloComponenteListaReso,this.utilityService.manejarMensajeError(error), IconPopType.ALERT);
  }

nuevaResolucion: boolean = false;
  openDialogAsociadas(resolucionBean:ResolucionAsociadosRequest, idResolucionParaDesbloquear?: number) {

    if (!this.procesoFormControlTab2.value || this.procesoFormControlTab2.value == '0') {
      this.mensajePopup("Seleccione un proceso de la lista desplegable",IconPopType.ALERT);
      return;
    }
    this.nuevaResolucion = resolucionBean.tipoResolucion === null;

    const dialogRef = this.dialog.open(PopAsociadasComponent, {
      width: '1200px',
      maxWidth: '80vw',
      disableClose: true,
      data: {
        resolucionBean:resolucionBean,
        idProceso : Number(this.procesoFormControlTab2.value),
        nuevaResolucion: this.nuevaResolucion
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Desbloquear SIEMPRE cuando se cierra el modal, independientemente de cómo se cierre
      if (idResolucionParaDesbloquear) {
        this.desbloquearResolucionSilencioso(idResolucionParaDesbloquear);
      }

      if (typeof result !== 'undefined'  && result != 'cancelar' ){
        this.mensajePopup(result,IconPopType.CONFIRM);
        this.buscarResolucionByNumero();
      }else if (typeof result !== 'undefined'  && result == 'cancelar' ){
        this.buscarResolucionByNumero();
      }
    });
  }



  transmitirResolucionCorrecto(res){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(res.message,IconPopType.CONFIRM);
  }

  transmitirResolucionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(e.error.message,IconPopType.ALERT);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  // Método para bloquear resolución antes de ejecutar acciones
  private bloquearResolucion(idResolucion: number, callback: () => void): void {
    sessionStorage.setItem('loading', 'true');
    this.resolucionService.bloquearResolucion(idResolucion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          sessionStorage.setItem('loading', 'false');
          if (response.success && response.data) {
            // Si el bloqueo fue exitoso, ejecutar la acción
            callback();
          } else {
            this.buscarResolucionByNumero();
            this.mensajePopup(response.message , IconPopType.ALERT);
          }
        },
        error: (error) => {
          sessionStorage.setItem('loading', 'false');
          const mensaje = this.utilityService.manejarMensajeError(error);
          this.mensajePopup(mensaje, IconPopType.ALERT);
          this.buscarResolucionByNumero();
        }
      });
  }

  // Método para desbloquear resolución sin mostrar mensajes (solo logs)
  private desbloquearResolucionSilencioso(idResolucion: number): void {
    this.resolucionService.desbloquearResolucion(idResolucion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Resolución desbloqueada correctamente:', idResolucion);
          } else {
            console.warn('No se pudo desbloquear la resolución:', response.message);
          }
        },
        error: (error) => {
          console.error('Error al desbloquear resolución:', error);
        }
      });
  }

  // Métodos wrapper para cada acción con bloqueo
  openDialogAsociadasConBloqueo(resolucionBean: ResolucionAsociadosRequest): void {
    this.bloquearResolucion(resolucionBean.id, () => this.openDialogAsociadas(resolucionBean, resolucionBean.id));
  }

  openDialogEliminarResoConBloqueo(resolucionBean: ResolucionAsociadosRequest): void {
    this.bloquearResolucion(resolucionBean.id, () => this.openDialogEliminarReso(resolucionBean));
  }

  descargarCargoEntregaMesasNoInstaladasExtSinConBloqueo(resolucionBean: ResolucionAsociadosRequest): void {
    this.bloquearResolucion(resolucionBean.id, () => this.descargarCargoEntregaMesasNoInstaladasExtSin(resolucionBean));
  }

  descargarCargoEntregaInfundadasConBloqueo(resolucionBean: ResolucionAsociadosRequest): void {
    this.bloquearResolucion(resolucionBean.id, () => this.descargarCargoEntregaInfundadas(resolucionBean));
  }

}
