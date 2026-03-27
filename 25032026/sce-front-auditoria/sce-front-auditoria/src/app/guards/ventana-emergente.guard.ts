import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {SourceVentanaEmergenteService} from '../service/source-ventana-emergente.service';

@Injectable({
  providedIn: 'root'
})
export class VentanaEmergenteGuard implements CanActivate{

  constructor(private readonly router: Router,
              private readonly sourceVentanaEmergenteService:SourceVentanaEmergenteService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Verifica si vinimos de una ventana padre (ventana emergente legítima)
    const opener = window.opener;
    const isPopupWindow = opener && opener !== window;

    // Obtener el valor de source de los parámetros
    const source = route.queryParams['source'];

    // Verificar si hay parámetro de consulta que indica acceso válido
    const hasValidParams = route.queryParams['popup'] === 'true' &&
      this.sourceVentanaEmergenteService.isValidSource(source) &&  // Comprueba si el source está en la lista de permitidos
      !!route.queryParams['id'];

    // Permitir acceso si es ventana emergente O hay datos de acta O tiene parámetros válidos
    if (isPopupWindow && hasValidParams) {
      return true;
    }

    // Si llega aquí, es acceso directo no autorizado - redirigir al principal
    this.router.navigate(['/main/principal']);
    return false;
  }
}
