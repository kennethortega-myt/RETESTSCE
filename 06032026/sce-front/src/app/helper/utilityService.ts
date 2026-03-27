import {DestroyRef, inject, Injectable} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PopMensajeData} from "../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../pages/shared/pop-mensaje/pop-mensaje.component";
import {VerificationActaResponseBean} from "../model/verificationActaResponseBean";
import {Constantes} from "./constantes";
import {DialogoConfirmacionComponent} from "../pages/main/dialogo-confirmacion/dialogo-confirmacion.component";
import {
  PdfViewerGenericoMovibleComponent
} from '../pages/shared/pdf-viewer-generico-movible/pdf-viewer-generico-movible.component';
import {
  ModalActaMovibleComponent,
  ModalActaMovibleData
} from '../pages/shared/modal-acta-movible/modal-acta-movible.component';
import {AlineacionType} from '../model/enum/alineacionType';
import {filter, forkJoin, Observable} from 'rxjs';
import {ResolucionService} from '../service/resolucion.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {IconPopType} from '../model/enum/iconPopType';
import {Utility} from './utility';
import {NavigationStart, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UtilityService{
  private readonly dialog = inject(MatDialog);
  private pdfDialogRef: MatDialogRef<PdfViewerGenericoMovibleComponent> | null = null;
  private actaDialogRef: MatDialogRef<ModalActaMovibleComponent> | null = null;

  private readonly resolucionService = inject(ResolucionService);
  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(()=>{
      this.cerrarModalesMoviblesAbiertos()
    });
  }

  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  mensajePopupCallback(title:string , mensaje:string, icon:string, callback: (confirmado: boolean) => void){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      disableClose: true,
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          callback(confirmado);
        }
      });
  }

  popupConfirmacion( event: any,
                     mensaje: string,
                     callback: (confirmado: boolean) => void,
                     opciones?: { alineacion?: AlineacionType.LEFT | AlineacionType.CENTER | AlineacionType.JUSTIFY }): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: { mensaje, alineacion: opciones?.alineacion || AlineacionType.CENTER }
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        callback(confirmado);
      });
  }

  // Método específico para cuando se confirma
  popupConfirmacionConAccion(event: any, mensaje: string, onConfirm: () => void): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: mensaje
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          onConfirm();
        }
      });
  }

  // Método específico para cuando se confirma o cancela
  popupConfirmacionConAcciones(event: any, mensaje: string, onConfirm: () => void, onCancel: () => void): void {
    this.dialog
      .open(DialogoConfirmacionComponent, {
        disableClose: true,
        data: mensaje
      })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          onConfirm();
        } else {
          onCancel();
        }
      });
  }

  public mostrarModalActaMovible(blobs: Blob[]): Observable<void>{
    this.cerrarModalesMoviblesAbiertos();

    const dataBlob: ModalActaMovibleData = blobs.length > 2
      ? { pdfBlob1: blobs[0], pdfBlob2: blobs[1], pdfBlob3: blobs[2] }
      : { pdfBlob1: blobs[0], pdfBlob2: blobs[1] };

    this.actaDialogRef = this.dialog.open(ModalActaMovibleComponent, {
      width: '70vw',
      maxWidth: '70vw',
      height: '85vh',
      hasBackdrop: false,
      autoFocus: false,
      panelClass: 'acta-movible-panel',
      data: dataBlob
    });

    const openedRef = this.actaDialogRef;
    const afterClosed$ = openedRef.afterClosed();
    afterClosed$.subscribe(()=> {
      if (this.actaDialogRef === openedRef){
        this.actaDialogRef = null;
      }
    });

    return afterClosed$;
  }

  public mostrarModalPdfMovible(pdfBlob: Blob): Observable<void>{
    this.cerrarModalesMoviblesAbiertos();

    this.pdfDialogRef = this.dialog.open(PdfViewerGenericoMovibleComponent, {
      width: '60vw',
      maxWidth: '60vw',
      height: '85vh',
      hasBackdrop: false,
      autoFocus: false,
      panelClass: 'pdf-movible-panel',
      data: {pdfBlob}
    });

    const openedRef = this.pdfDialogRef;
    const afterClosed$ = openedRef.afterClosed();
    afterClosed$.subscribe(() => {
      if(this.pdfDialogRef === openedRef){
        this.pdfDialogRef = null;
      }
    });
    return afterClosed$;
  }

  validarActa(acta: VerificationActaResponseBean, tipoEleccion: string): string[] {
    let missingSections: string[] = [];

    // Validación inicial de las secciones principales
    this.validateMainSections(acta, missingSections);

    // Si faltan secciones principales, devolvemos las faltantes
    if (missingSections.length > 0) return missingSections;

    // Validar cada sección específica
    this.validateSignSection(acta, missingSections);
    this.validateVoteSection(acta, missingSections, tipoEleccion);
    this.validateObservationSection(acta, missingSections);
    this.validateDateSectionResponse(acta, missingSections);

    return missingSections;
  }

  private validateMainSections(acta: VerificationActaResponseBean, missingSections: string[]): void {
    if (!acta.token) missingSections.push('token');
    if (!acta.signSection) missingSections.push('signSection');
    if (!acta.voteSection) missingSections.push('voteSection');
    if (!acta.observationSection) missingSections.push('observationSection');
    if (!acta.dateSectionResponse) missingSections.push('dateSectionResponse');
  }

  private validateSignSection(acta: VerificationActaResponseBean, missingSections: string[]): void {
    const signFields = [
      'countPresident', 'countSecretary', 'countThirdMember',
      'installPresident', 'installSecretary', 'installThirdMember',
      'votePresident', 'voteSecretary', 'voteThirdMember'
    ];

    for (const field of signFields) {
      if (!acta.signSection?.[field]?.fileId) {
        missingSections.push(`Sección firma - ${field}`);
      }
    }
  }

  private validateVoteSection(acta: VerificationActaResponseBean, missingSections: string[], tipoEleccion: string): void {
    if (acta.voteSection) {
      if (!acta.voteSection.items || acta.voteSection.items.length === 0) {
        missingSections.push('Sección votos - votos');
        return; // No tiene sentido validar más si no hay ítems
      }

      const items = acta.voteSection.items;
      const itemsToValidate = items.slice(0, -3); // Excluir los 3 últimos elementos

      itemsToValidate.forEach((item, index) => {
        // Solo validamos votoPreferencial si tipoEleccion no es 10
        if (
          tipoEleccion !== Constantes.COD_ELEC_PRE &&
          tipoEleccion !== Constantes.COD_ELEC_REVOCATORIA && item.votoPreferencial) {
          if (item.votoPreferencial.length !== acta.voteSection.cantidadVotosPreferenciales) {
            missingSections.push(`Sección voto - fila ${index}. Su votoPreferenciales es ${item.votoPreferencial.length}`);
          }
        }
      });
    }
  }

  private validateObservationSection(acta: VerificationActaResponseBean, missingSections: string[]): void {
    const observationFields = ['count', 'install', 'vote'];
    for (const field of observationFields) {
      if (!acta.observationSection?.[field]?.fileId) {
        missingSections.push(`Sección observaciones - ${field}`);
      }
    }
  }

  private validateDateSectionResponse(acta: VerificationActaResponseBean, missingSections: string[]): void {
    const dateFields = ['start', 'end', 'total'];
    for (const field of dateFields) {
      if (!acta.dateSectionResponse?.[field]?.fileId) {
        missingSections.push(`Sección date - ${field}`);
      }
    }
  }


  /**
   * Extrae un mensaje legible desde un objeto de error HTTP.
   * @param error El error recibido (HttpErrorResponse u otro).
   * @returns Mensaje legible para mostrar al usuario.
   */
  public manejarMensajeError(error: any): string {
    console.error("Error completo recibido:", error);

    const mensaje =
      error?.error?.message ||                              // caso típico JSON
      (typeof error?.error === 'string' ? error.error : '') || // caso texto plano
      error?.message ||                                     // fallback HttpErrorResponse
      'Ocurrió un error inesperado.';

    return mensaje;
  }

  setLoading(isLoading: boolean): void {
    sessionStorage.setItem('loading', String(isLoading));
  }

  isLoading(): boolean {
    return sessionStorage.getItem('loading') === 'true';
  }

  public formatNombreArchivoVerificaVersion(nombreArchivo: string): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}${month}${year}${hours}${minutes}${seconds}`;
    return `${nombreArchivo}-${formattedDate}.pdf`;
  }

  public abrirModalActaPorId(
    actaId: number,
    titulo: string,
    destroyRef: DestroyRef
  ): void {
    this.cerrarModalesMoviblesAbiertos();
    this.setLoading(true);
    this.resolucionService.getArchivos(actaId)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response: Array<number>) => {
          const todosValidos = response.length >=2 && response.every(id => id != null);
          if (todosValidos) {
            this.obtenerBlobsYMostrarModal(response, actaId, titulo, destroyRef);
          } else {
            this.setLoading(false);
            this.mensajePopup(titulo, "No fue posible obtener la imagen de acta", IconPopType.ALERT);
          }
        },
        error: (err) => {
          this.setLoading(false);
          this.mensajePopup(titulo, "Error al obtener las actas", IconPopType.ERROR);
        }
      });
  }

  private obtenerBlobsYMostrarModal(
    listArchivoId: Array<number>,
    actaId: number,
    titulo: string,
    destroyRef: DestroyRef
  ): void {
    const requests = listArchivoId.map(idFile => this.resolucionService.getFilePdfPoppuConvStae(idFile, actaId));
    forkJoin(requests)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (responses) => {
          const blobs = responses.map(r => Utility.base64toBlob(r.data, 'application/pdf'));
          this.setLoading(false)
          this.mostrarModalActaMovible(blobs);
        },
        error: (err) => {
          this.setLoading(false);
          this.mensajePopup(titulo, "Error al obtener los archivos del acta", IconPopType.ERROR);
          console.error(err);
        }
      });
  }

  public cerrarModalesMoviblesAbiertos(): void {
    if (this.actaDialogRef) {
      this.actaDialogRef.close();
      this.actaDialogRef = null;
    }
    if (this.pdfDialogRef) {
      this.pdfDialogRef.close();
      this.pdfDialogRef = null;
    }
  }
}
