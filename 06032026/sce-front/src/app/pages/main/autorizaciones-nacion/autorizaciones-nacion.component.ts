import {AuthComponent} from "../../../helper/auth-component";
import {Component, DestroyRef, inject, OnInit, ViewChild} from "@angular/core";
import {Usuario} from "../../../model/usuario-bean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {MatDialog} from "@angular/material/dialog";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import { ProcesoElectoralResponseBean } from "src/app/model/procesoElectoralResponseBean";
import { MonitoreoNacionService } from "src/app/service/monitoreo-nacion.service";
import { FormControl } from "@angular/forms";
import { AutorizacionNacionService } from "src/app/service/autorizacion-nacion.service";
import { AutorizacionNacionBean } from "src/app/model/autorizacionNacionBean";
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Constantes} from '../../../helper/constantes';
import {AutorizacionRequestBean} from '../../../model/autorizacionRequestBean';

@Component({
  selector: 'app-autorizaciones-nacion',
  templateUrl: './autorizaciones-nacion.component.html'
})
export class AutorizacionesNacionComponent extends AuthComponent implements OnInit{

  @ViewChild('paginator') paginator: MatPaginator;

  destroyRef:DestroyRef = inject(DestroyRef);
  private usuario: Usuario;
  displayedColumns: string[] = ['numero','centroComputo','tipoAutorizacion' , 'detalle','fechaHora','estado','descEstado','acciones'];
  dataSource: any;
  tituloComponente: string = "Autorizaciones";
  listProceso: Array<ProcesoElectoralResponseBean>;
  procesoFormControl = new FormControl();
  acronimo: string = null;

  constructor(private readonly autorizacionNacionService: AutorizacionNacionService,
              private readonly utilityService:UtilityService,
              public dialog: MatDialog,
              private readonly monitoreoService: MonitoreoNacionService,
              private readonly sanitizer: DomSanitizer) {
    super();
    this.dataSource = new MatTableDataSource<AutorizacionNacionBean>([]);
    this.listProceso = [];
    this.acronimo = null;
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.inicializarDatos();
  }
  inicializarDatos(){
    this.monitoreoService.obtenerProcesos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response.success) {
        this.listProceso = response.data;
      }
    });
  }

  obtenerEleccion() {
      if (+this.procesoFormControl.value.id > 0) {
        this.acronimo = this.procesoFormControl.value.acronimo;
      }
    }

  listarSolicitudes(){
    if (+this.procesoFormControl.value?.id > 0) {
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,"Seleccione un proceso", IconPopType.ALERT);
      return;
    }

    this.utilityService.setLoading(true);
    this.autorizacionNacionService.listAutorizaciones(this.procesoFormControl.value.id, this.acronimo)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: this.listAutorizacionesCorrecto.bind(this),
      error: this.listAutorizacionesIncorrecto.bind(this)
    });

  }

  resaltarTexto(texto: string): SafeHtml {
    if (!texto) return '';
    const resaltado = texto.replace(/(Puesta a Cero)/gi, '<span style="color:red;font-weight:bold;">$1</span>');
    //omitimos la seguridad, ya que el HTML escrito es seguro.
    return this.sanitizer.bypassSecurityTrustHtml(resaltado);
  }

  listAutorizacionesCorrecto(response: GenericResponseBean<Array<AutorizacionNacionBean>>){
    this.utilityService.setLoading(false);
    if (response.success) {
      this.dataSource = new MatTableDataSource<AutorizacionNacionBean>(response.data);
      this.dataSource.paginator = this.paginator;
    } else {
      this.utilityService.mensajePopup(
        this.tituloComponente,
        response.message,
        IconPopType.ALERT
      );
      this.dataSource = new MatTableDataSource<AutorizacionNacionBean>([]);
      this.dataSource.paginator = this.paginator;      
    }    
  }
  listAutorizacionesIncorrecto(error: any){
    this.utilityService.setLoading(false);
    this.dataSource = new MatTableDataSource<AutorizacionNacionBean>([]);
    this.dataSource.paginator = this.paginator;
    this.utilityService.mensajePopup(this.tituloComponente,"Error al obtener la lista de autorizaciones.", IconPopType.ERROR);
  }

  confirmarAutorizacion(autorizacion: AutorizacionNacionBean): void {
    let filtro:AutorizacionRequestBean = new AutorizacionRequestBean();
    filtro.idAutorizacion = autorizacion.id;
    filtro.descTipoAutorizacion = autorizacion.descTipoAutorizacion;
    filtro.codigoCentroComputo = autorizacion.codigoCentroComputo;
    filtro.nombreCentroComputo = autorizacion.nombreCentroComputo;

    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.aprobarAutorizacion(filtro);
        }
      });
  }

  confirmarCancelarAutorizacion(autorizacion: AutorizacionNacionBean): void {
    let filtro:AutorizacionRequestBean = new AutorizacionRequestBean();
    filtro.idAutorizacion = autorizacion.id;
    filtro.descTipoAutorizacion = autorizacion.descTipoAutorizacion;
    filtro.codigoCentroComputo = autorizacion.codigoCentroComputo;
    filtro.nombreCentroComputo = autorizacion.nombreCentroComputo;
    this.utilityService.popupConfirmacionConAccion(
        null,
        `¿Está seguro de rechazar la autorización?`,
        ()=> this.cancelarAutorizacion(filtro)
      );
  }

  cancelarAutorizacion(autorizacion: AutorizacionRequestBean): void {
    this.autorizacionNacionService.cancelarAutorizacion(this.acronimo, autorizacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.cancelarAutorizacionCorrecto.bind(this),
        error: this.cancelarAutorizacionIncorrecto.bind(this)
      });
  }

  cancelarAutorizacionCorrecto(response: GenericResponseBean<boolean>){
    if (response.success){
      this.utilityService.mensajePopupCallback(this.tituloComponente, "Autorización rechazada correctamente.", IconPopType.CONFIRM,
          (confirmado: boolean) => {
            this.listarSolicitudes();
          });      
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message, IconPopType.ALERT);
    }
  }

  cancelarAutorizacionIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"Error al rechazar la autorización.", IconPopType.ERROR);
  }

  aprobarAutorizacion(aprobarAutorizacionRequestBean: AutorizacionRequestBean){
    this.autorizacionNacionService.aprobarAutorizacion(this.acronimo, aprobarAutorizacionRequestBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.aprobarAutorizacionCorrecto.bind(this),
        error: this.aprobarAutorizacionIncorrecto.bind(this)
      });
  }

  aprobarAutorizacionCorrecto(response: GenericResponseBean<boolean>){
    if (response.success){
      let popMensaje :PopMensajeData= {
        title:this.tituloComponente,
        mensaje:"Autorización aprobada correctamente.",
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        data: popMensaje
      }).afterClosed().subscribe(() => {
          this.listarSolicitudes();
        });      
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message, IconPopType.ALERT);
    }
  }

  aprobarAutorizacionIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"Error al aprobar la autorización.", IconPopType.ERROR);
  }

  protected readonly Constantes = Constantes;
}
