import {ChangeDetectorRef, Component, DestroyRef, Inject, inject, OnDestroy, OnInit} from '@angular/core';

import {ENTER} from '@angular/cdk/keycodes';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {FormControl} from "@angular/forms";
import {GeneralService} from "../../../../service/general-service.service";
import {forkJoin, Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Constantes} from "../../../../helper/constantes";
import {ListaDenunciasComponent} from "../lista-denuncias/lista-denuncias.component";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {Utility} from "../../../../helper/utility";
import {IGenericInterface} from "../../../../interface/general.interface";
import {OrcDetalleCatalogoEstructuraBean} from "../../../../model/orcDetalleCatalogoEstructuraBean";
import {UtilityService} from "../../../../helper/utilityService";
import {OtroDocumentoService} from '../../../../service/otro-documento.service';
import {DetOtroDocumentoDto, OtroDocumentoDto} from '../../../../model/denuncias/denuncia-bean';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import moment from 'moment';
import {IconPopType} from '../../../../model/enum/iconPopType';


@Component({
  selector: 'app-pop-asociadas-denuncias',
  templateUrl: './pop-asociadas-denuncias.component.html',
  styleUrls: ['./pop-asociadas-denuncias.component.scss'],
})
export class PopAsociadasDenunciasComponent implements OnInit,OnDestroy{

  destroyRef:DestroyRef = inject(DestroyRef);
  protected readonly Constantes = Constantes;
  tituloComponente: string = "Asociación Denuncias-Mesas";
  readonly separatorKeysCodes = [ENTER] as const;
  detOtrosDocumentosDtoList: DetOtroDocumentoDto[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  listTiposDocumentos: Array<OrcDetalleCatalogoEstructuraBean>;
  listTipoPerdidas: Array<OrcDetalleCatalogoEstructuraBean>;
  tipoDocumentoFC= new FormControl<OrcDetalleCatalogoEstructuraBean | null>(null);
  tipoPerdidaFC = new FormControl<OrcDetalleCatalogoEstructuraBean | null>(null);
  numeroDocumentoFC = new FormControl();
  nroMesaFC = new FormControl();
  fechaFC = new FormControl(new Date());
  idProceso : number;
  nuevaResolucion: boolean = false;
  minDate:Date;
  readonly maxDate:Date;
  isMostrarModal: boolean = false;

  announcer = inject(LiveAnnouncer);

  constructor(
    private readonly generalService : GeneralService,
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly dialogRef: MatDialogRef<ListaDenunciasComponent>,
    private readonly cdr: ChangeDetectorRef,
    private readonly utilityService: UtilityService,
    private readonly otroDocumentoService:OtroDocumentoService
  ) {
    this.minDate= new Date(Utility.getAnioActual(),0,1);
    this.maxDate = new Date(Utility.getAnioActual(),Utility.getNumeroMesActual()-1,Utility.getDiaActual());

  }

  ngOnInit(): void {
    let otroDocumentoDto:OtroDocumentoDto = this.data.otroDocumentoDto;
    this.idProceso = this.data.idProceso;
    this.nuevaResolucion = this.data.nuevaResolucion;
    this.numeroDocumentoFC.setValue(otroDocumentoDto.numeroDocumento);
    if (otroDocumentoDto.fechaRegistro) {
      const fechaRegistro = Utility.parsearFecha(otroDocumentoDto.fechaRegistro.toString(),Constantes.FORMATO_FECHA_HORA).toDate();
      this.fechaFC.setValue(fechaRegistro);
      const sieteDiasAntes = new Date(fechaRegistro);
      sieteDiasAntes.setDate(fechaRegistro.getDate() - 7);

      this.minDate = sieteDiasAntes;
    }

    this.detOtrosDocumentosDtoList = otroDocumentoDto.detOtroDocumentoDtoList;
    sessionStorage.setItem('loading','true');

    forkJoin({
      tiposDocumentos: this.generalService.obtenerDetCatalogoEstructura(
        "mae_tipo_documento_det_otro_documento",
        "c_tipo_documento"
      ),
      tiposPerdidas: this.generalService.obtenerDetCatalogoEstructura(
        "mae_tipo_perdida_det_otro_documento",
        "c_tipo_perdida"
      )
    }).subscribe({
      next: (res) => {
        sessionStorage.setItem('loading','false');
        this.listTiposDocumentos = res.tiposDocumentos.data;
        this.listTipoPerdidas = res.tiposPerdidas.data;
        this.isMostrarModal = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        sessionStorage.setItem('loading','false');
        this.cerrarDialogo();
        const mensaje = this.utilityService.manejarMensajeError(error);
        this.mensajePopup(mensaje, IconPopType.ALERT);
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

  remove(detOtroDocumentoDto: DetOtroDocumentoDto): void {
    const index = this.detOtrosDocumentosDtoList.indexOf(detOtroDocumentoDto);
    if (index >= 0) {
      this.detOtrosDocumentosDtoList.splice(index, 1);
    }
  }

  validarMesaParaAsociacionCorrecto(response: IGenericInterface<DetOtroDocumentoDto>) {
    sessionStorage.setItem('loading', 'false');
    let detOtro: DetOtroDocumentoDto = response.data;
    this.detOtrosDocumentosDtoList.push(detOtro);
  }

  validarMesaParaAsociacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.utilityService.manejarMensajeError(e),IconPopType.ALERT);
  }

  registrarAsociacion(){
    let nroDocumento = this.numeroDocumentoFC.value;

    if (!nroDocumento || nroDocumento == '') {
        this.mensajePopup("Ingrese un número de denuncua.",IconPopType.ALERT);
        return;
    }

    if(this.detOtrosDocumentosDtoList.length == 0){
      this.mensajePopup("No se han ingresado mesas para asociarlas a la denuncia.",IconPopType.ALERT);
    }

    let documentoDto: OtroDocumentoDto = new OtroDocumentoDto();
    documentoDto.idOtroDocumento = this.data.otroDocumentoDto.idOtroDocumento;
    documentoDto.fechaRegistro = moment( this.fechaFC.value).format(Constantes.FORMATO_FECHA_HORA);
    documentoDto.detOtroDocumentoDtoList = this.detOtrosDocumentosDtoList;

    sessionStorage.setItem('loading','true');
    this.otroDocumentoService.registrarAsociacion(documentoDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
          next: this.registrarAsociacionCorrecto.bind(this),
          error: this.registrarAsociacionIncorrecto.bind(this)
        }
      );
  }

  registrarAsociacionCorrecto(res){
    sessionStorage.setItem('loading','false');
    if(res.success){
      this.dialogRef.close(res.message);
    }else{
      this.mensajePopup(res.message,IconPopType.ALERT)
    }
  }

  registrarAsociacionIncorrecto(e: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(e);
    this.mensajePopup(mensaje,IconPopType.ALERT);
  }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

  cerrarDialogo(){
    this.dialogRef.close("cancelar");
  }

  restringirNumeros(event: any): void {
    const valorOriginal = event.target.value;
    const valorNumerico = valorOriginal.replaceAll(/\D/g, '');
    if (valorOriginal !== valorNumerico) {
      event.target.value = valorNumerico;
    }
  }


  validarDetOtroDocumento() {
    const error = this.validarCampos();
    if (error) {
      return this.mensajePopup(error, IconPopType.ALERT);
    }

    const nroMesa = this.nroMesaFC.value;
    const tipoDocumento = this.tipoDocumentoFC.value;
    const tipoPerdida = this.tipoPerdidaFC.value;

    if (this.existeDuplicado(nroMesa, tipoDocumento)) {
      return this.mensajePopup(
        `La mesa ${nroMesa}, con el tipo de documento ${tipoDocumento?.nombre} (${tipoDocumento?.codigoS}), ya se encuentra agregada.`,
        IconPopType.ALERT
      );
    }
    if (
      tipoDocumento.codigoS == Constantes.DENUNCIA_COD_TIPO_DOC_HOJA_ASISTENCIA &&
      tipoPerdida.codigoS == Constantes.DENUNCIA_COD_TIPO_PERDIDA_PARCIAL
    ) {
      return this.mensajePopup(
        `El tipo de documento ${tipoDocumento.nombre} no puede asociarse al tipo de pérdida parcial.`,
        IconPopType.ALERT
      );
    }

    let detOtroDocumento: DetOtroDocumentoDto = new DetOtroDocumentoDto();
    detOtroDocumento.numeroMesa = nroMesa;
    detOtroDocumento.abrevTipoDocumento = tipoDocumento.codigoS;
    detOtroDocumento.descTipoDocumento = tipoDocumento.nombre;
    detOtroDocumento.abrevTipoPerdida = tipoPerdida.codigoS;
    detOtroDocumento.descTipoPerdida = tipoPerdida.nombre;

    sessionStorage.setItem('loading', 'true');

    this.otroDocumentoService.validarMesaParaAsociacion(detOtroDocumento)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.validarMesaParaAsociacionCorrecto.bind(this),
        error: this.validarMesaParaAsociacionIncorrecto.bind(this)
      });
  }

  private existeDuplicado(nroMesa: string, tipoDocumento: any): boolean {
    return this.detOtrosDocumentosDtoList.some(
      det => det.numeroMesa === nroMesa && det.abrevTipoDocumento === tipoDocumento.codigoS
    );
  }

  private validarCampos(): string | null {
    const nroMesa = this.nroMesaFC.value ?? '';
    const tipoDocumento = this.tipoDocumentoFC.value;
    const tipoPerdida = this.tipoPerdidaFC.value;

    if (!nroMesa) {
      return "Ingrese un número de mesa.";
    }

    if (nroMesa.length !== Constantes.LONGITUD_MESA) {
      return `El número de mesa debe tener ${Constantes.LONGITUD_MESA} dígitos.`;
    }

    if (tipoDocumento == null) {
      return "Seleccione el tipo de documento.";
    }

    if (tipoPerdida == null) {
      return "Seleccione un tipo de pérdida.";
    }

    return null;
  }

}
