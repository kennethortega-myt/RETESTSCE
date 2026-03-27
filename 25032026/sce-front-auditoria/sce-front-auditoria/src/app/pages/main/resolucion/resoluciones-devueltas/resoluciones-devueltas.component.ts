import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { SeguimientoJeeBean } from 'src/app/model/resoluciones/seguimiento-jee-bean';
import { Usuario } from 'src/app/model/usuario-bean';
import { GeneralService } from 'src/app/service/general-service.service';
import { ResolucionService } from 'src/app/service/resolucion.service';
import { PopVerActaSobreComponent } from '../envio-actas/pop-ver-acta-sobre/pop-ver-acta-sobre.component';
import { crearActaBeanMinimo } from 'src/app/helper/actaBean.helper';
import { PopReporteCargoEntregaComponent } from '../envio-actas/pop-reporte-cargo-entrega/pop-reporte-cargo-entrega.component';


@Component({
  selector: 'app-resoluciones-devueltas',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './resoluciones-devueltas.component.html',
})
export class ResolucionesDevueltasComponent extends AuthComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = [
    'position', 'Acta', 'FechaEnvio', 'FechaRespuesta',
    'nResolucion', 'Expediente', 'Estado', 'Acciones'];
  tituloAlert = "Envío de Actas al JEE/JNE"
  dataSource = new MatTableDataSource<SeguimientoJeeBean>;

  public usuario: Usuario;

  destroy$: Subject<boolean> = new Subject<boolean>();
  destroyRef: DestroyRef = inject(DestroyRef);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly resolucionService: ResolucionService,
    private readonly generalService: GeneralService,
    private readonly utilityService: UtilityService,
    private readonly dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
    this.listarSeguimiento();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  listarSeguimiento(): void {
    this.resolucionService.getSeguimientoJEE()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.dataSource.data = res.data;
          } else {
            this.utilityService.mensajePopup("Seguimiento", res.message, IconPopType.ALERT);
          }
        },
        error: (err) => {
          const msg = this.utilityService.manejarMensajeError(err);
          this.utilityService.mensajePopup("Seguimiento", msg, IconPopType.ALERT);
        }
      });
  }

  verSobreActa(acta: any, tipoSobre: string) {
    sessionStorage.setItem('loading', 'true');
    const actaBean = crearActaBeanMinimo({
      actaId: acta.actaPlomaId,
      idArchivoEscrutinio: acta.idArchivoEscrutinio,
      idArchivoInstalacionSufragio: acta.idArchivoInstalacionSufragio,
      idArchivoEscrutinioFirmado: acta.idArchivoEscrutinioFirmado,
      idArchivoInstalacionFirmado: acta.idArchivoInstalacionFirmado,
      idArchivoSufragioFirmado: acta.idArchivoSufragioFirmado,
      staeIntegrada: acta.staeIntegrada
    });
    this.resolucionService.getArchivosSobre(actaBean, tipoSobre)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.mostrarActaSobre(response),
        error: (error) => {
          sessionStorage.removeItem('loading');
          this.utilityService.mensajePopup(this.tituloAlert, error.error?.message || 'Error al obtener el sobre.', IconPopType.ALERT);
        }
      });
  }

  mostrarActaSobre(response: any) {
    sessionStorage.removeItem('loading');
    if (response.success) {
      this.dialog.open(PopVerActaSobreComponent, {
        width: '1200px',
        maxWidth: '80vw',
        disableClose: true,
        data: {
          dataBase64: response.data.acta1File,
          dataBase642: response.data.acta2File,
          dataBase643: response.data.acta3File,
          success: true,
          nombreArchivoDescarga: "Acta_Sobre.png"
        }
      });
    } else {
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  verDocumentoGenerado(acta: any, tipo: 'CARGO' | 'OFICIO' | 'RESOLUCION') {
    const actaBean = crearActaBeanMinimo({
      actaId: acta.actaPlomaId,
      idArchivoEscrutinio: acta.idArchivoEscrutinio,
      idArchivoInstalacionSufragio: acta.idArchivoInstalacionSufragio,
      idArchivoEscrutinioFirmado: acta.idArchivoEscrutinioFirmado,
      idArchivoInstalacionFirmado: acta.idArchivoInstalacionFirmado,
      idArchivoSufragioFirmado: acta.idArchivoSufragioFirmado,
      staeIntegrada: acta.staeIntegrada
    });

    const nombresArchivos: Record<string, string> = {
      CARGO: 'Reporte_cargo_entrega_actas_enviadas_jee.pdf',
      OFICIO: 'Oficio.pdf',
      RESOLUCION: 'Resolucion_JNE.pdf'
    };
    this.resolucionService.verificarDocumentoEnvioJEE(actaBean, tipo).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const nombreArchivo = nombresArchivos[tipo];
          
          this.dialog.open(PopReporteCargoEntregaComponent, {
            width: '1200px',
            maxWidth: '80vw',
            disableClose: true,
            data: {
              dataBase64: res.data,
              success: true,
              nombreArchivoDescarga: nombreArchivo
            }
          });
        } else {
          this.utilityService.mensajePopup(
            this.tituloAlert,
            `El documento ${tipo} aún no ha sido generado.`,
            IconPopType.ALERT
          );
        }
      },
      error: (err) => {
        const msg = this.utilityService.manejarMensajeError(err);
        this.utilityService.mensajePopup(this.tituloAlert, msg, IconPopType.ALERT);
      }
    });
  }

  traducirEstado(codigo: string | null): string {
    switch (codigo) {
      case 'P': return 'PENDIENTE';
      case 'I': return 'ENVIADO AL JEE';
      case 'E': return 'EXPEDIENTE GENERADO';
      case 'J': return 'ATENDIDO (RESOLUCIÓN ENVIADA POR EL JEE)';
      case 'W': return 'RECHAZADA POR EL JEE';
      case 'Z': return 'RECHAZADA POR ONPE';
      default: return '—';
    }
  }

  limpiarDatos() {
    this.dataSource.data = [];
  }

}
