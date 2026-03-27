import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../../helper/auth-component";
import {Usuario} from "../../../../model/usuario-bean";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GeneralService} from "../../../../service/general-service.service";
import {UtilityService} from "../../../../helper/utilityService";
import {GenericResponseBean} from "../../../../model/genericResponseBean";
import {IconPopType} from "../../../../model/enum/iconPopType";
import {VerificationMmBean} from "../../../../model/verificationMmBean";
import {MatDialog} from "@angular/material/dialog";
import {OmisosHojaAsistenciaMmService} from "../../../../service/omisos-hoja-asistencia-mm.service";
import {VerificacionActaService} from "../../../../service/verificacion-acta.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {firstValueFrom, forkJoin} from "rxjs";
import {VerificationMmSectionItemBean} from "../../../../model/verificationMmSectionItemBean";
import {ModalObservacionOmisosComponent} from "../modal-observacion-omisos/modal-observacion-omisos.component";
import {DialogoConfirmacionComponent} from "../../dialogo-confirmacion/dialogo-confirmacion.component";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {PadronBean} from "../../../../model/padronBean";
import {Constantes} from "../../../../helper/constantes";
import {HttpErrorResponse} from '@angular/common/http';
import {OrcDetalleCatalogoEstructuraBean} from '../../../../model/orcDetalleCatalogoEstructuraBean';

@Component({
  selector: 'app-omisos-hoja-asistencia',
  templateUrl: './omisos-hoja-asistencia.component.html',
  styleUrls: ['./omisos-hoja-asistencia.component.css']
})
export class OmisosHojaAsistenciaComponent extends AuthComponent implements OnInit {

  destroyRef:DestroyRef = inject(DestroyRef);

  public usuario: Usuario;
  public isConsulta: boolean;
  public tipoRegistroMM: string;
  public procesoControl: FormControl;
  public listProceso: Array<ProcesoElectoralResponseBean>;

  public tituloAlert="Hoja de Asistencia de Miembros de Mesa";

  public data: VerificationMmBean;
  formGroupMesa: FormGroup;
  currentPage = 0; // Página actual
  totalOmisos: number;
  archivoSeccionPadron: number;
  dniPadron: string;
  flagObservacionSorteados: boolean;
  flagObservacionNoSorteados: boolean;
  isMesaNoInstalada : boolean = false;
  public reprocesamientoControl: FormControl;
  listTipoPerdidas: Array<OrcDetalleCatalogoEstructuraBean>;
  tipoPerdidaFC = new FormControl<OrcDetalleCatalogoEstructuraBean | null>(null);
  tipoDenuncia = "";
  constructor(private readonly generalService: GeneralService,
              private readonly utilityService: UtilityService,
              private readonly verificacionActaService: VerificacionActaService,
              private readonly omisosHojaAsistenciaMmService:OmisosHojaAsistenciaMmService,
              public dialog: MatDialog,
              private readonly sanitizer: DomSanitizer,
              private readonly fb: FormBuilder) {
    super();
    this.isConsulta = true;
    this.procesoControl = new FormControl<number>(0);
    this.listProceso = [];
    this.tipoRegistroMM = "";
    this.data = new VerificationMmBean();
    this.totalOmisos = 0;
    this.archivoSeccionPadron = 0;
    this.dniPadron= "";
    this.flagObservacionSorteados = false;
    this.flagObservacionNoSorteados = false;
    this.reprocesamientoControl = new FormControl<boolean>(false);

    this.formGroupMesa = this.fb.group({
      electoresHabiles: [{value:'',disabled: true}],
      electoresAusentes: [{value:'',disabled: true}],
      localVotacion: [{value:'',disabled: true}],
      ubigeo: [{value:'',disabled: true}],
      departamento: [{value:'',disabled: true}],
      provincia: [{value:'',disabled: true}],
      distrito: [{value:'',disabled: true}]
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();

    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });

    forkJoin({
      tiposPerdidas: this.generalService.obtenerDetCatalogoEstructura(
        "mae_tipo_perdida_det_otro_documento",
        "c_tipo_perdida"
      )
    }).subscribe({
      next: (res) => {
        sessionStorage.setItem('loading','false');
        this.listTipoPerdidas = res.tiposPerdidas.data;
      },
      error: (error) => {
        sessionStorage.setItem('loading','false');
        this.utilityService.manejarMensajeError(error);
      }
    });
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>){
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    this.listProceso = response.data;
  }

  obtenerProcesosIncorrecto(error: any){
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
  }

  onEnter(event: Event, archivoSeccion: number): void {
    const input = event.target as HTMLInputElement; // Obtiene el valor del input
    const dniValue = input.value.trim();
    if (dniValue.length!==8){
      this.utilityService.mensajePopup(this.tituloAlert, "El campo DNI debe tener 8 dígitos.", IconPopType.ALERT);
      input.value = "";
      return;
    }
    let dniSorteadoExiste = this.data.paginas[0].secciones.some(seccion => seccion.dni == dniValue)
    if (dniSorteadoExiste){
      this.utilityService.mensajePopup(this.tituloAlert, "El DNI ingresado pertenece a un miembro de mesa sorteado.", IconPopType.ALERT);
      input.value = "";
      return;
    }

    let dniNoSorteadoExiste = this.data.paginas[1].secciones.some(seccion => seccion.dni == dniValue)
    if (dniNoSorteadoExiste){
      this.utilityService.mensajePopup(this.tituloAlert, "El DNI ingresado ya está ingresado como miembro de mesa no sorteado.", IconPopType.ALERT);
      input.value = "";
      return;
    }
    this.archivoSeccionPadron = archivoSeccion;
    this.dniPadron = dniValue;
    this.omisosHojaAsistenciaMmService.consultaPadron(this.dniPadron, this.data.mesa, this.esMesaExtranjero(this.data.ubigeo))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.consultaPadronCorrecto.bind(this),
        error: (err) => {
          input.value = "";
          sessionStorage.setItem('loading','false');
          let mensaje=this.utilityService.manejarMensajeError(err);
          this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
        }
      });
  }

  consultaPadronCorrecto(response: GenericResponseBean<PadronBean>){
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      this.data.paginas[1].secciones.forEach(seccion => {
        if (seccion.archivoSeccion===this.archivoSeccionPadron){
          seccion.idPadron = null;
          seccion.nombres = "";
          seccion.apellidoPaterno= "";
          seccion.apellidoMaterno = "";
          seccion.dni = "";
        }
      })
      return;
    }

    this.data.paginas[1].secciones.forEach(seccion => {
      if (seccion.archivoSeccion===this.archivoSeccionPadron){
        seccion.idPadron = response.data.idPadron;
        seccion.nombres = response.data.nombres;
        seccion.apellidoPaterno= response.data.apellidoPaterno;
        seccion.apellidoMaterno = response.data.apellidoMaterno;
        seccion.dni = this.dniPadron;
      }
    })

  }

  buscarRegistoMM(){
    if (this.procesoControl.value=='0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return;
    }

    if(this.tipoPerdidaFC.value){
      this.tipoDenuncia = this.tipoPerdidaFC.value.codigoS;
    }

    sessionStorage.setItem('loading','true');

    this.omisosHojaAsistenciaMmService.getRandomMiembrosMesa(this.reprocesamientoControl.value, this.tipoDenuncia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getRandomMiembrosMesaCorrecto.bind(this),
        error: this.getRandomMiembrosMesaIncorrecto.bind(this)
      });
  }

  getRandomMiembrosMesaCorrecto(response: GenericResponseBean<VerificationMmBean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }
    this.data = response.data;

    this.isConsulta = false;

    if(this.data.estadoMesa == Constantes.CE_ESTADO_MESA_NO_INSTALADA){
      this.isMesaNoInstalada = true;
      this.totalOmisos = 9;
      this.utilityService.mensajePopup(this.tituloAlert, "La mesa "+this.data.mesa + ", ha sido declarada como no instalada. No existen imágenes disponibles, al REGISTRAR se registrarán " +
        "todos los miembros de mesa sorteados como omisos.", IconPopType.ALERT);

    } else {
      this.isMesaNoInstalada = false;
      this.totalOmisos = this.calculateOmisos();
    }

    if(this.tipoDenuncia == Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL){
      this.utilityService.mensajePopup(this.tituloAlert, "La hoja de asistencia de la mesa "+this.data.mesa + " presenta pérdida, los electores de las páginas perdidas se considerarán como asistentes.", IconPopType.ALERT);
    }

    this.tipoRegistroMM = 'hojaAsistenciaMM';

    this.formGroupMesa.get('electoresHabiles').setValue(this.data.electoresHabiles);
    this.formGroupMesa.get('electoresAusentes').setValue(this.data.electoresAusentes);
    this.formGroupMesa.get('departamento').setValue(this.data.departamento);
    this.formGroupMesa.get('provincia').setValue(this.data.provincia);
    this.formGroupMesa.get('distrito').setValue(this.data.distrito);
    this.formGroupMesa.get('localVotacion').setValue(this.data.localVotacion);

    this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));


  }

  calculateOmisos(): number {
    let totalOmisos = 0;

    this.data.paginas.forEach((pagina) => {
      pagina.secciones.forEach((seccion) => {
        if ((seccion.asistioUser === null || seccion.asistioUser === Constantes.COD_ASISTENCIA_NO_ASISTIO) &&
          seccion.asistioAutomatico === Constantes.COD_ASISTENCIA_NO_ASISTIO) {
          totalOmisos++;
        }
      });
    });

    return totalOmisos;
  }

  resetarValoresDespuesDeProcesar(){
    this.isConsulta = true;
    this.data = new VerificationMmBean();
    this.currentPage = 0;
    this.totalOmisos = 0;
    this.archivoSeccionPadron = 0;
    this.dniPadron= "";
    this.flagObservacionSorteados = false;
    this.flagObservacionNoSorteados = false;
  }

  async loadPage(pageIndex: number):Promise<void>{

    const page = this.data.paginas[pageIndex];

    if (!page) return;

    sessionStorage.setItem('loading', 'true');

    // Función auxiliar para procesar un archivo
    const processFile = async (file: any): Promise<SafeUrl> => {
      if (file === null || file === undefined || file === 'undefined') {
        const imageUrl = 'assets/img/mm/pagina_sin_sorteo.png';
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const objectURL = URL.createObjectURL(blob);
        return this.sanitizer.bypassSecurityTrustUrl(objectURL || '');
      }

      try {
        if(file == -1){
          const imageUrl = this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL ?
            'assets/img/mm/pagina_perdida.jpg' : 'assets/img/mm/mm_imagen_no_disponible.jpeg';
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          return this.sanitizer.bypassSecurityTrustUrl(objectURL || '');
        }
        else{
          const blob = await firstValueFrom(this.verificacionActaService.getFile(file));
          if (Array.isArray(blob)) {
            return this.sanitizer.bypassSecurityTrustUrl('');
          } else {
            const objectURL = URL.createObjectURL(blob);
            return this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }
        }
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
        return this.sanitizer.bypassSecurityTrustUrl('');
      }
    };

    //procesar archivo de observación
    if (!page?.archivoObservacionPng){
      page.archivoObservacionPng = await processFile(page.archivoObservacion);
    }

    //Procesar archivos de secciones
    await Promise.all(
      page.secciones.map(async (seccion, j)=>{
        if (!seccion?.archivoSeccionPng){
          page.secciones[j].archivoSeccionPng = await processFile(seccion.archivoSeccion);
        }
      })
    );

    sessionStorage.setItem('loading', 'false');
  }

  getRandomMiembrosMesaIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');

    if (response.error?.message) {
      console.log(response.error.message);
    } else {
      this.utilityService.mensajePopup("Hoja de Asistencia de Miembros de Mesa","No fue posible obtener la lista de miembros de mesa", IconPopType.ERROR);
    }
  }

  // Cambiar de página
  changePage(direction: string): void {
    if (!this.flagObservacionSorteados){
      this.utilityService.mensajePopup(this.tituloAlert, "Antes de continuar, revise las observaciones, por favor.", IconPopType.ALERT);
      return;
    }
    if (direction === 'next' && this.currentPage < 1) {
      this.currentPage++;
      this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));
    } else if (direction === 'prev' && this.currentPage > 0) {
      this.currentPage--;
      this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));
    }
  }

  // Método para determinar la clase del botón "Asistió"
  getClaseAsistio(seccion: VerificationMmSectionItemBean): string {

    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;

    if (this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL) {
      return 'btn_asistio_perdido activo'; // Si asistioUser es 1, el botón está activo
    }
    if (asistioUser === Constantes.COD_ASISTENCIA_ASISTIO) {
      return 'btn_asitio activo'; // Si asistioUser es 1, el botón está activo
    }
    if (asistioUser === null) {
      // Dependiendo del valor de asistioAutomatico
      switch (asistioAutomatico) {
        case Constantes.COD_ASISTENCIA_NINGUNO: return 'btn_asitio'; // Ninguno
        case Constantes.COD_ASISTENCIA_ASISTIO: return 'btn_asitio'; // Asistió
        case Constantes.COD_ASISTENCIA_NO_ASISTIO: return 'btn_asitio'; // No asistió, pero el botón de "Asistió" no está activo
        case Constantes.COD_ASISTENCIA_POR_CONFIRMAR: return 'btn_asitio_2'; // Iletreado
      }
    }
    return 'btn_asitio'; // Valor por defecto
  }

  // Método para determinar la clase del texto botón "Asistió"
  getClaseTxtAsistio(seccion: VerificationMmSectionItemBean): string {

    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;
    if (asistioUser === Constantes.COD_ASISTENCIA_ASISTIO) {
      return 'txt_btn_asistencia p_txt_asistencia'; // Si asistioUser es 1, el botón está activo
    }
    if (asistioUser === null) {
      // Dependiendo del valor de asistioAutomatico
      switch (asistioAutomatico) {
        case Constantes.COD_ASISTENCIA_NINGUNO: return 'txt_btn_asistencia p_txt_asistencia'; // Ninguno
        case Constantes.COD_ASISTENCIA_ASISTIO: return 'txt_btn_asistencia p_txt_asistencia'; // No asistió, pero el botón de "Asistió" no está activo
        case Constantes.COD_ASISTENCIA_NO_ASISTIO: return 'txt_btn_asistencia p_txt_asistencia'; // Asistió
        case Constantes.COD_ASISTENCIA_POR_CONFIRMAR: return 'txt_btn_asistencia_2 p_txt_asistencia'; // Iletreado
      }
    }
    return 'txt_btn_asistencia p_txt_asistencia'; // Valor por defecto
  }

  // Similar para "No Asistió"
  getClaseNoAsistio(seccion: VerificationMmSectionItemBean): string {
    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;

    if (asistioUser === Constantes.COD_ASISTENCIA_NO_ASISTIO) {
      return 'btn_no_asitio activo'; // Si asistioUser es 2, el botón está activo
    }
    if (asistioUser === null) {
      switch (asistioAutomatico) {
        case Constantes.COD_ASISTENCIA_NINGUNO: return 'btn_no_asitio'; // Ninguno
        case Constantes.COD_ASISTENCIA_ASISTIO: return 'btn_no_asitio'; // Asistió
        case Constantes.COD_ASISTENCIA_NO_ASISTIO: return 'btn_no_asitio activo'; // No asistió
        case Constantes.COD_ASISTENCIA_POR_CONFIRMAR: return 'btn_no_asitio'; // Iletreado
      }
    }
    return 'btn_no_asitio'; // Valor por defecto
  }

  // Método que maneja el clic en el botón "Asistió"
  marcarAsistio(seccion: VerificationMmSectionItemBean, seccionIndex: number): void {
    const paginaActual = this.data.paginas[this.currentPage].secciones[seccionIndex];
    const asistioUser = paginaActual.asistioUser;
    const asistioAutomatico = paginaActual.asistioAutomatico;

    // Validar si ya asistió
    if (this.esAsistenciaRegistrada(asistioUser, asistioAutomatico)) {
      return;
    }

    // Actualizar el estado de asistencia
    paginaActual.asistioUser = Constantes.COD_ASISTENCIA_ASISTIO;

    // Ajustar el contador de omisos
    this.ajustarTotalOmisos(asistioUser, asistioAutomatico);
  }

  // Método para verificar si la asistencia ya está registrada
  private esAsistenciaRegistrada(
    asistioUser: string | null,
    asistioAutomatico: string | null
  ): boolean {

    // Si el usuario ya fue evaluado, usar su valor
    if (asistioUser !== null) {
      return asistioUser === Constantes.COD_ASISTENCIA_ASISTIO;
    }

    // Si aún no fue evaluado, NO tomar automático todavía
    return false;
  }

// Método para validar duplicados en la segunda página
  private estaDuplicadoEnSegundaPagina(cargo: number): boolean {
    const seccionesSegundaPagina = this.data.paginas[1]?.secciones ?? [];
    switch (cargo) {
      case Constantes.CO_CARGO_MM_PRESIDENTE:
        return !!seccionesSegundaPagina[0]?.idPadron;
      case Constantes.CO_CARGO_MM_SECRETARIO:
        return !!seccionesSegundaPagina[1]?.idPadron;
      case Constantes.CO_CARGO_MM_TERCER_MIEMBRO:
        return !!seccionesSegundaPagina[2]?.idPadron;
      default:
        return false;
    }
  }

  // Método para ajustar el total de omisos
  private ajustarTotalOmisos(asistioUser: string, asistioAutomatico: string): void {
    if (asistioUser || asistioAutomatico === Constantes.COD_ASISTENCIA_NO_ASISTIO) {
      this.totalOmisos--;
    }
  }

// Método que maneja el clic en el botón "No Asistió"
  marcarNoAsistio(seccion: VerificationMmSectionItemBean, seccionIndex: number): void {
    const asistioUser = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser;
    const asistioAutomatico = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioAutomatico;

    if (!asistioUser && asistioAutomatico === Constantes.COD_ASISTENCIA_NO_ASISTIO) {
      return;
    }

    if (asistioUser === Constantes.COD_ASISTENCIA_NO_ASISTIO) {
      return;
    }

    // Actualizar el objeto data para reflejar el cambio
    this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser = Constantes.COD_ASISTENCIA_NO_ASISTIO;
    this.totalOmisos++;
  }

  openModal(): void {
    if (this.currentPage ===0){
      this.flagObservacionSorteados = true;
    }
    if (this.currentPage === 1){
      this.flagObservacionNoSorteados = true;
    }
    const dialogRef = this.dialog.open(ModalObservacionOmisosComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '1200px',
      maxWidth: '80vw',
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        pngImageUrlObservacionOmiso: this.data.paginas[this.currentPage].archivoObservacionPng ? this.data.paginas[this.currentPage].archivoObservacionPng : '',
        txtObservacionOmiso: this.data.paginas[this.currentPage].textoObservacionesUser ? this.data.paginas[this.currentPage].textoObservacionesUser : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result?.isBoton){
        this.data.paginas[this.currentPage].textoObservacionesUser = result.obs;
      }

    });
  }

  registrarOmisosMM(){
    if(!this.isMesaNoInstalada){
      if(this.data.paginas[this.currentPage].tipoDenuncia !== 'L'){
        if(!this.requisitosMinimosParaGrabar()) return;
      }
    }

    this.confirmarGrabarActa();
  }

  requisitosMinimosParaGrabar() :boolean{
    if (this.calcularPorSeleccionar()!=0){
      this.utilityService.mensajePopup(this.tituloAlert, "Pendientes por seleccionar", IconPopType.ALERT);
      return false;
    }
    if (!this.flagObservacionSorteados){
      this.utilityService.mensajePopup(this.tituloAlert, "Antes de continuar, revise las observaciones de la hoja de asistencia de miembros de mesa, por favor.", IconPopType.ALERT);
      return false;
    }
    if (!this.flagObservacionNoSorteados){
      this.utilityService.mensajePopup(this.tituloAlert, "Antes de continuar, revise las observaciones de la hoja de asistencia de miembros de mesa no sorteados, por favor.", IconPopType.ALERT);
      return false;
    }

    return true;
  }


  calcularPorSeleccionar(): number {

    let total = 0;

    this.data.paginas[0].secciones.forEach((seccion)=> {
      if (seccion.estado ==1 && seccion.asistioUser === null && (seccion.asistioAutomatico == null || seccion.asistioAutomatico == "1"  || seccion.asistioAutomatico === "0" || seccion.asistioAutomatico === "3")) {
        total++;
      }
    });

    return total;

  }

  onInputChange(event: Event, archivoSeccion: number): void {
    const input = event.target as HTMLInputElement;
    const dniValue = input.value.trim();

    if (dniValue.length !== 8) {
      // Si el valor del DNI no tiene exactamente 8 caracteres, limpiamos `seccion.dni`
      this.data.paginas[1].secciones.forEach(seccion => {
        if (seccion.archivoSeccion===archivoSeccion){
          seccion.idPadron = null;
          seccion.nombres = "";
          seccion.apellidoPaterno= "";
          seccion.apellidoMaterno = "";
          seccion.dni = "";
        }
      })

    }
  }

  confirmarRechazarActa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de rechazar para continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarRechazarMM();
        }
      });
  }

  confirmarGrabarActa(): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Está seguro de continuar?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.grabarOmisosMM();
        }
      });
  }

  grabarOmisosMM(){
    let dataGuardar = structuredClone(this.data);
    dataGuardar.paginas.forEach((pagina) => {
      delete pagina.archivoObservacionPng;
      pagina.secciones.forEach((seccion) => {
        delete seccion.archivoSeccionPng;
      });
    });

    dataGuardar.electoresOmisos = this.totalOmisos;

    sessionStorage.setItem('loading','true');
    this.omisosHojaAsistenciaMmService.saveMiembrosMesa(dataGuardar, this.reprocesamientoControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.saveMiembrosMesaCorrecto.bind(this),
        error: this.saveMiembrosMesaIncorrecto.bind(this)
      });
  }

  saveMiembrosMesaCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    let popMensaje :PopMensajeData= {
      title:this.tituloAlert,
      mensaje:response.message,
      icon:IconPopType.CONFIRM,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.resetarValoresDespuesDeProcesar();
          this.buscarRegistoMM();
        }
      });
  }

  saveMiembrosMesaIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');

    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloAlert, response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloAlert, "No fue posible grabar la lista de miembros de mesa.", IconPopType.ERROR);
    }

  }

  grabarRechazarMM(){
    sessionStorage.setItem('loading','true');
    this.omisosHojaAsistenciaMmService.rechazarMiembrosMesa(this.data.mesaId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.rechazarMiembrosMesaCorrecto.bind(this),
        error: this.rechazarMiembrosMesaIncorrecto.bind(this)
      });
  }

  rechazarMiembrosMesaCorrecto(response: GenericResponseBean<boolean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    let popMensaje :PopMensajeData= {
      title:this.tituloAlert,
      mensaje:"Se rechazó correctamente.",
      icon:IconPopType.CONFIRM,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          this.resetarValoresDespuesDeProcesar();
          this.buscarRegistoMM();
        }
      });
  }

  rechazarMiembrosMesaIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible rechazar la lista de miembros de mesa.", IconPopType.ERROR);
  }

  esMesaExtranjero(ubigeo: string): boolean{
    if(ubigeo===null || ubigeo === '' || ubigeo===undefined){
      return false;
    }
    return ubigeo.startsWith('9');
  }

}
