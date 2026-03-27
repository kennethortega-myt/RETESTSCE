import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ProcesoElectoralResponseBean} from 'src/app/model/procesoElectoralResponseBean';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {EleccionResponseBean} from 'src/app/model/eleccionResponseBean';
import {FormControl} from '@angular/forms';
import {MonitoreoListActasItemBean} from "src/app/model/monitoreoListActasItemBean";
import {Utility} from 'src/app/helper/utility';
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {UbigeoDTO, UbigeoNacionDto} from "../../../model/ubigeoElectoralBean";
import {LocalVotacionNacionService} from 'src/app/service-api/local-votacion-nacion.service';
import {LocalVotacionBean} from 'src/app/model/localVotacionBean';
import {ArchivoNacionApiService} from 'src/app/service-api/archivo-nacion.service';
import {PageEvent} from "@angular/material/paginator";
import { Constantes } from 'src/app/helper/constantes';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { DigitizationGetFilesResponse } from 'src/app/model/digitizationGetFilesResponse';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { MatDialog } from '@angular/material/dialog';
import {VentanaEmergenteService} from '../../../service/ventana-emergente.service';
import { PopReportePuestaCeroComponent } from '../puesta-cero/pop-reporte-puesta-cero/pop-reporte-puesta-cero.component';
import { NivelUbigeo } from 'src/app/model/enum/nivel-ubigeo.enum';

declare var Tiff: any;

export interface MonitorListadoActasInterface {
  position: number;
  acta: string;
  mesa: string;
  registro: any;
  estado: string;
  acciones: string;
  imagenInstalacion: string;
  imagenEscrutinio: string;
  imagenSufragio: string;
  imagenInstalacionSufragio: string;
}

@Component({
  selector: 'app-monitoreo-nacion',
  templateUrl: './monitoreo-nacion.component.html',
  styleUrls: ['./monitoreo-nacion.component.scss']
})
export class MonitoreoNacionComponent implements OnInit {
  destroyRef:DestroyRef = inject(DestroyRef);
  displayedColumns: string[] = ['position', 'acta', 'mesa', 'registro', 'estado', 'acciones'];
  dataSource = [];

  totalActasNormales = Utility.rellenarCerosAIzquierda(0, 4);
  totalActasObservadas = Utility.rellenarCerosAIzquierda(0, 4);
  totalActasEnviadasJne = Utility.rellenarCerosAIzquierda(0, 4);
  totalActasDevueltasJne = Utility.rellenarCerosAIzquierda(0, 4);
  totalActas = Utility.rellenarCerosAIzquierda(0, 4);
  listaActas: MonitoreoListActasItemBean;

  listProceso: Array<ProcesoElectoralResponseBean>;
  listEleccion: Array<EleccionResponseBean>;
  pageSize: number = 500;
  totalRegistro: number = 0;
  pageIndex: number = 0;

  destroy$: Subject<boolean> = new Subject<boolean>();

  procesoFormControl = new FormControl();
  eleccionFormControl = new FormControl();
  mesaFormControl = new FormControl();
  estadoFormControl = new FormControl('TODOS');

  departamentoFormControl = new FormControl();
  provinciaFormControl = new FormControl();
  distritoFormControl = new FormControl();
  localFormControl = new FormControl();

  estadoContenidoAnuncio: boolean = true;

  numeroActaVerActaEscrutinioInstalacion: string = "";
  codigoAEVerActaEscrutinioInstalacion: string = "";
  codigoISVerActaEscrutinioInstalacion: string = "";
  showToogleActa: boolean = true;
  showLadoToogleActa: boolean = false;
  pngImageUrlEscrutinio: string = null;
  pngImageUrlInstalacion: string = null;

  ubigeos: UbigeoNacionDto = { departamentos: [], provincias: [], distritos: [] };
  listDepartamentos: Array<UbigeoDTO> = [];
  listProvincias: Array<UbigeoDTO> = [];
  listDistritos: Array<UbigeoDTO> = [];
  listLocales: Array<LocalVotacionBean> = [];

  acronimo: string = null;

  estadoActaProcesada = Constantes.ESTADO_ACTA_PROCESADA
  estadoActaProcesadaxResolucion = Constantes.ESTADO_ACTA_PROCESADA_POR_RESOLUCION

  tituloComponente: string = 'Monitoreo';
  public tituloAlert="Monitoreo";

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly localVotacionNacionService: LocalVotacionNacionService,
    private readonly archivoNacionApiService: ArchivoNacionApiService,
    public dialogo: MatDialog,
    private readonly utilityService:UtilityService,
    private readonly ventanaEmergenteService: VentanaEmergenteService,
  ) {
    this.listProceso = [];
    this.listEleccion = [];
    this.listDepartamentos = [];
    this.listProvincias = [];
    this.listDistritos = [];
    this.listLocales = [];
    this.limpiarDatos();
  }

  ngOnInit(): void {
    this.monitoreoService
      .obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response.success) {
          this.listProceso = response.data;
        }
      });
  }

  obtenerEleccion() {
    this.listEleccion = [];
    this.listDepartamentos = [];
    this.listProvincias = [];
    this.listDistritos = [];
    this.listLocales = [];
    this.eleccionFormControl.setValue(null);
    this.departamentoFormControl.setValue(null);
    this.provinciaFormControl.setValue(null);
    this.distritoFormControl.setValue(null);
    this.localFormControl.setValue(null);
    if (+this.procesoFormControl.value.id > 0) {
      this.acronimo = this.procesoFormControl.value.acronimo;
      console.log("acronimo:" + this.acronimo);
      this.monitoreoService.obtenerEleccionesNacion(this.procesoFormControl.value.id, this.acronimo).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        this.listEleccion = response.data;
      });
    }
  }

  cargarDepartamentos() {
    this.listDepartamentos = [];
    this.listProvincias = [];
    this.listDistritos = [];
    this.listLocales = [];
    this.departamentoFormControl.setValue(null);
    this.provinciaFormControl.setValue(null);
    this.distritoFormControl.setValue(null);
    this.localFormControl.setValue(null);
    if (+this.eleccionFormControl.value > 0) {
      this.monitoreoService.obtenerDepartamentosNacion(this.eleccionFormControl.value, this.acronimo).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        this.listDepartamentos = response.data;
        console.log(this.listDepartamentos)
      });
    }
  }

  cargarProvincias() {
    console.log("cargar provincias");
    this.listProvincias = [];
    this.listDistritos = [];
    this.listLocales = [];
    this.provinciaFormControl.setValue(null);
    this.distritoFormControl.setValue(null);
    this.localFormControl.setValue(null);
    this.limpiarDatos();
    if (+this.departamentoFormControl.value > 0) {
      this.monitoreoService.obtenerProvinciasNacion(
        this.departamentoFormControl.value,
        this.eleccionFormControl.value,
        this.acronimo,
        this.procesoFormControl.value.nombreEsquemaPrincipal,
        '0' // Nacion
      ).pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.listProvincias = response.data;
      });
    }
  }

  cargarDistritos() {
    console.log("cargar distritos");
    this.listDistritos = [];
    this.listLocales = [];
    this.distritoFormControl.setValue(null);
    this.localFormControl.setValue(null);
    this.limpiarDatos();
    if (+this.provinciaFormControl.value > 0) {
      this.monitoreoService.obtenerDistritosNacion(this.provinciaFormControl.value,
        this.eleccionFormControl.value,
        this.acronimo,
        this.procesoFormControl.value.nombreEsquemaPrincipal,
        '0', //RONIER CREO QUE TENEMOS QUE CREAR OTRA FUNCION
      ).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        this.listDistritos = response.data;
        this.listLocales = [];
        this.limpiarDatos();
      });
    }
  }

  cargarLocales() {
    console.log("cargar locales");
    this.listLocales = [];
    this.localFormControl.setValue(null);
    this.limpiarDatos();
    if (+this.distritoFormControl.value > 0) {
      this.localVotacionNacionService.listarPorIdUbigeo(this.distritoFormControl.value, this.acronimo).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        this.listLocales = response;
        this.limpiarDatos();
      });
    }
  }

  cargarListadoActas() {
    if (!this.eleccionFormControl.value || this.eleccionFormControl.value == 0) {
      return;
    }
    sessionStorage.setItem("loading", 'true');
    this.cargarPaginacion();
    console.log("cargar listas");
    console.log("-----------------------------------------------------");
    console.log("local:" + this.localFormControl.value);
    console.log("distrito:" + this.distritoFormControl.value);
    console.log("provincia:" + this.provinciaFormControl.value);
    console.log("departamento:" + this.departamentoFormControl.value);
    console.log("eleccion:" + this.eleccionFormControl.value);
    console.log("proceso:" + this.procesoFormControl.value.id);
    console.log("mesa:" + this.mesaFormControl.value);
    console.log("estado:" + this.estadoFormControl.value);
    console.log("-----------------------------------------------------");
    this.limpiarDatos();
    const params = {
      idProceso: this.procesoFormControl.value.id,
      idEleccion: this.eleccionFormControl.value,
      idDepartamento: this.departamentoFormControl.value,
      idProvincia: this.provinciaFormControl.value,
      idDistrito: this.distritoFormControl.value,
      idLocal: this.localFormControl.value,
      acronimo: this.acronimo,
      mesa: this.mesaFormControl.value,
      estado: this.estadoFormControl.value,
      cantidad: this.pageSize,
      pageIndex: this.pageIndex
    };
    this.monitoreoService.obtenerActasNacion(params)
      .pipe(takeUntil(this.destroy$)).subscribe((response) => {
        sessionStorage.setItem("loading", 'false');
        this.listaActas = response;
        this.dataSource = []
        this.listaActas.listActaItems.forEach((element, index) => {
          let estado_acta = "verificar"

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

          this.dataSource.push(
            {
              position: element.nro,
              acta: element.nroActa,
              mesa: element.mesa,
              registro: element.fecha,
              estado: estado_acta,
              estadoId: element.estado,
              verActa: element.verActa,
              grupoActa: element.grupoActa,
              acciones: '',
              imagenInstalacion: element.imagenInstalacion,
              imagenEscrutinio: element.imagenEscrutinio,
              imagenInstalacionSufragio: element.imagenInstalacionSufragio,
              imagenSufragio: element.imagenSufragio
            }
          )
        });
        this.totalActas = this.listaActas.total == null ? Utility.rellenarCerosAIzquierda(0, 4) : Utility.rellenarCerosAIzquierda(this.listaActas.total, 4);
        this.totalActasNormales = this.listaActas.totalNormales == null ? Utility.rellenarCerosAIzquierda(0, 4) : Utility.rellenarCerosAIzquierda(this.listaActas.totalNormales, 4);
        this.totalActasObservadas = this.listaActas.totalObservadas == null ? Utility.rellenarCerosAIzquierda(0, 4) : Utility.rellenarCerosAIzquierda(this.listaActas.totalObservadas, 4);
        this.totalActasEnviadasJne = this.listaActas.totalEnviadasJne == null ? Utility.rellenarCerosAIzquierda(0, 4) : Utility.rellenarCerosAIzquierda(this.listaActas.totalEnviadasJne, 4);
        this.totalActasDevueltasJne = this.listaActas.totalDevueltasJne == null ? Utility.rellenarCerosAIzquierda(0, 4) : Utility.rellenarCerosAIzquierda(this.listaActas.totalDevueltasJne, 4);
        sessionStorage.setItem("loading", 'false');
      }, error => {
        sessionStorage.setItem("loading", 'false');
      });

  }

  cargarPaginacion() {
    if (!this.eleccionFormControl.value || this.eleccionFormControl.value == 0) {
      return;
    }
    const params = {
      idProceso: this.procesoFormControl.value.id,
      idEleccion: this.eleccionFormControl.value,
      idDepartamento: this.departamentoFormControl.value,
      idProvincia: this.provinciaFormControl.value,
      idDistrito: this.distritoFormControl.value,
      idLocal: this.localFormControl.value,
      mesa: this.mesaFormControl.value,
      acronimo: this.acronimo,
      estado: this.estadoFormControl.value,
      cantidad: this.pageSize
    };
    this.monitoreoService.cargarPaginacion(params).pipe(takeUntil(this.destroy$)).subscribe((response) => {
        if (response) {
          this.totalRegistro = response.totalRegistro;
        }

      });

  }

  handlePageEvent(e: PageEvent) {
    console.log(this.pageSize);
    if (this.pageSize != e.pageSize) {
      this.cargarPaginacion();
    }
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.cargarListadoActas();
    sessionStorage.setItem("loading", 'false');
  }

  limpiarDatos() {
    this.showToogleActa = false;
    this.showLadoToogleActa = true;
    this.estadoContenidoAnuncio = true;
    this.pngImageUrlEscrutinio = null;
    this.pngImageUrlInstalacion = null;
  }

  mostrarActa(derecha: boolean) {
    this.showLadoToogleActa = derecha;
  }

  async cargarImagenes(fileEscrutinio: number, fileInstalacion: number, acronimo:string) {

    this.pngImageUrlEscrutinio = null;
    this.pngImageUrlInstalacion = null;

    sessionStorage.setItem('loading', 'true');
    this.archivoNacionApiService.getFilesPng(fileEscrutinio, fileInstalacion, acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFilesPngCorrecto.bind(this),
        error: this.getFilesPngIncorrecto.bind(this)
      });


  }

  getFilesPngCorrecto(response: GenericResponseBean<DigitizationGetFilesResponse>){
    sessionStorage.setItem('loading','false');
    if (response.success){
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
    else{
      this.utilityService.mensajePopup(this.tituloComponente,response.message,IconPopType.ALERT);
    }
  }

  getFilesPngIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    this.cerrarToogleActa();
    this.utilityService.mensajePopup(this.tituloComponente,reason.error.message,IconPopType.ERROR);
  }

  // mostrarImagen(event: any, escrutinio: boolean): void {
  //   const file = event;
  //   if (file.type === 'image/tiff') {
  //     const reader = new FileReader();
  //     reader.onload = (event: any) => {
  //       const tiffDataArray = new Uint8Array(event.target.result);
  //       const tiff = new Tiff({ buffer: tiffDataArray });
  //       const canvas = tiff.toCanvas();
  //       const pngDataUrl = canvas.toDataURL('image/png');
  //       if (escrutinio) {
  //         this.pngImageUrlEscrutinio = pngDataUrl; // nueva variable
  //       } else {
  //         this.pngImageUrlInstalacion = pngDataUrl; // nueva variable
  //       }
  //     };
  //     reader.readAsArrayBuffer(file);
  //   } else {
  //     console.log('Error: Invalid file format. Only TIFF files are allowed.');
  //   }
  // }

  public cerrarToogleActa() {
    this.showToogleActa = false; // nueva variable
    this.estadoContenidoAnuncio = true;  // nueva variable
    this.pngImageUrlEscrutinio = null; // nueva variable
    this.pngImageUrlInstalacion = null; // nueva variable
  }

  sonValidosLosDatos() :string | null{
    if(!this.procesoFormControl.value ||
      this.procesoFormControl.value === '0'){
      return "Seleccione un proceso";
    }
    if(!this.eleccionFormControl.value ||
      this.eleccionFormControl.value === '0'){
      return "Seleccione una elección";
    }
    return null;
  }

  cargarListadoActasBtn(){
    let resultadoMensaje = this.sonValidosLosDatos();
    if(resultadoMensaje) {
      this.utilityService.mensajePopup(this.tituloComponente,resultadoMensaje, IconPopType.ALERT);
      return;
    }

    this.pageIndex = 0;
    this.cargarListadoActas();
  }

  mostrarPdf(idAchivo: any, nombre:string) {
      sessionStorage.setItem('loading','true');
      this.monitoreoService.obtenerArchivo(idAchivo, this.acronimo)
      .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            sessionStorage.setItem('loading','false');
            this.descargarPdf(response, nombre);
          },
          error: () => {
            sessionStorage.setItem('loading','false');
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el archivo pdf", IconPopType.ERROR);
          }
        });
    }

  descargarPdf(response: GenericResponseBean<string>, nombre:string){
      if (response.success){
        this.dialogo.open(PopReportePuestaCeroComponent, {
          width: '1200px',
          maxWidth: '80vw',
          data: {
            dataBase64: response.data,
            nombreArchivoDescarga: `archivo_${nombre}.pdf`,
            success: true
          }
        });
      }else{
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ERROR);
      }
  }

  get labelNivelUbigeoUno(): string {
    const seleccionado = this.departamentoFormControl?.value;
    if (seleccionado && seleccionado !== '0') {
      return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.UNO);
    }
    return Utility.labelFiltroUbigeo(this.listDepartamentos, NivelUbigeo.UNO);
  }

  get labelNivelUbigeoDos(): string {
    const seleccionado = this.departamentoFormControl?.value;
      if (seleccionado && seleccionado !== '0') {
        return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.DOS);
      }
      return Utility.labelFiltroUbigeo(this.listDepartamentos, NivelUbigeo.DOS);
  }

  get labelNivelUbigeoTres(): string {
    const seleccionado = this.departamentoFormControl?.value;
    if (seleccionado && seleccionado !== '0') {
      return Utility.labelFiltroUbigeo(seleccionado.toString(), NivelUbigeo.TRES);
    }
    return Utility.labelFiltroUbigeo(this.listDepartamentos, NivelUbigeo.TRES);
  }

}
