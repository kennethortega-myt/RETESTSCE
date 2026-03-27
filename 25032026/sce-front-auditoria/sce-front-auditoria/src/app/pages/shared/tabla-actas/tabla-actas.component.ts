import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { TipoAccionTabla, ACCIONES_TABLA } from './tabla-actas-acciones.constant';

@Component({
  selector: 'app-tabla-actas',
  templateUrl: './tabla-actas.component.html'
})
export class TablaActasComponent implements AfterViewInit {
  @Input() dataSource: MatTableDataSource<any>;
  @Input() displayedColumns: string[];
  @Input() accionesVisibles: TipoAccionTabla[] = [
    ACCIONES_TABLA.ELIMINAR,
    ACCIONES_TABLA.VER_PLOMO,
    ACCIONES_TABLA.VER_CELESTE,
    ACCIONES_TABLA.CARGO,
    ACCIONES_TABLA.OFICIO,
    ACCIONES_TABLA.TRANSMITIR
  ];
  @Output() eliminar = new EventEmitter<number>();
  @Output() verActa = new EventEmitter<{ acta: any, tipoSobre: string }>();
  @Output() generarCargo = new EventEmitter<{ acta: any }>();
  @Output() generarOficio = new EventEmitter<{ acta: any }>();
  @Output() transmitirOficio = new EventEmitter<{ acta: any }>();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    if (this.dataSource && this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getDisplayIndex(index: number): number {
    if (!this.paginator) {
      return index + 1;
    }
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }
  protected readonly ACCIONES_TABLA = ACCIONES_TABLA;

  getEstadoClass(descripcionEstado: string): string {
  const claseMapeada = this.estadoClassMap[descripcionEstado.toLowerCase()];
  return claseMapeada || '';
}

  private readonly estadoClassMap: { [key: string]: string } = {
    'enviada al jee': 'enviadoJurado',
    'validado': 'validado',
    'procesada': 'procesada',
    'aprobada': 'aprobada',
    'aplicada': 'procesada',
    'observada': 'observada'
  };
}
