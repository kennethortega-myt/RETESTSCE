import {Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {takeUntil} from "rxjs/operators";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {AuthComponent} from "../../../../helper/auth-component";
import {GeneralService} from "../../../../service/general-service.service";
import {MatDialog} from "@angular/material/dialog";
import {Subject} from "rxjs";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {Constantes} from "../../../../helper/constantes";
import {Utility} from "../../../../helper/utility";
import {MatTableDataSource} from "@angular/material/table";
import {PopAsociadasDenunciasComponent} from "../pop-asociadas/pop-asociadas-denuncias.component";
import {Usuario} from "../../../../model/usuario-bean";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {UtilityService} from "../../../../helper/utilityService";
import {IGenericInterface} from "../../../../interface/general.interface";
import {MatPaginator} from "@angular/material/paginator";
import {OtroDocumentoService} from '../../../../service/otro-documento.service';
import {OtroDocumentoDto, ResumenOtroDocumentoDto} from '../../../../model/denuncias/denuncia-bean';
import {ArchivoService} from '../../../../service/archivo.service';
import {PopReporteCargoEntregaComponent} from '../../resolucion/envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component';
import {IconPopType} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-lista-denuncias',
  templateUrl: './lista-denuncias.component.html',
  styleUrls: ['./lista-denuncias.component.scss']
})
export class ListaDenunciasComponent extends AuthComponent implements OnInit, OnDestroy{

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  destroyRef:DestroyRef = inject(DestroyRef);
  procesoFormControl = new FormControl("0");
  listProceso: Array<ProcesoElectoralResponseBean>;
  destroy$: Subject<boolean> = new Subject<boolean>();
  totalDocumentosAsociadas = Utility.rellenarCerosAIzquierda(0, 4);
  totalDocumentosSinAsociar = Utility.rellenarCerosAIzquierda(0, 4);
  totalDocumentosAnulados = Utility.rellenarCerosAIzquierda(0, 4);
  totalDocumentos = Utility.rellenarCerosAIzquierda(0, 4);
  resumenOtroDocumento : ResumenOtroDocumentoDto;
  dataSource: MatTableDataSource<OtroDocumentoDto> = new  MatTableDataSource<OtroDocumentoDto>([]);
  protected readonly Constantes = Constantes;
  isDisabled:boolean = true;
  columns: string[] = ['documento','fecha', 'mesas', 'estado', 'acciones'];
  public usuario: Usuario;
  isVisible:boolean =false;
  public numeroResolucion = "";
  tipoReporte:number;
  public formGroupAcciones: FormGroup;
  public tituloComponente = "Denuncias";
  nuevoDocumento: boolean = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly archivoService: ArchivoService,
    private readonly otroDocumentoService: OtroDocumentoService,
    private readonly generalService : GeneralService,
    private readonly dialog: MatDialog,
    private readonly utilityService: UtilityService
  ) {
    super();
    this.formGroupAcciones = this.formBuilder.group({
      nroDocumentoFormControl: ['']
    });
  }


  ngOnInit(): void {
    this.usuario = this.authentication();
    this.generalService.obtenerProcesos().pipe(takeUntil(this.destroy$)).subscribe(
      (response)=>{
        if(response.success){
          this.listProceso = response.data;
        }else{
          this.mensajePopup("problemas al cargar lista de procesos.",IconPopType.ALERT);
        }
      });
  }

  mensajePopup(mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:this.tituloComponente,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    });
  }

  onSelectedProceso() {
    if (!this.procesoFormControl.value || this.procesoFormControl.value == '0') {
      this.isVisible=false;
      this.dataSource.data = [];

      this.totalDocumentos=Utility.rellenarCerosAIzquierda(0, 4);
      this.totalDocumentosAsociadas=Utility.rellenarCerosAIzquierda(0, 4);
      this.totalDocumentosSinAsociar = Utility.rellenarCerosAIzquierda(0, 4);
      this.totalDocumentosAnulados = Utility.rellenarCerosAIzquierda(0, 4);
      return;
    }
    if (+this.procesoFormControl.value > 0) {
      this.buscarDocumentosByNumero();
    }
  }

  resumen(nroDocumento:string, estadoDocumento:string, estadoDigitalizacion:string){
    sessionStorage.setItem('loading','true');
    this.otroDocumentoService.resumen(nroDocumento, estadoDocumento , estadoDigitalizacion)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          sessionStorage.setItem('loading','false');
          if (res.data.otroDocumentoDtoList.length === 0) {
            this.mensajePopup("No se encontraron documentos.", IconPopType.ALERT);
          }

          this.isVisible = true;
          this.resumenOtroDocumento = res.data;
          this.dataSource.data = this.resumenOtroDocumento.otroDocumentoDtoList;

          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
          });

          this.totalDocumentosAsociadas = Utility.rellenarCerosAIzquierda(this.resumenOtroDocumento.mumeroDocumentosAsociados, 4);
          this.totalDocumentosSinAsociar = Utility.rellenarCerosAIzquierda(this.resumenOtroDocumento.numeroDocumentosPendientesDeAsociar, 4);
          this.totalDocumentosAnulados = Utility.rellenarCerosAIzquierda(this.resumenOtroDocumento.numeroDocumentosAnulados, 4);
          this.totalDocumentos = Utility.rellenarCerosAIzquierda(this.resumenOtroDocumento.numeroTotalDocumentos, 4);
          this.dataSource = new MatTableDataSource(this.resumenOtroDocumento.otroDocumentoDtoList);
        },
        error: (error) => {
          sessionStorage.setItem('loading', 'false');
          let mensaje = this.utilityService.manejarMensajeError(error);
          this.mensajePopup(mensaje, IconPopType.ERROR);
          this.isVisible = false;
        }
      });
  }

  buscarDocumentosByNumero(){
    this.resumen(this.formGroupAcciones.get('nroDocumentoFormControl').value, "", Constantes.DENUNCIA_ESTADO_DIGTAL_APROBADO);
  }

  verArchivoPopupCorrecto(res: IGenericInterface<any>){
    sessionStorage.setItem('loading','false');
    this.dialog.open(PopReporteCargoEntregaComponent, {
      width: '1200px',
      maxWidth: '80vw',
      data: {
        dataBase64: res.data,
        success: true,
        nombreArchivoDescarga: this.numeroResolucion+".pdf"
      }
    });
  }

  verArchivoPopupIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.mensajePopup(mensaje,IconPopType.ALERT);
  }

  verArchivoModal(e:any){
    this.numeroResolucion = e.numeroResolucion;
    sessionStorage.setItem('loading','true');
    this.archivoService
      .getPdfBase64( e.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.verArchivoPopupCorrecto.bind(this),
        error: this.verArchivoPopupIncorrecto.bind(this)
        }
      );
  }


  onProcesarAsociacion(otroDocumento:OtroDocumentoDto){
    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Desea procesar las asociaciones de la denuncia ${otroDocumento.numeroDocumento}, una vez procesada ya no podrá ser revertida.?`,
      ()=> this.procesarAsociacion(otroDocumento)
    );
  }

  procesarAsociacion(otroDocumento:OtroDocumentoDto){
    sessionStorage.setItem('loading', 'true');
    this.otroDocumentoService.procesarAsociacion(otroDocumento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.procesarAsociacionCorrecto.bind(this),
        error: this.procesarAsociacionIncorrecto.bind(this)
      });
  }

  procesarAsociacionCorrecto(response: IGenericInterface<boolean>) {
    sessionStorage.setItem('loading', 'false');
    this.mensajePopup(response.message,IconPopType.CONFIRM);
    this.buscarDocumentosByNumero();
  }

  procesarAsociacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.utilityService.manejarMensajeError(e),IconPopType.ALERT);
  }


  onAnularOtroDocumento(otroDocumento:OtroDocumentoDto){
    this.utilityService.popupConfirmacionConAccion(
      null,
      `¿Desea anular la denuncia ${otroDocumento.numeroDocumento} y sus mesas asociadas.?`,
      ()=> this.anularOtroDocumento(otroDocumento)
    );
  }

  anularOtroDocumento(otroDocumento:OtroDocumentoDto){
    sessionStorage.setItem('loading', 'true');
    this.otroDocumentoService.anularDocumento(otroDocumento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.anularDocumentoCorrecto.bind(this),
        error: this.anularDocumentoIncorrecto.bind(this)
      });
  }

  anularDocumentoCorrecto(response: IGenericInterface<boolean>) {
    sessionStorage.setItem('loading', 'false');
    this.mensajePopup(response.message,IconPopType.CONFIRM);
    this.buscarDocumentosByNumero();
  }

  anularDocumentoIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.utilityService.manejarMensajeError(e),IconPopType.ALERT);
  }


  openDialogAsociadas(otroDocumentoDto:OtroDocumentoDto) {

    if (!this.procesoFormControl.value || this.procesoFormControl.value == '0') {
      this.mensajePopup("Seleccione un proceso de la lista desplegable",IconPopType.ALERT);
      return;
    }

    const dialogRef = this.dialog.open(PopAsociadasDenunciasComponent, {
      width: '1200px',
      maxWidth: '80vw',
      disableClose: true,
      data: {
        otroDocumentoDto:otroDocumentoDto,
        idProceso : Number(this.procesoFormControl.value),
        nuevaResolucion: this.nuevoDocumento
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined  && result != 'cancelar' ){
        this.mensajePopup(result,IconPopType.CONFIRM);
        this.buscarDocumentosByNumero();
      }else if (result !== undefined  && result == 'cancelar' ){
        this.buscarDocumentosByNumero();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
