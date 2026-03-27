import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {Constantes} from "../../../helper/constantes";
import {FormBuilder} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {ControlHojaAsistenciaMmService} from "../../../service/control-hoja-asistencia-mm.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {DigitizationListMesasBean} from "../../../model/digitizationListMesasBean";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {ControlDigitalizacionService} from "../../../service/control-digitalizacion.service";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {firstValueFrom} from "rxjs";
import {IconPopType} from '../../../model/enum/iconPopType';
import {UtilityService} from '../../../helper/utilityService';


@Component({
  selector: 'app-hoja-asistencia',
  templateUrl: './hoja-asistencia.component.html',
  styleUrls: ['./hoja-asistencia.component.scss']
})
export class HojaAsistenciaComponent implements OnInit, AfterViewInit{
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['mesa',  'estado', 'paginas'];
  dataSource: MatTableDataSource<any>;

  destroyRef:DestroyRef = inject(DestroyRef);
  constantes = Constantes;
  listAsistenciaMM: Array<DigitizationListMesasBean>;
  isMostrarArchivo: boolean = false;
  selectedPDFBlob!: Blob;
  selectedRowMesa: DigitizationListMesasBean;
  indiceMesaSeleccionada: number = 0;

  totalPages: number = 0; // Guardaremos la cantidad total de páginas
  selectedPages = new Set<number>();
  tituloComponente= "Control de Digitalización de Hoja de Asistencia de Miembros de Mesa";
  tituloMensaje = "Hoja de asistencia de miembros de mesa";

  constructor(
    private readonly formBuilder: FormBuilder,
    public dialog: MatDialog,
    private readonly renderer: Renderer2,
    private readonly el: ElementRef,
    private readonly utilityService:UtilityService,
    private readonly controlHojaAsistenciaMmService:ControlHojaAsistenciaMmService,
    private readonly controlDigitalizacionService:ControlDigitalizacionService
  ) {
    this.listAsistenciaMM = [];
    this.dataSource = new MatTableDataSource<DigitizationListMesasBean>(this.listAsistenciaMM);
    this.selectedRowMesa = new DigitizationListMesasBean();
  }

  ngOnInit() {
    this.cargarDocumentos();
  }

  async cargarDocumentos() {
    await this.getListaMesas();

    if (this.listAsistenciaMM.length == 0) {
      this.utilityService.mensajePopup(this.tituloMensaje, "No existen registros.", IconPopType.ALERT)
      this.limpiarDatos();
      return;
    }

    if (this.listAsistenciaMM.length > 1) {
      this.listAsistenciaMM.sort(this.compararPorMesa);
    }
  }

  actualizarPaginasRevisadas = (info: { total: number; revisadas: Set<number> }) => {
    this.totalPages = info.total;
    this.selectedPages = info.revisadas;
  }

  compararPorMesa(a: DigitizationListMesasBean, b: DigitizationListMesasBean){
    const ordenMesaA = Number(a?.mesa ?? '0');
    const ordenMesaB = Number(b?.mesa ?? '0');
    return ordenMesaA - ordenMesaB;
  }

  async getListaMesas(){
    try {
      sessionStorage.setItem('loading','true');
      this.listAsistenciaMM = await firstValueFrom(this.controlHojaAsistenciaMmService.listaMiembrosMesa());
      this.dataSource.data = this.listAsistenciaMM;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      sessionStorage.setItem('loading','false');
    }catch (error){
      sessionStorage.setItem('loading','false');
      console.error(error);
      this.utilityService.mensajePopup(this.tituloMensaje,"Ocurrió un error para obtener la lista de miembros de mesa.",IconPopType.ERROR);
      this.listAsistenciaMM = [];
      this.dataSource.data = this.listAsistenciaMM;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  verMesa(row: DigitizationListMesasBean) {
    sessionStorage.setItem('loading','true');
    this.selectedRowMesa = row;
    this.indiceMesaSeleccionada = this.listAsistenciaMM.findIndex(x =>x.mesa ==this.selectedRowMesa.mesa);
    this.controlDigitalizacionService.getFile(this.selectedRowMesa.filePdfId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFileCorrecto.bind(this),
        error: this.getFileIncorrecto.bind(this)
      });
  }

  getFileCorrecto(response: any){
    sessionStorage.setItem('loading','false');
    this.isMostrarArchivo = true;
    this.selectedPDFBlob = response;
    console.log(response)
  }

  getFileIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.isMostrarArchivo = false;
    this.utilityService.mensajePopup(this.tituloMensaje, "Ocurrió un error para obtener la hoja de miembros de mesa.", IconPopType.ALERT);

  }

  limpiarDatos(){
    this.listAsistenciaMM = [];
    this.dataSource = new MatTableDataSource(this.listAsistenciaMM);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.selectedRowMesa = new DigitizationListMesasBean();

    this.indiceMesaSeleccionada = 0;
    this.isMostrarArchivo= false;
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

  confirAprobarListaMM(){
    const paginasFaltantes = this.obtenerPaginasFaltantes();
    if (paginasFaltantes.length > 0) {
      this.utilityService.mensajePopup(this.tituloComponente,` Faltan por revisar las siguientes páginas: ${paginasFaltantes.join(', ')}`,IconPopType.ALERT);
      return;
    }

    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.aprobarHojaAsistencia();
        }
      });
  }

  confirRechazarListMM(){
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.rechazarHojaAsistencia();
        }
      });
  }

  rechazarHojaAsistencia(){
    sessionStorage.setItem('loading','true');
    this.controlHojaAsistenciaMmService.rechazarlistaMM(this.selectedRowMesa.mesaId,'HA')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.rechazarlistaMMCorrecto.bind(this),
        error: this.rechazarlistaMMIncorrecto.bind(this)
      });
  }

  rechazarlistaMMCorrecto(response: boolean){
    sessionStorage.setItem('loading','false');
    if (response){
      let popMensaje :PopMensajeData= {
        title:"Hoja de asistencia de miembros de mesa",
        mensaje:"Se rechazó correctamente.",
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          this.siguienteMesaAsync();
        });
    }else{
      this.utilityService.mensajePopup(this.tituloMensaje, "Ocurrió un error al aprobar la lista de miembros de mesa.", IconPopType.ALERT);
    }
  }

  rechazarlistaMMIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloMensaje, "Ocurrió un error al rechazar la lista de miembros de mesa.", IconPopType.ALERT);
  }

  aprobarHojaAsistencia(){
    sessionStorage.setItem('loading','true');
    this.controlHojaAsistenciaMmService.aprobarlistaMM(this.selectedRowMesa.mesaId,'HA')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.aprobarlistaMMCorrecto.bind(this),
        error: this.aprobarlistaMMIncorrecto.bind(this)
      });
  }

  aprobarlistaMMCorrecto(response: boolean){
    sessionStorage.setItem('loading','false');
    if (response){
      let popMensaje :PopMensajeData= {
        title:"Hoja de asistencia de miembros de mesa",
        mensaje:"Se ejecutó correctamente.",
        icon:IconPopType.CONFIRM,
        success:true
      }
      this.dialog.open(PopMensajeComponent, {
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.siguienteMesaAsync();
          }
        });
    }else{
      this.utilityService.mensajePopup(this.tituloMensaje, "Ocurrió un error al aprobar la lista de miembros de mesa.", IconPopType.ALERT);
    }
  }

  async siguienteMesaAsync(){
    await this.cargarDocumentos();
    if(this.listAsistenciaMM.length!==0){
      let mesa = this.siguienteMesa();
      this.verMesa(mesa);
    }
  }

  siguienteMesa(){
    if(this.indiceMesaSeleccionada+1>this.listAsistenciaMM.length){
      this.indiceMesaSeleccionada=0;
    }
    return this.listAsistenciaMM[this.indiceMesaSeleccionada];
  }

  aprobarlistaMMIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloMensaje, "Ocurrió un error al aprobar la lista de miembros de mesa.", IconPopType.ALERT);
  }

}
