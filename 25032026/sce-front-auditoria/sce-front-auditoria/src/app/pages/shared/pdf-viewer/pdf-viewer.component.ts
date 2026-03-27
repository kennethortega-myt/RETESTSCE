import {Component, Input, OnChanges, OnDestroy, OnInit, signal, SimpleChanges} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {ScrollModeType} from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent implements OnInit, OnDestroy, OnChanges{

  @Input() pdfBlob!: Blob;  // Entrada para un Blob PDF
  @Input() actualizarPaginas!: (info: { total: number; revisadas: Set<number> }) => void;
  @Input() paginasLabels: string[] = [];

  pdfUrl!: string;
  totalPages = 0; // Número total de páginas en el PDF
  selectedPages: Set<number> = new Set();
  currentPage: number = 1;
  scrollMode: ScrollModeType = ScrollModeType.page;

  private thumbnailObserver: MutationObserver | null = null;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    this.setupThumbnailObserver();
  }

  reiniciarValores(){
    this.currentPage = 1;
    this.selectedPages.clear();
    this.totalPages = 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.reiniciarValores();
    if (changes['pdfBlob'] && this.pdfBlob) {
      sessionStorage.setItem('loading', 'true');
      this.pdfUrl = URL.createObjectURL(this.pdfBlob);
      this.selectedPages.add(this.currentPage);
    }
  }

  onDocumentLoaded() {
    // Desactiva el indicador de carga
    setTimeout(()=>{
      sessionStorage.setItem('loading', 'false');
      this.addPageLabelsToThumbnails();
    },1500);
  }

  onPagesLoaded(event: any) {
    this.totalPages = event.pagesCount;
    this.removeThumbnailsTooltip();

    // Generar etiquetas de página si no se proporcionaron
    if (!this.paginasLabels || this.paginasLabels.length === 0) {
      this.paginasLabels = Array.from({ length: this.totalPages }, (_, i) => `Pag. ${i + 1}`);
    }

    // Intentar agregar las etiquetas
    this.addPageLabelsToThumbnails();

    this.actualizarPaginas({ total: this.totalPages, revisadas: this.selectedPages });
  }

  onPageChange(pageNumber: number) {
    if (!pageNumber || isNaN(pageNumber)) {
      console.warn("onPageChange: Número de página inválido.");
      return;
    }

    this.currentPage = pageNumber;
    this.selectedPages.add(this.currentPage);
    this.actualizarPaginas({ total: this.totalPages, revisadas: this.selectedPages });
  }

  removeThumbnailsTooltip() {
    setTimeout(() => {
      const thumbnails = document.querySelectorAll('#thumbnailView a');
      thumbnails.forEach((thumb) => {
        thumb.removeAttribute('title'); // Elimina el tooltip
      });
    }, 500); // Esperamos un poco para asegurarnos de que los elementos están listos
  }

  setupThumbnailObserver() {
    // Crear un observador que monitorea cambios en el contenedor de miniaturas
    this.thumbnailObserver = new MutationObserver((mutations) => {
      // Cuando hay cambios, intentamos agregar las etiquetas
      this.addPageLabelsToThumbnails();
    });

    // Configurar un temporizador para iniciar la observación cuando el DOM esté listo
    setTimeout(() => {
      const thumbnailContainer = document.getElementById('thumbnailView');
      if (thumbnailContainer) {
        // Comenzar a observar el contenedor de miniaturas
        this.thumbnailObserver?.observe(thumbnailContainer, {
          childList: true,      // Observar adiciones/eliminaciones de hijos
          subtree: true,        // Observar todo el subárbol
          characterData: false, // No nos interesan cambios de texto
          attributes: false     // No nos interesan cambios de atributos
        });

        // Intentar agregar las etiquetas inmediatamente
        this.addPageLabelsToThumbnails();
      }
    }, 2000); // Dar tiempo para que el visor PDF se inicialice

    // También monitorear el evento de scroll para mantener las etiquetas actualizadas
    document.addEventListener('scroll', this.handleScroll.bind(this), true);
  }

  handleScroll(event: Event) {
    // Verificar si el scroll ocurre en el área de miniaturas
    const target = event.target as HTMLElement;
    if (target && target.id === 'thumbnailView' || target.closest('#thumbnailView')) {
      // Retrasar ligeramente para permitir que el DOM se actualice
      setTimeout(() => {
        this.addPageLabelsToThumbnails();
      }, 100);
    }
  }

  /**
   * Agrega etiquetas de número de página a las miniaturas del PDF
   */
  addPageLabelsToThumbnails() {
    // Obtener todas las miniaturas
    const thumbnails = document.querySelectorAll('#thumbnailView a');

    // Si no hay miniaturas o no tenemos etiquetas, no hacer nada
    if (!thumbnails.length || !this.paginasLabels.length) return;

    // Procesar cada miniatura
    thumbnails.forEach((thumb, index) => {
      // Verificar si es una miniatura válida y si ya tiene una etiqueta
      if (!thumb || index >= this.paginasLabels.length || thumb.querySelector('.page-label')) {
        return;
      }

      // Crear el elemento de etiqueta
      const labelDiv = document.createElement('div');
      labelDiv.className = 'page-label';
      labelDiv.textContent = this.paginasLabels[index];

      // Estilos para la etiqueta
      labelDiv.style.position = 'absolute';
      labelDiv.style.bottom = '0';
      labelDiv.style.left = '0';
      labelDiv.style.right = '0';
      labelDiv.style.textAlign = 'center';
      labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      labelDiv.style.color = 'white';
      labelDiv.style.padding = '2px 0';
      labelDiv.style.fontSize = '12px';
      labelDiv.style.fontWeight = 'bold';

      // Asegurar que el contenedor de la miniatura tenga posición relativa
      const thumbnailContainer = thumb.querySelector('.thumbnail') as HTMLElement;
      if (thumbnailContainer) {
        thumbnailContainer.style.position = 'relative';
        thumbnailContainer.appendChild(labelDiv);
      } else {
        // Si no encuentra el contenedor .thumbnail, intentar agregar al elemento <a> directamente
        //thumb.style.position = 'relative';
        thumb.appendChild(labelDiv);
      }
    });
  }

  ngOnDestroy() {
    // Detener y limpiar el observador
    if (this.thumbnailObserver) {
      this.thumbnailObserver.disconnect();
      this.thumbnailObserver = null;
    }

    // Eliminar el listener de scroll
    document.removeEventListener('scroll', this.handleScroll.bind(this), true);

    // Revocar la URL del objeto para liberar memoria
    if (this.pdfUrl) {
      URL.revokeObjectURL(this.pdfUrl);
    }
  }
}
