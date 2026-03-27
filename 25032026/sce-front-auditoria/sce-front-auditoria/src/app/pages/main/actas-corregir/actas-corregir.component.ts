import {Component, DestroyRef, ElementRef, inject, OnInit, QueryList, ViewChildren,} from '@angular/core';

import {MatDialog} from '@angular/material/dialog';
import {ActasCorregirService} from "../../../service/actas-corregir.service";
import {ActasPorCorregirListBean} from "../../../model/actasPorCorregirListBean";
import {PopMensajeData} from "../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../shared/pop-mensaje/pop-mensaje.component";
import {Constantes} from "../../../helper/constantes";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ActaPorCorregirBean} from "../../../model/actaPorCorregirBean";
import {FormBuilder, FormGroup} from "@angular/forms";
import {DialogoConfirmacionComponent} from "../dialogo-confirmacion/dialogo-confirmacion.component";
import {
  PopMensajeDataGenericaComponent
} from "../../shared/pop-mensaje-data-generica/pop-mensaje-data-generica.component";
import {PopMensajeDataGenerica} from "../../../interface/popMensajeDataGenerica.interface";
import {Router} from "@angular/router";
import {MessageActasCorregirService} from "../../../message/message-actas-corregir.service";
import {firstValueFrom} from "rxjs";
import {IconPopType} from '../../../model/enum/iconPopType';
import {AgrupolPorCorregirBean} from '../../../model/agrupolPorCorregirBean';
import {VotoPreferencialPorCorregirBean} from '../../../model/votoPreferencialPorCorregirBean';
import {UtilityService} from '../../../helper/utilityService';
import {AlineacionType} from '../../../model/enum/alineacionType';

@Component({
  selector: 'app-actas-corregir',
  templateUrl: './actas-corregir.component.html',
})

export class ActasCorregirComponent implements OnInit{


  destroyRef:DestroyRef = inject(DestroyRef);
  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;

  isShowInicio: boolean = true;
  isVerActa: boolean = false;
  listaActasPorCorregir: Array<ActasPorCorregirListBean> = [];
  nroMesaCompleto: string = "";
  actaSeleccionada: ActasPorCorregirListBean;
  indiceActaSeleccionada: number = 0;
  actaPorCorregirBean: ActaPorCorregirBean = new ActaPorCorregirBean();
  public formGroupInfoActa: FormGroup;
  displayedColumnsAgrupaciones: string[] = ['nro', 'organizacionPolitica', 'primeraDigitacion','segundaDigitacion','terceraDigitacion'];
  displayedColumnsCvas: string[] = ['detalle', 'primeraDigitacion','segundaDigitacion','terceraDigitacion'];
  tituloComponent = "Actas por corregir";
    constructor(public dialog: MatDialog,
                private readonly actasCorregirService: ActasCorregirService,
                private readonly formBuilder: FormBuilder,
                private readonly router: Router,
                private readonly messageActasCorregirService:MessageActasCorregirService,
                private readonly utilityService: UtilityService) {

      this.formGroupInfoActa = this.formBuilder.group({
        numMesaFormControl: [{value:'',disabled: true}],
        ubigeoFormControl: [{value:'',disabled: true}],
        electoresHabilesFormControl: [{value:'',disabled: true}]
      });
    }

    ngOnInit() {
      this.cargarDocumentos();
    }

  async cargarDocumentos() {
    await this.getListaActas();

    if (this.listaActasPorCorregir == null ){
      this.mensajePopup(this.tituloComponent, "Ocurrió un error interno para obtener la lista de actas por corregir.", IconPopType.ERROR);
      return;
    }

    if (this.listaActasPorCorregir.length === 0) {
      this.mensajePopup(this.tituloComponent, "No existen registros", IconPopType.ALERT);
      this.limpiarDatos();
      return;
    }

    if (this.listaActasPorCorregir.length > 1) {
      this.listaActasPorCorregir.sort(this.compararPorMesaCopia);
      this.router.navigate(['/main/actas-corregir/consulta']);
      this.isVerActa = false;
    }
  }

  compararPorMesaCopia(a: ActasPorCorregirListBean, b: ActasPorCorregirListBean){
    const ordenDigito = {A:1, B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13,N:14,O:15,P:16,Q:17,R:18,S:19,T:20,U:21,V:22,W:23,X:24,Y:25,Z:26};

    const ordenMesaA = Number(a?.mesa ?? '0');
    const ordenMesaB = Number(b?.mesa ?? '0');
    if (ordenMesaA !== ordenMesaB){
      return ordenMesaA - ordenMesaB;
    }

    const ordenCopiaA = Number(a?.copia ?? '0');
    const ordenCopiaB = Number(b?.copia ?? '0');
    if (ordenCopiaA !== ordenCopiaB) {
      return ordenCopiaA - ordenCopiaB;
    }

    const digitoA = ordenDigito[a?.digitoChequeo ?? ''] ?? 0;
    const digitoB = ordenDigito[b?.digitoChequeo ?? ''] ?? 0;
    return digitoA - digitoB;
  }

  limpiarDatos(){
      this.listaActasPorCorregir = [];
      this.actaPorCorregirBean = new ActaPorCorregirBean();
      this.actaSeleccionada= new ActasPorCorregirListBean();
      this.nroMesaCompleto="";
      this.indiceActaSeleccionada=0;
      this.isVerActa = false;
      this.isShowInicio = true;

  }

    async getListaActas(){
      try {
        this.listaActasPorCorregir = await firstValueFrom(this.actasCorregirService.obtenerActasPorCorregir());
        this.isShowInicio = false;
      }catch (error){
        console.error('Error al obtener lista de actas por corregir:',error);
        this.listaActasPorCorregir = null;
      }
    }

  verActa(acta: ActasPorCorregirListBean){
      this.utilityService.cerrarModalesMoviblesAbiertos();
      sessionStorage.setItem('loading','true');
    this.router.navigate(['/main/actas-corregir/consulta']);
    this.isVerActa = false;
      this.actaSeleccionada = acta;
      this.indiceActaSeleccionada = this.listaActasPorCorregir.findIndex(x=>
        x.mesa+x.copia+x.digitoChequeo==this.actaSeleccionada.mesa+this.actaSeleccionada.copia+this.actaSeleccionada.digitoChequeo);
      this.nroMesaCompleto = this.actaSeleccionada.mesa+this.actaSeleccionada.copia+this.actaSeleccionada.digitoChequeo;

    this.actasCorregirService.actasPorCorregirInfo(this.actaSeleccionada.actaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.actasPorCorregirInfoCorrecto.bind(this),
        error: this.actasPorCorregirInfoIncorrecto.bind(this)
      });
  }

  actasPorCorregirInfoCorrecto(response: ActaPorCorregirBean){
    sessionStorage.setItem('loading', 'false');
    this.actaPorCorregirBean = response;
    this.messageActasCorregirService.setDataActaPorCorregirBean(this.actaPorCorregirBean);
    this.isVerActa = true;

    const codigoEleccion = this.actaPorCorregirBean.acta.codigoEleccion;
    let rutaDestino = '/main/actas-corregir/';

    switch (codigoEleccion) {
      case Constantes.COD_ELEC_PRE:
        rutaDestino += 'presidencial';
        break;
      case Constantes.COD_ELEC_DIST:
        rutaDestino += 'distrital';
        break;
      case Constantes.COD_ELEC_REVOCATORIA:
        rutaDestino += 'revocatoria';
        break;
      default:
        rutaDestino += 'preferencial';
        break;
    }
    this.router.navigate([rutaDestino]);
  }

  actasPorCorregirInfoIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.router.navigate(['/main/actas-corregir/consulta']);
    this.isVerActa = false;
    this.mensajePopup(this.tituloComponent, "Ocurrió un error para obtener la información del acta.", IconPopType.ALERT);
  }

  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
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

  onEnterPress(index: number) {
    let inputs = this.inputRefs.toArray();
    if (index + 1 < inputs.length) {
      inputs[index + 1].nativeElement.focus();
    }
  }
  changeObservacion(i:number, event: any){
      const isChecked = event.checked;
    this.actaPorCorregirBean.observaciones[i].terceraDigitacion=isChecked?"SI":"NO";
  }

  validar3DigitacionAntesGuardar(){
    const hayPendientes = this.existenCamposSinDigitar();
    hayPendientes ? this.mostrarAlertaCamposSinDigitar() : this.validarActasPorCorregir();
  }

  private existenCamposSinDigitar(): boolean {
    for (const agrPol of this.actaPorCorregirBean.agrupacionesPoliticas) {
      if (this.requiereTerceraDigitacion(agrPol)) {
        return true;
      }
      if (agrPol.votosPreferenciales && Array.isArray(agrPol.votosPreferenciales)) {
        for (const votPref of agrPol.votosPreferenciales) {
          if (this.requiereTerceraDigitacion(votPref)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private mostrarAlertaCamposSinDigitar(): void{
    const primerInputPendiente = this.encontrarPrimerCasilleroSinDigitar();
    if(!primerInputPendiente){
      this.validarActasPorCorregir();
      return;
    }

    const mensaje = `Existen campos sin completar en la tercera digitación. ¿Desea continuar de todas formas?

    Haga clic en Sí para continuar.
    Haga clic en No para revisar el campo.`;

    this.utilityService.popupConfirmacion(null, mensaje, (confirmado: boolean) => {
        if (!confirmado) {
          this.focusearInput(primerInputPendiente.inputId);
          return;
        }
        this.validarActasPorCorregir();
      },
      {alineacion: AlineacionType.LEFT}
    );
  }

  private focusearInput(inputId: string): void {
    setTimeout(() => {
      const inputElement = document.getElementById(inputId);
      if (inputElement) {
        inputElement.focus();
        inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  private encontrarPrimerCasilleroSinDigitar():{inputId: string} | null {
    for (const [i, agrPol] of this.actaPorCorregirBean.agrupacionesPoliticas.entries()) {
      if (this.requiereTerceraDigitacion(agrPol)) {
        return { inputId: `mat-input-total-${i}` };
      }

      if (agrPol.votosPreferenciales && Array.isArray(agrPol.votosPreferenciales)) {
        for (const [j, votPref] of agrPol.votosPreferenciales.entries()) {
          if (this.requiereTerceraDigitacion(votPref)) {
            return { inputId: `mat-input-pref-${i}-${j}` };
          }
        }
      }
    }
    return null;
  }

  private requiereTerceraDigitacion(voto: AgrupolPorCorregirBean | VotoPreferencialPorCorregirBean): boolean{
    const tieneDigitacionesValidas = voto.primeraDigitacion !== "null" && voto.segundaDigitacion !== "null";
    const terceraDigitacionVacia = voto.terceraDigitacion === '';
    return tieneDigitacionesValidas && terceraDigitacionVacia;
  }

  obtenerTituloCabecera(indice: number): string {
    const titulos = [
      "SI",
      "NO",
      "VOTOS EN BLANCO",
      "VOTOS NULOS",
      "VOTOS IMPUGNADOS"
    ];

    return titulos[indice];
  }

  validarActasPorCorregir(){
    sessionStorage.setItem('loading','true');
    this.actasCorregirService.validarActaPorCorregir(this.actaSeleccionada.actaId,this.actaPorCorregirBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.validarActaPorCorregirCorrecto.bind(this),
        error: this.validarActaPorCorregirIncorrecto.bind(this)
      });
  }

  validarActaPorCorregirCorrecto(response: Array<string>){
    sessionStorage.setItem('loading','false');

    if (response.length>0){
      let popMensaje :PopMensajeDataGenerica<Array<string>>;
      popMensaje = {
        title:"Actas por corregir - Validación",
        mensaje:response,
        icon:IconPopType.ALERT,
        success:true
      }
      this.dialog.open(PopMensajeDataGenericaComponent<Array<string>>, {
        disableClose: true,
        data: popMensaje
      })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.confirmarGrabarActa();
          }
        });

    }else{
      this.confirmarGrabarActa();
    }
  }
  validarActaPorCorregirIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.tituloComponent, "Ocurrió un error interno al validar el acta. Vuelva a intentar.", IconPopType.ERROR);
  }

  confirmarGrabarActa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarActa();
        }
      });
  }


  grabarActa(){
    sessionStorage.setItem('loading','true');
    this.actasCorregirService.registrarActasPorCorregir(this.actaSeleccionada.actaId,this.actaPorCorregirBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.registrarActasPorCorregirCorrecto.bind(this),
        error: this.registrarActasPorCorregirIncorrecto.bind(this)
      });
  }

  registrarActasPorCorregirCorrecto(response: boolean){
    sessionStorage.setItem('loading','false');
      if (response){
        this.utilityService.cerrarModalesMoviblesAbiertos();
        let popMensaje :PopMensajeData= {
          title:this.tituloComponent,
          mensaje:"Se ejecutó correctamente.",
          icon:IconPopType.CONFIRM,
          success:true
        }
        this.dialog.open(PopMensajeComponent, {
          disableClose: true,
          data: popMensaje
        })
          .afterClosed()
          .subscribe((confirmado: boolean) => {
            if (confirmado) {

              this.siguienteActaAsync();
            }
          });
      }else{
        this.mensajePopup(this.tituloComponent, "Ocurrió un error al grabar el acta.", IconPopType.ALERT);
      }
  }

  async siguienteActaAsync(){
    await this.cargarDocumentos();
    if(this.listaActasPorCorregir.length!==0){
      let acta = this.siguienteActa();
      this.verActa(acta);
    }
  }

  siguienteActa(){
    if(this.indiceActaSeleccionada+1>this.listaActasPorCorregir.length){
      this.indiceActaSeleccionada=0;
    }
    return this.listaActasPorCorregir[this.indiceActaSeleccionada];
  }
  registrarActasPorCorregirIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup(this.tituloComponent, "Ocurrió un error interno al grabar el acta.", IconPopType.ERROR);
  }

  ignoreKeyPress(event: KeyboardEvent) {
    // No hacer nada, para cumplir con la recomendación de SonarQube
    event.preventDefault();
  }
  protected readonly Constantes = Constantes;

}
