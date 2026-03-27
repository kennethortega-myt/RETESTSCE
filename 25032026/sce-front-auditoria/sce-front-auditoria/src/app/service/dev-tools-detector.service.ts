import {Injectable, Renderer2, RendererFactory2} from '@angular/core';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class DevToolsDetectorService {

  private devToolsOpen = false;
  private readonly renderer: Renderer2;
  detectar = environment.detectarDevTools;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    if(this.detectar){
      this.detectDevTools();
    }

  }

  private detectDevTools() {
    setInterval(() => {
      const threshold = 100;
      const startTime = performance.now();
      debugger; // Esto pausa si las DevTools están abiertas
      const endTime = performance.now();

      if (endTime - startTime > threshold) {
        this.devToolsOpen = true;
        this.blockPage();
      } else {
        this.devToolsOpen = false;
        this.unblockPage();
      }
    }, 1000); // Revisa cada segundo
  }

  private blockPage() {
    const overlay = this.renderer.createElement('div');
    this.renderer.setStyle(overlay, 'position', 'fixed');
    this.renderer.setStyle(overlay, 'top', '0');
    this.renderer.setStyle(overlay, 'left', '0');
    this.renderer.setStyle(overlay, 'width', '100%');
    this.renderer.setStyle(overlay, 'height', '100%');
    this.renderer.setStyle(overlay, 'backgroundColor', 'white');
    this.renderer.setStyle(overlay, 'zIndex', '9999');
    this.renderer.setStyle(overlay, 'textAlign', 'center');
    this.renderer.setStyle(overlay, 'paddingTop', '20%');
    this.renderer.setProperty(overlay, 'innerHTML', '<h1>Por favor, cierra las herramientas de desarrollo para continuar.</h1>');

    document.body.appendChild(overlay);
  }

  private unblockPage() {
    const overlay = document.querySelector('div[style*="z-index: 9999"]');
    if (overlay) {
      overlay.remove();
    }
  }
}
