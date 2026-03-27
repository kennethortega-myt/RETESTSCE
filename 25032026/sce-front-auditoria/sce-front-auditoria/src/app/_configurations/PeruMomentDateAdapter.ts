import {Inject, Injectable} from '@angular/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as moment from 'moment-timezone';
import {MAT_DATE_LOCALE} from '@angular/material/core';

@Injectable()
export class PeruMomentDateAdapter extends MomentDateAdapter {
  constructor(@Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    // Pasar el valor de locale a la clase base
    super(matDateLocale);
  }

  // Sobrescribir el método createDate para ajustar la zona horaria
  override createDate(year: number, month: number, date: number): moment.Moment {
    // Crear la fecha con la zona horaria de Lima
    return moment.tz({ year, month, day: date }, "America/Lima");
  }

  // Sobrescribir el parse para asegurar que todas las fechas se parseen en la zona horaria de Lima
  override parse(value: any, format: string | string[]): moment.Moment | null {
    if (value && typeof value === 'string') {
      return moment.tz(value, format, "America/Lima");
    }
    return super.parse(value, format);
  }
}
