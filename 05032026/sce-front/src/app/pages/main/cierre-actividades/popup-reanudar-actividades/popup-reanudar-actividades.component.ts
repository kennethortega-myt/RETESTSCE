import {Component, DestroyRef, HostListener, Inject, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatListModule} from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {ReaperturaCCModalResult} from '../../../../interface/reaperturaCCModalResult.interface';
import {NgIf} from '@angular/common';
import {CierreActividadesService} from '../../../../service/cierre-actividades.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {GenericResponseBean} from '../../../../model/genericResponseBean';
import {ReaperturaCentroComputoResponseBean} from '../../../../model/reaperturaCentroComputoResponseBean';
import {first, finalize} from 'rxjs/operators';
import {Login} from '../../../../model/login';
import {AuthService} from '../../../../service/auth-service.service';
import {GeneralService} from '../../../../service/general-service.service';
import {ValidarUsuarioReaperturaResponseBean} from '../../../../model/validarUsuarioReaperturaResponseBean';
import {ReaperturaModalAction} from '../../../../model/enum/reaperturaModalAction.enum';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {PopReanudarActividadesData} from '../../../../interface/popReanudarActividadesData.interface';
import {ReporteCierreActividadesService} from '../../../../service/reporte/reporte-cierre-actividades.service';

@Component({
  selector: 'app-popup-reanudar-actividades',
  standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, ReactiveFormsModule, NgIf, MatIcon, MatIconButton],
  templateUrl: './popup-reanudar-actividades.component.html',
})
export class PopupReanudarActividadesComponent implements OnInit, OnDestroy{

  public generalService2 = inject(GeneralService);
  destroyRef: DestroyRef = inject(DestroyRef);
  reaperturaForm!: FormGroup;
  isSubmitting = false;
  usuarioCierre: string = "";
  fechaCierre: string = "";
  base64Pdf: string = "";

  public errorMessage: string = "";

  login = new Login();

  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly cierreActividadesService: CierreActividadesService,
    private readonly authenticationService: AuthService,
    private readonly dialogRef: MatDialogRef<PopupReanudarActividadesComponent, ReaperturaCCModalResult>,
    private readonly reporteCierreActividadesService: ReporteCierreActividadesService,
    @Inject(MAT_DIALOG_DATA) public data: PopReanudarActividadesData
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Configurar el formulario con valores iniciales si existen
    if (this.data) {
      this.usuarioCierre = this.data.usuarioCierre;
      this.fechaCierre = this.data.fechaCierre;
    }
  }

  private initializeForm(): void {
    this.reaperturaForm = this.fb.group({
      usuario: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50) // Solo letras, números y algunos caracteres especiales
      ]],
      clave: ['', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20)
      ]]
    });
  }

  // Getters para facilitar el acceso a los controles del formulario
  get usuario() { return this.reaperturaForm.get('usuario'); }
  get clave() { return this.reaperturaForm.get('clave'); }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.reaperturaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.reaperturaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Método para obtener mensaje de error específico
  getErrorMessage(controlName: string): string {
    const control = this.reaperturaForm.get(controlName);

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
      'clave': 'Clave'
    };
    return labels[controlName] || controlName;
  }

  salirModal(): void {
    const result: ReaperturaCCModalResult = {
      action: ReaperturaModalAction.SALIR
    };
    this.dialogRef.close(result);
  }

  salirModalDespuesReapertura(): void {
    const result: ReaperturaCCModalResult = {
      action: ReaperturaModalAction.REAPERTURA_REALIZADA,
      data: {
        usuario: this.reaperturaForm.value.usuario.trim(),
        clave:this.reaperturaForm.value.clave,
        base64Pdf: this.base64Pdf,
      }
    };
    this.dialogRef.close(result);
  }

  salirModalAutorizacion(): void {
    const result: ReaperturaCCModalResult = {
      action: ReaperturaModalAction.SOLICITAR_AUTORIZACION,
      data: {
        usuario: this.reaperturaForm.value.usuario.trim(),
        clave:this.reaperturaForm.value.clave
      }
    };
    this.dialogRef.close(result);
  }

  getTokenCorrecto(result:number){
    if (result === 3){
      this.validarUsuarioReapertura();
    }
  }

  getTokenIncorrecto(error: any){
    this.isSubmitting = false;
    this.errorMessage = error;
  }

  authentica(){
    if (this.reaperturaForm.valid) {
      this.isSubmitting = true;
      this.login.username = this.reaperturaForm.value.usuario.trim()
      this.login.password = this.reaperturaForm.value.clave;

      this.authenticationService.getToken( this.login)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: this.getTokenCorrecto.bind(this),
          error: this.getTokenIncorrecto.bind(this)
        });
    } else {
      // Marcar todos los campos como touched para mostrar errores
      this.markFormGroupTouched();
      this.errorMessage = 'El usuario o contraseña es requerido';
    }
  }

  validarUsuarioReapertura(): void{
    this.cierreActividadesService.validarUsuarioReapertura()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.validarUsuarioReaperturaCorrecto.bind(this),
        error: this.validarUsuarioReaperturaIncorrecto.bind(this)
      });
  }

  validarUsuarioReaperturaCorrecto(response: GenericResponseBean<ValidarUsuarioReaperturaResponseBean>){
    if (!response.success){
      this.isSubmitting = false;
      this.errorMessage = response.message;
      return;
    }

    if (response.data.mismoUsuario) {
      this.reaperturaCC(false);
    } else {
      this.cerrarSesionSegura(() => {
        this.salirModalAutorizacion();
      });
    }
  }

  validarUsuarioReaperturaIncorrecto(error: any){
    this.isSubmitting = false;
    const mensaje = error?.error?.message || error?.message || "Error al validar el usuario para la reapertura";
    console.error('Error al validar usuario para reapertura:', error);
    this.errorMessage = mensaje;
  }

  /**
   * Método centralizado para cerrar sesión de forma segura
   */
  private cerrarSesionSegura(callback?: () => void): void {
    sessionStorage.setItem("loading", "true");

    this.generalService2.cerrarSesion(this.authenticationService.currentUser())
      .pipe(
        first(),
        finalize(() => {
          sessionStorage.setItem("loading", "false");
          this.authenticationService.cerrarSesion();
        })
      ).subscribe({
        next: () => {
          if (callback) {
            callback();
          }
        },
        error: (error) => {
          console.warn('Error al cerrar sesión del servidor:', error);
          if (callback) {
            callback();
          }
        }
      });
  }

  reaperturaCC(conAutorizacionNacion: boolean): void {
    sessionStorage.setItem("loading","true");
    this.cierreActividadesService.reabrirCC(conAutorizacionNacion)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.reabrirCCCorrecto.bind(this),
        error: this.reabrirCCIncorrecto.bind(this)
      });
  }

  reabrirCCCorrecto(response: GenericResponseBean<ReaperturaCentroComputoResponseBean>){
    sessionStorage.setItem("loading","false");
    if (!response.success){
      this.isSubmitting = false;
      this.errorMessage = response.message;
      return;
    }

    // Obtener reporte después de reapertura exitosa
    sessionStorage.setItem('loading', 'true');
    this.reporteCierreActividadesService.obtenerReporteReaperturaCentroComputo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.obtenerReporteReaperturaCentroComputoCorrecto.bind(this),
        error: this.obtenerReporteReaperturaCentroComputoIncorrecto.bind(this)
      });
  }

  reabrirCCIncorrecto(error: any){
    sessionStorage.setItem("loading","false");
    this.isSubmitting = false;
    const mensaje = error?.error?.message || error?.message || "Error al realizar la reapertura del centro de cómputo";
    console.error('Error en reapertura:', error);
    this.errorMessage = mensaje;
  }

  // Marcar todos los campos como touched para mostrar errores de validación
  private markFormGroupTouched(): void {
    Object.keys(this.reaperturaForm.controls).forEach(key => {
      const control = this.reaperturaForm.get(key);
      control?.markAsTouched();
    });
  }

  ngOnDestroy() {
    //vacio
  }

  // Método para manejar Enter en inputs (opcional: submit en Enter)
  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !this.isSubmitting) {
      this.authentica();
    }
  }



  obtenerReporteReaperturaCentroComputoCorrecto(response: GenericResponseBean<any>){
    sessionStorage.setItem('loading', 'false');
    this.base64Pdf = response.data;

    // Cerrar sesión y salir con reporte
    this.cerrarSesionSegura(() => {
      this.salirModalDespuesReapertura();
    });
  }

  obtenerReporteReaperturaCentroComputoIncorrecto(error: any){
    sessionStorage.setItem('loading', 'false');
    console.error('Error al obtener reporte de reapertura:', error);
    // Incluso si falla el reporte, proceder con la reapertura exitosa
    this.cerrarSesionSegura(() => {
      this.salirModalDespuesReapertura();
    });
  }



}

