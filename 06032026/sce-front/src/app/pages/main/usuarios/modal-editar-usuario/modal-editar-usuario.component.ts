import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UtilityService } from 'src/app/helper/utilityService';
import {
  IUsuario,
  UsuarioSasa,
  UsuarioUpdateRequestData,
} from 'src/app/interface/usuario.interface';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { OrcDetalleCatalogoEstructuraBean } from 'src/app/model/orcDetalleCatalogoEstructuraBean';
import { UsuarioService } from 'src/app/service/usuario.service';
import { Constantes } from 'src/app/helper/constantes';

export type ModalEditarUsuarioComponentData = {
  usuario: IUsuario;
  usuarioSasa: UsuarioSasa | null;
  sasaMessage: string;
  perfiles: OrcDetalleCatalogoEstructuraBean[];
  tiposDocumento: OrcDetalleCatalogoEstructuraBean[];
};

@Component({
  selector: 'app-modal-editar-usuario',
  templateUrl: './modal-editar-usuario.component.html',
  styleUrl: './modal-editar-usuario.component.scss',
})
export class ModalEditarUsuarioComponent implements OnInit {
  private readonly lettersAndSpacesRegex = /[^\p{L} ]/gu;
  private readonly numericRegex = /\D+/g;

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly usuarioService: UsuarioService = inject(UsuarioService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly utilityService: UtilityService = inject(UtilityService);
  private readonly dialogRef: MatDialogRef<ModalEditarUsuarioComponent> =
    inject(MatDialogRef<ModalEditarUsuarioComponent>);
  public readonly data =
    inject<ModalEditarUsuarioComponentData>(MAT_DIALOG_DATA);

  public loading: boolean = false;
  public usuarioTitle: string = '';
  public maxtDocumentLength = 8;
  readonly userForm = this.fb.group({
    tipoDocumento: [Constantes.CATALOGO_TIPO_DOCUMENTO_DNI, [Validators.required]],
    documento: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(8)],
    ],
    apellidoPaterno: ['', [Validators.required, Validators.maxLength(100)]],
    apellidoMaterno: ['', [Validators.required, Validators.maxLength(100)]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    correo: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(100)],
    ],
    perfil: ['', [Validators.required]],
    activo: [1, [Validators.required]],
  });

  ngOnInit(): void {
    const usuario = this.data.usuario;
    this.usuarioTitle = usuario.usuario;
    this.userForm.controls.perfil.setValue(usuario.perfil);
    this.userForm.controls.perfil.disable();

    this.userForm.controls.tipoDocumento.setValue(usuario.tipoDocumento ?? Constantes.CATALOGO_TIPO_DOCUMENTO_DNI);
    this.userForm.controls.documento.setValue(usuario.documento);
    this.userForm.controls.apellidoPaterno.setValue(usuario.apellidoPaterno);
    this.userForm.controls.apellidoMaterno.setValue(usuario.apellidoMaterno);
    this.userForm.controls.nombres.setValue(usuario.nombres);
    this.userForm.controls.correo.setValue(usuario.correo);
    this.userForm.controls.activo.setValue(usuario.activo);

    this.initFormSanitize();
  }

  formIsDirty(): boolean {
    const usuario = this.data.usuario;
    if (
      usuario.apellidoPaterno ===
        this.userForm.controls.apellidoPaterno.value &&
      usuario.apellidoMaterno ===
        this.userForm.controls.apellidoMaterno.value &&
      usuario.nombres === this.userForm.controls.nombres.value &&
      usuario.documento === this.userForm.controls.documento.value &&
      usuario.perfil === this.userForm.controls.perfil.value &&
      usuario.activo === this.userForm.controls.activo.value &&
      (usuario.tipoDocumento ?? Constantes.CATALOGO_TIPO_DOCUMENTO_DNI) ===
        this.userForm.controls.tipoDocumento.value &&
      (usuario.correo ?? '') === this.userForm.controls.correo.value
    ) {
      return false;
    }
    return true;
  }

  initFormSanitize(): void {
    // Validators tipo documento
    this.userForm.controls.tipoDocumento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value === Constantes.CATALOGO_TIPO_DOCUMENTO_DNI) {
          this.userForm.controls.documento.setValidators([
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(8),
          ]);
          this.maxtDocumentLength = 8;
        } else {
          this.userForm.controls.documento.setValidators([
            Validators.required,
            Validators.minLength(9),
            Validators.maxLength(9),
          ]);
          this.maxtDocumentLength = 9;
        }
      });
    // Documento
    this.userForm.controls.documento.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const sanitized: string = value?.replace(this.numericRegex, '') ?? '';
        this.userForm.controls.documento.setValue(sanitized.toUpperCase(), {
          emitEvent: false,
        });
      });
    const alphaNumericFields = [
      'apellidoPaterno',
      'apellidoMaterno',
      'nombres',
    ];
    for (const field of alphaNumericFields) {
      this.userForm
        .get(field)
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          const sanitized: string =
            value?.replace(this.lettersAndSpacesRegex, '') ?? '';
          this.userForm
            .get(field)
            .setValue(sanitized.toUpperCase(), { emitEvent: false });
        });
    }
  }

  desbloquearUsuario(): void {
    if (this.loading) return;
    this.loading = true;
    this.usuarioService
      .desbloquearUsuario(this.data.usuario.usuario)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.utilityService.mensajePopup(
              res.message,
              undefined,
              IconPopType.CONFIRM
            );
            this.dialogRef.close(res.data);
          }
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 0) {
              this.utilityService.mensajePopup(
                'Error de red',
                'Verifica tu conexión o si el backend está disponible',
                IconPopType.ERROR
              );
              return;
            }
            const errorMessage = err.error.message;
            const details = [];
            let detailMessage: string | undefined = undefined;
            if (errorMessage === 'Error de validación') {
              for (const field in err.error.data) {
                details.push(err.error.data[field]);
              }
            }
            if (details.length > 0) {
              detailMessage = details.join(', ');
            }
            this.utilityService.mensajePopup(
              errorMessage,
              detailMessage,
              IconPopType.ERROR
            );
            this.loading = false;
          }
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  restablecerContrasenia(): void {
    if (this.loading) return;
    if (this.data.usuario.personaAsignada === 0) {
      this.utilityService.mensajePopup(
        'Persona no asignada',
        'Asegurese de que el usuario tenga una persona asignada',
        'alert',
      );
      return;
    }

    this.utilityService.popupConfirmacion(
      undefined,
      '¿Está seguro de realizar la operación?',
      (confirm) => {
        if (!confirm) return;

        this.loading = true;
        this.usuarioService
          .restablecerContrasenia(this.data.usuario.usuario)
          .subscribe({
            next: (res) => {
              if (res.success) {
                this.utilityService.mensajePopup(
                  res.message,
                  `Usuario: ${this.data.usuario.usuario}\nLa contraseña temporal es: ${res.data}`,
                  IconPopType.CONFIRM,
                );
              }
            },
            error: (err) => {
              if (err instanceof HttpErrorResponse) {
                if (err.status === 0) {
                  this.utilityService.mensajePopup(
                    'Error de red',
                    'Verifica tu conexión o si el backend está disponible',
                    IconPopType.ERROR,
                  );
                  return;
                }
                const errorMessage = err.error.message;
                const details = [];
                let detailMessage: string | undefined = undefined;
                if (errorMessage === 'Error de validación') {
                  for (const field in err.error.data) {
                    details.push(err.error.data[field]);
                  }
                }
                if (details.length > 0) {
                  detailMessage = details.join(', ');
                }
                this.utilityService.mensajePopup(
                  errorMessage,
                  detailMessage,
                  IconPopType.ERROR,
                );
                this.loading = false;
              }
            },
            complete: () => {
              this.loading = false;
            },
          });
      },
    );
  }

  actualizarUsuario(): void {
    if (this.loading) return;
    if (!this.formIsDirty()) {
      this.utilityService.mensajePopup(
        'No se detectaron cambios en el formulario',
        'Realice alguna modificación para poder guardar',
        IconPopType.ALERT
      );
      return;
    }

    let data: UsuarioUpdateRequestData = {
      tipoDocumento: this.userForm.controls.tipoDocumento.value,
      documento: this.userForm.controls.documento.value,
      nombres: this.userForm.controls.nombres.value,
      apellidoPaterno: this.userForm.controls.apellidoPaterno.value,
      apellidoMaterno: this.userForm.controls.apellidoMaterno.value,
      correo: this.userForm.controls.correo.value,
      activo: this.userForm.controls.activo.value,
    };
    this.loading = true;
    this.usuarioService
      .updateUsuario(this.data.usuario.usuario, data)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.utilityService.mensajePopup(
              res.message,
              undefined,
              IconPopType.CONFIRM
            );
            this.dialogRef.close(res.data);
          }
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 0) {
              this.utilityService.mensajePopup(
                'Error de red',
                'Verifica tu conexión o si el backend está disponible',
                IconPopType.ERROR
              );
              return;
            }
            const errorMessage = err.error.message;
            const details = [];
            let detailMessage: string | undefined = undefined;
            if (errorMessage === 'Error de validación') {
              for (const field in err.error.data) {
                details.push(err.error.data[field]);
              }
            }
            if (details.length > 0) {
              detailMessage = details.join(', ');
            }
            this.utilityService.mensajePopup(
              errorMessage,
              detailMessage,
              IconPopType.ERROR
            );
          }
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
