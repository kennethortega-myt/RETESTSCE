import {Injectable, OnDestroy} from '@angular/core';
import {MessageData} from '../interface/ventanaEmergente/messageData.interface';

@Injectable({
  providedIn: 'root'
})
export class VentanaEmergenteService implements OnDestroy {
  private popupWindows: { [key: string]: Window } = {};
  private messageRetryTimers: { [key: string]: any } = {};
  private readonly maxRetries = 3; // Optimizado: 3 reintentos en lugar de 5

  // Mapa de datos sensibles por popupId - solo en memoria, nunca en storage
  private popupData: { [popupId: string]: {
      acta1FileId: number | null;
      acta2FileId: number | null;
      source: string;
      esquemaNacion: boolean;
      acronimo: string;
    }} = {};

  private popupDataResolucion: { [popupId: string]: {
      idArchivoResolucion: number | null;
      source: string;
    }} = {};

  constructor() {
    // Escuchar mensajes de las ventanas emergentes
    window.addEventListener('message', this.handleMessage);
  }

  openVerActaGenericoPopup(resolucionId: number, source: string) {
    if (!resolucionId) {
      console.error('No se puede abrir la ventana: ID de resolución es nulo');
      alert("No hay acta disponible para visualizar.");
      return null;
    }

    // Generar identificador único para esta ventana
    const popupId = 'verActa_' + Date.now();

    // Almacenar los datos sensibles en memoria
    this.popupDataResolucion[popupId] = {
      idArchivoResolucion: resolucionId,
      source
    };

    try {
      // Abrir ventana con la nueva ruta
      const popup = window.open(
        `${globalThis.location.origin}/#/ventana-emergente/ver-actas-generico?popup=true&source=${source}&id=${popupId}`,
        '_blank',
        'width=1360,height=768'
      );

      // Verificar si la ventana se abrió correctamente
      if (!popup || popup.closed || popup.closed === undefined) {
        console.error('La ventana emergente fue bloqueada por el navegador');
        delete this.popupDataResolucion[popupId];
        return null;
      }

      // Almacenar referencia a la ventana
      this.popupWindows[popupId] = popup;

      // Datos a enviar (adaptados para resolución)
      const dataMessage = {
        type: 'RESOLUCION_DATA',
        payload: {
          resolucionId: resolucionId,
          popupId,
          source
        }
      };

      // Enviar datos con retries
      this.sendMessageWithRetries(popup, dataMessage, popupId);
      // Establecer detector para cuando la ventana se cierre
      this.setupPopupCloseDetector(popup, popupId);

      return popup;
    } catch (error) {
      console.error('Error al abrir la ventana emergente:', error);
      alert("Error al abrir la ventana emergente: " + (error.message ?? "Error desconocido"));
      delete this.popupDataResolucion[popupId];
      return null;
    }
  }

  openVerResolucionPopup(resolucionId: number, source: string) {
    if (!resolucionId) {
      console.error('No se puede abrir la ventana: ID de resolución es nulo');
      alert("No hay resolución disponible para visualizar.");
      return null;
    }

    // Generar identificador único para esta ventana
    const popupId = 'verResolucion_' + Date.now();

    // Almacenar los datos sensibles en memoria
    this.popupDataResolucion[popupId] = {
      idArchivoResolucion: resolucionId,
      source
    };

    try {
      // Abrir ventana con la nueva ruta
      const popup = window.open(
        `${globalThis.location.origin}/#/ventana-emergente/ver-resolucion?popup=true&source=${source}&id=${popupId}`,
        '_blank',
        'width=1360,height=768'
      );

      // Verificar si la ventana se abrió correctamente
      if (!popup || popup.closed || popup.closed === undefined) {
        console.error('La ventana emergente fue bloqueada por el navegador');
        delete this.popupDataResolucion[popupId];
        return null;
      }

      // Almacenar referencia a la ventana
      this.popupWindows[popupId] = popup;

      // Datos a enviar (adaptados para resolución)
      const dataMessage = {
        type: 'RESOLUCION_DATA',
        payload: {
          resolucionId: resolucionId,
          popupId,
          source
        }
      };

      // Enviar datos con retries
      this.sendMessageWithRetries(popup, dataMessage, popupId);
      // Establecer detector para cuando la ventana se cierre
      this.setupPopupCloseDetector(popup, popupId);

      return popup;
    } catch (error) {
      console.error('Error al abrir la ventana emergente:', error);
      alert("Error al abrir la ventana emergente: " + (error.message ?? "Error desconocido"));
      delete this.popupDataResolucion[popupId];
      return null;
    }
  }

  openVerActasPopup(acta1Id: number | null, acta2Id: number | null, source: string, esquemaNacion: boolean = false, acronimo: string = null) {

    if (!acta1Id && !acta2Id) {
      console.error('No se puede abrir la ventana: ambos IDs de actas son nulos');
      // Opcionalmente mostrar un mensaje al usuario
      alert("No hay actas disponibles para visualizar.");
      return null;
    }

    // Generar identificador único para esta ventana
    const popupId = 'verActas_' + Date.now();

    // Almacenar los datos sensibles en memoria, nunca en storage
    this.popupData[popupId] = {
      acta1FileId: acta1Id,
      acta2FileId: acta2Id,
      source,
      esquemaNacion,
      acronimo
    };

    try {
      // URL encoding para mayor seguridad y compatibilidad
      const baseUrl = globalThis.location.origin;
      const encodedSource = encodeURIComponent(source);
      const popupUrl = `${baseUrl}/#/ventana-emergente/ver-actas?popup=true&source=${encodedSource}&id=${popupId}`;

      // Abrir ventana con configuraciones optimizadas
      const popup = window.open(
        popupUrl,
        '_blank',
        'width=700,height=1000,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no,status=no'
      );

      // Verificar si la ventana se abrió correctamente
      if (!popup || popup.closed || popup.closed === undefined) {
        console.error('La ventana emergente fue bloqueada por el navegador');
        delete this.popupData[popupId]; // Limpiar datos sensibles
        return null;
      }

      // Almacenar referencia a la ventana
      this.popupWindows[popupId] = popup;

      // Datos a enviar
      const dataMessage = {
        type: 'ACTA_DATA',
        payload: {
          acta1FileId: acta1Id,
          acta2FileId: acta2Id,
          popupId,
          source,
          esquemaNacion,
          acronimo
        }
      };

      // Enviar datos con retries
      this.sendMessageWithRetries(popup, dataMessage, popupId);

      // Establecer detector para cuando la ventana se cierre
      this.setupPopupCloseDetector(popup, popupId);

      return popup;
    } catch (error) {
      console.error('Error al abrir la ventana emergente:', error);
      alert("Error al abrir la ventana emergente: " + (error.message ?? "Error desconocido"));
      delete this.popupData[popupId]; // Limpiar datos sensibles
      return null;
    }
  }

  // Manejador de mensajes desde ventanas emergentes
  private readonly handleMessage = (event: MessageEvent) => {
    // Validaciones iniciales (early returns para reducir anidamiento)
    if (!this.isValidMessage(event)) {
      return;
    }

    const data = event.data as MessageData;
    const messageType = data.type;

    try {
      // Usar Map para delegación en lugar de if/else anidados
      this.processMessage(messageType, data, event);
    } catch (error) {
      console.error('Error procesando mensaje:', error, data);
    }
  };

  private isValidMessage(event: MessageEvent): boolean {
    // Verificar origen por seguridad
    if (event.origin !== globalThis.location.origin) {
      console.warn('Mensaje rechazado de origen desconocido:', event.origin);
      return false;
    }

    // Verificar que los datos sean válidos
    if (!event.data || typeof event.data !== 'object') {
      console.warn('Mensaje rechazado: formato inválido', event.data);
      return false;
    }

    return true;
  }

  private processMessage(messageType: string, data: MessageData, event: MessageEvent): void {
    // Usar Map para delegación de handlers (más eficiente que if/else chain)
    const messageHandlers = new Map<string, (data: MessageData, event: MessageEvent) => void>([
      ['ACTA_DATA_RECEIVED', this.handleDataReceived.bind(this)],
      ['REQUEST_ACTA_DATA', this.handleRequestActaData.bind(this)],
      ['POPUP_CLOSED', this.handlePopupClosed.bind(this)],
      ['REQUEST_RESOLUCION_DATA', this.handleRequestResolucionData.bind(this)],
      ['RESOLUCION_DATA_RECEIVED', this.handleDataReceived.bind(this)]
    ]);

    const handler = messageHandlers.get(messageType);

    if (handler) {
      handler(data, event);
    } else {
      console.warn('Tipo de mensaje desconocido:', messageType, data);
    }
  }

  // ===== HANDLERS ESPECÍFICOS POR TIPO DE MENSAJE =====

  private handleDataReceived(data: MessageData): void {
    const { popupId } = data;

    this.clearRetryTimer(popupId);
  }

  private handleRequestActaData(data: MessageData, event: MessageEvent): void {
    const { popupId } = data;

    if (!popupId) {
      console.error('Se recibió solicitud sin popupId');
      return;
    }

    const windowState = this.analyzeWindowState(popupId);
    this.handleActaDataByState(windowState, popupId, event);
  }

  private handlePopupClosed(data: MessageData): void {
    const { popupId } = data;

    if (!popupId) {
      console.warn('Mensaje de cierre sin popupId');
      return;
    }

    this.clearResources(popupId);
  }

  private handleRequestResolucionData(data: MessageData): void {
    const { popupId } = data;

    if (this.popupDataResolucion[popupId] && this.popupWindows[popupId]) {
      this.sendResolucionData(popupId);
    } else if (this.popupWindows[popupId]) {
      this.sendResolucionError(popupId, 'Datos de resolución no encontrados');
    }
  }

  // ===== MÉTODOS AUXILIARES =====

  private analyzeWindowState(popupId: string): 'HAS_BOTH' | 'HAS_WINDOW_NO_DATA' | 'HAS_DATA_NO_WINDOW' | 'HAS_NOTHING' {
    const hasData = !!this.popupData[popupId];
    const hasWindow = !!this.popupWindows[popupId] && !this.popupWindows[popupId].closed;

    if (hasData && hasWindow) return 'HAS_BOTH';
    if (!hasData && hasWindow) return 'HAS_WINDOW_NO_DATA';
    if (hasData && !hasWindow) return 'HAS_DATA_NO_WINDOW';
    return 'HAS_NOTHING';
  }

  private handleActaDataByState(
    state: 'HAS_BOTH' | 'HAS_WINDOW_NO_DATA' | 'HAS_DATA_NO_WINDOW' | 'HAS_NOTHING',
    popupId: string,
    event: MessageEvent
  ): void {
    const stateHandlers = {
      'HAS_BOTH': () => this.handleScenario1_HasBoth(popupId),
      'HAS_WINDOW_NO_DATA': () => this.handleScenario2_HasWindowNoData(popupId),
      'HAS_DATA_NO_WINDOW': () => this.handleScenario3_HasDataNoWindow(popupId, event),
      'HAS_NOTHING': () => this.handleScenario4_HasNothing(popupId, event)
    };

    const handler = stateHandlers[state];
    if (handler) {
      handler();
    }
  }

  private handleScenario1_HasBoth(popupId: string): void {
    const { acta1FileId, acta2FileId, source } = this.popupData[popupId];

    const dataMessage = {
      type: 'ACTA_DATA',
      payload: {
        acta1FileId,
        acta2FileId,
        popupId,
        source
      }
    };

    this.sendMessageWithRetries(this.popupWindows[popupId], dataMessage, popupId, 0);
  }

  private handleScenario2_HasWindowNoData(popupId: string): void {
    console.warn('Ventana encontrada pero datos no disponibles para', popupId);

    this.popupWindows[popupId].postMessage({
      type: 'ACTA_DATA_ERROR',
      message: 'Datos no encontrados. La sesión puede haber expirado.'
    }, globalThis.location.origin);
  }

  private handleScenario3_HasDataNoWindow(popupId: string, event: MessageEvent): void {
    console.warn('Datos encontrados pero ventana no disponible para', popupId);

    if (event.source && event.source instanceof Window) {
      this.popupWindows[popupId] = event.source;
      this.handleScenario1_HasBoth(popupId);
    } else {
      console.error('No se pudo obtener referencia a la ventana desde el evento');
      delete this.popupData[popupId];
    }
  }

  private handleScenario4_HasNothing(popupId: string, event: MessageEvent): void {
    console.error('Ni datos ni ventana encontrados para', popupId);

    if (event.source && event.source instanceof Window) {
      event.source.postMessage({
        type: 'ACTA_DATA_ERROR',
        message: 'Sesión expirada o ventana no reconocida. Por favor cierre y vuelva a abrir.'
      }, globalThis.location.origin);
    }
  }

  private sendResolucionData(popupId: string): void {
    const { idArchivoResolucion: resolucionId, source } = this.popupDataResolucion[popupId];

    const dataMessage = {
      type: 'RESOLUCION_DATA',
      payload: {
        resolucionId,
        popupId,
        source
      }
    };

    this.sendMessageWithRetries(this.popupWindows[popupId], dataMessage, popupId, 0);
  }

  private sendResolucionError(popupId: string, message: string): void {
    this.popupWindows[popupId].postMessage({
      type: 'RESOLUCION_DATA_ERROR',
      message
    }, globalThis.location.origin);
  }

  private clearRetryTimer(popupId: string): void {
    if (this.messageRetryTimers[popupId]) {
      clearTimeout(this.messageRetryTimers[popupId]);
      delete this.messageRetryTimers[popupId];
    }
  }

  private setupPopupCloseDetector(popup: Window, popupId: string): void {
    const checkPopupClosed = setInterval(() => {
      if (!popup || popup.closed) {
        clearInterval(checkPopupClosed);
        this.clearResources(popupId);
      }
    }, 1000);
  }


  // Enviar mensaje con reintentos
  private sendMessageWithRetries(popup: Window, message: any, popupId: string, retryCount = 0) {
    // Cancelar cualquier timer previo para este popup
    if (this.messageRetryTimers[popupId]) {
      clearTimeout(this.messageRetryTimers[popupId]);
    }

    // Verificar si la ventana aún está abierta
    if (!popup || popup.closed) {
      this.clearResources(popupId);
      return;
    }

    try {
      // Intentar enviar el mensaje
      popup.postMessage(message, globalThis.location.origin);

      // Configurar un timer para verificar si se recibió confirmación
      this.messageRetryTimers[popupId] = setTimeout(() => {
        // Si aún no hemos recibido confirmación y no hemos excedido los reintentos
        if (this.popupWindows[popupId] && retryCount < this.maxRetries) {
          this.sendMessageWithRetries(popup, message, popupId, retryCount + 1);
        } else if (retryCount >= this.maxRetries) {
          console.warn(`Máximo de reintentos alcanzado para ventana ${popupId}`);
        }
      }, 500); // Optimizado: 500ms en lugar de 1000ms
    } catch (e) {
      console.error('Error enviando mensaje a la ventana emergente:', e);

      // Reintentar si no hemos excedido el máximo
      if (retryCount < this.maxRetries) {
        this.messageRetryTimers[popupId] = setTimeout(() => {
          this.sendMessageWithRetries(popup, message, popupId, retryCount + 1);
        }, 500); // Optimizado: 500ms en lugar de 1000ms
      }
    }
  }

  closePopup(popupId: string) {
    if (this.popupWindows[popupId]) {
      this.popupWindows[popupId].close();
      this.clearResources(popupId);
    }
  }

  // Método para limpiar todos los recursos asociados a un popup
  private clearResources(popupId: string) {
    // Limpiar timers de reintento
    if (this.messageRetryTimers[popupId]) {
      clearTimeout(this.messageRetryTimers[popupId]);
      delete this.messageRetryTimers[popupId];
    }

    // Eliminar referencia a la ventana
    delete this.popupWindows[popupId];

    // Eliminar datos sensibles
    delete this.popupData[popupId];
    delete this.popupDataResolucion[popupId];
  }

  // Limpiar todos los recursos al destruir el servicio
  ngOnDestroy() {
    // Eliminar listener de mensajes
    window.removeEventListener('message', this.handleMessage);

    // Cancelar todos los timers
    Object.keys(this.messageRetryTimers).forEach(popupId => {
      clearTimeout(this.messageRetryTimers[popupId]);
    });

    // Cerrar todas las ventanas emergentes abiertas
    Object.keys(this.popupWindows).forEach(popupId => {
      try {
        const popup = this.popupWindows[popupId];
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {
        console.error(`Error cerrando ventana ${popupId}:`, e);
      }
    });

    // Limpiar colecciones
    this.popupWindows = {};
    this.messageRetryTimers = {};
    this.popupData = {};
    this.popupDataResolucion = {};
  }
}
