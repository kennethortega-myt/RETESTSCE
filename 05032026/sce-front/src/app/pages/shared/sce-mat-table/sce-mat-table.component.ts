import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {TableColumn} from "../../../interface/tableColumn.interface";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'sce-mat-table',
  templateUrl: './sce-mat-table.component.html',
  styleUrls: ['./sce-mat-table.component.scss']
})
export class SceMatTableComponent implements OnInit, OnDestroy, OnChanges{

  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() displayedColumns: string[] = [];
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() addIndexColumn = false;
  @Input() enableSorting = false;

  @Input() heightOffset = 650;

  dataSource = new MatTableDataSource<any>();

  @Output() actionClicked = new EventEmitter<{ action: string, element: any }>();

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor() {
  }

  ngOnInit() {
    if (this.enableSorting) {
      this.dataSource.sort = this.sort;
    }

  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {

    if (this.data){
      if (changes['data']){
        this.dataSource = new MatTableDataSource(this.data);
        this.dataSource.paginator = this.paginator;

        if (this.enableSorting){
          this.dataSource.sort = this.sort;
        }
        // Añadir columna de enumeración si está habilitada
        if (this.addIndexColumn) {
          this.addIndexToData();
          if (!this.displayedColumns.includes('index')) {
            this.displayedColumns = ['index', ...this.displayedColumns];
          }
        }
      }
    }
  }

  // Método para agregar un índice a los datos
  addIndexToData() {
    this.data.forEach((item, index) => {
      item.index = index + 1; // Se agrega el índice al objeto de datos
    });
  }

  emitAction(action: string, element: any) {
    this.actionClicked.emit({ action, element });
  }

  ngOnDestroy() {
    //vacio
  }
}
