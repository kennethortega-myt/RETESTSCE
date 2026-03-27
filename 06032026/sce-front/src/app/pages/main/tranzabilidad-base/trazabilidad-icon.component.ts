import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-trazabilidad-icon',
  templateUrl: './trazabilidad-icon.component.html',
  standalone: true
})
export class TrazabilidadIconComponent {
  @Input() item: {
    codEstadoActa: string,
    descripcionEstado: string,
    fecha: string,
    detalle: string,
    fechaInicioFin: string
  };

  getIconPath(): string {
    const recepcion = ['ANC', 'ANP'];
    const observada = ['IOC'];
    const contabilizada = ['DSC', 'LSC'];

    if (recepcion.includes(this.item.codEstadoActa)) {
      return 'assets/img/icon-tranzabilidad/ico-recepcion.svg';
    } else if (observada.includes(this.item.codEstadoActa)) {
      return 'assets/img/icon-tranzabilidad/ico-observada.svg';
    } else if (contabilizada.includes(this.item.codEstadoActa)) {
      return 'assets/img/icon-tranzabilidad/ico-contabilizada.svg';
    } else {
      return 'assets/img/icon-tranzabilidad/ico-digitacion.svg';
    }
  }
  formatearFecha(fechaStr: string): string {
    try {
      let limpio = fechaStr.replace(',', '.');
      const match = limpio.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
      if (!match) {
        return fechaStr;
      }
      const [_, dia, mes, anio, hora, min, seg] = match;
      const fecha = new Date(
        Number(anio),
        Number(mes) - 1,
        Number(dia),
        Number(hora),
        Number(min),
        Number(seg)
      );
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(fecha.getDate())}-${pad(fecha.getMonth() + 1)}-${fecha.getFullYear()} ${pad(fecha.getHours())}:${pad(fecha.getMinutes())}:${pad(fecha.getSeconds())}`;
    } catch (error) {
      return fechaStr;
    }
  }
}
