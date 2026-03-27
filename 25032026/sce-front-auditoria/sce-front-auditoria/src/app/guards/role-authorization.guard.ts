import { CanActivateFn, Router } from "@angular/router";
import { inject } from "@angular/core";
import { AuthService } from "../service/auth-service.service";
import { AuthStatus } from "../model/enum/auth-status.enum";
import { JwtHelperService } from "@auth0/angular-jwt";
import { ROUTE_PERMISSIONS_CONFIG } from "../config/route-permissions.config";

const helper = new JwtHelperService();

export const roleAuthorizationGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado primero
  if (authService.authStatus() !== AuthStatus.authenticated) {
    router.navigateByUrl('/inicio');
    return false;
  }

  // Obtener rol del usuario
  const userRole = getUserRole();
  if (!userRole) {
    router.navigateByUrl('/main/principal');
    return false;
  }

  //SOLO USA CONFIGURACIÓN CENTRALIZADA
  const requestedPath = state.url;
  const routeConfig = findConfigByPath(requestedPath);

  if (!routeConfig) {
    // Si no hay configuración específica, permitir acceso
    return true;
  }

  const hasPermission = routeConfig.requiredRoles.includes(userRole);

  if (!hasPermission) {
    router.navigateByUrl('/main/principal');
    return false;
  }

  return true;
};

function getUserRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const tokenString = JSON.parse(token);
    const decodedToken = helper.decodeToken(tokenString);
    return decodedToken['per'] || null;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

function findConfigByPath(requestedPath: string): any {
  const entries = Object.entries(ROUTE_PERMISSIONS_CONFIG);
  return entries.find(([_, config]) => config.path === requestedPath)?.[1] || null;
}
