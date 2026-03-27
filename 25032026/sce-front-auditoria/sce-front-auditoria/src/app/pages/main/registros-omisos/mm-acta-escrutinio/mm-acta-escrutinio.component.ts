import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../../helper/auth-component";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GeneralService} from "../../../../service/general-service.service";
import {UtilityService} from "../../../../helper/utilityService";
import {GenericResponseBean} from "../../../../model/genericResponseBean";
import {IconPopType, TitlePop} from "../../../../model/enum/iconPopType";
import {MiembroMesaEscrutinioService} from '../../../../service/miembro-mesa-escrutinio.service';
import { IRegistroPersonero} from '../../../../interface/personero.interface';
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';
import {firstValueFrom} from 'rxjs';
import {IMiembroMesaEscrutinioRequest} from '../../../../interface/miembroMesaEscritunio.interface';
import {IComboResponse} from '../../../../interface/general.interface';

@Component({
  selector: 'app-mm-acta-escrutinio',
  templateUrl: './mm-acta-escrutinio.component.html',
})
export class MmActaEscrutinioComponent extends AuthComponent implements OnInit {

  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  public isConsulta: boolean;
  public procesoControl: FormControl;
  public reprocesamientoControl: FormControl;
  public tipoFiltroControl: FormControl;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  isPrimeraConsulta: boolean = false;
  filePngUrlPresidente: any;
  filePngUrlSecretario: any;
  filePngUrlTercerMiembro: any;
  formGroupParent: FormGroup;
  formGroupMiembros: FormGroup;
  existePresidente:boolean = false;
  existeSecretario:boolean = false;
  existeTercerMiembro:boolean = false;
  padronPresidente: any = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
  padronSecretario: any = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
  padronTercerMiembro: any = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
  listTipoFiltro: IComboResponse[] = [{id:1, descripcion: 'Normal/Observadas'}, {id:2, descripcion: 'No instaladas'}, {id:3, descripcion: 'Siniestradas/Extraviadas'}];
  dnis: Array<string> = [];
  dniP: string = null;
  dniS: string = null;
  dniT: string = null;
  idMee: number = 0;

  private readonly tituloAlert = "Registro de acta de escrutinio - Miembros de mesa";

  public mesaInfo: IRegistroPersonero = {
    mesa: '',
    departamento: '',
    mesaId: 0,
    distrito: '',
    electoresAusentes: 0,
    electoresHabiles: 0,
    electoresOmisos: 0,
    localVotacion: '',
    paginas: [],
    provincia: '',
    type: '',
    ubigeo: ''
  };

  constructor(
    private readonly generalService: GeneralService,
    private readonly utilityService: UtilityService,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly formBuilder: FormBuilder,
    private readonly miembroMesaEscrutinioService: MiembroMesaEscrutinioService,
  ) {
    super();
    this.isConsulta = true;
    this.procesoControl = new FormControl<number>(0);
    this.tipoFiltroControl = new FormControl<number>(1);
    this.reprocesamientoControl = new FormControl<boolean>(false);
    this.listProceso = [];
    this.formGroupParent = this.formBuilder.group({
      electoresHabiles: ['', []],
      electoresAusentes: ['', []],
      departamento: ['', []],
      provincia: ['', []],
      distrito: ['', []],
      localVotacion: ['', []]
    });
    this.formGroupMiembros = this.formBuilder.group({
      documentoIdentidadPresidente: ['', [Validators.required]],
      documentoIdentidadSecretario: ['', [Validators.required]],
      documentoIdentidadMiembro: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });

    this.formGroupMiembros.get('documentoIdentidadPresidente')?.valueChanges.subscribe(dni => {
      if (dni?.length === 8) {
        if(this.existeDuplicidad(dni)){
          this.padronPresidente = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
          return
        }
        this.dniP = dni;
        this.consultarDNI(dni, 1);
      }else{
        if (this.dniP) {
          this.eliminarDeDuplicados(this.dniP);
          this.dniP = null;
          this.padronPresidente = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};

        }
      }
    });
    this.formGroupMiembros.get('documentoIdentidadSecretario')?.valueChanges.subscribe(dni => {
      if (dni?.length === 8) {
        if(this.existeDuplicidad(dni)){
          this.padronSecretario = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
          return
        }
        this.dniS = dni;
        this.consultarDNI(dni, 2);
      }
      else{
        if (this.dniS) {
          this.eliminarDeDuplicados(this.dniS);
          this.dniS = null;
          this.padronSecretario = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};

        }
      }
    });
    this.formGroupMiembros.get('documentoIdentidadMiembro')?.valueChanges.subscribe(dni => {
      if (dni?.length === 8) {
        if(this.existeDuplicidad(dni)){
          this.padronTercerMiembro = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
          return
        }
        this.dniT = dni;
        this.consultarDNI(dni, 3);
      }else if (this.dniT) {
          this.eliminarDeDuplicados(this.dniT);
          this.dniT = null;
          this.padronTercerMiembro = {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
        }
    });
    this.tipoFiltroControl?.valueChanges.subscribe(tipo => {
      if(tipo === 2){
        this.formGroupMiembros.disable();
      }else{
        this.formGroupMiembros.enable();
      }
    });
  }


  verImagenActa(): void {
    this.utilityService.abrirModalActaPorId(
      this.mesaInfo.actaId,
      this.tituloAlert,
      this.destroyRef
    );
  }

  obtenerProcesosCorrecto(response: GenericResponseBean<Array<ProcesoElectoralResponseBean>>) {
    if (!response.success) {
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      return;
    }

    this.listProceso = response.data;
  }

  obtenerProcesosIncorrecto(error: any) {
    this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
  }

  buscarMME() {
    if (this.procesoControl.value.id == '0' || !this.procesoControl.value) {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return;
    }
    if(this.tipoFiltroControl.value === 2){
      this.formGroupMiembros.disable();
    }
    this.miembroMesaEscrutinioService.obtenerMesaRandom(this.procesoControl.value.id, this.tipoFiltroControl.value, this.reprocesamientoControl.value).subscribe(async response => {
      if (response.success) {
        this.mesaInfo = response.data;
        this.setDatosMesa(this.mesaInfo);
        this.isConsulta = false;
        this.disabledForm();
        if(this.mesaInfo.data){
          this.isPrimeraConsulta = true;
          this.idMee = this.mesaInfo.data[0].id;
          this.formGroupMiembros.get('documentoIdentidadPresidente').setValue(this.mesaInfo.data[0].documentoIdentidadPresidente);
          this.formGroupMiembros.get('documentoIdentidadMiembro').setValue(this.mesaInfo.data[0].documentoIdentidadTercerMiembro);
          this.formGroupMiembros.get('documentoIdentidadSecretario').setValue(this.mesaInfo.data[0].documentoIdentidadSecretario);
        }
       this.filePngUrlPresidente = await this.loadImagePresidente(this.mesaInfo.secciones.archivoPresidente.fileId);
        this.filePngUrlSecretario = await this.loadImagePresidente(this.mesaInfo.secciones.archivoSecretario.fileId);
        this.filePngUrlTercerMiembro = await this.loadImagePresidente(this.mesaInfo.secciones.archivoTercerMiembro.fileId);

      } else {
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      }
    })
  }

  async loadImagePresidente(fileId) {
    let imageBlob: Blob | null = null;
    if (fileId === null) {
      imageBlob = await this.fetchImagen('../../../../../assets/img/mme_no.jpg');
    }  else {
      imageBlob = await this.verificacionActaService.getFileV2(fileId as number);
    }
    return URL.createObjectURL(imageBlob);
  }

  private async fetchImagen(url: string): Promise<Blob> {
    try {
      const response = await fetch(url);
      return await response.blob();
    } catch (error) {
      console.error(`Error fetching image at ${url}`, error);
      return new Blob(); // Devuelve un Blob vacío en caso de error
    }
  }

  private setDatosMesa(data: IRegistroPersonero) {
    this.formGroupParent.get('electoresHabiles').setValue(data.electoresHabiles);
    this.formGroupParent.get('electoresAusentes').setValue(data.electoresAusentes);
    this.formGroupParent.get('departamento').setValue(data.departamento);
    this.formGroupParent.get('provincia').setValue(data.provincia);
    this.formGroupParent.get('distrito').setValue(data.distrito);
    this.formGroupParent.get('localVotacion').setValue(data.localVotacion);
  }

  disabledForm() {
    this.formGroupParent.disable();
  }

  async consultarDNI(dni: string, tipo: number) {
    const data = await this.consultarPadron(dni);
    const persona = data || this.initPersona();

    switch (tipo) {
      case 1:
        this.existePresidente = data !== null;
        this.padronPresidente = persona;
        break;
      case 2:
        this.existeSecretario = data !== null;
        this.padronSecretario = persona;
        break;
      case 3:
        this.existeTercerMiembro = data !== null;
        this.padronTercerMiembro = persona;
        break;
    }
  }

  async consultarPadron(dni: string): Promise<any> {
    try {
      const response = await firstValueFrom(this.miembroMesaEscrutinioService.consultaPadron(dni, this.mesaInfo.mesaId, this.isPrimeraConsulta));
      if (response.success) {
        return response.data;
      } else {
        this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: false
        });
        return null;
      }
    } catch (error) {
      this.generalService.openDialogoGeneral({
        mensaje: 'Error al consultar el padrón.',
        icon: IconPopType.ERROR,
        title: TitlePop.ERROR,
        success: false
      });
      console.error(error);
    }
  }

  initPersona() {
    return {nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
  }

  guardarInformacion() {

    if(this.formGroupMiembros.get('documentoIdentidadPresidente').value && !this.padronPresidente.idPadron){
      this.generalService.openDialogoGeneral({
        mensaje: 'Validar el número de DNI del presidente haya sido ingresado correctamente.',
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }

    if(this.formGroupMiembros.get('documentoIdentidadMiembro').value && !this.padronTercerMiembro.idPadron){
      this.generalService.openDialogoGeneral({
        mensaje: 'Validar el número de DNI del tercer miembro haya sido ingresado correctamente.',
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }

    if(this.formGroupMiembros.get('documentoIdentidadSecretario').value && !this.padronSecretario.idPadron){
      this.generalService.openDialogoGeneral({
        mensaje: 'Validar el número de DNI del secretario haya sido ingresado correctamente.',
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }


    const request: IMiembroMesaEscrutinioRequest = {
      id: this.idMee,
      mesa: {id: this.mesaInfo.mesaId, mesa: this.mesaInfo.mesa},
      documentoIdentidadPresidente: this.formGroupMiembros.get('documentoIdentidadPresidente').value,
      documentoIdentidadTercerMiembro: this.formGroupMiembros.get('documentoIdentidadMiembro').value,
      documentoIdentidadSecretario: this.formGroupMiembros.get('documentoIdentidadSecretario').value,
      tipoFiltro: this.tipoFiltroControl.value,
      actaId: this.mesaInfo.actaId,
      acronimoProceso: this.procesoControl.value.cacronimo
    }

    console.log('REQUEST:', request);

    if(this.tipoFiltroControl.value != 2 && (!request.documentoIdentidadPresidente || !request.documentoIdentidadSecretario || !request.documentoIdentidadTercerMiembro)){
      const dialog = this.generalService.openDialogoGeneral({
        mensaje: 'Ha ingresado menos de 3 miembros de mesa. ¿Está seguro que desea continuar?',
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        isQuestion: true,
        success: true
      });

      dialog.then(resp => {
        resp.afterClosed().subscribe(result => {
          if (result) {
            this.saveMme(request);
          }
        })
      })
    }else{
      this.saveMme(request);
    }


  }

  saveMme(request: IMiembroMesaEscrutinioRequest){
    sessionStorage.setItem('loading', 'true');
    const codmesa = this.mesaInfo.mesa;
    this.miembroMesaEscrutinioService.save(request).subscribe(response => {
      if (response.success) {
        this.generalService.openDialogoGeneral({
          mensaje: 'El registro para la mesa ' +  codmesa +' se realizó con éxito.',
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: false
        });
        this.resetComponent(false);
        this.buscarMME();
      }
      sessionStorage.setItem('loading', 'false');
    }, error=>{
      sessionStorage.setItem('loading', 'false');
      console.error(error);
    })
  }

  resetComponent(isSaltar:boolean) {
    if(isSaltar){
      try{
        this.miembroMesaEscrutinioService.saltar(this.mesaInfo.mesaId).subscribe(resp=>{
          this.buscarMME();
        })
      }catch (error){
        console.error(error);
      }
    }

    this.padronTercerMiembro = this.initPersona();
    this.padronPresidente = this.initPersona();
    this.padronSecretario = this.initPersona();
    this.isConsulta = true;
    this.formGroupMiembros.reset();
    this.formGroupParent.reset();
    this.idMee = 0;
    this.isPrimeraConsulta = false;
    this.dnis = [];
    this.mesaInfo = {
      mesa: '',
      departamento: '',
      mesaId: 0,
      distrito: '',
      electoresAusentes: 0,
      electoresHabiles: 0,
      electoresOmisos: 0,
      localVotacion: '',
      paginas: [],
      provincia: '',
      type: '',
      ubigeo: ''
    };
  }


  private existeDuplicidad(dni:string){
    if(this.dnis.includes(dni)){
      this.generalService.openDialogoGeneral({
        mensaje: 'Ya ingresó el dni ' + dni,
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return true;
    }
    this.dnis.push(dni);
    return false;
  }

  private eliminarDeDuplicados(dni: string): void {
    const index = this.dnis.indexOf(dni);
    if (index !== -1) {
      this.dnis.splice(index, 1);
    }
  }
}
