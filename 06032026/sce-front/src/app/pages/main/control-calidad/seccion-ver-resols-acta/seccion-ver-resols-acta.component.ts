import { Component, DestroyRef, inject, Input, OnChanges } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/app/helper/utilityService';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';
import { DataPopupVerResolucion } from 'src/app/model/control-calidad/DataPopupVerResolucion';
import { ResolucionActa } from 'src/app/model/control-calidad/ResolucionActa';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { ResolucionService } from 'src/app/service/resolucion.service';
import { VentanaEmergenteService } from 'src/app/service/ventana-emergente.service';
import { PopupVerResolucionComponent } from '../popup-ver-resolucion/popup-ver-resolucion.component';
import { ControlCalidadPaso } from 'src/app/model/enum/control-calidad.enum';
import { PopupResolucionAplicadaComponent } from '../popup-resolucion-aplicada/popup-resolucion-aplicada.component';
import { forkJoin, Observable } from 'rxjs';
import { MessageControlCalidadService } from 'src/app/message/message-control-calidad.service';

@Component({
  selector: 'app-seccion-ver-resols-acta',
  templateUrl: './seccion-ver-resols-acta.component.html',
  styleUrl: './seccion-ver-resols-acta.component.scss'
})
export class SeccionVerResolsActaComponent implements OnChanges {

  @Input() acta: ActaPendienteControlCalidad;
  @Input() pasoActual: number;
  @Input() listaResoluciones: ResolucionActa[];

  pasosControlCalidad = ControlCalidadPaso;
  readonly dialog = inject(MatDialog);
  destroyRef: DestroyRef = inject(DestroyRef);
  readonly tituloMenu = 'Control de Calidad';
  ubigeo: string;

  constructor(
    private readonly resolucionService: ResolucionService,
    protected readonly ventanaEmergenteService: VentanaEmergenteService,
    private readonly utilityService: UtilityService,
    private readonly messageControlCalidadService: MessageControlCalidadService,
  ){}

  ngOnChanges(): void {
    this.ubigeo = `${this.acta.ubigeoDepa} / ${this.acta.ubigeoProv} / ${this.acta.ubigeoNombre}`;
    //Vamos cargando los pdfs de las resoluciones
    if(this.listaResoluciones && this.listaResoluciones.length > 0) {
      this.cargarResolucionesFiles();
    }
  }

  cargarResolucionesFiles() {
    const observablesResol :Observable<any>[] = this.listaResoluciones.map(resol => this.resolucionService.getFileV3(resol.idArchivo));

    forkJoin(observablesResol)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(
      {
        next: (blobs) => {
          this.listaResoluciones.forEach( (resol, index) => {
            this.listaResoluciones[index] = {
              ...resol,
              fileResolucion: blobs[index]
            }
          });
        },
        error: () => {
          this.utilityService.mensajePopup(this.tituloMenu,
              'Error al obtener los pdfs de las resoluciones',
              IconPopType.ERROR);
        }
      }
    );

  }

  public verResolucion(resolucion: ResolucionActa) {
    const resolEncontrada = this.listaResoluciones
          .find( resol => resol.idResolucion === resolucion.idResolucion);

    if(resolEncontrada?.fileResolucion){
      this.openDialogResolucion(resolucion, resolEncontrada.fileResolucion);
    } else {
      this.obtenerPdfResolucion(resolucion);
    }
  }

  private obtenerPdfResolucion(resolucion: ResolucionActa) {
    sessionStorage.setItem('loading', 'true');
    this.resolucionService.getFileV3(resolucion.idArchivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response) => {
            sessionStorage.setItem('loading', 'false');
            if(response){
              this.openDialogResolucion(resolucion, response);
            } else {
              this.errorLoadResolucion();
            }
          },
          error: () => {
            sessionStorage.setItem('loading', 'false');
            this.errorLoadResolucion();
          }
        }
      );
  }

  private openDialogResolucion(resolucion: ResolucionActa, file: any) {
    if(this.pasoActual === this.pasosControlCalidad.paso3) {
      this.dialog.open(PopupResolucionAplicadaComponent,
        {
          data: this.dataResolucion(resolucion, file),
          width: '1400px',
          maxWidth: '80vw',
        });
    } else {
      this.dialog.open(PopupVerResolucionComponent,
        {
          data: this.dataResolucion(resolucion, file),
          width: '1300px',
          maxWidth: '80vw',
        });
    }

  }

  public verActa() {
    this.utilityService.abrirModalActaPorId(
      this.acta.idActa,
      this.tituloMenu,
      this.destroyRef
    );

      this.messageControlCalidadService.revisoActa.next(true);
  }

  private dataResolucion(resolucion: ResolucionActa, file: any) : DataPopupVerResolucion{
    return {
      idActa: this.acta.idActa,
      idResolucion: resolucion.idResolucion,
      numeroActa: `${this.acta.mesa}-${this.acta.copia}${this.acta.digitoChequeo}`,
      nombreResolucion: resolucion.nombreResolucion,
      eleccion : this.acta.nombreEleccion,
      numeroElectores: resolucion.numeroElectores,
      numeroElectoresAusentes: resolucion.numeroElectoresAusentes,
      ubigeo: this.ubigeo,
      archivoResolucion: file,
      numeroExpediente: resolucion.numeroExpediente
    }
  }

  private errorLoadResolucion() {
    this.utilityService.mensajePopup(this.tituloMenu,
              'Error al obtener el pdf de la resolución.',
              IconPopType.ERROR);
  }

  get tituloPaso(): string {
    let titulo = '';
    switch(this.pasoActual) {
      case this.pasosControlCalidad.paso1:
        titulo = `Paso 1 de 3 - Datos del Acta` ;
        break;
      case this.pasosControlCalidad.paso2:
        titulo = `Paso 2 de 3 - Firmas verificadas`;
        break;
      case this.pasosControlCalidad.paso3:
        titulo = `Paso 3 de 3 - Votos validados`;
        break;
      default:
        break;
    }

    return titulo;
  }

}
