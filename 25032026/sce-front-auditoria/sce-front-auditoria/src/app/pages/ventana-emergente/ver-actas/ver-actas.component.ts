import {Component, DestroyRef, inject, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ControlDigitalizacionService} from '../../../service/control-digitalizacion.service';
import {Utility} from '../../../helper/utility';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {timeout, retryWhen, delay, take, tap} from 'rxjs';
import {VerActaService} from '../../../helper/verActaService';
import {Constantes} from '../../../helper/constantes';
import {MatTabChangeEvent} from '@angular/material/tabs';

@Component({
  selector: 'app-ver-actas',
  templateUrl: './ver-actas.component.html',
})
export class VerActasComponent implements OnInit, OnDestroy {

  destroyRef:DestroyRef = inject(DestroyRef);
  public imgPngBase64Escrutinio: string = "";
  public imgPngBase64Instalacion: string = "";
  private source: string = '';
  tamanioEscrutinio: number = 100;
  anguloActaEscrutinio: number = 0;
  tamanioInstalacion: number = 100;
  anguloActaInstalacion: number = 0;
  tipoDocumentoView: string = Constantes.CE_TIPO_ACTA_ESCRUTINIO;

  // Propiedades para manejo de mensajes
  private messageHandler: (event: MessageEvent) => void;
  private popupId: string = '';
  private dataReceived: boolean = false;

  // Variables para detectar si la ventana fue recargada
  private hasBeenReloaded = false;
  private errorMessage: string = '';

  private readonly TIMEOUT_DATA_RECEIVED = 30000; // Optimizado: 30s en lugar de 80s


  constructor(
              private readonly renderer: Renderer2,
              private readonly controlDigitalizacionService:ControlDigitalizacionService,
              private readonly verActaService: VerActaService) {
    this.imgPngBase64Escrutinio = "";
    this.imgPngBase64Instalacion = "";
  }

  ngOnInit() {
    // Configurar estado inicial de carga
    sessionStorage.setItem('loading', 'true');

    this.hasBeenReloaded = false;
    // Comprobar con la API moderna
    if (window.performance && performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigationEntry = navigationEntries[0] as PerformanceNavigationTiming;
        this.hasBeenReloaded = navigationEntry.type === 'reload';
      }
    }

    // Detectar si es una recarga de manera más confiable
    this.hasBeenReloaded = this.hasBeenReloaded ||
      sessionStorage.getItem('windowLoaded') === 'true';

    // Marcar que la ventana ha sido cargada para futuras recargas
    sessionStorage.setItem('windowLoaded', 'true');


    // Configurar listener para mensajes
    this.messageHandler = (event: MessageEvent) => {
      // Verificar origen por seguridad
      if (event.origin !== window.location.origin) {
        console.warn('Mensaje rechazado de origen desconocido:', event.origin);
        return;
      }

      const data = event.data;

      // Procesar datos de actas
      if (data && data.type === 'ACTA_DATA' && !this.dataReceived) {
        this.dataReceived = true;

        // Limpiar cualquier mensaje de error
        this.errorMessage = '';

        // Extraer datos
        const { acta1FileId, acta2FileId, popupId, source, esquemaNacion, acronimo } = data.payload;
        this.popupId = popupId || '';
        this.source = source || '';

        // Enviar confirmación de recepción
        if (window.opener && this.popupId) {
          window.opener.postMessage({
            type: 'ACTA_DATA_RECEIVED',
            popupId: this.popupId
          }, window.location.origin);

        }

        // Cargar actas
        this.loadActas(acta1FileId, acta2FileId, esquemaNacion, acronimo);
      }

      // Manejar errores de datos
      if (data && data.type === 'ACTA_DATA_ERROR') {
        console.error('Error recibido:', data.message);
        this.errorMessage = data.message || 'Error al cargar datos';
        sessionStorage.setItem('loading', 'false');

        // Mostrar mensaje al usuario después de un breve retraso
        setTimeout(() => {
          alert(`Error: ${this.errorMessage}`);
          this.onCerrarModal(); // Cerrar la ventana si no hay datos
        }, 100);
      }
    };

    // Registrar listener de mensajes
    window.addEventListener('message', this.messageHandler);

    // Obtener parámetros de URL correctamente, considerando el formato con hash
    let params: URLSearchParams;
    const url = window.location.href;

    try {
      // Caso 1: URL con hash y parámetros (formato: #/ver-actas?param=value)
      if (url.includes('#') && url.includes('?')) {
        const hashPart = url.split('#')[1];
        const queryPart = hashPart.split('?')[1];
        params = new URLSearchParams(queryPart);
      }
      // Caso 2: URL con parámetros regulares (formato: ?param=value)
      else {
        params = new URLSearchParams(window.location.search);
      }

      this.popupId = params.get('id') || '';
      this.source = params.get('source') || '';

    } catch (error) {
      console.error('Error al extraer parámetros de URL:', error);
      this.errorMessage = 'Error al procesar la URL';
      sessionStorage.setItem('loading', 'false');
    }

    // Si es una recarga y tenemos window.opener, solicitar datos nuevamente
    if (this.hasBeenReloaded && window.opener && this.popupId) {

      // Dar tiempo al sistema para que se estabilice
      setTimeout(() => {
        try {
          window.opener.postMessage({
            type: 'REQUEST_ACTA_DATA',
            popupId: this.popupId
          }, window.location.origin);

        } catch (error) {
          console.error('Error al solicitar datos después de recarga:', error);
          this.errorMessage = 'Error al comunicarse con la ventana principal';
          sessionStorage.setItem('loading', 'false');
        }
      }, 300);
    }

    // Mostrar mensaje de espera después de un timeout optimizado
    setTimeout(() => {
      if (!this.dataReceived) {
        const message = 'No se pudieron recibir los datos. La ventana principal puede haberse cerrado.';
        console.warn(message);
        this.errorMessage = message;
        sessionStorage.setItem('loading', 'false');

        // Si no se han recibido datos y es una recarga, mostrar mensaje
        // No cerramos automáticamente para permitir al usuario intentarlo de nuevo
        if (this.hasBeenReloaded) {
          alert(message);
        }
      }
    }, 8000);

  }

  // Método para cargar actas
  private loadActas(acta1Id: number, acta2Id: number, esquemaNacion: boolean, acronimo:string = null) {
    const startTime = performance.now();
    // Validar IDs
    if (!acta1Id && !acta2Id) {
      this.handleError('No se proporcionaron IDs de actas válidos');
      return;
    }

    this.controlDigitalizacionService.getFilesPng(acta1Id, acta2Id, esquemaNacion, acronimo)
      .pipe(
        // Reintentar hasta 2 veces con delay de 1 segundo
        retryWhen(errors => errors.pipe(
          delay(1000),
          take(2),
          tap(() => console.log('Reintentando carga de actas...'))
        )),
        timeout(this.TIMEOUT_DATA_RECEIVED - 1000),
        takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response?.success) {

            // Verificar si hay datos en la respuesta
            const hasActa1 = !!response.data?.acta1File;
            const hasActa2 = !!response.data?.acta2File;

            if (!hasActa1 && !hasActa2) {
              this.handleError('No se encontraron imágenes para las actas solicitadas');
              return;
            }

            // Crear blobs en paralelo usando Promise.all para mayor eficiencia
            const promises: Promise<void>[] = [];

            if (hasActa1) {
              promises.push(Promise.resolve().then(() => {
                const blobAE = Utility.base64toBlob(response.data.acta1File, 'image/png');
                this.imgPngBase64Escrutinio = URL.createObjectURL(blobAE);
              }));
            }
            if (hasActa2) {
              promises.push(Promise.resolve().then(() => {
                const blobAI = Utility.base64toBlob(response.data.acta2File, 'image/png');
                this.imgPngBase64Instalacion = URL.createObjectURL(blobAI);
              }));
            }

            Promise.all(promises).then(() => {
              const endTime = performance.now();
              sessionStorage.setItem('loading', 'false');
            });
          } else {
            this.handleError(response?.message || 'Error al cargar las actas');
          }
        },
        error: (err) => {
          // Diferenciar entre errores de timeout y otros errores
          if (err.name === 'TimeoutError') {
            this.handleError('La carga de las actas ha excedido el tiempo máximo de espera');
          } else {
            this.handleError(err.message || 'Error en el servicio al cargar las actas');
          }
        }
      });
  }

  // Método centralizado para manejar errores
  private handleError(message: string) {
    console.error(message);
    sessionStorage.setItem('loading', 'false');

    // Mostrar mensaje al usuario
    alert("Error: " + message);

    // Cerrar la ventana después de un breve retraso
    setTimeout(() => {
      this.onCerrarModal();
    }, 1000);
  }

  rotarActa(){
    if (this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_ESCRUTINIO){
      this.anguloActaEscrutinio+=90;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaEscrutinio}deg)`); //transform-origin:
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio));
    }
    else if (this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO){
      this.anguloActaInstalacion+=90;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActaInstalacion}deg)`); //transform-origin:
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion));
    }

  }

  zoomInActa(){
    const tamanioMaximo = 250;
    if (this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_ESCRUTINIO && this.tamanioEscrutinio + 50 <= tamanioMaximo){
      this.tamanioEscrutinio += 50;
      const tamanioPorcentaje = `${this.tamanioEscrutinio}%`;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio)); //CS New
    }else if(this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO && this.tamanioInstalacion + 50 <= tamanioMaximo){
      this.tamanioInstalacion += 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion)); //CS New
    }
  }

  zoomOutActa(){
    const tamanioMinimo=100;
    if (this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_ESCRUTINIO && this.tamanioEscrutinio - 50 >= tamanioMinimo){
      this.tamanioEscrutinio -= 50;
      const tamanioPorcentaje = `${this.tamanioEscrutinio}%`;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaEscrutinio, this.tamanioEscrutinio)); //CS New
    } else if (this.tipoDocumentoView == Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO && this.tamanioInstalacion - 50 >= tamanioMinimo){
      this.tamanioInstalacion -= 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById(`img-${this.tipoDocumentoView}`);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActaInstalacion, this.tamanioInstalacion)); //CS New
    }
  }

  onCerrarModal(){
    // Notificar a la ventana principal
    if (window.opener && this.popupId) {
      window.opener.postMessage({
        type: 'POPUP_CLOSED',
        popupId: this.popupId
      }, window.location.origin);
    }

    // Limpiar sessionStorage
    sessionStorage.removeItem('windowLoaded');

    // Liberar recursos
    this.cleanupResources();

    // Cerrar ventana
    window.close();
  }

  // Método para limpiar recursos
  private cleanupResources() {
    // Liberar URLs de objeto
    if (this.imgPngBase64Escrutinio) {
      URL.revokeObjectURL(this.imgPngBase64Escrutinio);
      this.imgPngBase64Escrutinio = '';
    }

    if (this.imgPngBase64Instalacion) {
      URL.revokeObjectURL(this.imgPngBase64Instalacion);
      this.imgPngBase64Instalacion = '';
    }
  }

  ngOnDestroy() {
    // Eliminar listener de mensajes
    window.removeEventListener('message', this.messageHandler);

    // Limpiar recursos
    this.cleanupResources();
  }

  protected readonly Constantes = Constantes;


  tabsIds = [
    this.Constantes.CE_TIPO_ACTA_ESCRUTINIO,
    this.Constantes.CE_TIPO_ACTA_INSTALACION_SUFRAGIO
  ];

  onTabChange(event: MatTabChangeEvent): void {
    this.tipoDocumentoView = this.tabsIds[event.index];
  }
}
