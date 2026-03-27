import {Component, Inject, OnDestroy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {Constantes} from '../../../helper/constantes';
import {ScrollModeType} from 'ngx-extended-pdf-viewer';
import {VistaModalType} from '../../../model/enum/vistaModalType';
import {UtilityService} from '../../../helper/utilityService';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

export interface ModalActaMovibleData{
  pdfBlob1: Blob,
  pdfBlob2: Blob,
  pdfBlob3?: Blob,
}

@Component({
  selector: 'app-modal-acta-movible',
  templateUrl: './modal-acta-movible.component.html',
})
export class ModalActaMovibleComponent implements OnDestroy {

  public pdfSrcEscrutinio: string = '';
  public pdfSrcInstalacionSufragio: string = '';
  public pdfSrcInstalacion: string = '';
  public pdfSrcSufragio: string = '';
  public tipoVista: VistaModalType | null = null;
  public pdfActual: string = '';
  public pdfActualSafe: SafeResourceUrl | string = '';
  public tipoDocumentoView: string = Constantes.CE_TIPO_ACTA_ESCRUTINIO;
  public cargandoPdf: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: ModalActaMovibleData,
    private readonly dialogRef: MatDialogRef<ModalActaMovibleComponent>,
    private readonly sanitizer: DomSanitizer
  ) {
    if (this.data) {
      this.cargandoPdf = true;
      this.pdfSrcEscrutinio = URL.createObjectURL(this.data.pdfBlob1);
      if (this.data.pdfBlob3) {
        this.tipoVista = VistaModalType.SEPARADA;
        this.pdfSrcInstalacion = URL.createObjectURL(this.data.pdfBlob2);
        this.pdfSrcSufragio = URL.createObjectURL(this.data.pdfBlob3);
      } else {
        this.tipoVista = VistaModalType.COMBINADA;
        this.pdfSrcInstalacionSufragio = URL.createObjectURL(this.data.pdfBlob2);
      }
      this.setCurrentPdf(this.pdfSrcEscrutinio);
    }
  }

  private setCurrentPdf(url: string): void {
    this.pdfActual = url;
    this.pdfActualSafe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.cargandoPdf = true;
    this.tipoDocumentoView = this.tabsIds[event.index];

    if (this.tipoVista === VistaModalType.COMBINADA) {
      this.setCurrentPdf(event.index === 0
        ? this.pdfSrcEscrutinio
        : this.pdfSrcInstalacionSufragio);
    } else {
      switch (event.index) {
        case 0: this.setCurrentPdf(this.pdfSrcEscrutinio); break;
        case 1: this.setCurrentPdf(this.pdfSrcInstalacion); break;
        case 2: this.setCurrentPdf(this.pdfSrcSufragio); break;
      }
    }
  }

  get tabsIds(): string[] {
    if (this.tipoVista === VistaModalType.SEPARADA) {
      return [
        Constantes.CE_TIPO_ACTA_ESCRUTINIO,
        Constantes.CE_TIPO_ACTA_INSTALACION,
        Constantes.CE_TIPO_ACTA_SUFRAGIO
      ];
    }
    return [
      Constantes.CE_TIPO_ACTA_ESCRUTINIO,
      Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO
    ];
  }

  onPdfCargado(): void {
    this.cargandoPdf = false;
  }

  private get nombreArchivoDescarga(): string {
    const nombres: Record<string, string> = {
      [Constantes.CE_TIPO_ACTA_ESCRUTINIO]:          'escrutinio.pdf',
      [Constantes.CE_TIPO_ACTA_INSTALACION]:          'instalacion.pdf',
      [Constantes.CE_TIPO_ACTA_SUFRAGIO]:             'sufragio.pdf',
      [Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO]: 'instalacionSufragio.pdf',
    };
    return nombres[this.tipoDocumentoView] ?? 'acta.pdf';
  }

  descargar(): void {
    if (!this.pdfActual) return;
    const a = document.createElement('a');
    a.href = this.pdfActual;
    a.download = this.nombreArchivoDescarga;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  cerrar(): void {
    this.pdfActual = '';
    this.pdfActualSafe = '';
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.pdfSrcEscrutinio)          URL.revokeObjectURL(this.pdfSrcEscrutinio);
    if (this.pdfSrcInstalacionSufragio) URL.revokeObjectURL(this.pdfSrcInstalacionSufragio);
    if (this.pdfSrcSufragio)            URL.revokeObjectURL(this.pdfSrcSufragio);
    if (this.pdfSrcInstalacion)         URL.revokeObjectURL(this.pdfSrcInstalacion);
  }

  protected readonly VistaModalType = VistaModalType;
}
