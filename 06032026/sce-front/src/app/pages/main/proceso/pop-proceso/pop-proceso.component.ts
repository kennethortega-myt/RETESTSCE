import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ConfiguracionProcesoElectoralService} from "../../../../service-api/configuracion-proceso-electoral.service";
import {TipoEleccionService} from "../../../../service-api/tipo-eleccion.service";
import {IDatosGeneralResponse} from "../../../../interface/general.interface";
import {GeneralService} from "../../../../service/general-service.service";

import {PopListaProcesoComponent} from '../pop-lista-proceso/pop-lista-proceso.component';
import {Subject} from "rxjs";
import {PopAutorizacionComponent} from "../../puesta-cero/pop-autorizacion/pop-autorizacion.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {Login} from "../../../../model/login";
import {AuthService} from "../../../../service/auth-service.service";
import {AuthComponent} from "../../../../helper/auth-component";
import {Usuario} from "../../../../model/usuario-bean";
import {ElementRef, Renderer2 } from '@angular/core';
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {UtilityService} from '../../../../helper/utilityService';
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';
import {Constantes} from '../../../../helper/constantes';
import {Utility} from 'src/app/helper/utility';

@Component({

  selector: 'app-pop-proceso',
  templateUrl: './pop-proceso.component.html',
  styleUrls: ['./pop-proceso.component.scss']
})
export class PopProcesoComponent extends AuthComponent implements OnInit {

  botonGuardarDeshabilitado: boolean = false;
  private dataSubject = new Subject<any>();
  destroyRef: DestroyRef = inject(DestroyRef);
  formGroupParent: FormGroup;
  tipoEleccionForm: FormGroup;
  principalEleccionForm: FormGroup;
  logo: string = '';
  imagenSeleccionado: any;
  fileSeleccionado: any;
  listTipoEleccion: Array<IDatosGeneralResponse> = [];
  botonCargar: boolean = true;
  login = new Login();
  destroy$: Subject<boolean> = new Subject<boolean>();
  private usuario: Usuario;
  btnFecha : boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PopProcesoComponent>, public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private configuracionProcesoService: ConfiguracionProcesoElectoralService,
    public formBuilder: FormBuilder,
    public utilityService: UtilityService,
    public tipoEleccionService: TipoEleccionService,
    public generalService: GeneralService,
    private authenticationService: AuthService,
    private el: ElementRef,
    private renderer: Renderer2) {
    super();
    this.formGroupParent = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      acronimo: ['', [Validators.required]],
      nombreEsquemaPrincipal: ['', [Validators.required]],
      nombreEsquemaBdOnpe: ['', [Validators.required]],
      nombreDbLink: ['', [Validators.required]],
      fechaCreacion: [{value: '', disabled: true}, [Validators.required]],
      fechaConvocatoria: [{value: '', disabled: true}, [Validators.required]],
      activo: 1
    });
    this.tipoEleccionForm = this.formBuilder.group({});
    this.principalEleccionForm = this.formBuilder.group({});
    this.disable("fechaCreacion");
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    if (this.data) {
      this.getListTipoEleccion(this.data.tipoEleccion);
      this.setValuesForm(this.data);
      if (this.data.isDetalle) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    }
  }

  getImageSource() {
    // Si hay una imagen seleccionada, se muestra su URL (temporal o definitiva), de lo contrario se usa el logo en base64
    if (this.imagenSeleccionado) {
      return this.logo;
    } else {
      return 'data:image/png;base64,' + this.logo;
    }
  }

  ngAfterViewChecked() {
    if (this.imagenSeleccionado) {
      this.logo = URL.createObjectURL(this.imagenSeleccionado);
    }
  }

  update() {
console.log(this.formGroupParent);
    if(this.formGroupParent.invalid){
      return;
    }
    if (!this.imagenSeleccionado) {
      this.imagenSeleccionado = Utility.dataURLtoFile('data:image/png;base64,' + this.logo, 'hello.png');
    }
    const dataToSend = {
      file: this.imagenSeleccionado,
      data: {...this.formGroupParent.getRawValue(), id: this.data.id, vigente: this.data.vigente}
    };
    console.log(this.imagenSeleccionado);
    // Emitir los datos sin cerrar el diálogo
    this.dataSubject.next(dataToSend);
    console.log(this.imagenSeleccionado);
  }

  disable(att: string) {
    this.formGroupParent.get(`${att}`)?.disable();
  }

  enable(att: string) {
    this.formGroupParent.get(`${att}`)?.enable();
  }

  async upload(data: any) {
    const MAX_FILE_SIZE =  100 * 1024;
    if (data.files) {
      const file = data.files[0];
      if (!file.type.startsWith('image/')) {
        await this.generalService.openDialogoGeneral({
          mensaje: "Solo se permiten archivos de imagen.",
          icon: "warn",
          title: TitlePop.INFORMATION,
          success: true
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        await this.generalService.openDialogoGeneral({
          mensaje: "El archivo es demasiado grande. El tamaño máximo permitido es 100 KB",
          icon: "warn",
          title: TitlePop.INFORMATION,
          success: true
        });
        return;
      }
      this.imagenSeleccionado = data.files[0];
      try {
        const result = await this.toBase64(file) as any;
        this.logo = result;
      } catch (error) {
        console.error(error);
        return;
      }
    }
  }

  toBase64 = (fileImg: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileImg);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  getListTipoEleccion(data?: IDatosGeneralResponse[]) {
    this.tipoEleccionService.list().subscribe(response => {
      if (response.success) {
        this.listTipoEleccion = response.data.filter(x => x.codigo !== null);
        for (let tipo of this.listTipoEleccion) {
          this.tipoEleccionForm.setControl(tipo.codigo, new FormControl(false, []));
          this.tipoEleccionForm.setControl("p" + tipo.codigo, new FormControl(false, []));
          this.tipoEleccionForm.get(tipo.codigo).disable();
          if (this.data.isDetalle) {
            this.tipoEleccionForm.get("p" + tipo.codigo).disable();
          }
          for (let tip of data) {
            if (tip.codigo == tipo.codigo) {
              this.tipoEleccionForm.get(tipo.codigo).setValue(true);
              if (tip.principal == 1) {
                this.tipoEleccionForm.get("p" + tipo.codigo).setValue(true);
              }
            }


          }
        }

      }
    })
  }

  updatePrincipal(data: any, event: MatSlideToggleChange) {
    console.log(data)
    if (!this.existeUnaEleccionPrincipal()) {
      this.generalService.openDialogoGeneral({
        mensaje: "Debe haber al menos una elección como principal.",
        icon: IconPopType.CONFIRM,
        title: TitlePop.INFORMATION,
        success: true
      });
      this.tipoEleccionForm.get("p" + data.codigo).setValue(!event.checked);
      return;
    }

    let msje = "La elección dejará de ser principal ¿Desea continuar?";
    if (event.checked) {
      msje = "La elección será principal ¿Desea continuar?";
    }
    const dialog = this.generalService.openDialogoGeneral({
      mensaje: msje,
      icon: IconPopType.ALERT,
      title: '',
      isQuestion: true,
      success: true
    });

    dialog.then(resp => {
      resp.afterClosed().subscribe(result => {
        if (result) {
          let idData = 0;
          for (let tip of this.data.tipoEleccion) {
            if (tip.codigo == data.codigo) {
              idData = tip.id;
              this.tipoEleccionForm.get("p" + tip.codigo).setValue(true);
            } else {
              this.tipoEleccionForm.get("p" + tip.codigo).setValue(false);
            }
          }
          this.configuracionProcesoService.updatePrincipal(this.formGroupParent.get("nombreEsquemaPrincipal").value, idData).subscribe(re => {
            if (re.success) {
              this.data.existePrincipal = true;
              this.generalService.openDialogoGeneral({
                mensaje: "Operación Exitosa",
                icon: IconPopType.CONFIRM,
                success: true,
                title: TitlePop.INFORMATION
              })
            } else {
              this.generalService.openDialogoGeneral({
                mensaje: "Ocurrio un error",
                icon: IconPopType.ERROR,
                success: true,
                title: TitlePop.ERROR
              })

            }
          })
        }else{
          this.tipoEleccionForm.get("p" + data.codigo).setValue( !this.tipoEleccionForm.get("p" + data.codigo).value);
        }
      })
    })
  }

  existeUnaEleccionPrincipal(): boolean {
    for (let tip of this.data.tipoEleccion) {
      if (this.tipoEleccionForm.get("p" + tip.codigo).getRawValue()) {
        return true;
      }
    }
    return false;
  }

 async cargarDatos() {
    if(this.data.etapa === 1){
   const response = await this.generalService.openDialogoGeneral({
        mensaje: "¿Desea actualizar la carga de datos?",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: true,
        isQuestion: true,
      });
   response.afterClosed().subscribe(result => {
     if (result) {
       this.ejecutarCargaData(true)
     }
   })
    }else{
      this.ejecutarCargaData(false)
    }

  }
 async ejecutarCargaData(isUpdate: boolean){
    sessionStorage.setItem("loading", "true");
    if(isUpdate){
      this.data.etapa =  0;
    }

    this.configuracionProcesoService.cargaDatos(this.data.id, this.formGroupParent.get("nombreEsquemaPrincipal").value,
      this.formGroupParent.get("nombreEsquemaBdOnpe").value, this.formGroupParent.get("nombreDbLink").value,
      this.formGroupParent.get("acronimo").value).subscribe(async (response) => {
      if (response.success) {
        sessionStorage.setItem("loading", "false");
        this.data.etapa =  1;
        await this.generalService.openDialogoGeneral({
          mensaje: "Se cargó la data correctamente.",
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });

      } else if(!response.success && response.message){
        sessionStorage.setItem("loading", "false");
        await this.generalService.openDialogoGeneral({mensaje:response.message,icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
      }else {
        sessionStorage.setItem("loading", "false");
        await this.generalService.openDialogoGeneral({
          mensaje: "Ocurrió un error al cargar la data.",
          icon: IconPopType.ERROR,
          title: TitlePop.INFORMATION,
          success: true
        });

      }
    }, error => {
      if(error && error.error){
        this.generalService.openDialogoGeneral({
          mensaje: error ? (error.error ? error.error.message: ""):"",
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: true
        });
      }else{
        this.generalService.openDialogoGeneral({
          mensaje: "Ocurrio un error en la carga de datos",
          icon: IconPopType.ERROR,
          success: true,
          title: TitlePop.ERROR
        })
      }
      sessionStorage.setItem("loading", "false");
    })
  }
  verificarAutorizacion() {
    if(!this.data.existePrincipal){
      this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar una elección principal",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: true
      });
      return;
    }
    const dialogRef = this.dialog.open(PopAutorizacionComponent, {
      disableClose: true,
      width: '400px',
      data: "Ingresar su clave para la carga de usuarios."
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.success) {
        this.login.username = this.usuario.nombre.toUpperCase();
        this.login.password = result.claveAutorizacion;
        this.authenticationService.getToken( this.login)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.cargarUsuario.bind(this),
            error: this.autorizacionIncorrecto.bind(this)
          });
        }
    });

  }

  verificarAutorizacionCarga() {

    const dialogRef = this.dialog.open(PopAutorizacionComponent, {
      disableClose: true,
      width: '400px',
      data: "Ingresar su clave para la carga de datos."
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.success) {
        this.login.username = this.usuario.nombre.toUpperCase();
        this.login.password = result.claveAutorizacion;
        this.authenticationService.getToken( this.login)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.cargarDatos.bind(this),
            error: this.autorizacionIncorrecto.bind(this)
          });
      }
    });

  }


  async autorizacionIncorrecto(response: any) {
    await this.generalService.openDialogoGeneral({mensaje:response,icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
  }

  cargarUsuario() {
    sessionStorage.setItem("loading", "true");
    this.configuracionProcesoService.cargarUsuarios(this.formGroupParent.get("acronimo").value, this.login.password).subscribe(response => {
      if (response.success) {
        this.generalService.openDialogoGeneral({
          mensaje: "Carga exitosa",
          icon: IconPopType.CONFIRM,
          success: true,
          title: TitlePop.INFORMATION
        })
      }else if(!response.success && response.message){
        sessionStorage.setItem("loading", "false");
         this.generalService.openDialogoGeneral({mensaje:response.message,icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
      }
      sessionStorage.setItem("loading", "false");
    }, error => {
      if(error && error.error){
        this.generalService.openDialogoGeneral({
          mensaje: error ? (error.error ? error.error.message: ""):"",
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: true
        });
      }else{
        this.generalService.openDialogoGeneral({
          mensaje: "Ocurrio un error al cargar usuarios",
          icon: IconPopType.ERROR,
          success: true,
          title: TitlePop.ERROR
        })
      }

      sessionStorage.setItem("loading", "false");
    })
  }

  openModalDetEscrutinio(data: any): void {

    sessionStorage.setItem("loading", "true");
    this.configuracionProcesoService.listTipoEleccionEscrutinio(this.formGroupParent.get("nombreEsquemaPrincipal").value, data.id).subscribe(response => {
      sessionStorage.setItem("loading", "false");
      if (response.success) {
        if (response.data.length > 0) {

          const dialogRef = this.dialog.open(PopListaProcesoComponent, {
            width: '649px', // Ancho del modal
            data: {nombreProceso: this.data.nombre, lista: response.data}
          });
          dialogRef.afterClosed().subscribe(res => {
            if (res.success) {
              sessionStorage.setItem("loading", "true");
              this.configuracionProcesoService.updateTipoDocumentoEscrutinio(res.data, this.formGroupParent.get("acronimo").value).subscribe(respDet => {
                sessionStorage.setItem("loading", "false");
                if (respDet.success) {
                  this.generalService.openDialogoGeneral({
                    mensaje: "Se actualizo de forma exitosa",
                    icon: IconPopType.CONFIRM,
                    success: true,
                    title: TitlePop.INFORMATION
                  })

                }
              }, error => {
                console.error(error.error);
                this.generalService.openDialogoGeneral({
                  mensaje: "Ocurrio un error al actualizar los datos",
                  icon: IconPopType.ERROR,
                  success: true,
                  title: TitlePop.ERROR
                })
                sessionStorage.setItem("loading", "false");
              })
            }
          })
        } else {
          this.generalService.openDialogoGeneral({
            mensaje: "Tipo elección no cuenta con ubigeos para actas horizontales",
            icon: IconPopType.ALERT,
            success: true,
            title: TitlePop.INFORMATION
          })
        }
      }

    }, error => {
      sessionStorage.setItem("loading", "false");
    })


  }

  async cargarFile(data: any) {
    if (data.files) {
      this.fileSeleccionado = data.files[0];
    }
  }

  setValuesForm(data: any) {
    this.logo = data.logo;

    this.formGroupParent.get("nombre")?.setValue(data.nombre);
    this.formGroupParent.get("acronimo")?.setValue(data.acronimo);
    this.formGroupParent.get("nombreEsquemaPrincipal")?.setValue(data.nombreEsquemaPrincipal);
    this.formGroupParent.get("nombreEsquemaBdOnpe")?.setValue(data.nombreEsquemaBdOnpe);
    this.formGroupParent.get("nombreDbLink").setValue(data.nombreDbLink);
    this.formGroupParent.get("fechaConvocatoria")?.setValue(data.fechaConvocatoria);
    this.formGroupParent.get("fechaCreacion")?.setValue(data.fechaConvocatoria);
  }

  disableForm() {
    // this.disable("nombre");
    // this.disable("acronimo");
    // this.disable("nombreEsquemaPrincipal");
    this.disable("nombreEsquemaBdOnpe");
    this.disable("nombreDbLink");
    this.disable("fechaConvocatoria");
    this.botonCargar = true;
    const archivoLogo = this.el.nativeElement.querySelector('#archivoLogo');
    if (archivoLogo) {
      this.renderer.setStyle(archivoLogo, 'display', 'none');
    }
    this.botonGuardarDeshabilitado = true;
    this.btnFecha = true;
  }

  enableForm() {
    this.enable("nombre");
    this.enable("acronimo");
    this.enable("nombreEsquemaPrincipal");
    this.enable("nombreEsquemaBdOnpe");
    this.enable("nombreDbLink");
  //  this.enable("fechaConvocatoria");
    this.botonCargar = false;
    this.btnFecha = false;
  }

  getDataObservable() {
    return this.dataSubject.asObservable();
  }
}


