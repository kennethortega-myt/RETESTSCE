import {Component, Inject, OnDestroy, OnInit} from '@angular/core';

import {Subject} from "rxjs";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ActaBean} from "../../../../model/resoluciones/acta-jee-bean";
import {MatTableDataSource} from "@angular/material/table";
import {ResolucionAsociadosRequest} from "../../../../model/resoluciones/resolucion-bean";

export interface Acta {
  nroActaCopia: string;
}

@Component({
  selector: 'app-pop-list-actas-asoc',
  templateUrl: './pop-list-actas-asoc.component.html',
  styleUrls: ['./pop-list-actas-asoc.component.scss'],
})
export class PopListActasAsocComponent implements OnInit,OnDestroy{

  numeroResolucion :string;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataSourceAgrupacionesActas:MatTableDataSource<ActaBean>;
  displayedColumnsActas: string[] = ['position', 'acta', 'copia','estado'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit(): void {
    let resolucionAsociadosRequest:ResolucionAsociadosRequest = this.data.resolucion;
    this.dataSourceAgrupacionesActas = new MatTableDataSource<ActaBean>(resolucionAsociadosRequest.actasAsociadas);
    this.numeroResolucion = resolucionAsociadosRequest.numeroResolucion;
  }

    ngOnDestroy() {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }



}
