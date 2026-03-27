import { Constantes } from '../helper/constantes';

export interface RoutePermissionConfig {
  path: string;
  component?: any;
  requiredRoles: string[];
  menuConfig?: {
    nombre: string;
    icon?: string;
    descripcion?: string;
    parent?: string; // Para rutas anidadas
    order?: number; // Para ordenamiento
    tieneHijos?: boolean;
  };
}

/**
 * CONFIGURACIÓN ÚNICA DE PERMISOS
 * IMPORTANTE: Esta es la única fuente de verdad para permisos
 * Al cambiar aquí, se actualizan automáticamente:
 * 1. Guards de routing
 * 2. Validaciones de servicio
 * 3. Filtrado de menús
 */
export const ROUTE_PERMISSIONS_CONFIG: Record<string, RoutePermissionConfig> = {

  // ==================== INSTALACIÓN Y CONFIGURACIÓN ====================
  'carga-inicial': {
    path: '/main/carga-inicial',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Carga de configuración inicial',
      parent: 'instalacion-configuracion',
      order: 1
    }
  },
  'descarga-instalacion': {
    path: '/main/descarga-instalacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Descarga e instalación del SCE-Scanner',
      parent: 'instalacion-configuracion',
      order: 2
    }
  },
  'instalacion-padron': {
    path: '/main/instalacion-padron',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Importación de padrones',
      parent: 'instalacion-configuracion',
      order: 3
    }
  },

  // ==================== DOCUMENTOS ELECTORALES POR PROCESO NACION - SIN HIJOS ====================
  'configuracionDocumentacionProcesal': {
    path: '/main/configuracionDocumentacionProcesal',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Documentos Electorales por Proceso',
      icon: 'iconDocuentosElectoralesProceso.svg',
      order: 2
    }
  },
  // ==================== DOCUMENTOS ELECTORALES POR ELECCION NACION - SIN HIJOS ====================
  'configuracionDocumentacionPorEleccion': {
    path: '/main/configuraciones/paso1',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Documentos Electorales por Elección',
      icon: 'iconDocumentosElectoralesEleccion.svg',
      order: 3
    }
  },

  // ==================== PROCESO ELECTORAL NACION - SIN HIJOS ====================
  'proceso': {
    path: '/main/proceso',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Proceso Electoral',
      icon: 'menu-proceso.svg',
      order: 4
    }
  },

  // ==================== VERIFICACIÓN DE VERSIÓN - SIN HIJOS ====================
  'verificacion-version': {
    path: '/main/verificacion-version',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Verificación de versión',
      icon: 'verificacion_version.svg',
      order: 5
    }
  },

  // ==================== VERIFICACIÓN DE VERSIÓN NACIÓN - SIN HIJOS ====================
  'verificacion-version-nacion': {
    path: '/main/verificacion-version-nacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Verificación de versión',
      icon: 'verificacion_version.svg',
      order: 6
    }
  },

  // ==================== PUESTA CERO - SIN HIJOS ====================
  'puesta-cero': {
    path: '/main/puesta-cero',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Puesta a cero',
      icon: 'puesta_cero.svg',
      order: 7
    }
  },

  // ==================== PUESTA CERO NACIÓN - SIN HIJOS ====================
  'puesta-cero-nacion': {
    path: '/main/puesta-cero-nacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Puesta a cero',
      icon: 'puesta_cero.svg',
      order: 8
    }
  },
  // ==================== ANEXOS NACIÓN - SIN HIJOS ====================
  'anexos': {
    path: '/main/anexos',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Anexos',
      icon: 'iconAnexo.svg',
      order: 9
    }
  },
  // ==================== CONTROL DE DIGITALIZACIÓN ====================
  'control': {
    path: '/main/control',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Actas',
      parent: 'control-digitalizacion',
      order: 1
    }
  },

  'control-sc': {
    path: '/main/controlSC',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Actas Sobre Celeste',
      parent: 'control-digitalizacion',
      order: 2
    }
  },

  'denuncias': {
    path: '/main/denuncias',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Denuncias',
      parent: 'control-digitalizacion',
      order: 3
    }
  },

  'hoja-asistencia': {
    path: '/main/hoja-asistencia',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Hojas de asistencia',
      parent: 'control-digitalizacion',
      order: 4
    }
  },

  'lista-electoral': {
    path: '/main/lista-electoral',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Lista de electores',
      parent: 'control-digitalizacion',
      order: 5
    }
  },

  'resoluciones': {
    path: '/main/resoluciones',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Resoluciones',
      parent: 'control-digitalizacion',
      order: 6
    }
  },

  // ==================== DIGITACIÓN DE ACTAS - SIN HIJOS ====================
  'verificacion-actas': {
    path: '/main/verificacion-actas',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI, Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Digitación de Actas',
      icon: 'digitacion-actas.svg',
      order: 11
    }
  },

  // ==================== ACTAS POR CORREGIR - SIN HIJOS ====================
  'actas-corregir': {
    path: '/main/actas-corregir',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Actas por Corregir',
      icon: 'iconActasCorregir.svg',
      order: 12
    }
  },
  // ==================== CONTROL CALIDAD - SIN HIJOS ====================
  'control-calidad': {
    path: '/main/control-calidad',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_CON],
    menuConfig: {
      nombre: 'Control de Calidad',
      icon: 'control-calidad.svg',
      order: 13
    }
  },
  // ==================== HABILITAR ACTAS STAE - SIN HIJOS ====================
  'habilitar-actas-stae': {
    path: '/main/habilitar-actas-stae',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Habilitar actas STAE',
      icon: 'icon_habilitar_acta_stae.svg',
      order: 14
    }
  },
  // ==================== RESOLUCIÓN JEE JNE ====================
  'envio-actas-jurado': {
    path: '/main/envio-actas-jurado',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Envío de Actas al JEE/JNE',
      parent: 'resolucion-jee-jne',
      order: 1
    }
  },
  'registro-actas-devueltas': {
    path: '/main/registro-actas-devueltas',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Registro de Actas Devueltas',
      parent: 'resolucion-jee-jne',
      order: 2
    }
  },
  'lista-resoluciones': {
    path: '/main/lista-resoluciones',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Lista de Resoluciones JEE/JNE',
      parent: 'resolucion-jee-jne',
      order: 3
    }
  },
  'resoluciones-devueltas': {
    path: '/main/resoluciones-devueltas',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Seguimiento JEE/JNE',
      parent: 'resolucion-jee-jne',
      order: 4
    }
  },
  'verificacion-resolucion': {
    path: '/main/verificacion-resolucion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Aplicación de Resolución',
      parent: 'resolucion-jee-jne',
      order: 5
    }
  },
  'reimpresion': {
    path: '/main/reimpresion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Reimpresión de Cargos',
      parent: 'resolucion-jee-jne',
      order: 6
    }
  },
  'reprocesar-acta': {
    path: '/main/reprocesar-acta',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Reprocesar Acta',
      parent: 'resolucion-jee-jne',
      order: 7
    }
  },

  // ==================== MONITOREO - SIN HIJOS ====================
  'monitoreo': {
    path: '/main/monitoreo',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Monitoreo y Transmisión',
      icon: 'menu-monitor.svg',
      order: 16
    }
  },
  // ==================== MONITOREO NACIÓN - SIN HIJOS ====================
  'monitoreo-nacion': {
    path: '/main/monitoreo-nacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Monitoreo',
      icon: 'menu-monitor.svg',
      order: 17
    }
  },
  // ==================== TRAZABILIDAD ====================
  'tranzabilidad-actas': {
    path: '/main/tranzabilidad-actas',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC,Constantes.CB_PERFIL_USER_REPO],
    menuConfig: {
      nombre: 'Trazabilidad de Actas',
      parent: 'trazabilidad',
      order: 1
    }
  },
  'tranzabilidad-mesas': {
    path: '/main/tranzabilidad-mesas',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC,Constantes.CB_PERFIL_USER_REPO],
    menuConfig: {
      nombre: 'Trazabilidad de Mesas',
      parent: 'trazabilidad',
      order: 2
    }
  },
  // ==================== REGISTRO DE MESAS ====================
  'omisos-lista-electores': {
    path: '/main/omisos-lista-electores',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Lista de Electores',
      parent: 'registro-mesas',
      order: 1
    }
  },
  'omisos-hoja-asistencia': {
    path: '/main/omisos-hoja-asistencia',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Hoja de Asistencia',
      parent: 'registro-mesas',
      order: 2
    }
  },
  'mm-acta-escrutinio': {
    path: '/main/mm-acta-escrutinio',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'MM acta de escrutinio',
      parent: 'registro-mesas',
      order: 3
    }
  },
  'registro-personeros': {
    path: '/main/registro-personeros',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Personeros',
      parent: 'registro-mesas',
      order: 4
    }
  },
  'reprocesar-mesa': {
    path: '/main/reprocesar-mesa',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Reprocesar Mesa',
      parent: 'registro-mesas',
      order: 5
    }
  },
  'lista-denuncias': {
    path: '/main/lista-denuncias',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Denuncias',
      parent: 'registro-mesas',
      order: 6
    }
  },
  'eliminacion-omisos': {
    path: '/main/eliminacion-omisos',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Eliminación de omisos',
      parent: 'registro-mesas',
      order: 7
    }
  },
  'busqueda-electores': {
    path: '/main/busqueda-electores',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Búsqueda de electores',
      parent: 'registro-mesas',
      order: 8
    }
  },
  // ==================== CIFRA REPARTIDORA NACION - SIN HIJOS ====================
  'cifra-repartidora': {
    path: '/main/cifra-repartidora',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Cifra Repartidora',
      icon: 'icon_cifrarepartidora.svg',
      order: 20
    }
  },
  // ==================== REPORTES CC Y NACIÓN ====================
  'reportes-actas': {
    path: '/main/reportes/actas',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_REPO,
      Constantes.CB_PERFIL_USER_ADM_NAC, Constantes.CB_PERFIL_USER_REPO_NAC, Constantes.CB_PERFIL_USER_SCE_SCANNER],
    menuConfig: {
      nombre: 'Actas',
      parent: 'reportes',
      order: 1
    }
  },

  // Hijos de reportes actas
  'reportes-actas-resumen-total': {
    path: '/main/reportes/actas/resumen-total',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-avance-estado-actas': {
    path: '/main/reportes/actas/avance-estado-actas',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-mesa_por_mesa': {
    path: '/main/reportes/actas/mesa-por-mesa',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-mesa_por_estado': {
    path: '/main/reportes/actas/mesas-por-estado',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-resultados': {
    path: '/main/reportes/actas/resultados',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-digitalizacion': {
    path: '/main/reportes/actas/digitalizacion',
    requiredRoles: Constantes.CB_PERFILES_REPORTES_SCANNER,
  },
  'reportes-actas-informacion-oficial': {
    path: '/main/reportes/actas/informacion-oficial',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-auditoria-digitacion': {
    path: '/main/reportes/actas/auditoria-digitacion',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-estado-actas-odpe': {
    path: '/main/reportes/actas/estado-actas-odpe',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-actas-estado-actas-digitalizadas': {
    path: '/main/reportes/actas/actas-digitalizadas',
    requiredRoles: Constantes.CB_PERFILES_REPORTES_SCANNER,
  },
  'reportes-actas-autoridades-revocadas': {
    path: '/main/reportes/actas/autoridades-revocadas',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },


  'reportes-resoluciones': {
    path: '/main/reportes/resoluciones',
    requiredRoles: Constantes.CB_PERFILES_REPORTES_SCANNER,
    menuConfig: {
      nombre: 'Resoluciones',
      parent: 'reportes',
      order: 2
    }
  },

  'reportes-resoluciones-digitalizacion': {
    path: '/main/reportes/resoluciones/digitalizacion',
    requiredRoles: Constantes.CB_PERFILES_REPORTES_SCANNER,
  },
  'reportes-resoluciones-actas-no-devueltas': {
    path: '/main/reportes/resoluciones/actas-no-devueltas',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },
  'reportes-resoluciones-total-actas-enviadas-jee': {
    path: '/main/reportes/resoluciones/total-actas-enviadas-jee',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
  },



  'lista-electores': {
    path: '/main/reportes/lista-electores',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
    menuConfig: {
      nombre: 'Lista de Electores',
      parent: 'reportes',
      order: 3
    }
  },
  'miembros-mesa': {
    path: '/main/reportes/miembros-mesa',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
    menuConfig: {
      nombre: 'Miembros de Mesa',
      parent: 'reportes',
      order: 4
    }
  },
  'datos': {
    path: '/main/reportes/otros',
    requiredRoles: Constantes.CB_PERFILES_REPORTES,
    menuConfig: {
      nombre: 'Datos',
      parent: 'reportes',
      order: 5
    }
  },
  // ==================== ADMINISTRACIÓN CC Y NACIÓN ====================
  'autorizaciones-nacion': {
    path: '/main/autorizaciones-nacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Autorizaciones Nación',
      parent: 'administracion',
      order: 1
    }
  },
  'autorizaciones': {
    path: '/main/autorizaciones',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Autorizaciones',
      parent: 'administracion',
      order: 2
    }
  },
  'cierre-de-sesiones': {
    path: '/main/cierre-sesion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Cierre de sesiones',
      parent: 'administracion',
      order: 3
    }
  },
  'usuarios': {
    path: '/main/usuarios',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Usuarios',
      parent: 'administracion',
      order: 4
    }
  },
  'respaldo': {
    path: '/main/respaldo/backup',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_SUP_ADM],
    menuConfig: {
      nombre: 'Respaldo',
      parent: 'administracion',
      order: 4
    }
  },

  'parametros': {
    path: '/main/parametros',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Parámetros',
      parent: 'administracion',
      order: 5
    }
  },
  'Jurado Electoral Especial': {
    path: '/main/jurado-electoral-especial',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Jurado Electoral Especial',
      parent: 'administracion',
      order: 5
    }
  },
  'listado-pc': {
    path: '/main/listado-pc',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Listado de PC',
      parent: 'administracion',
      order: 6
    }
  },

  'listado-pc-nacion': {
    path: '/main/listado-pc-nacion',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Listado de PC',
      parent: 'administracion',
      order: 7
    }
  },

  'parametros-stae-vd': {
    path: '/main/parametros-cc',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    menuConfig: {
      nombre: 'Parámetros de Conexión por C.C',
      parent: 'administracion',
      order: 8
    }
  },
  // ==================== CIERRE DE ACTIVIDADES - SIN HIJOS ====================
  'cierre-actividades': {
    path: '/main/cierre-actividades',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    menuConfig: {
      nombre: 'Cierre de Actividades',
      icon: 'cierre-actividades.svg',
      order: 23
    }
  },
  // ==================== PROCESAMIENTO MANUAL - SIN HIJOS ====================
  'procesamiento-manual': {
    path: '/main/procesamiento-manual',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_VERI],
    menuConfig: {
      nombre: 'Procesamiento Manual',
      icon: 'icon_procesamiento_manual.svg',
      order: 24
    }
  },

  // ==================== PROCEDE PAGO - SOLO NACIÓN ====================
  'procede-pago': {
    path: '/main/reportes/miembros-mesa/procede-pago',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC, Constantes.CB_PERFIL_USER_REPO_NAC],
    // NO tiene menuConfig porque no aparece en el menú
  },

};

/**
 * CONFIGURACIÓN DE MENÚS PADRE
 * Define la estructura jerárquica de menús
 */
export const MENU_PARENTS_CONFIG: Record<string, any> = {
  'instalacion-configuracion': {
    nombre: 'Instalación y Configuración',
    icon: 'menu-instalacion-configuracion.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    order: 1
  },

  'control-digitalizacion': {
    nombre: 'Control de Digitalización',
    icon: 'menu-digitalizacion.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_CON, Constantes.CB_PERFIL_USER_ADM_CC],
    order: 10
  },
  'resolucion-jee-jne': {
    nombre: 'Resoluciones JEE/JNE',
    icon: 'menu-resolucion.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC],
    order: 15
  },
  'trazabilidad': {
    nombre: 'Trazabilidad',
    icon: 'iconTrazabilidadMesa.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC,Constantes.CB_PERFIL_USER_REPO],
    order: 18
  },
  'registro-mesas': {
    nombre: 'Registro de Mesas',
    icon: 'icon-trazabilidad.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_VERI,Constantes.CB_PERFIL_USER_ADM_CC],
    order: 19
  },
  'reportes': {
    nombre: 'Reportes',
    icon: 'reporte.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC,Constantes.CB_PERFIL_USER_REPO,
      Constantes.CB_PERFIL_USER_ADM_NAC,Constantes.CB_PERFIL_USER_REPO_NAC, Constantes.CB_PERFIL_USER_SCE_SCANNER],
    order: 21
  },


  'administracion': {
    nombre: 'Administración',
    icon: 'menu-administracion.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_CC, Constantes.CB_PERFIL_USER_ADM_NAC,
      Constantes.CB_PERFIL_USER_SUP_ADM],
    order: 22
  },
  /*'respaldo-nacion': {
    nombre: 'Respaldo',
    icon: 'menu-backup.svg',
    requiredRoles: [Constantes.CB_PERFIL_USER_ADM_NAC],
    order: 33
  }*/

};

/**
 * UTILIDADES PARA ACCESO A LA CONFIGURACIÓN
 */
export class RoutePermissionsHelper {

  /**
   * Obtiene los roles requeridos para una ruta
   */
  static getRequiredRoles(routeKey: string): string[] {
    return ROUTE_PERMISSIONS_CONFIG[routeKey]?.requiredRoles || [];
  }

  /**
   * Obtiene la configuración completa de una ruta
   */
  static getRouteConfig(routeKey: string): RoutePermissionConfig | undefined {
    return ROUTE_PERMISSIONS_CONFIG[routeKey];
  }

  /**
   * Obtiene todas las rutas disponibles
   */
  static getAllRoutes(): string[] {
    return Object.keys(ROUTE_PERMISSIONS_CONFIG);
  }

  /**
   * Obtiene rutas filtradas por rol
   */
  static getRoutesByRole(userRole: string): string[] {
    return Object.entries(ROUTE_PERMISSIONS_CONFIG)
      .filter(([_, config]) => config.requiredRoles.includes(userRole))
      .map(([key, _]) => key);
  }

  /**
   * Valida si un usuario tiene acceso a una ruta
   */
  static hasAccess(routeKey: string, userRole: string): boolean {
    const config = ROUTE_PERMISSIONS_CONFIG[routeKey];
    return config ? config.requiredRoles.includes(userRole) : false;
  }
}
