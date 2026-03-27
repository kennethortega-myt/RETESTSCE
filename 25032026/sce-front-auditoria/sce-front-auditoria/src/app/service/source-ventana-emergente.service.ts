import {Injectable} from '@angular/core';
import {Constantes} from '../helper/constantes';

@Injectable({
  providedIn: 'root'
})
export class SourceVentanaEmergenteService{
  private readonly validSources: string[] = [
    Constantes.CO_SOURCE_ACTAS_CORREGIR,
    Constantes.CO_SOURCE_ACTAS_PROCESAMIENTO_MANUAL,
    Constantes.CO_SOURCE_VERIFICACION_RESOLUCION,
    Constantes.CO_SOURCE_DIGITACION_ACTAS,
    Constantes.CO_SOURCE_MONITOREO,
    Constantes.CO_SOURCE_MONITOREO_NACION,
    Constantes.CO_SOURCE_CONTROL_CALIDAD,
    Constantes.CO_SOURCE_MM_ACTA_ESCRUTINIO
  ];

  isValidSource(source: string): boolean {
    return this.validSources.includes(source);
  }

  addValidSource(source: string): void {
    if (!this.isValidSource(source)) {
      this.validSources.push(source);
    }
  }

}
