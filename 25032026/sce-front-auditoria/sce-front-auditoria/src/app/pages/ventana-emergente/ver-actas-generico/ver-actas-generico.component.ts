import {Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild} from '@angular/core';
import {ResolucionService} from '../../../service/resolucion.service';
import {timeout} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Utility} from '../../../helper/utility';
import {Constantes} from '../../../helper/constantes';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ArchivoService} from '../../../service/archivo.service';

@Component({
  selector: 'app-ver-actas-generico',
  templateUrl: './ver-actas-generico.component.html',
})
export class VerActasGenericoComponent implements OnInit, OnDestroy{

  @ViewChild('idDivImagen', { static: false }) divImagen!: ElementRef;

  destroyRef: DestroyRef = inject(DestroyRef);

  public pdfSrc: string = "";
  private source: string = '';
  private messageHandler: (event: MessageEvent) => void;
  private popupId: string = '';
  private dataReceived: boolean = false;
  private hasBeenReloaded = false;
  private errorMessage: string = '';
  private readonly TIMEOUT_DATA_RECEIVED = 80000;
  public listArchivoId: Array<number>;
  public idArchivoEscrutinio: number;
  public idArchivoInstalacionSufragio: number;
  public idArchivoSoloInstalacion: number;
  public idArchivoSoloSufragio: number;

  public tipoVista: 'combinada' | 'separada' | null = null;
  tipoDocumentoView: string = Constantes.CE_TIPO_ACTA_ESCRUTINIO;

  constructor(
    private readonly renderer: Renderer2,
    private readonly resolucionService: ResolucionService,
  ) {
    this.listArchivoId=[];
  }

  ngOnInit() {
    console.log('Iniciando VerResolucionComponent...');

    sessionStorage.setItem('loading', 'true');
    this.setupReloadDetection();
    this.setupMessageHandler();
    this.extractUrlParams();
    this.handlePageReload();
    this.setupDataTimeout();
  }

  private setupReloadDetection() {
    if (window.performance && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        this.hasBeenReloaded = navigationEntry.type === 'reload';
      }
    }

    this.hasBeenReloaded = this.hasBeenReloaded || sessionStorage.getItem('windowLoaded') === 'true';
    sessionStorage.setItem('windowLoaded', 'true');
  }

  private setupMessageHandler() {
    this.messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje rechazado de origen desconocido:', event.origin);
        return;
      }

      const data = event.data;
      console.log('Mensaje recibido en ventana de resolución:', data);

      // Procesar datos de resolución
      if (data && data.type === 'RESOLUCION_DATA' && !this.dataReceived) {
        console.log('Datos de resolución recibidos');
        this.dataReceived = true;
        this.errorMessage = '';

        const { resolucionId, popupId, source } = data.payload;
        this.popupId = popupId || '';
        this.source = source || '';

        // Enviar confirmación
        if (window.opener && this.popupId) {
          window.opener.postMessage({
            type: 'RESOLUCION_DATA_RECEIVED',
            popupId: this.popupId
          }, window.location.origin);
        }

        // Cargar resolución
        this.loadResolucion(resolucionId);
      }

      // Manejar errores
      if (data && data.type === 'RESOLUCION_DATA_ERROR') {
        console.error('Error recibido:', data.message);
        this.errorMessage = data.message || 'Error al cargar resolución';
        sessionStorage.setItem('loading', 'false');

        setTimeout(() => {
          alert(`Error: ${this.errorMessage}`);
          this.onCerrarModal();
        }, 100);
      }
    };

    window.addEventListener('message', this.messageHandler);
  }

  private extractUrlParams() {
    try {
      let params: URLSearchParams;
      const url = window.location.href;

      if (url.includes('#') && url.includes('?')) {
        const hashPart = url.split('#')[1];
        const queryPart = hashPart.split('?')[1];
        params = new URLSearchParams(queryPart);
      } else {
        params = new URLSearchParams(window.location.search);
      }

      this.popupId = params.get('id') || '';
      this.source = params.get('source') || '';
    } catch (error) {
      console.error('Error al extraer parámetros de URL:', error);
      this.errorMessage = 'Error al procesar la URL';
      sessionStorage.setItem('loading', 'false');
    }
  }

  private handlePageReload() {
    if (this.hasBeenReloaded && window.opener && this.popupId) {
      console.log('Solicitando datos de resolución después de recarga');

      setTimeout(() => {
        try {
          window.opener.postMessage({
            type: 'REQUEST_RESOLUCION_DATA',
            popupId: this.popupId
          }, window.location.origin);
        } catch (error) {
          console.error('Error al solicitar datos después de recarga:', error);
          this.errorMessage = 'Error al comunicarse con la ventana principal';
          sessionStorage.setItem('loading', 'false');
        }
      }, 300);
    }
  }

  private setupDataTimeout() {
    setTimeout(() => {
      if (!this.dataReceived) {
        const message = 'No se pudieron recibir los datos de la resolución.';
        console.warn(message);
        this.errorMessage = message;
        sessionStorage.setItem('loading', 'false');

        if (this.hasBeenReloaded) {
          alert(message);
        }
      }
    }, this.TIMEOUT_DATA_RECEIVED);
  }

  private loadResolucion(resolucionId: number) {
    if (!resolucionId) {
      this.handleError('No se proporcionó ID de resolución válido');
      return;
    }

    //llamar al servicio de ids de actas



    // Llamar al servicio para obtener el PDF
    this.resolucionService.getArchivos(resolucionId)
      .pipe(
        timeout(this.TIMEOUT_DATA_RECEIVED - 1000),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: Array<number>) => {
          if (response.length > 0) {
            this.listArchivoId = response;
            this.configurarTipoVista(this.listArchivoId);

            // Cargar el primer PDF
            this.obtenerArchivoPdf(this.idArchivoEscrutinio);
            sessionStorage.setItem('loading', 'false');
          } else {
            this.handleError('Error al cargar la resolución');
          }
        },
        error: (err) => {
          if (err.name === 'TimeoutError') {
            this.handleError('La carga de la resolución ha excedido el tiempo máximo');
          } else {
            this.handleError(err.message || 'Error en el servicio al cargar la resolución');
          }
        }
      });
  }

  private configurarTipoVista(response: Array<number>): void {
    this.idArchivoEscrutinio = response[0];

    if (response.length === 2) {
      // Vista combinada: Escrutinio + Instalación y Sufragio
      this.tipoVista = 'combinada';
      this.idArchivoInstalacionSufragio = response[1];
      console.log('Vista combinada activada', {
        escrutinio: this.idArchivoEscrutinio,
        instalacionSufragio: this.idArchivoInstalacionSufragio
      });
    } else if (response.length === 3) {
      // Vista separada: Escrutinio + Solo Instalación + Solo Sufragio
      this.tipoVista = 'separada';
      this.idArchivoSoloInstalacion = response[1];
      this.idArchivoSoloSufragio = response[2];
      console.log('Vista separada activada', {
        escrutinio: this.idArchivoEscrutinio,
        instalacion: this.idArchivoSoloInstalacion,
        sufragio: this.idArchivoSoloSufragio
      });
    } else {
      console.warn('Tamaño de arreglo no esperado:', response.length);
      this.tipoVista = null;
    }
  }

  obtenerArchivoPdf(idFile: number){
    if (!idFile) {
      console.warn('ID de archivo no válido');
      return;
    }
    sessionStorage.setItem('loading', 'true');

    this.resolucionService.generarResolucionPopup(idFile)
      .pipe(
        timeout(this.TIMEOUT_DATA_RECEIVED - 1000),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response?.success) {
            if (!response.data) {
              this.handleError('No se encontró el archivo PDF para la resolución solicitada');
              return;
            }
            // Crear blob y URL para el PDF
            const pdfBlob = Utility.base64toBlob(response.data, 'application/pdf');
            this.pdfSrc = URL.createObjectURL(pdfBlob);

            // Crear el elemento iframe para mostrar el PDF
            this.createPdfViewer();

            sessionStorage.setItem('loading', 'false');
          } else {
            this.handleError(response?.message || 'Error al cargar la resolución');
          }
        },
        error: (err) => {
          if (err.name === 'TimeoutError') {
            this.handleError('La carga de la resolución ha excedido el tiempo máximo');
          } else {
            this.handleError(err.message || 'Error en el servicio al cargar la resolución');
          }
        }
      });
  }

  // Crear el visor de PDF dentro del div
  private createPdfViewer() {
    if (!this.divImagen || !this.pdfSrc) {
      console.error('Div de imagen o PDF source no disponible');
      return;
    }

    // Limpiar contenido previo
    this.divImagen.nativeElement.innerHTML = '';

    // Crear iframe para mostrar el PDF
    const iframe = this.renderer.createElement('iframe');
    this.renderer.setAttribute(iframe, 'src', this.pdfSrc);
    this.renderer.setAttribute(iframe, 'width', '100%');
    this.renderer.setAttribute(iframe, 'height', '620px');
    this.renderer.setAttribute(iframe, 'frameborder', '0');
    this.renderer.setStyle(iframe, 'border', 'none');
    this.renderer.setStyle(iframe, 'border-radius', '8px');

    // Añadir el iframe al div
    this.renderer.appendChild(this.divImagen.nativeElement, iframe);

    console.log('PDF cargado en iframe');
  }

  private handleError(message: string) {
    console.error(message);
    sessionStorage.setItem('loading', 'false');
    alert("Error: " + message);

    setTimeout(() => {
      this.onCerrarModal();
    }, 1000);
  }

  onCerrarModal() {
    if (window.opener && this.popupId) {
      window.opener.postMessage({
        type: 'POPUP_CLOSED',
        popupId: this.popupId
      }, window.location.origin);
    }

    sessionStorage.removeItem('windowLoaded');
    this.cleanupResources();
    window.close();
  }

  private cleanupResources() {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
      this.pdfSrc = '';
    }
    // Limpiar el contenido del div
    if (this.divImagen?.nativeElement) {
      this.divImagen.nativeElement.innerHTML = '';
    }
  }

  onTabChange(event: MatTabChangeEvent): void {
    let idArchivo: number | undefined;

    if (this.tipoVista === 'combinada') {
      // Lógica para vista combinada (2 pestañas)
      switch(event.index) {
        case 0: // Acta de Escrutinio
          idArchivo = this.idArchivoEscrutinio;
          break;
        case 1: // Acta de Instalación y Sufragio
          idArchivo = this.idArchivoInstalacionSufragio;
          break;
      }
    } else if (this.tipoVista === 'separada') {
      // Lógica para vista separada (3 pestañas)
      switch(event.index) {
        case 0: // Acta de Escrutinio
          idArchivo = this.idArchivoEscrutinio;
          break;
        case 1: // Acta de Instalación
          idArchivo = this.idArchivoSoloInstalacion;
          break;
        case 2: // Acta de Sufragio
          idArchivo = this.idArchivoSoloSufragio;
          break;
      }
    }

    if (idArchivo) {
      this.obtenerArchivoPdf(idArchivo);
    } else {
      console.warn(`No hay archivo disponible para la pestaña ${event.index}`);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.messageHandler);
    this.cleanupResources();
  }

  protected readonly Constantes = Constantes;
}
