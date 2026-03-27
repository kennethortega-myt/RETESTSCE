import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { AccesoPcResponse } from 'src/app/interface/accesoPcResponse.interface';


@Component({
  selector: 'app-listado-pc-tabla',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './listado-pc-tabla.component.html'
})
export class ListadoPcTablaComponent {
  @ViewChild('MatPaginator') paginator!: MatPaginator;

  @Input() displayedColumns: string[] = [];
  @Input() dataSource: AccesoPcResponse[] = [];
  @Input() totalElements: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() mostrarBotonImpresion: boolean = true;

  @Output() eliminarEvent = new EventEmitter<AccesoPcResponse>();
  @Output() pageChangeEvent = new EventEmitter<PageEvent>();
  @Output() imprimirEvent = new EventEmitter<void>();

  eliminarPc(element: AccesoPcResponse): void {
    this.eliminarEvent.emit(element);
  }

  onPageChange(event: PageEvent): void {
    this.pageChangeEvent.emit(event);
  }

  imprimirReporte(): void {
    this.imprimirEvent.emit();
  }

  getNumeroFila(index: number): number {
    return (this.pageIndex * this.pageSize) + index + 1;
  }

}
