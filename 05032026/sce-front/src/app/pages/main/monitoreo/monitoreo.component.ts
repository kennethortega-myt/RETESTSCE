import {AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild} from '@angular/core';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { MonitoreoService } from "../../../service/monitoreo.service";
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { FormControl } from '@angular/forms';
import { MonitoreoListActasItemBean} from "src/app/model/monitoreoListActasItemBean";
import { Utility } from 'src/app/helper/utility';
import { ControlDigitalizacionService } from 'src/app/service/control-digitalizacion.service';
import { TransmisionActaService } from 'src/app/service/transmision.service';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';
import { MatDialog } from '@angular/material/dialog';
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {GenericResponseBean} from "../../../model/genericResponseBean";
import {DigitizationGetFilesResponse} from "../../../model/digitizationGetFilesResponse";
import {UtilityService} from "../../../helper/utilityService";
import {IconPopType} from "../../../model/enum/iconPopType";
import {Constantes} from '../../../helper/constantes';
import {VentanaEmergenteService} from '../../../service/ventana-emergente.service';
import {GeneralService} from '../../../service/general-service.service';
import {Usuario} from '../../../model/usuario-bean';
import {AuthComponent} from '../../../helper/auth-component';

@Component({
  selector: 'app-monitoreo',
  templateUrl: './monitoreo.component.html',
  styleUrls: ['./monitoreo.component.scss']
})
export class MonitoreoComponent extends AuthComponent implements OnInit,AfterViewInit{

  destroyRef:DestroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns: string[] = ['position', 'acta', 'mesa', 'registro','estado','acciones'];
  dataSource: MatTableDataSource<any>;

  totalActasNormales = Utility.rellenarCerosAIzquierda(0,4);
  totalActasObservadas = Utility.rellenarCerosAIzquierda(0,4);
  totalActasEnviadasJne = Utility.rellenarCerosAIzquierda(0,4);
  totalActasDevueltasJne = Utility.rellenarCerosAIzquierda(0, 4);
  totalActas = Utility.rellenarCerosAIzquierda(0,4);
  listaActas: MonitoreoListActasItemBean;

  listProceso: Array<ProcesoElectoralResponseBean>;
  listEleccion: Array<EleccionResponseBean>;

  idEleccion: string;
  destroy$: Subject<boolean> = new Subject<boolean>();

  procesoFormControl = new FormControl(0);
  eleccionFormControl = new FormControl(0);
  mesaFormControl = new FormControl();
  estadoFormControl = new FormControl('TODOS');

  estadoContenidoAnuncio: boolean = true;

  showToogleActa: boolean = false;
  toogleDivPngSeccionVerActaEscrutinioInstalacion: boolean = false;
  showLadoToogleActa:boolean = false;
  numeroActaVerActaEscrutinioInstalacion: string = "";

  pngImageUrlEscrutinio:  string = null;
  pngImageUrlInstalacion: string = null;

  tituloComponente: string = 'Monitoreo y Transmisión';

  usuario : Usuario;

  constructor(
    private readonly monitoreoService:MonitoreoService,
    private readonly controlDigitalizacionService:ControlDigitalizacionService,
    private readonly transmisionActaService: TransmisionActaService,
    public dialogo: MatDialog,
    private readonly utilityService:UtilityService,
    private readonly ventanaEmergenteService: VentanaEmergenteService,
    private readonly generalService: GeneralService
  ){
    super();
    this.listProceso = [];
    this.listEleccion = [];
    this.listaActas = new MonitoreoListActasItemBean();
    this.dataSource = new MatTableDataSource([]);

  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.dataSource.sort = this.sort;
    this.generalService
      .obtenerProcesos()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response)=>{
        if(response.success){
          this.listProceso= response.data;
        }else{
          this.utilityService.mensajePopup(this.tituloComponente,"Hubo un problema al cargar la lista de actas.",IconPopType.ALERT)
        }
    });
  }

  transmitirActa(idActa:number){
    this.dialogo
      .open(DialogoConfirmacionComponent, {
        data: `¿Desea transmitir los datos del acta seleccionada?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.transmisionActaService.transmitir(idActa).pipe(takeUntil(this.destroy$)).subscribe((response) =>{
            if(response){
              this.utilityService.mensajePopup(this.tituloComponente,"Se transmitió el acta correctamente.",IconPopType.CONFIRM);
            } else {
              this.utilityService.mensajePopup(this.tituloComponente,"No se transmitió el acta correctamente.",IconPopType.ERROR);
            }
          });
        }
      });
  }

  obtenerEleccion() {
    // console.log(this.procesoFormControl.value)
    if (!this.procesoFormControl.value || this.procesoFormControl.value == 0) {
      this.limpiarDatos();
      this.eleccionFormControl.setValue(0);
      this.listEleccion = [];
      return;
    }
    if (+this.procesoFormControl.value > 0) {
      this.generalService.obtenerElecciones(this.procesoFormControl.value).pipe(takeUntil(this.destroy$)).subscribe((response) =>{
        this.listEleccion = response.data;
        this.idEleccion= '0'
        this.limpiarDatos();
      });
    }
  }

  sonValidosLosDatos() :string | null{
    if(!this.procesoFormControl.value ||
      this.procesoFormControl.value === 0){
      return "Seleccione un proceso";
    }
    if(!this.eleccionFormControl.value ||
      this.eleccionFormControl.value === 0){
      return "Seleccione una elección";
    }
    return null;
  }

  cargarListadoActas(){
    let resultadoMensaje = this.sonValidosLosDatos();
    if(resultadoMensaje) {
      this.utilityService.mensajePopup(this.tituloComponente,resultadoMensaje, IconPopType.ALERT);
      return;
    }
    sessionStorage.setItem('loading','true');
    this.limpiarDatos();
    if (+this.eleccionFormControl.value > 0) {
      this.monitoreoService.obtenerActas(
        this.procesoFormControl.value,
        this.eleccionFormControl.value.toString(),
        this.mesaFormControl.value,
        this.estadoFormControl.value,
      ).pipe(takeUntil(this.destroy$)).subscribe((response) =>{
        this.listaActas = response;

        this.dataSource.data = this.listaActas.listActaItems.map((element,index) => {
          let estado_acta = "verificar"
          /*if (element.estado === "D"
            || element.estado === "L"
            || element.estado === "O"
            || element.estado === "S"
            || element.estado === "N"
            || element.estado === "M"
            || element.estado === "Q"
            || element.estado === "R") {
            estado_acta = "validado"
          } else if (element.estado === "I") {
            estado_acta = "enviadoJurado"
          } else if (element.estado === "H") {
            estado_acta = "observada"
          }*/
          if (element.grupoActa === 'OBSERVADAS') {
              estado_acta = "observada";
          } else if (element.grupoActa === 'ENVIADAS_JNE') {
            estado_acta = "enviadoJurado";
          } else if (element.grupoActa === 'DEVUELTAS_JNE') {
            estado_acta = "devueltoJurado";
          } else if (element.grupoActa === 'CONTABILIZADAS') {
            estado_acta = "validado";
          } else {
            estado_acta = "verificar";
          }
          // agregue la clase "devuelta" (ya esta en el css es de color azul) cuando el acta este en estado devuelta
          return {
            position: index +1,
            acta: element.acta,
            actaId: element.actaId,
            mesa: element.mesa,
            registro: element.fecha,
            estado: estado_acta,
            estadoId: element.estado,
            verActa: element.verActa,
            grupoActa: element.grupoActa,
            acciones: '',
            imagenInstalacion: element.imagenInstalacion,
            imagenEscrutinio: element.imagenEscrutinio
          }
        });
        this.dataSource.paginator.firstPage();
        this.totalActas = Utility.rellenarCerosAIzquierda(this.listaActas.total,4);
        this.totalActasNormales = Utility.rellenarCerosAIzquierda(this.listaActas.totalNormales,4);
        this.totalActasObservadas = Utility.rellenarCerosAIzquierda(this.listaActas.totalObservadas,4);
        this.totalActasEnviadasJne = Utility.rellenarCerosAIzquierda(this.listaActas.totalEnviadasJne,4);
        this.totalActasDevueltasJne = Utility.rellenarCerosAIzquierda(this.listaActas.totalDevueltasJne, 4);
        sessionStorage.setItem('loading','false');
      });
    }
  }

  limpiarDatos(){
    this.showToogleActa = false;
    this.showLadoToogleActa = true;
    this.estadoContenidoAnuncio = true;
    this.pngImageUrlEscrutinio = null;
    this.pngImageUrlInstalacion = null;
  }

  mostraPanelAcataEscrutinioActaInstalacionSufragio(idActa: number){
    this.utilityService.abrirModalActaPorId(
      idActa,
      this.tituloComponente,
      this.destroyRef
    );
  }

  mostrarActa(derecha:boolean){
    this.showLadoToogleActa = derecha;
  }

  getFilesPngCorrecto(response: GenericResponseBean<DigitizationGetFilesResponse>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
    else{
      if (response.data.acta1File=== null){
        this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT)
      }else{
        let pngBlobAE = Utility.base64toBlob(response.data.acta1File,'image/png');
        this.pngImageUrlEscrutinio = URL.createObjectURL(pngBlobAE);
      }
      if (response.data.acta2File === null){
        this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
      }else{
        let pngBlobAI = Utility.base64toBlob(response.data.acta2File,'image/png');
        this.pngImageUrlInstalacion = URL.createObjectURL(pngBlobAI);
      }
    }
  }

  getFilesPngIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    this.cerrarToogleActa();
    this.utilityService.mensajePopup(this.tituloComponente,reason.error.message,IconPopType.ERROR);
  }

  public cerrarToogleActa(){
    this.showToogleActa = false;
    this.estadoContenidoAnuncio = true;
    this.pngImageUrlEscrutinio = null;
    this.pngImageUrlInstalacion = null;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  protected readonly Constantes = Constantes;

}
