import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {Usuario} from "../../../../model/usuario-bean";
import {AuthComponent} from "../../../../helper/auth-component";
import { FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {GeneralService} from "../../../../service/general-service.service";
import {UtilityService} from "../../../../helper/utilityService";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../../model/genericResponseBean";
import {IconPopType} from "../../../../model/enum/iconPopType";
import {VerificacionActaService} from "../../../../service/verificacion-acta.service";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {OmisosListaElectoresServices} from "../../../../service/omisos-lista-electores.services";
import {firstValueFrom} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ModalObservacionOmisosComponent} from "../modal-observacion-omisos/modal-observacion-omisos.component";
import {DialogoConfirmacionComponent} from "../../dialogo-confirmacion/dialogo-confirmacion.component";
import {VerificationLeSectionItemBean} from "../../../../model/verificationLeSectionItemBean";
import {VerificationLeBean} from "../../../../model/verificationLeBean";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {Constantes} from '../../../../helper/constantes';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-omisos-lista-electores',
  templateUrl: './omisos-lista-electores.component.html',
})
export class OmisosListaElectoresComponent extends AuthComponent implements OnInit {


  destroyRef:DestroyRef = inject(DestroyRef);
  public usuario: Usuario;
  public isConsulta: boolean;
  public procesoControl: FormControl;
  public listProceso: Array<ProcesoElectoralResponseBean>;

  public tituloAlert="Registro de electores omisos";

  public data: VerificationLeBean;

  isMesaNoInstalada : boolean = false;
  currentPage = 0; // Página actual
  pageSize: number = 10; // Tamaño de cada página (10 registros)
  loading = true; // Variable que maneja el estado del loader

  formGroupMesa: FormGroup;

  totalOmisos: number;
  paginasPorSeleccionar: string[];
  selectedPages = new Set<number>();
  selectedObservaciones = new Set<number>();
  public reprocesamientoControl: FormControl;
  tipoDenuncia = "";

  constructor(private readonly generalService: GeneralService,
              private readonly utilityService: UtilityService,
              private readonly verificacionActaService: VerificacionActaService,
              private readonly omisosListaElectoresServices: OmisosListaElectoresServices,
              private readonly sanitizer: DomSanitizer,
              public dialog: MatDialog,
              private readonly fb: FormBuilder) {
    super();
    this.isConsulta = true;
    this.procesoControl = new FormControl<number>(0);
    this.listProceso = [];
    this.totalOmisos = 0;
    this.paginasPorSeleccionar = [];
    this.data = new VerificationLeBean();
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

  buscarLEOmisos(){
    if (this.procesoControl.value=='0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return;
    }

    sessionStorage.setItem('loading','true');

    this.omisosListaElectoresServices.getRandomListaElectores(this.reprocesamientoControl.value, this.tipoDenuncia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getRandomListaElectoresCorrecto.bind(this),
        error: this.getRandomListaElectoresIncorrecto.bind(this)
      });

  }

  calculateOmisos(): number {
    let totalOmisos = 0;

    this.data.paginas.forEach((pagina) => {
      pagina.secciones.forEach((seccion) => {
        // Si asistioUser es null y asistioAutomatico es "2", es considerado omiso
        if (seccion.asistioUser === null && seccion.asistioAutomatico === "2" || seccion.asistioUser === "2" && seccion.asistioAutomatico === "2") {
          totalOmisos++;
        }
      });
    });

    return totalOmisos;
  }

  calcularPorSeleccionar(): number {
    let total = 0;
    this.paginasPorSeleccionar = [];

    this.data.paginas.forEach((pagina) => {
      pagina.secciones.forEach((seccion) => {
        // Si asistioUser es null y asistioAutomatico es "2", es considerado omiso
        if (seccion.asistioUser === null && (seccion.asistioAutomatico == null || seccion.asistioAutomatico === "0" || seccion.asistioAutomatico === "3")) {
          total++;
          this.paginasPorSeleccionar.push(pagina.pagina.toString())
        }
      });
    });


    return total;
  }

  getRandomListaElectoresCorrecto(response: GenericResponseBean<VerificationLeBean>){
    sessionStorage.setItem('loading','false');
    if (!response.success){
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }
    this.data = response.data;

    this.isConsulta = false;
    this.tipoDenuncia = this.data.estadoLe;
    if(this.data.estadoMesa == Constantes.CE_ESTADO_MESA_NO_INSTALADA){
      this.isMesaNoInstalada = true;
      this.totalOmisos = this.data.electoresHabiles;
      this.utilityService.mensajePopup(this.tituloAlert, "La mesa "+this.data.mesa + ", ha sido declarada como no instalada. No existen imágenes disponibles, al REGISTRAR se registrarán " +
        "todos los electores hábiles como omisos.", IconPopType.ALERT);
    }else {
      this.isMesaNoInstalada = false;
      this.totalOmisos = this.calculateOmisos();
    }
    if(this.tipoDenuncia == Constantes.DENUNCIA_COD_TIPO_PERDIDA_PARCIAL){
      this.utilityService.mensajePopup(this.tituloAlert, "La lista de electores de la mesa "+this.data.mesa + " presenta pérdida parcial, los electores de las páginas perdidas se considerarán como asistentes.", IconPopType.ALERT);
    }else if(this.tipoDenuncia == Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL){
      this.utilityService.mensajePopup(this.tituloAlert, "La lista de electores de la mesa "+this.data.mesa + " presenta pérdida total, al registrar se considerarán a todos los electores como asistentes.", IconPopType.ALERT);
    }

    this.formGroupMesa.get('electoresHabiles').setValue(this.data.electoresHabiles);
    this.formGroupMesa.get('electoresAusentes').setValue(this.data.electoresAusentes);
    this.formGroupMesa.get('departamento').setValue(this.data.departamento);
    this.formGroupMesa.get('provincia').setValue(this.data.provincia);
    this.formGroupMesa.get('distrito').setValue(this.data.distrito);
    this.formGroupMesa.get('localVotacion').setValue(this.data.localVotacion);

    this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));
    this.selectedPages.add(this.currentPage);

  }



  getRandomListaElectoresIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener la lista de electores omisos.", IconPopType.ERROR);
  }

  // Cargar imágenes para la página actual
  async loadPage(pageIndex: number): Promise<void> {
    const page = this.data.paginas[pageIndex];

    if (!page) return; // Salir temprano si la página no existe

    sessionStorage.setItem('loading', 'true');

    // Función auxiliar para procesar un archivo
    const processFile = async (file: any): Promise<SafeUrl> => {
      if (file === null || file === undefined) {
        return this.sanitizer.bypassSecurityTrustUrl('');
      }
      try {
        if(file == -1){
          const imageUrl = this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL ||
          this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_PARCIAL?
            'assets/img/le/le_pagina_perdida.jpg' : 'assets/img/le/le_no_disponible.jpeg';
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const objectURL = URL.createObjectURL(blob);
          return this.sanitizer.bypassSecurityTrustUrl(objectURL || '');
        }else{
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

    // Procesar archivo de observación si no está definido
    if (!page?.archivoObservacionPng) {
      page.archivoObservacionPng = await processFile(page.archivoObservacion);
    }

    // Procesar archivos de secciones
    await Promise.all(
      page.secciones.map(async (seccion, j) => {
        if (!seccion?.archivoSeccionPng) {
          page.secciones[j].archivoSeccionPng = await processFile(seccion.archivoSeccion);
        }
      })
    );

    sessionStorage.setItem('loading', 'false');
  }

  // Cambiar de página
  changePage(direction: string): void {
    if (direction === 'next' && this.currentPage < this.getTotalPages() - 1) {
      this.currentPage++;
      this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));
      this.selectedPages.add(this.currentPage);
    } else if (direction === 'prev' && this.currentPage > 0) {
      this.currentPage--;
      this.loadPage(this.currentPage).catch(error => console.error('Error al cargar página:', error));
    }
  }

  // Obtener el total de páginas
  getTotalPages(): number {
    return this.data.paginas.length;
  }

  rechazarOmisosLE(){
    this.dialog
      .open(DialogoConfirmacionComponent, {
        data: `¿Desea rechazar la lista de electores?`
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          sessionStorage.setItem('loading','true');
          this.omisosListaElectoresServices.rechazarListaElectores(this.data.mesaId)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: this.rechazarListaElectoresCorrecto.bind(this),
              error: this.rechazarListaElectoresIncorrecto.bind(this)
            });
        }
      });
  }

  rechazarListaElectoresCorrecto(response: GenericResponseBean<boolean>){
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
          this.buscarLEOmisos();
        }
      });
  }

  rechazarListaElectoresIncorrecto(error: any){
    sessionStorage.setItem('loading','false');
    let mensaje = this.utilityService.manejarMensajeError(error)
    this.utilityService.mensajePopup(this.tituloAlert, mensaje, IconPopType.ALERT);
  }

  registrarOmisosLE(){
    console.log("registrarOmisosLE");
    if(!this.isMesaNoInstalada){
      if(!this.data.paginas[this.currentPage].tipoDenuncia ||
        this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_PARCIAL){
         if(!this.requisitosMinimosParaGrabar()) return;
      }
    }
    this.confirmarGrabarActa();
  }

  requisitosMinimosParaGrabar() :boolean{
    if (this.calcularPorSeleccionar()!=0){
      this.utilityService.mensajePopup(this.tituloAlert, "Número de página pendiente por seleccionar: "+this.paginasPorSeleccionar.join(", "), IconPopType.ALERT);
      return false;
    }

    const paginasFaltante = this.obtenerPaginasFaltantes();
    if (paginasFaltante.length > 0){
      this.utilityService.mensajePopup(this.tituloAlert, " Falta por revisar las siguientes páginas: "+paginasFaltante.join(", "), IconPopType.ALERT);
      return false;
    }

    return true;
  }

  obtenerPaginasFaltantes(): number[] {
    const paginasFaltantes: number[] = [];
    for (let i = 0; i < this.getTotalPages(); i++) {
      if (!this.selectedPages.has(i)) {
        paginasFaltantes.push(i+1);
      }
    }
    return paginasFaltantes;
  }

  confirmarGrabarActa(): void {


    if(this.totalOmisos == this.data.electoresAusentes){
      this.dialog
        .open(DialogoConfirmacionComponent, {
          data: `¿Está seguro de continuar?`
        })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.grabarOmisosLE();
          }
        });
    }else{
      this.dialog
        .open(DialogoConfirmacionComponent, {
          data: `La cantidad de omisos de la LE, no coincide con la cantidad de electores Ausentes. ¿Está seguro de continuar?`
        })
        .afterClosed()
        .subscribe((confirmado: boolean) => {
          if (confirmado) {
            this.grabarOmisosLE();
          }
        });
    }

  }

  grabarOmisosLE(){
    let dataGuardar = structuredClone(this.data);
    dataGuardar.paginas.forEach((pagina) => {
      delete pagina.archivoObservacionPng;
      pagina.secciones.forEach((seccion) => {
        delete seccion.archivoSeccionPng;
      });
    });

    dataGuardar.electoresOmisos = this.totalOmisos;

    sessionStorage.setItem('loading','true');
    this.omisosListaElectoresServices.saveListaElectores(dataGuardar, this.reprocesamientoControl.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.saveListaElectoresCorrecto.bind(this),
        error: this.saveListaElectoresIncorrecto.bind(this)
      });

  }

  saveListaElectoresCorrecto(response: GenericResponseBean<boolean>){
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
          this.buscarLEOmisos();
        }
      });

  }

  resetarValoresDespuesDeProcesar(){
    this.isConsulta = true;
    this.data = new VerificationLeBean();
    this.currentPage = 0;
    this.totalOmisos = 0;
    this.selectedPages.clear();
    this.selectedObservaciones.clear();

  }

  saveListaElectoresIncorrecto(response: HttpErrorResponse){
    sessionStorage.setItem('loading','false');
    if (response.error?.message) {
      this.utilityService.mensajePopup(this.tituloAlert, response.error.message, IconPopType.ALERT);
    } else {
      this.utilityService.mensajePopup(this.tituloAlert, "No fue posible grabar la lista de electores omisos.", IconPopType.ERROR);
    }
  }

    // Método que maneja el clic en el botón "Asistió"
  marcarAsistio(seccion: VerificationLeSectionItemBean, seccionIndex: number): void {
    let asistioUser = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser;
    let asistioAutomatico = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioAutomatico;
    if (!asistioUser && asistioAutomatico == '1') {
      return;
    }

    if (asistioUser == '1') {
      return;
    }

    // Actualizar el objeto data para reflejar el cambio
    this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser = '1';

    if (asistioUser || asistioAutomatico == '2') {
      this.totalOmisos--;
    }

  }

// Método que maneja el clic en el botón "No Asistió"
  marcarNoAsistio(seccion: VerificationLeSectionItemBean, seccionIndex: number): void {
    let asistioUser = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser;
    let asistioAutomatico = this.data.paginas[this.currentPage].secciones[seccionIndex].asistioAutomatico;

    if (!asistioUser && asistioAutomatico == '2') {
      return;
    }

    if (asistioUser == '2') {
      return;
    }

    // Actualizar el objeto data para reflejar el cambio
    this.data.paginas[this.currentPage].secciones[seccionIndex].asistioUser = '2';

    this.totalOmisos++;
  }

  // Método para determinar la clase del botón "Asistió"
  getClaseAsistio(seccion: VerificationLeSectionItemBean): string {

    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;

    if (this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_TOTAL || this.data.paginas[this.currentPage].tipoDenuncia === Constantes.DENUNCIA_COD_TIPO_PERDIDA_PARCIAL) {
      return 'btn_asistio_perdido activo';
    }
    if (asistioUser === '1') {
      return 'btn_asitio activo'; // Si asistioUser es 1, el botón está activo
    }
    if (asistioUser === null) {
      // Dependiendo del valor de asistioAutomatico
      switch (asistioAutomatico) {
        case "0": return 'btn_asitio'; // Ninguno
        case "1": return 'btn_asitio activo'; // Asistió
        case "2": return 'btn_asitio'; // No asistió, pero el botón de "Asistió" no está activo
        case "3": return 'btn_asitio_2'; // Iletreado
      }
    }
    return 'btn_asitio'; // Valor por defecto
  }

  // Método para determinar la clase del texto botón "Asistió"
  getClaseTxtAsistio(seccion: VerificationLeSectionItemBean): string {

    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;
    if (asistioUser === '1') {
      return 'txt_btn_asistencia p_txt_asistencia'; // Si asistioUser es 1, el botón está activo
    }
    if (asistioUser === null) {
      // Dependiendo del valor de asistioAutomatico
      switch (asistioAutomatico) {
        case "0": return 'txt_btn_asistencia p_txt_asistencia'; // Ninguno
        case "1": return 'txt_btn_asistencia p_txt_asistencia'; // No asistió, pero el botón de "Asistió" no está activo
        case "2": return 'txt_btn_asistencia p_txt_asistencia'; // Asistió
        case "3": return 'txt_btn_asistencia_2 p_txt_asistencia'; // Iletreado
      }
    }
    return 'txt_btn_asistencia p_txt_asistencia'; // Valor por defecto
  }

  // Similar para "No Asistió"
  getClaseNoAsistio(seccion: VerificationLeSectionItemBean): string {
    const asistioUser = seccion.asistioUser;
    const asistioAutomatico = seccion.asistioAutomatico;

    if (asistioUser === '2') {
      return 'btn_no_asitio activo'; // Si asistioUser es 2, el botón está activo
    }
    if (asistioUser === null) {
      switch (asistioAutomatico) {
        case "0": return 'btn_no_asitio'; // Ninguno
        case "1": return 'btn_no_asitio'; // Asistió
        case "2": return 'btn_no_asitio activo'; // No asistió
        case "3": return 'btn_no_asitio'; // Iletreado
      }
    }
    return 'btn_no_asitio'; // Valor por defecto
  }


  openModal(): void {
    const dialogRef = this.dialog.open(ModalObservacionOmisosComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '1200px',
      maxWidth:'1200px',
      maxHeight: '90vh',
      disableClose: true,
      data: {
        pngImageUrlObservacionOmiso: this.data.paginas[this.currentPage].archivoObservacionPng ? this.data.paginas[this.currentPage].archivoObservacionPng : '',
        txtObservacionOmiso: this.data.paginas[this.currentPage].textoObservacionesUser ? this.data.paginas[this.currentPage].textoObservacionesUser : ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined && result.isBoton){
        this.selectedObservaciones.add(this.currentPage);
        this.data.paginas[this.currentPage].textoObservacionesUser = result.obs;
      }
    });
  }

    verObs(){
      this.selectedObservaciones.add(this.currentPage);
    }
}
