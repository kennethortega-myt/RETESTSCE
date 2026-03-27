import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, Inject, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { MaterialModule } from 'src/app/material/material.module';
import {AuthService} from "../../../service/auth-service.service";
import {CambiaContraseniaInputDto} from "../../../model/cambiaContrasenia";
import {finalize, first} from "rxjs";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {GeneralService} from "../../../service/general-service.service";
import { Login } from 'src/app/model/login';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import {IconPopType} from '../../../model/enum/iconPopType';
import { passwordSeguroValidator } from 'src/app/validators/password-seguro.validator';
import { ValidacionContraseniaComponent } from "../../shared/validacion-contrasenia/validacion-contrasenia.component";

@Component({
  selector: 'cambiar-contrasena',
  templateUrl: './cambiar-contrasena.component.html',
  styleUrl: './cambiar-contrasena.component.scss',
  imports: [
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatSuffix,
    MaterialModule,
    ReactiveFormsModule,
    ValidacionContraseniaComponent
],
  standalone: true
})
export class CambiarContrasenaComponent implements AfterViewInit {
  formulario: FormGroup;
  mensajeError: string | null = null;
  isLoading: boolean = false;

  destroyRef:DestroyRef = inject(DestroyRef);

  // Visibilidad individual por campo
  hideActual = signal(true);
  hideNueva = signal(true);
  hideConfirmar = signal(true);
  public generalService2 = inject(GeneralService);

  @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

  @ViewChild('actualContrasena')
  public readonly actualContrasena!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.actualContrasena.nativeElement.focus();
  }

  constructor(private readonly fb: FormBuilder,
              private readonly authenticationService: AuthService,
              private readonly dialogRef: MatDialogRef<CambiarContrasenaComponent>,
              private readonly generalService: GeneralService,
              @Inject(MAT_DIALOG_DATA) public data: {Usuario: string, Clave: string}
            ) {
    this.formulario = this.fb.group({
      actualContrasena: ['', Validators.required],
      nuevaContrasena: ['', [
        Validators.required,
        Validators.minLength(8),
        passwordSeguroValidator()
      ]],
      confirmarContrasena: ['', Validators.required]
    });
  }

  getTokenCorrecto(result:number){

    const cambiarConta: CambiaContraseniaInputDto = {claveActual: this.formulario.get('actualContrasena').value, claveNueva: this.formulario.get('nuevaContrasena').value};
    this.isLoading = true;
    sessionStorage.setItem("loading","true");
    this.authenticationService.cambiarContrasena(cambiarConta)
    .pipe(
        finalize(() => {
          this.isLoading = false;
          sessionStorage.setItem("loading", "false");
        })
    )
    .subscribe({
      next: (respuesta) => {
        if (respuesta.exito) {
          this.generalService2.cerrarSesion(this.authenticationService.currentUser()).pipe(first()).subscribe({
                      next: (value: GenericResponseBean<string>)=> {
                        this.authenticationService.cerrarSesion();
                        this.dialogRef.close(true);
                        this.generalService.openDialogoGeneral({
                          mensaje: "Vuelva a iniciar sesión para continuar.",
                          icon: IconPopType.CONFIRM,
                          success: true,
                          title: "Realizado"
                        })
                      },
                      error: (error) => {
                        this.authenticationService.logout();
                      }
                    })

        } else {
          this.mensajeError = respuesta.mensaje;
          this.generalService2.cerrarSesion(this.authenticationService.currentUser()).pipe(first()).subscribe({
            next: (value: GenericResponseBean<string>)=> {
              this.authenticationService.cerrarSesion();
            },
            error: (error) => {
              this.authenticationService.logout();
            }
          })
        }
      },
      error: (err) => {
        this.mensajeError = err.message;
      }
    });
  }

  getTokenIncorrecto(error: any){
    this.isLoading = false;
    sessionStorage.setItem("loading","false");
  }

  cambiarContrasena(): void {

    if (this.formulario.invalid) {
      const nuevaContrasenaControl = this.formulario.get('nuevaContrasena');

      if (nuevaContrasenaControl?.hasError('required')) {
        this.mensajeError = 'La nueva contraseña es requerida.';
      } else if (nuevaContrasenaControl?.hasError('minlength')) {
        this.mensajeError = 'La contraseña debe tener al menos 8 caracteres.';
      } else if (nuevaContrasenaControl?.hasError('passwordStrength')) {
        this.mensajeError = 'Use una contraseña segura: con mayúsculas, minúsculas, números y un carácter especial.';
      } else {
        this.mensajeError = 'Por favor, complete todos los campos correctamente.';
      }
      return;
    }

    const { nuevaContrasena, confirmarContrasena } = this.formulario.value;
    if (nuevaContrasena !== confirmarContrasena) {
      this.mensajeError = 'Las contraseñas nuevas no coinciden.';
      return;
    }

    if(this.data.Clave !== this.formulario.get('actualContrasena')?.value){
      this.mensajeError = 'Contraseña incorrecta.';
      return;
    }

    let login: Login = {
      username: this.data.Usuario,
      password: this.data.Clave
    };

    this.authenticationService.getToken( login)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: this.getTokenCorrecto.bind(this),
            error: this.getTokenIncorrecto.bind(this)
          });

  }

  toggleCampo(campo: 'actual' | 'nueva' | 'confirmar') {
    switch (campo) {
      case 'actual': this.hideActual.set(!this.hideActual()); break;
      case 'nueva': this.hideNueva.set(!this.hideNueva()); break;
      case 'confirmar': this.hideConfirmar.set(!this.hideConfirmar()); break;
    }
  }
}
