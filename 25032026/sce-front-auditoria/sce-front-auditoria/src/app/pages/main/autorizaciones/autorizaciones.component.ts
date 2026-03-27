import {AuthComponent} from "../../../helper/auth-component";
import {Component, DestroyRef, inject, OnInit, ViewChild} from "@angular/core";
import {Usuario} from "../../../model/usuario-bean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {AutorizacionService} from "../../../service/autorizacion.service";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {AutorizacionBean} from "../../../model/autorizacionBean";
import {TabAutorizacionBean} from "../../../model/tabAutorizacionBean";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {MatDialog} from "@angular/material/dialog";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Constantes} from '../../../helper/constantes';

@Component({
  selector: 'app-autorizaciones',
  templateUrl: './autorizaciones.component.html'
})
export class AutorizacionesComponent extends AuthComponent implements OnInit{

  @ViewChild('paginator') paginator: MatPaginator;

  destroyRef:DestroyRef = inject(DestroyRef);
  private usuario: Usuario;
  displayedColumns: string[] = ['numero',  'detalle','fechaHora','estado','descEstado','acciones'];
  dataSource: any;
  tituloComponente: string = "Autorizaciones";

  constructor(private readonly autorizacionService: AutorizacionService,
              private readonly utilityService:UtilityService,
              public readonly dialog: MatDialog,
              private readonly sanitizer: DomSanitizer) {
    super();
    this.dataSource = new MatTableDataSource<AutorizacionBean>([]);
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.inicializarDatos();
  }

  inicializarDatos(){


    this.autorizacionService.listAutorizaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.listAutorizacionesCorrecto.bind(this),
        error: this.listAutorizacionesIncorrecto.bind(this)
      });
  }

  resaltarTexto(texto: string): SafeHtml {
    if (!texto) return '';
    const resaltado = texto.replaceAll(/(Puesta a Cero)/gi, '<span style="color:red;font-weight:bold;">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(resaltado);
  }

  listAutorizacionesCorrecto(response: GenericResponseBean<Array<AutorizacionBean>>){
    if (response.success){
      this.dataSource = new MatTableDataSource<AutorizacionBean>(response.data);
      this.dataSource.paginator = this.paginator;
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message, IconPopType.ALERT);
    }
  }
  listAutorizacionesIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"Error al obtener la lista de autorizaciones.", IconPopType.ERROR);
  }

  confirmarAutorizacion(idAutorizacion: string): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.aprobarAutorizacion(idAutorizacion);
        }
      });
  }

  aprobarAutorizacion(idAutorizacion: string){
    this.autorizacionService.aprobarAutorizacion(idAutorizacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.aprobarAutorizacionCorrecto.bind(this),
        error: this.aprobarAutorizacionIncorrecto.bind(this)
      });
  }

  aprobarAutorizacionCorrecto(response: GenericResponseBean<TabAutorizacionBean>){
    if (response.success){
      let popMensaje :PopMensajeData= {
        title:this.tituloComponente,
        mensaje:response.message,
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        data: popMensaje
      }).afterClosed()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.inicializarDatos();
        });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message, IconPopType.ALERT);
    }
  }

  aprobarAutorizacionIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloComponente,"Error al aprobar la autorización.", IconPopType.ERROR);
  }

  confirmarRechazarAutorizacionCC(idAutorizacion: string): void {
    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Está seguro de rechazar la autorización?`,
      ()=> this.rechazarAutorizacionCC(idAutorizacion)
    );
  }

  rechazarAutorizacionCC(idAutorizacion: string): void {
    this.autorizacionService.rechazarAutorizacionCC(idAutorizacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.rechazarAutorizacionCCCorrecto.bind(this),
        error: (err) => {
          this.utilityService.mensajePopup(this.tituloComponente,'Error al rechazar la autorización', IconPopType.ERROR);
        }
      });
  }

  rechazarAutorizacionCCCorrecto(response: GenericResponseBean<TabAutorizacionBean>){
    if (response.success){
      this.utilityService.mensajePopupCallback(this.tituloComponente, "Autorización rechazada correctamente.", IconPopType.CONFIRM,
        (confirmado: boolean) => {
          this.inicializarDatos();
        });
    }else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message, IconPopType.ALERT);
    }

  }

  protected readonly Constantes = Constantes;
}
