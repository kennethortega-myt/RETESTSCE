import {Component, Inject, ViewChild} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
export interface PeriodicElement {
  distrito: string;
  position: number;
  ae: string;
  aehorizontal: string;
}


@Component({
  selector: 'app-pop-lista-proceso',
  templateUrl: './pop-lista-proceso.component.html',
  styleUrls: ['./pop-lista-proceso.component.scss']
})
export class PopListaProcesoComponent {
  displayedColumns: string[] = ['position', 'distrito', 'acciones'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatSort) sort!: MatSort;
  formGroupParent: FormGroup;
   listaInicial: any;
  listaTipoDocumentoEscrutinio: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PopListaProcesoComponent>,public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: FormBuilder,
  ) {
    this.formGroupParent = new FormGroup({});

  }

  ngOnInit(): void {
    this.listaInicial = JSON.stringify( this.data.lista);
    this.listaTipoDocumentoEscrutinio.push(...this.data.lista);
    for(let docu of this.listaTipoDocumentoEscrutinio){
      this.formGroupParent.setControl(docu.codigoDistritoElectoral +"-radio",new FormControl(docu.documentoElectoral, [Validators.required]));
    }
    this.dataSource = new MatTableDataSource(this.listaTipoDocumentoEscrutinio);
  }

  guardar(){
    let dataUpdate : any[] = [];
    for(let docu of this.listaTipoDocumentoEscrutinio){
      docu.documentoElectoral = this.formGroupParent.get(docu.codigoDistritoElectoral +"-radio").value;
    }
    for (let docu of this.listaTipoDocumentoEscrutinio){
      const lista = JSON.parse(this.listaInicial);
      let filter = lista.filter(tip=> docu.id == tip.id && docu.documentoElectoral != tip.documentoElectoral );
      if(filter.length > 0){
        dataUpdate.push(docu);
      }
    }
    this.dialogRef.close({success: true, data: dataUpdate})

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
