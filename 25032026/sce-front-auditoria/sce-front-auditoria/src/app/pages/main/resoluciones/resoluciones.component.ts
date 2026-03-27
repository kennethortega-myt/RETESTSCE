import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {DigitizationListResolucionItem} from "../../../model/resoluciones/resolucion-bean";
import {ResolucionService} from "../../../service/resolucion.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {Router} from "@angular/router";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {MatPaginator} from "@angular/material/paginator";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {IGenericInterface} from '../../../interface/general.interface';
import {IconPopType} from '../../../model/enum/iconPopType';
import {UtilityService} from '../../../helper/utilityService';
import {Constantes} from '../../../helper/constantes';

export interface PeriodicElement {
  Resolucion: string;
  FechaRegistro: string;
  paginas: string;
}



@Component({
  selector: 'app-resoluciones',
  templateUrl: './resoluciones.component.html',
})


export class ResolucionesComponent implements OnInit, AfterViewInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator, { static: true }) paginatorRes: MatPaginator;
  displayedColumns: string[] = ['numero','numeroResolucion' , 'paginas', 'fecha'];
  isShowResolucion:boolean = false;
  dataSourceResoluciones: MatTableDataSource<DigitizationListResolucionItem>;
  resumenResoluciones : DigitizationListResolucionItem[];
  cantidadResoluciones:number = 0;
  resolucionEdit:DigitizationListResolucionItem;
  selectedRow: DigitizationListResolucionItem;

  selectedPDFBlob!: Blob;
  totalPages: number = 0; // Guardaremos la cantidad total de páginas
  selectedPages = new Set<number>();
  tituloComponente: string = "Control de Digitalización de Resoluciones";

  constructor(
    private readonly resolucionService: ResolucionService,
    private readonly dialog: MatDialog,
    private readonly utilityService:UtilityService,
    public router:Router,
  ) {

    this.dataSourceResoluciones = new MatTableDataSource<DigitizationListResolucionItem>([]);

  }

   ngOnInit(): void {
    this.listarResumenResoluciones("");

  }
  cargarDocumentos(){
    this.listarResumenResoluciones("");
  }

  mensajePopupAprobado(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Resoluciones",
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        this.listarResumenResoluciones("");
      });
  }

  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:"Resoluciones",
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


  listarResumenResoluciones(numeroResolucion:string){
    this.isShowResolucion = false;
    this.resolucionEdit = null;
    this.selectedRow = new DigitizationListResolucionItem();
    sessionStorage.setItem('loading','true');

    this.resolucionService.listnResolucionesDigtal()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.listnResolucionesDigtalCorrecto.bind(this),
        error: this.listnResolucionesDigtalIncorrecto.bind(this)
      });
  }

  listnResolucionesDigtalCorrecto(res: Array<DigitizationListResolucionItem>){
    sessionStorage.setItem('loading','false');

    if ((res && res.length == 0) || res == null) {
      this.resumenResoluciones = [];
      this.dataSourceResoluciones.data = [];
      this.cantidadResoluciones = 0;
      this.mensajePopup("No existen resoluciones digitalizadas.",IconPopType.ALERT);
      return;
    }

    this.resumenResoluciones = res;
    this.dataSourceResoluciones.data = this.resumenResoluciones;
    this.cantidadResoluciones = this.dataSourceResoluciones.data.length;
  }

  listnResolucionesDigtalIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(error.message,IconPopType.ALERT);
  }

  verPdf(e:DigitizationListResolucionItem){
    this.selectedRow = e;

    if(e.estadoDigitalizacion=='O'){
      this.mensajePopup("Redigitalizar la resolución",IconPopType.ALERT);
      this.listarResumenResoluciones("");
      return;
    }

    this.resolucionEdit = e;
    this.isShowResolucion = true;
    sessionStorage.setItem('loading','true');

    this.resolucionService.getFileV3(e.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFileV3Correcto.bind(this),
        error: this.getFileV3Incorrecto.bind(this)
      });
  }

  getFileV3Correcto(res: any){
    sessionStorage.setItem('loading','false');
    this.isShowResolucion = true;
    this.selectedPDFBlob = res;
  }

  getFileV3Incorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup("Archivo no Encontrado",IconPopType.ALERT);
    this.isShowResolucion =  false;
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


  updateResolucion(estadoDescr:string, estado:string){
    if (estado === 'A'){
      const paginasFaltantes = this.obtenerPaginasFaltantes();
      if (paginasFaltantes.length > 0) {
        this.utilityService.mensajePopup(this.tituloComponente,` Faltan por revisar las siguientes páginas: ${paginasFaltantes.join(', ')}`,IconPopType.ALERT);
        return;
      }
    }

    if(this.isShowResolucion){
      if(this.resolucionEdit.estadoDigitalizacion=='D'){
        this.dialog.open(DialogoConfirmacionComponent, {
          disableClose: true,
          data: `¿Desea ` + estadoDescr + ` la resolución?`
        })
          .afterClosed()
          .subscribe((confirmado: boolean) => {
            if (confirmado) {
              sessionStorage.setItem('loading','true');

              this.resolucionService.actualizarEstadoDigitalizacion(this.resolucionEdit.id, estado)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                  next: this.actualizarEstadoDigitalizacionCorrecto.bind(this),
                  error: this.actualizarEstadoDigitalizacionIncorrecto.bind(this)
                });
            }
          });
      }else{
        this.mensajePopup("Solo pueden aprobarse o redigitalizarse las resoluciones Digitalizadas",IconPopType.ALERT);
      }
    }else{
      this.mensajePopup("Seleccione una resolución.",IconPopType.ALERT);
    }
  }

  actualizarEstadoDigitalizacionCorrecto(res: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');
    if(res.success){
      this.mensajePopupAprobado(res.message,IconPopType.CONFIRM);
    }else{
      this.mensajePopup(res.message,IconPopType.ALERT);
    }
  }

  actualizarEstadoDigitalizacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(e.error.message,IconPopType.ALERT);
  }

  ngAfterViewInit() {
    this.dataSourceResoluciones.paginator = this.paginatorRes;
  }


  protected readonly Constantes = Constantes;
}
