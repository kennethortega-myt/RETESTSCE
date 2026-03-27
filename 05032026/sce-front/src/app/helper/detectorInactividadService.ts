import {Injectable, NgZone} from "@angular/core";
import {AuthService} from "../service/auth-service.service";
import {Router} from "@angular/router";
import {GeneralService} from "../service/general-service.service";

@Injectable({
  providedIn: 'root'
})
export class DetectorInactividadService{
  private timeoutId: any;
  private readonly timeoutDuration = 30 * 60 * 1000; // en milisegundos

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly ngZone: NgZone,
    public generalService: GeneralService
  ) {
  }

  public startMonitoring(): void {
    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'keydown', 'click', 'touchstart'];
      events.forEach(event => window.addEventListener(event, () => this.resetTimeout()));
    });

    this.resetTimeout();  // Iniciar el timeout por primera vez
  }

  public stopMonitoring(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }



  private resetTimeout(): void {
    // Limpiar el timeout anterior
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Configurar un nuevo timeout
    this.timeoutId = setTimeout(() => this.handleInactivity(), this.timeoutDuration);
  }

  private handleInactivity(): void {
    // Si el usuario está inactivo por el tiempo especificado, cerrar sesión y redirigir al login
    this.generalService.cerrarSesion(this.auth.currentUser()).subscribe({
      next: () => {
        this.auth.logout();
        this.ngZone.run(() => this.router.navigate(['/inicio']));
      },
      error: (err) => {
        this.auth.logout();
        this.ngZone.run(() => this.router.navigate(['/inicio']));
      }
    }
    );
  }

}
