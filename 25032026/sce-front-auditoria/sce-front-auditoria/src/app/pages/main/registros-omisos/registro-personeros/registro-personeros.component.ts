import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {AuthComponent} from "../../../../helper/auth-component";
import {TableColumn} from "../../../../interface/tableColumn.interface";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GeneralService} from "../../../../service/general-service.service";
import {GenericResponseBean} from "../../../../model/genericResponseBean";
import {ProcesoElectoralResponseBean} from "../../../../model/procesoElectoralResponseBean";
import {IconPopType, TitlePop} from "../../../../model/enum/iconPopType";
import {UtilityService} from "../../../../helper/utilityService";
import {OrganizacionPoliticaService} from '../../../../service/organizacion-politica.service';
import {IComboResponse} from '../../../../interface/general.interface';
import {PersoneroService} from '../../../../service/personero.service';
import {IPersonero, IPersoneroRequest, IRegistroPersonero} from '../../../../interface/personero.interface';
import {PadronBean} from '../../../../model/padronBean';
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';
import {Usuario} from '../../../../model/usuario-bean';
import {VentanaEmergenteService} from '../../../../service/ventana-emergente.service';

@Component({
  selector: 'app-registro-personeros',
  templateUrl: './registro-personeros.component.html',
})
export class RegistroPersonerosComponent extends AuthComponent implements OnInit {
  listOrganizacionPolitica: Array<IComboResponse> = [];
  padron: PadronBean = {idPadron: 0, nombres: '', apellidoPaterno: '', apellidoMaterno: ''}
  displayedColumns: string[] = ['organizacion', 'documentoIdentidad', 'nombres', 'apellidos', 'Acciones'];
  listTipoFiltro: IComboResponse[] = [{id:1, descripcion: 'Normal/Observadas'}, {id:2, descripcion: 'No instaladas'}, {id:3, descripcion: 'Siniestradas/Extraviadas'}];
  public reprocesamientoControl: FormControl;

  filePngUrl: any;
  data: Array<IPersonero> = [];
  dataFiltrado: Array<IPersonero> = [];
  public tipoFiltroControl: FormControl;
  public addIndexColumn = true;
  public enableSorting = true;
  maxItems: number = 0;
  tituloComponente: string = "Registro de personeros";
  consultoPadron : boolean = false;
  private lastConsultedDni: string = '';


  columns: TableColumn[] = [
    {
      key: 'organizacion',
      label: 'Organizaciones políticas',
      width: '40%',
      headerAlign: 'center',
      cellAlign: 'left'
    },
    {
      key: 'documentoIdentidad',
      label: 'DNI',
      width: '10%',
      headerAlign: 'center',
      cellAlign: 'center'
    },
    {
      key: 'nombres',
      label: 'Nombres',
      width: '15%',
      headerAlign: 'center',
      cellAlign: 'left'
    },
    {
      key: 'apellidos',
      label: 'Apellidos',
      width: '25%',
      headerAlign: 'center',
      cellAlign: 'left'
    },
    {
      key: 'Acciones',
      label: 'Acciones',
      isAction: true,
      width: '5%',
      headerAlign: 'center',
      cellAlign: 'center',
      actions: [
        {
          icon: 'delete',
          emitEvent: true,  // Indica que este botón emite un evento
          class: 'material-icons color-blue cursor-pointer'
        },
      ]
    }
  ];

  // Datos para mostrar en la sección de información de mesa
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

  destroyRef: DestroyRef = inject(DestroyRef);

  public personerosForm: FormGroup;
  public procesoControl: FormControl;
  public isConsulta: boolean;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  private usuario: Usuario;
  public tituloAlert = "Registro de Personeros";
  tituloCombo: string = "Organización política"

  constructor(private fb: FormBuilder,
              private generalService: GeneralService,
              private organizacionPoliticaService: OrganizacionPoliticaService,
              private personeroService: PersoneroService,
              private verificacionActaService: VerificacionActaService,
              private utilityService: UtilityService,
              protected readonly ventanaEmergenteService: VentanaEmergenteService) {
    super();
    this.isConsulta = true;
    this.procesoControl = new FormControl<number>(0);
    this.tipoFiltroControl = new FormControl<number>(1);
    this.reprocesamientoControl = new FormControl<boolean>(false);
    this.listProceso = [];
    this.personerosForm = this.fb.group({
      org: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      apellidos: ['', []]
    });

  }

  ngOnInit() {

    this.usuario = this.authentication();
    if(this.usuario.acronimoProceso){
      this.tituloCombo = this.usuario.acronimoProceso.startsWith("CPR") ? "Autoridades" : this.tituloCombo;
    }
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerProcesosCorrecto.bind(this),
        error: this.obtenerProcesosIncorrecto.bind(this)
      });
    this.tipoFiltroControl?.valueChanges.subscribe(tipo => {
      if(tipo === 2 ){
        this.personerosForm.disable();
      }else{
        this.personerosForm.enable()
      }
    });

    this.personerosForm.get('dni')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(newDni => {

        if (this.consultoPadron && newDni !== this.lastConsultedDni) {
          this.personerosForm.get('apellidos').setValue('');
          this.consultoPadron = false;
          this.padron = this.initPadron();
        }
      });

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

  buscarHAPersoneros() {
    if (this.procesoControl.value.id == '0') {
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return;
    }

    this.cargarOrganizacionPolitica();
    this.personeroService.obtenerMesaRandom(this.procesoControl.value.id, this.tipoFiltroControl.value, this.reprocesamientoControl.value).subscribe(response => {
      if (response.success) {
        this.mesaInfo = response.data;
        this.isConsulta = false;
        if(this.mesaInfo.data && this.mesaInfo.data.length > 0) {
          this.data = this.mesaInfo.data.map(a=> this.mapearPersonero(a)) as any;
          this.dataFiltrado = this.data.filter(item=>item.activo === 1);
        }
        this.loadImageWhenVisible(this.mesaInfo.fileId);
      }else{
        this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
      }
    })
  }

  // Manejar el evento emitido desde la tabla
  onActionClicked(event: { action: string, element: any }) {
    if (event.action === 'delete') {
      this.eliminarPersonero(event.element);
    }

  }

  eliminarPersonero(elemento: any) {
    const index = this.data.indexOf(elemento);
    if (index > -1) {
      this.data[index].activo = 0;
      this.dataFiltrado = this.data.filter(item=>item.activo === 1);
      this.data = [...this.dataFiltrado];
    }
  }

 async agregarPersonero() {
    if (!this.personerosForm.get('org').value.descripcion) {
      this.generalService.openDialogoGeneral({
        mensaje: "Seleccione " + this.tituloCombo,
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }
    if (!this.personerosForm.get('dni').value || this.personerosForm.get('dni').value.length < 8) {
      this.generalService.openDialogoGeneral({
        mensaje: "Debe ingresar un DNI válido",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }

   if (!this.consultoPadron) {
     this.generalService.openDialogoGeneral({
       mensaje: "Debe consultar el dni registrado",
       icon: IconPopType.ALERT,
       title: TitlePop.INFORMATION,
       success: false
     });
     return;
   }

    if(this.maxItems <= this.data.length) {
      this.generalService.openDialogoGeneral({
        mensaje: "Ha alcanzando el número máximo de personeros que puede registrar",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }

    const filter = this.data.filter(per => per.documentoIdentidad === this.personerosForm.get('dni').value);
    if (filter.length > 0) {
      this.generalService.openDialogoGeneral({
        mensaje: "DNI ya se encuentra registrado",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      this.consultoPadron = false;
      this.lastConsultedDni = '';
      this.personerosForm.get('apellidos').setValue('');
      this.personerosForm.get('dni').setValue('');
      return;
    }

    const filter2 = this.data.filter(per => per.agrupacionPolitica.id === this.personerosForm.get('org').value.id);
   let mensaje = "Personero agregado correctamente";
    if (filter2.length > 0) {
      mensaje = "Ya existe un personero para esta autoridad. Aún así se permitirá el registro.";
    }
    let nuevoPersonero: IPersonero = {
      organizacion: this.personerosForm.get('org').value.descripcion,
      documentoIdentidad: this.personerosForm.get('dni').value,
      nombres: this.padron.nombres,
      apellidos: this.padron.apellidoPaterno + ' ' + this.padron.apellidoMaterno,
      agrupacionPolitica: this.personerosForm.get('org').value,
      apellidoPaterno: this.padron.apellidoPaterno,
      apellidoMaterno: this.padron.apellidoMaterno,
      mesa: {id: this.mesaInfo.mesaId, mesa: this.mesaInfo.mesa},
      activo: 1
    };
    this.data = [
      ...this.data,
      nuevoPersonero
    ];
   this.dataFiltrado = this.data.filter(item=>item.activo === 1);
    this.generalService.openDialogoGeneral({
      mensaje: mensaje,
      icon: IconPopType.CONFIRM,
      title: TitlePop.INFORMATION,
      success: true
    });
    this.personerosForm.reset();
    this.personerosForm.get('org').setValue('');
    this.padron = this.initPadron();
    this.consultoPadron = false;
    this.lastConsultedDni = '';
  }

  cargarOrganizacionPolitica() {
    this.organizacionPoliticaService.list().subscribe(response => {
      if (response.success) {
        this.listOrganizacionPolitica = response.data;
        this.maxItems = this.listOrganizacionPolitica.length + 1;
      }
    })
  }

  consultaPadron() {
    if(!this.personerosForm.get('dni').value || this.personerosForm.get('dni').value.length < 8) {
      return;
    }
    this.personeroService.consultaPadron(this.personerosForm.get('dni').value, this.mesaInfo.mesaId).subscribe(response => {
      if (response.success) {
        this.personerosForm.get('apellidos').setValue(response.data.nombres + ' ' + response.data.apellidoPaterno + ' ' + response.data.apellidoMaterno);
        this.padron = response.data;
        this.lastConsultedDni = this.personerosForm.get('dni').value;
      } else {
        this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: false
        });
        this.personerosForm.get('apellidos').setValue('');
        this.padron = this.initPadron();
      }
      this.consultoPadron = true;
    })
  }

  guardarInformacion() {
    sessionStorage.setItem('loading', 'true');
    const codMesa = this.mesaInfo.mesa;
    const request: IPersoneroRequest = {personeros: this.dataFiltrado, tipoFiltro: this.tipoFiltroControl.value, mesa: {id: this.mesaInfo.mesaId, mesa: this.mesaInfo.mesa}, actaId: this.mesaInfo.actaId, acronimoProceso: this.procesoControl.value.cacronimo}
    this.personeroService.save(request).subscribe(response => {
      if(response.success){
        this.generalService.openDialogoGeneral({
          mensaje: 'El registro para la mesa ' +  codMesa + ' se realizó con éxito.',
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: false
        });
        this.resetComponent(false);
        this.buscarHAPersoneros();
      }
      sessionStorage.setItem('loading', 'false');
    }, error => {
      sessionStorage.setItem('loading', 'false');
    })
  }
  async loadImageWhenVisible(fileId) {

    let imageBlob: Blob | null = null;
    if (fileId === null){
      imageBlob = await this.fetchImagen('../../../../../assets/img/personero_no.jpg');
    } else{
      imageBlob = await this.verificacionActaService.getFileV2(fileId as number);
    }

    this.filePngUrl = URL.createObjectURL(imageBlob);
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

  resetComponent(isSaltar: boolean) {
    if(isSaltar){
      try{
        this.personeroService.saltar(this.mesaInfo.mesaId).subscribe(resp=>{
          console.log("Se libero la mesa con exito");
          this.buscarHAPersoneros();
        })
      }catch (error){
        console.error(error);
      }
    }

    this.data = [];
    this.dataFiltrado = [];
    this.isConsulta = true;
    this.personerosForm.reset();
    this.personerosForm.get('org').setValue('');
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

  private initPadron(){
    return {idPadron: 0, nombres: '', apellidoPaterno: '', apellidoMaterno: ''};
  }

  private mapearPersonero(data:any){
    let nuevoPersonero: IPersonero = {
      id: data.id,
      organizacion: data.agrupacionPolitica.descripcion,
      documentoIdentidad: data.documentoIdentidad,
      nombres: data.nombres,
      apellidos: data.apellidoPaterno + ' ' + data.apellidoMaterno,
      agrupacionPolitica: data.agrupacionPolitica,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      mesa: data.mesa,
      activo: data.activo
    };
    return nuevoPersonero;
  }

  verImagenActa(): void {
    this.utilityService.abrirModalActaPorId(
      this.mesaInfo.actaId,
      this.tituloComponente,
      this.destroyRef
    );
  }

}
