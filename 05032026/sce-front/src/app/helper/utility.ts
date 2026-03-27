import moment from 'moment';
import {Constantes} from './constantes';
import { NivelUbigeo } from '../model/enum/nivel-ubigeo.enum';

export class Utility {

  static rellenarCerosAIzquierda(number: number, width: number) {
    let numberOutput = Math.abs(number); // Valor absoluto del número
    let length = number.toString().length; // Largo del número
    let zero = '0'; // String de cero

    if (width <= length) {
      return number < 0 ? '-' + numberOutput.toString() : numberOutput.toString();
    }

    if (number < 0) {
      return '-' + zero.repeat(width - length) + numberOutput.toString();
    }

    return zero.repeat(width - length) + numberOutput.toString();
  }

  static base64toBlob(base64Data, contentType): Blob {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }


  static getNumeroMesActual(): number {
    return moment().month() + 1; // Los meses en moment() van de 0 a 11, por eso sumamos 1
  }

  static getAnioActual(): number {
    return moment().year(); // Obtener el año actual
  }

  // Obtener el día actual
  static getDiaActual(): number {
    return moment().date(); // Obtener el día del mes actual
  }

  static parsearFecha(fechaString: string,formato: string){
    return moment(fechaString,formato)
  }

  static rotateImage(imageSrc: string, canvas: HTMLCanvasElement) {
    if(!imageSrc) return;
    const context = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      context.rotate(Math.PI / 2);
      context.drawImage(img, 0, -img.height);
    };
    img.src = imageSrc;
  }

  private static readonly codEleccionDescripcion = new Map<string, string>([
    [Constantes.COD_ELEC_PRE, 'presidencial'],
    [Constantes.COD_ELEC_CON, 'congresal'],
    [Constantes.COD_ELEC_PAR, 'parlamento'],
    [Constantes.COD_ELEC_DIPUTADOS, 'diputados'],
    [Constantes.COD_ELEC_SENADO_MULTIPLE, 'senador-multiple'],
    [Constantes.COD_ELEC_SENADO_UNICO, 'senador-unico'],
    [Constantes.COD_ELEC_DIST, 'distrital'],
    [Constantes.COD_ELEC_REVOCATORIA, 'revocatoria'],
    [Constantes.COD_ELEC_REFERENDUM, 'referendum']
  ]);

  static getCodEleccionToDescripcion(codigo: string): string {
    return this.codEleccionDescripcion.get(codigo) || 'desconocido';
  }
  /** Valida que el objeto tenga al menos un atributo null */
  static objectHasNullAttribute(objeto: any): boolean {
    const keys = Object.keys(objeto);

    return !!keys.find(key => objeto[key] === null);
  }

  static getSrcImage(imageBlob: Blob): string{
    if(!imageBlob) return null;
    return URL.createObjectURL(imageBlob);
  }

  static labelFiltroUbigeo(ubigeoNivelUno: string, nivel: number): string {
    let label = '';
    if(ubigeoNivelUno && ubigeoNivelUno.toString().startsWith('9')) {
      switch (nivel) {
        case NivelUbigeo.UNO:
            label = 'Continente:'
            break;
        case NivelUbigeo.DOS:
            label = 'País:'
            break;        
        case NivelUbigeo.TRES:
          label = 'Estado:'
          break;
        default:            
            break;
      }    
    } else {
      switch (nivel) {
        case NivelUbigeo.UNO:
            label = 'Departamento:'
            break;
        case NivelUbigeo.DOS:
            label = 'Provincia:'
            break;        
        case NivelUbigeo.TRES:
          label = 'Distrito:'
          break;
        default:            
            break;
      } 
    }

    return label;
  }

}
