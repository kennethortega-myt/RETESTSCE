import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { LogService } from '../../../service/log.service';
import { LogOrcService } from '../../../service/log-orc.service';
import { Log } from '../../../interface/log.interface';

@Component({
  selector: 'app-log-unico',
  templateUrl: './log-unico.component.html'
})
export class LogUnicoComponent implements OnInit, AfterViewInit {

  search: string = '';
  listLogs: Log[] = [];
  dataSource = new MatTableDataSource<Log>([]);
  displayedColumns: string[] = ['#', 'usuario', 'centro', 'observacion', 'fecha'];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  totalRegistro = 0;
  page = 0;
  pageSize = 10;
  clearSearch = false;

  private servicio!: LogService | LogOrcService;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly logService: LogService,
    private readonly logOrcService: LogOrcService
  ) {}

  ngOnInit(): void {
    const tipo = this.route.snapshot.data['tipo']; // ← aquí lo tomas del `data`

    this.servicio = tipo === 'nacion' ? this.logService : this.logOrcService;
    this.fetchLogs(this.page, this.pageSize, this.search);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  buscar(): void {
    if (!this.search) return;
    this.clearSearch = true;
    this.fetchLogs(0, 100, this.search);
  }

  clear(): void {
    this.clearSearch = false;
    this.search = '';
    this.fetchLogs(this.page, this.pageSize, this.search);
  }

  getRowIndex(index: number): number {
    return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
  }

  eventosPaginador(event: PageEvent): void {
    this.totalRegistro = event.length;
    this.pageSize = event.pageSize;
    this.page = event.pageIndex;
    this.fetchLogs(this.page, this.pageSize, this.search);
  }

  private fetchLogs(page: number, size: number, search: string): void {
    this.servicio.logs$.subscribe(data => {
      this.listLogs = data.list;
      this.totalRegistro = data.total;
      this.dataSource = new MatTableDataSource(this.listLogs);
      this.dataSource.paginator = this.paginator;
    });
    this.servicio.listLogs(page, size, search);
  }
}
