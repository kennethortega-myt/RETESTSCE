import moment from 'moment';
import {Constantes} from './constantes';
import { NivelUbigeo } from '../model/enum/nivel-ubigeo.enum';
import { UbigeoDTO } from '../model/ubigeoElectoralBean';

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

  static base64toBlob(base64Data, contentType: string): Blob {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.codePointAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  static dataURLtoFile(dataurl: string, filename: string) {
    const arr: string[] = dataurl.split(',');
    const mime: string = arr[0].match(/:(.*?);/)[1];
    const bstr: string = atob(arr[arr.length - 1]);
    let n: number = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
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

    return keys.some(key => objeto[key] === null);
  }

  static getSrcImage(imageBlob: Blob): string{
    if(!imageBlob) return null;
    return URL.createObjectURL(imageBlob);
  }

  static labelFiltroUbigeo(ubigeoNivelUnoOrList: string | UbigeoDTO[], nivel: number, agregarDosPuntos = true): string {
    let label = '';

    const empiezaCon9 = (codigo: string) => codigo.toString().startsWith('9') && !codigo.startsWith('09');

    const labels: Record<number, { normal: string; continente: string }> = {
      [NivelUbigeo.UNO]: {
        normal: 'Departamento',
        continente: 'Continente'
      },
      [NivelUbigeo.DOS]: {
        normal: 'Provincia',
        continente: 'País'
      },
      [NivelUbigeo.TRES]: {
        normal: 'Distrito',
        continente: 'Ciudad'
      },
    };

    if (typeof ubigeoNivelUnoOrList === 'string') {
      const esContinente = ubigeoNivelUnoOrList && empiezaCon9(ubigeoNivelUnoOrList);
      label = esContinente ? labels[nivel].continente : labels[nivel].normal;
    } else if (Array.isArray(ubigeoNivelUnoOrList)) {
      const tieneConNueve = ubigeoNivelUnoOrList.some(
        item => empiezaCon9(item.codigo?.trim() ?? item.id?.toString() ?? '')
      );
      const tieneSinNueve = ubigeoNivelUnoOrList.some(item =>
        !empiezaCon9(item.codigo?.trim() ?? item.id?.toString() ?? '')
      );

      if (tieneConNueve && tieneSinNueve) {
        label = labels[nivel].normal;
      } else {
        label = tieneConNueve ? labels[nivel].continente : labels[nivel].normal;
      }
    }
    return agregarDosPuntos ? label + ':' : label;
  }
  
  static listaSoloExtranjero(lstUbogeo: UbigeoDTO[]): boolean {
    const empiezaCon9 = (codigo: string) =>
    codigo != null && codigo.toString().trim().startsWith('9') && !codigo.startsWith('09');
    if (!lstUbogeo || lstUbogeo.length === 0) {
      return false;
    }

    return lstUbogeo.every(item =>
      empiezaCon9(item.codigo?.trim() ?? item.id?.toString() ?? '')
    );
  }

}
