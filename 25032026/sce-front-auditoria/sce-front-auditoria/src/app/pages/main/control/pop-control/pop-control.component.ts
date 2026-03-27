import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {PopControlData} from "../../../../interface/PopControlData";
import {VerActaService} from '../../../../helper/verActaService';
@Component({
  selector: 'app-pop-control',
  templateUrl: './pop-control.component.html',
})
export class PopControlComponent implements OnInit {
  tamanio: number = 100;
  anguloActa: number = 0;
  btnMostrarAE: boolean = false;
  imgPngBase64:string = "";
  nroMesa:string = "";
  isVisibleTxtLeyenda: boolean = false;

  constructor(public dialog: MatDialog,
              private readonly renderer: Renderer2,
              public dialogRef: MatDialogRef<PopControlComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PopControlData,
              private readonly verActaService: VerActaService
              ) {}
  ngOnInit(): void {
    this.imgPngBase64=this.data.imgActa;
    this.nroMesa = this.data.nroMesa;
    this.isVisibleTxtLeyenda = this.data.isVisibleTxtLeyenda;
  }

  onCerrarModal(): void {
    this.dialogRef.close();
  }

  zoomInActa(){
    const tamanioMaximo = 250;
    if(this.tamanio + 50 <= tamanioMaximo){
      this.tamanio += 50;
      const tamanioPorcentaje = `${this.tamanio}%`;
      const imagen= document.getElementById('actaLado');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanio)); //CS New
    }
  }

  zoomOutActa(){
    const tamanioMinimo=100;
    if(this.tamanio - 50 >= tamanioMinimo){
      this.tamanio -= 50;
      const tamanioPorcentaje = `${this.tamanio}%`;
      const imagen= document.getElementById('actaLado');
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanio)); //CS New
    }
  }

  rotarActa(){

    this.anguloActa+=90;
    const imagen= document.getElementById('actaLado');
    this.renderer.setStyle(imagen,'transform',`rotate(${this.anguloActa}deg)`); //transform-origin:
    this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanio));

  }
}
