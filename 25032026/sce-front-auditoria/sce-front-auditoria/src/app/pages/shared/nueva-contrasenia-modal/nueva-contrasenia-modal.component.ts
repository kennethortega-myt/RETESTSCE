import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { AuthService } from 'src/app/service/auth-service.service';
import { passwordSeguroValidator } from 'src/app/validators/password-seguro.validator';
import { ValidacionContraseniaComponent } from '../validacion-contrasenia/validacion-contrasenia.component';

@Component({
  selector: 'app-nueva-contrasenia-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ValidacionContraseniaComponent,
  ],
  templateUrl: './nueva-contrasenia-modal.component.html',
  styleUrl: './nueva-contrasenia-modal.component.scss',
})
export class NuevaContraseniaModalComponent implements AfterViewInit {
  readonly isLoading = signal(false);
  readonly hideNueva = signal(true);
  readonly hideConfirmar = signal(true);
  readonly mensajeError = signal<string>(undefined);
  private readonly fb = inject(FormBuilder);
  private readonly authenticationService = inject(AuthService);
  private readonly utilityService = inject(UtilityService);
  private readonly dialogRef = inject(
    MatDialogRef<NuevaContraseniaModalComponent>,
  );
  readonly form = this.fb.group({
    nuevaContrasena: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        passwordSeguroValidator(),
      ],
    ],
    confirmarContrasena: ['', Validators.required],
  });
  @ViewChild('nuevaContrasenaInput')
  public readonly nuevaContrasenaInput!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    setTimeout(() => this.nuevaContrasenaInput.nativeElement.focus());
  }

  actualizarContrasenia(): void {
    if (this.form.invalid) {
      const nuevaContrasenaControl = this.form.controls['nuevaContrasena'];
      if (nuevaContrasenaControl?.hasError('required')) {
        this.mensajeError.update(() => 'La nueva contraseña es requerida.');
      } else if (nuevaContrasenaControl?.hasError('minlength')) {
        this.mensajeError.update(
          () => 'La contraseña debe tener al menos 8 caracteres.',
        );
      } else if (nuevaContrasenaControl?.hasError('passwordStrength')) {
        this.mensajeError.update(
          () =>
            'Use una contraseña segura: con mayúsculas, minúsculas, números y un carácter especial.',
        );
      } else {
        this.mensajeError.update(
          () => 'Por favor, complete todos los campos correctamente.',
        );
      }
      return;
    }

    if (
      this.form.controls['nuevaContrasena'].value !==
      this.form.controls['confirmarContrasena'].value
    ) {
      this.mensajeError.update(() => 'Las contraseñas nuevas no coinciden.');
      return;
    }

    const cambiarConta = {
      claveNueva: this.form.get('nuevaContrasena').value,
      confirmaClaveNueva: this.form.get('confirmarContrasena').value,
    };
    this.isLoading.update(() => true);
    sessionStorage.setItem('loading', 'true');
    this.authenticationService.nuevaContrasenia(cambiarConta).subscribe({
      next: (res) => {
        if (!res.success) {
          this.mensajeError.update(() => res.message);
          return;
        }

        this.utilityService.mensajePopupCallback(
          '',
          res.message,
          IconPopType.CONFIRM,
          () => {
            this.dialogRef.close();
          },
        );
      },
      error: (e) => {
        if (e instanceof HttpErrorResponse) {
          this.utilityService.mensajePopup(
            '',
            e.error.message,
            IconPopType.ERROR,
          );
        }
        this.isLoading.update(() => false);
        sessionStorage.setItem('loading', 'false');
      },
      complete: () => {
        this.isLoading.update(() => false);
        sessionStorage.setItem('loading', 'false');
      },
    });
  }

  toggleCampo(campo: 'actual' | 'nueva' | 'confirmar') {
    switch (campo) {
      case 'nueva':
        this.hideNueva.set(!this.hideNueva());
        break;
      case 'confirmar':
        this.hideConfirmar.set(!this.hideConfirmar());
        break;
    }
  }
}
