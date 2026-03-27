import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ROUTE_PERMISSIONS_CONFIG, MENU_PARENTS_CONFIG, RoutePermissionConfig } from '../config/route-permissions.config';

const helper = new JwtHelperService();

export interface MenuPermission {
  nombre: string;
  icon?: string;
  url: string;
  descripcion?: string;
  perfiles: string[];
  tieneHijos?: boolean;
  hijos?: MenuPermission[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {


  constructor() {}

  /**
   * Verifica si el usuario tiene permiso para acceder a una ruta específica
   * SOLO USA CONFIGURACIÓN CENTRALIZADA
   */
  hasPermissionForRoute(route: string): boolean {
    const userRole = this.getCurrentUserRole();
    if (!userRole) return false;

    // Buscar en la configuración centralizada
    const routeConfig = this.findConfigByPath(route);
    if (!routeConfig) {
      return true; // Si no hay restricciones configuradas, permitir acceso
    }

    return routeConfig.requiredRoles.includes(userRole);
  }

  /**
   * Busca la configuración de ruta por path en la configuración centralizada
   */
  private findConfigByPath(path: string): RoutePermissionConfig | null {
    const entry = Object.entries(ROUTE_PERMISSIONS_CONFIG)
      .find(([_, config]) => config.path === path);

    return entry ? entry[1] : null;
  }

  /**
   * Genera el menú automáticamente desde la configuración centralizada
   * Ordenamiento global mezclando padres e ítems sin hijos
   */
  private generateMenuFromCentralizedConfig(userRole: string): MenuPermission[] {
    const allMenuItems: Array<{item: MenuPermission, order: number}> = [];
    // Primero crear menús padre desde MENU_PARENTS_CONFIG
    const parentMenus = this.buildParentMenus(userRole);

    // Luego agregar rutas que tienen acceso el usuario
    this.addRouteItems(userRole, parentMenus, allMenuItems);

    // Ordenar hijos de menús padre
    for(const parentMenu of Object.values(parentMenus)) {
      if (parentMenu.hijos && parentMenu.hijos.length > 0) {
        parentMenu.hijos.sort((a, b) => {
          const aConfig = Object.values(ROUTE_PERMISSIONS_CONFIG).find(c => c.path === a.url);
          const bConfig = Object.values(ROUTE_PERMISSIONS_CONFIG).find(c => c.path === b.url);
          const aOrder = aConfig?.menuConfig?.order || 999;
          const bOrder = bConfig?.menuConfig?.order || 999;
          return aOrder - bOrder;
        });
      }
    }

    // Agregar menús padre que tienen hijos a la lista para ordenamiento global
    for(const [parentKey, parentConfig] of Object.entries(MENU_PARENTS_CONFIG)) {
      if (!!parentMenus[parentKey] && !!parentMenus[parentKey].hijos && parentMenus[parentKey].hijos.length > 0) {
        allMenuItems.push({
          item: parentMenus[parentKey],
          order: parentConfig.order || 999
        });
      }
    }

    //ORDENAMIENTO GLOBAL: Mezclar padres e ítems sin hijos por order
    allMenuItems.sort((a, b) => a.order - b.order);

    return allMenuItems.map(item => item.item);
  }

  private buildParentMenus(userRole: string): Record<string, MenuPermission> {
    const parentMenus: Record<string, MenuPermission> = {};
    for (const [parentKey, parentConfig] of Object.entries(MENU_PARENTS_CONFIG)) {
      if (parentConfig.requiredRoles.includes(userRole)) {
        parentMenus[parentKey] = {
          nombre: parentConfig.nombre,
          icon: parentConfig.icon,
          url: '',
          perfiles: parentConfig.requiredRoles,
          tieneHijos: true,
          hijos: []
        };
      }
    }
    return parentMenus;
  }

  private addRouteItems(
    userRole: string,
    parentMenus: Record<string, MenuPermission>,
    allMenuItems: Array<{ item: MenuPermission; order: number }>
  ): void {
    for(const [_routeKey, config] of Object.entries(ROUTE_PERMISSIONS_CONFIG)){
      if (!config.requiredRoles.includes(userRole)) continue;
      if (!config.menuConfig) continue;

      const menuItem: MenuPermission = {
        nombre: config.menuConfig.nombre,
        url: config.path,
        perfiles: config.requiredRoles,
        icon: config.menuConfig.icon
      };

      // Si tiene padre, agregarlo al menú padre
      if (config.menuConfig.parent && parentMenus[config.menuConfig.parent]) {
        if (!parentMenus[config.menuConfig.parent].hijos) {
          parentMenus[config.menuConfig.parent].hijos = [];
        }
        parentMenus[config.menuConfig.parent].hijos.push(menuItem);
      } else {
        // Si no tiene padre, agregarlo a la lista para ordenamiento global
        allMenuItems.push({
          item: menuItem,
          order: config.menuConfig.order || 999
        });
      }
    }
  }

  /**
   * Obtiene el rol del usuario actual desde el token JWT
   */
  getCurrentUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const tokenString = JSON.parse(token);
      const decodedToken = helper.decodeToken(tokenString);

      return decodedToken['per'] || null;
    } catch (error) {
      console.error('Error al obtener rol del usuario:', error);
      return null;
    }
  }

  /**
   * Filtra el menú según los permisos del usuario
   * SOLO USA CONFIGURACIÓN CENTRALIZADA
   */
  getAuthorizedMenu(): MenuPermission[] {
    const userRole = this.getCurrentUserRole();
    if (!userRole) return [];

    return this.generateMenuFromCentralizedConfig(userRole);
  }

}
