import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatDialog} from "@angular/material/dialog";
import {DialogoConfirmacionComponent} from "../../dialogo-confirmacion/dialogo-confirmacion.component";
import {Router} from "@angular/router";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {MatPaginator} from "@angular/material/paginator";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {IGenericInterface} from '../../../../interface/general.interface';
import {IconPopType} from '../../../../model/enum/iconPopType';
import {UtilityService} from '../../../../helper/utilityService';
import {OtroDocumentoDto} from '../../../../model/denuncias/denuncia-bean';
import {Constantes} from '../../../../helper/constantes';
import {OtroDocumentoService} from '../../../../service/otro-documento.service';
import {ArchivoService} from '../../../../service/archivo.service';

@Component({
  selector: 'app-control-digtal-denuncias',
  templateUrl: './control-digtal-denuncias.component.html',
})


export class ControlDigtalDenunciasComponent implements OnInit, AfterViewInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator, { static: true }) paginatorRes: MatPaginator;
  displayedColumns: string[] = ['numero','numeroDocumento' , 'numeroPaginas', 'fechaRegistro'];
  isShowDocumentos:boolean = false;
  dataSourceDocumentos: MatTableDataSource<OtroDocumentoDto>;
  listaOtrosDocumentos : OtroDocumentoDto[];
  cantidadDocumentos:number = 0;
  otroDocumentoEdit:OtroDocumentoDto;
  selectedRow: OtroDocumentoDto;
  selectedPDFBlob!: Blob;
  totalPages: number = 0; // Guardaremos la cantidad total de páginas
  selectedPages = new Set<number>();
  tituloComponente: string = "Control de Digitalización de Denuncias";

  constructor(
    private readonly otroDocumentoService: OtroDocumentoService,
    private readonly archivoService:ArchivoService,
    private readonly dialog: MatDialog,
    private readonly utilityService:UtilityService,
    public router:Router,
  ) {
    this.dataSourceDocumentos = new MatTableDataSource<OtroDocumentoDto>([]);
  }

   ngOnInit(): void {
    this.listarDocumentos();

  }

  mensajePopupAprobado(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Denuncias",
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        this.listarDocumentos();
      });
  }

  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Denuncias",
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }


  listarDocumentos(){
    this.isShowDocumentos = false;
    this.otroDocumentoEdit = null;
    this.selectedRow = new OtroDocumentoDto();
    sessionStorage.setItem('loading','true');

    this.otroDocumentoService.listarControlDigtalOtrosDocumentos(Constantes.COD_TIPO_DOCUMENTO_DENUNCIA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.listarControlDigtalOtrosDocumentosCorrecto.bind(this),
        error: this.listarControlDigtalOtrosDocumentosIncorrecto.bind(this)
      });
  }

  listarControlDigtalOtrosDocumentosCorrecto(res: Array<OtroDocumentoDto>){
    sessionStorage.setItem('loading','false');
    if ((res && res.length == 0) || res == null) {
      this.listaOtrosDocumentos = [];
      this.dataSourceDocumentos.data = [];
      this.cantidadDocumentos = 0;
      this.mensajePopup("No existen denuncias digitalizadas.",IconPopType.ALERT);
      return;
    }

    this.listaOtrosDocumentos = res;
    this.dataSourceDocumentos.data = this.listaOtrosDocumentos;
    this.cantidadDocumentos = this.dataSourceDocumentos.data.length;
  }

  listarControlDigtalOtrosDocumentosIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(error);
    this.mensajePopup(mensaje,IconPopType.ALERT);
  }

  verPdf(documentoDto:OtroDocumentoDto){
    this.selectedRow = documentoDto;

    if(documentoDto.estadoDigitalizacion=='O') {
      this.mensajePopup("Redigitalizar la denuncia",IconPopType.ALERT);
      this.listarDocumentos();
      return;
    }
    this.otroDocumentoEdit = documentoDto;
    this.isShowDocumentos = true;
    sessionStorage.setItem('loading','true');

    this.archivoService.getBlobArchivoPdf(documentoDto.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getBlobArchivoPdfCorrecto.bind(this),
        error: this.getBlobArchivoPdfIncorrecto.bind(this)
      });
  }

  getBlobArchivoPdfCorrecto(res: any){
    sessionStorage.setItem('loading','false');
    this.isShowDocumentos = true;
    this.selectedPDFBlob = res;
  }

  getBlobArchivoPdfIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(error);
    this.mensajePopup(mensaje,IconPopType.ALERT);
    this.isShowDocumentos =  false;
  }

  actualizarPaginasRevisadas = (info: { total: number; revisadas: Set<number> }) => {
    this.totalPages = info.total;
    this.selectedPages = info.revisadas;
  }

  obtenerPaginasFaltantes(): number[] {
    const paginasFaltantes: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      if (!this.selectedPages.has(i)) {
        paginasFaltantes.push(i);
      }
    }
    return paginasFaltantes;
  }


  updateEstadoDocumento(estadoDescr:string, estado:string){
    if (estado === Constantes.ESTADO_RESOLUCION_DIGTAL_PRIMER_CC_ACEPTADA){
      const paginasFaltantes = this.obtenerPaginasFaltantes();
      if (paginasFaltantes.length > 0) {
        this.utilityService.mensajePopup(this.tituloComponente,` Faltan por revisar las siguientes páginas: ${paginasFaltantes.join(', ')}`,IconPopType.ALERT);
        return;
      }
    }

    if(this.isShowDocumentos){
      if(this.otroDocumentoEdit.estadoDigitalizacion==Constantes.DENUNCIA_ESTADO_DIGTAL_DIGITALIZADO){
        this.dialog.open(DialogoConfirmacionComponent, {
          disableClose: true,
          data: `¿Desea ` + estadoDescr + ` la denuncia?`
        })
          .afterClosed()
          .subscribe((confirmado: boolean) => {
            if (confirmado) {
              sessionStorage.setItem('loading','true');
              this.otroDocumentoService.actualizarEstadoDigitalizacion(this.otroDocumentoEdit.idOtroDocumento, estado)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: this.actualizarEstadoDigitalizacionCorrecto.bind(this),
                  error: this.actualizarEstadoDigitalizacionIncorrecto.bind(this)
                });
            }
          });
      }else{
        this.mensajePopup("Solo pueden aprobarse o redigitalizarse los denuncias Digitalizados",IconPopType.ALERT);
      }
    }else{
      this.mensajePopup("Seleccione una denuncia.",IconPopType.ALERT);
    }
  }

  actualizarEstadoDigitalizacionCorrecto(res: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');
    this.mensajePopupAprobado(res.message,IconPopType.CONFIRM);
  }

  actualizarEstadoDigitalizacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.mensajePopup(mensaje,IconPopType.ALERT);
  }

  ngAfterViewInit() {
    this.dataSourceDocumentos.paginator = this.paginatorRes;
  }

  protected readonly Constantes = Constantes;
}
