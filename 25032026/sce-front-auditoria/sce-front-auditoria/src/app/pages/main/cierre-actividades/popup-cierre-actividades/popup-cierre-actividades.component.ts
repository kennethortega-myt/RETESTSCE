import {Component, DestroyRef, inject, Inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {CierreCCModalResult} from '../../../../interface/cierreCCModalResult.interface';
import {CommonModule} from '@angular/common';
import {CierreCentroComputoRequestBean} from '../../../../model/cierreCentroComputoRequestBean';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Login} from '../../../../model/login';
import {AuthService} from '../../../../service/auth-service.service';
import {GenericResponseBean} from '../../../../model/genericResponseBean';
import {CierreCentroComputoResponseBean} from '../../../../model/cierreCentroComputoResponseBean';
import {CierreActividadesService} from '../../../../service/cierre-actividades.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-popup-cierre-actividades',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule, MatIcon, MatIconButton],
  templateUrl: './popup-cierre-actividades.component.html',
})
export class PopupCierreActividadesComponent implements OnInit {

  destroyRef: DestroyRef = inject(DestroyRef);
  cierreForm!: FormGroup;
  isSubmitting = false;
  login = new Login();
  public errorMessage: string = "";

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly authenticationService: AuthService,
    private readonly cierreActividadesService: CierreActividadesService,
    private readonly dialogRef: MatDialogRef<PopupCierreActividadesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Configurar el formulario con valores iniciales si existen
    if (this.data?.initialValues) {
      this.cierreForm.patchValue(this.data.initialValues);
    }
  }

  private initializeForm(): void {
    this.cierreForm = this.fb.group({
      usuario: ['', [
        Validators.required,
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/) // Solo letras, números y algunos caracteres especiales
      ]
      ],
      clave: ['', [
        Validators.required,
        Validators.minLength(1)
      ]],
      motivo: ['', [
        Validators.required,
        Validators.maxLength(350),
        Validators.minLength(1)
      ]]
    });
    this.cierreForm.get('usuario')?.disable();
  }

  // Getters para facilitar el acceso a los controles del formulario
  get usuario() { return this.cierreForm.get('usuario'); }
  get clave() { return this.cierreForm.get('clave'); }
  get motivo() { return this.cierreForm.get('motivo'); }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cierreForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.cierreForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getCharacterCount(fieldName: string): number {
    const field = this.cierreForm.get(fieldName);
    return field?.value?.length || 0;
  }

  // Método para obtener mensaje de error específico
  getErrorMessage(controlName: string): string {
    const control = this.cierreForm.get(controlName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} es obligatorio`;
    }

    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} no puede exceder ${maxLength} caracteres`;
    }

    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} debe tener al menos ${minLength} caracteres`;
    }

    if (control?.hasError('pattern')) {
      return `${this.getFieldLabel(controlName)} contiene caracteres no válidos`;
    }

    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      'usuario': 'Usuario',
      'clave': 'Clave',
      'motivo': 'Motivo'
    };
    return labels[controlName] || controlName;
  }

  salirModal(): void {
    const result: CierreCCModalResult = {
      action: 'salir'       
    };
    this.dialogRef.close(result);
  }

  salirModalDespuesCierre(data: CierreCentroComputoResponseBean): void {
    const result: CierreCCModalResult = {
      action: 'cerrar',
      correlativo: `${data.correlativo}`
    };
    this.dialogRef.close(result);
  }

  // Marcar todos los campos como touched para mostrar errores de validación
  private markFormGroupTouched(): void {
    Object.keys(this.cierreForm.controls).forEach(key => {
      const control = this.cierreForm.get(key);
      control?.markAsTouched();
    });
  }

  cerrarCCCorrecto(response: GenericResponseBean<CierreCentroComputoResponseBean>){
    if (response.success){
      this.salirModalDespuesCierre(response.data);
    }else{
      this.errorMessage= response.message;
      this.isSubmitting = false;
    }
  }
  cerrarCCIncorrecto(error: any){
    this.isSubmitting = false;
    this.errorMessage = error.error.message

  }

  preventEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  cerrarCC(){
    if (this.cierreForm.valid) {
      this.isSubmitting = true;
      const formData: CierreCentroComputoRequestBean = {
        usuario: this.cierreForm.get('usuario')?.value,
        clave: this.cierreForm.value.clave,
        motivo: this.cierreForm.value.motivo.trim()
      };

      this.cierreActividadesService.cerrarCC( formData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: this.cerrarCCCorrecto.bind(this),
          error: this.cerrarCCIncorrecto.bind(this)
        });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched();
      this.errorMessage = 'La clave o motivo es requerido';
    }
  }
}
