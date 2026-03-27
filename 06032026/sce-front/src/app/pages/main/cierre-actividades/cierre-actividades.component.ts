import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { PopupCierreActividadesComponent } from './popup-cierre-actividades/popup-cierre-actividades.component';

import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CierreCCModalResult } from '../../../interface/cierreCCModalResult.interface';
import { GenericResponseBean } from '../../../model/genericResponseBean';
import { UtilityService } from '../../../helper/utilityService';
import { IconPopType } from '../../../model/enum/iconPopType';
import { Usuario } from '../../../model/usuario-bean';
import { AuthComponent } from '../../../helper/auth-component';
import { AuthService } from '../../../service/auth-service.service';
import { filter, first, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ModalGenericoReporteComponent } from '../../shared/modal-generico-reporte/modal-generico-reporte.component';
import { ReporteCierreActividadesService } from 'src/app/service/reporte/reporte-cierre-actividades.service';
import {ModalGenericoResult} from '../../../interface/ModalGenericoResult.interface';

@Component({
  selector: 'app-cierre-actividades',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, PopupCierreActividadesComponent],
  templateUrl: './cierre-actividades.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CierreActividadesComponent extends AuthComponent implements OnInit {
  public form: FormGroup;
  readonly dialog = inject(MatDialog);
  destroyRef: DestroyRef = inject(DestroyRef);
  tituloComponent = "Cierre de actividades del centro de cómputo";
  public usuario: Usuario;
  public tituloComponente: string = "Cierre de actividades del centro de cómputo";
  protected isShowReporte: boolean;
  private readonly destroy$: Subject<boolean> = new Subject<boolean>();
  protected tituloAlert = "Reporte Cierre de actividades";
  public cierreActividadesInicio: string = ""

  constructor(
    private readonly cierreActividadesService: ReporteCierreActividadesService,
    private readonly utilityService: UtilityService,
    private readonly authenticationService: AuthService,
    private readonly formBuilder: FormBuilder,
  ) {
    super();
    this.form = this.formBuilder.group({
      proceso: [{ value: '0', disabled: false }],
      centroComputo: [{ value: '0', disabled: false }],
      estado: [{ value: '-1', disabled: false }],
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();
  }

  mostrarReporteHistoricoCierreReapertura(): void {
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.cierreActividadesService.obtenerReporteHistoricoCierre()
      .pipe(
        filter(value => {
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.descargarPdf(response, false, 'Historico-cierre-reapertura-actividades.pdf');
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de histórico de cierre y reapertura", IconPopType.ERROR);
        }
      })
  }


  descargarPdf(response: GenericResponseBean<string>,isCerrarSesion, nombreArchivo: string = 'Historico-cierre-actividades.pdf') {
    if (response.success) {
      setTimeout(() => {
        const reporteCierreActividadesRef = this.dialog.open(ModalGenericoReporteComponent, {
          width: '1200px',
          maxWidth: '80vw',
          disableClose: true,
          data: {
            pdfBlob: response.data,
            nombreArchivoDescarga: nombreArchivo,
            success: true,
            isCerrarSesion
          }
        });

        reporteCierreActividadesRef.afterClosed().subscribe((result: ModalGenericoResult) => {
          if (result?.action == 'cerrar_sesion'){
            this.cerrarSesion();
          }
        });

      }, 300);
    } else {
      this.isShowReporte = false;
      this.utilityService.setLoading(false);
      this.utilityService.mensajePopupCallback(this.tituloAlert, response.message, IconPopType.ALERT,
        (confirmado: boolean) => {
          if(isCerrarSesion){
            this.cerrarSesion();
          }
        });
    }
  }

  mostrarReporteCierreActividades(isCerrarSesion:boolean, correlativo: string): void {
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.cierreActividadesService.obtenerReporteCierreActividades(correlativo)
      .pipe(
        filter(value => {
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.descargarPdf(response, isCerrarSesion, 'Cierre-Actividades.pdf');
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopupCallback(this.tituloComponent, "No fue posible obtener el reporte de cierre de actividades.", IconPopType.ERROR,
            (confirmado: boolean) => {
              if (isCerrarSesion){
                this.cerrarSesion()
              }
            });
        }
      })
  }

  mostrarReporteReaperturaActividades(isCerrarSesion:boolean): void {
    this.isShowReporte = true;
    sessionStorage.setItem('loading', 'true');

    this.cierreActividadesService.obtenerReporteReaperturaCentroComputo()
      .pipe(
        filter(value => {
          return true;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.descargarPdf(response, isCerrarSesion, 'Reapertura-Actividades.pdf');
        },
        error: err => {
          sessionStorage.setItem('loading', 'false');
          this.isShowReporte = false;
          this.utilityService.mensajePopupCallback(this.tituloComponent, "No fue posible obtener el reporte de cierre de actividades.", IconPopType.ERROR,
            (confirmado: boolean) => {
              if (isCerrarSesion){
                this.cerrarSesion()
              }
            });
        }
      })
  }

  openDialogCerrarCC() {
    const dialogCierreRef = this.dialog.open(
      PopupCierreActividadesComponent, {
      width: '550px',
      maxWidth: '80vw',
      disableClose: true,
      data: {
        initialValues: {
          usuario: this.usuario.nombre,
          clave: '',
          motivo: ''
        }
      }
    });

    dialogCierreRef.afterClosed().subscribe((result: CierreCCModalResult) => {
      if (result.action === 'cerrar') {
        this.utilityService.mensajePopupCallback(this.tituloComponent, "Se realizó el cierre de actividades del centro de cómputo.", IconPopType.CONFIRM,
          (confirmado: boolean) => {
            this.mostrarReporteCierreActividades(true, result.correlativo);
          });

      }
    });
  }

  cerrarSesion() {
    sessionStorage.setItem('loading', 'true');
    this.generalService2.cerrarSesion(this.authenticationService.currentUser()).pipe(first()).subscribe({
      next: (value: GenericResponseBean<string>) => {
        this.authenticationService.cerrarSesion();
      },
      error: (error) => {
        this.authenticationService.cerrarSesion();
      }
    })
  }


}
