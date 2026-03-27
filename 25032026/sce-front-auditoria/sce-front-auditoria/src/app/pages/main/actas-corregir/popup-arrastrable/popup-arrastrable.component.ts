import {Component, DestroyRef, EventEmitter, inject, Input, Output, Renderer2, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {PopActasData} from "../../../../interface/popActasData.interface";
import {ControlDigitalizacionService} from "../../../../service/control-digitalizacion.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {GenericResponseBean} from "../../../../model/genericResponseBean";
import {DigitizationGetFilesResponse} from "../../../../model/digitizationGetFilesResponse";
import {Utility} from "../../../../helper/utility";
import {PopMensajeData} from "../../../../interface/popMensajeData.interface";
import {PopMensajeComponent} from "../../../shared/pop-mensaje/pop-mensaje.component";
import {VerActaService} from '../../../../helper/verActaService';
import {IconPopType} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-popup-arrastrable',
  templateUrl: './popup-arrastrable.component.html',
  styleUrls: ['./popup-arrastrable.component.scss']
})
export class PopupArrastrableComponent implements OnInit {
  destroyRef:DestroyRef = inject(DestroyRef);
  public imgPngBase64Escrutinio: string = "";
  public imgPngBase64Instalacion: string = "";
  tamanio: number = 100;
  anguloActa: number = 0;
  tamanioInstalacion: number = 100;
  anguloActaInstalacion: number = 0;
  @Input() public data: PopActasData
  @Output() cerrarPop: any = new EventEmitter<any>();
  constructor(public dialog: MatDialog,
              private readonly renderer: Renderer2,
              private readonly controlDigitalizacionService:ControlDigitalizacionService,
              private readonly verActaService: VerActaService
  ) {
  }

  ngOnInit() {

    sessionStorage.setItem('loading','true');

    this.controlDigitalizacionService.getFilesPng(this.data.acta1FileId,this.data.acta2FileId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: this.getFilesPngCorrecto.bind(this),
        error: this.getFilesPngIncorrecto.bind(this)
      });
    sessionStorage.setItem('loading','false');
  }

  getFilesPngCorrecto(response: GenericResponseBean<DigitizationGetFilesResponse>){
    sessionStorage.setItem('loading','false');
    if (response.success){
      if (response.data.acta1File !== null){
        let pngBlobAE = Utility.base64toBlob(response.data.acta1File,'image/png');
        this.imgPngBase64Escrutinio = URL.createObjectURL(pngBlobAE);
      }
      if (response.data.acta2File !== null){
        let pngBlobAI = Utility.base64toBlob(response.data.acta2File,'image/png');
        this.imgPngBase64Instalacion = URL.createObjectURL(pngBlobAI);
      }
    }
    else{
      this.mensajePopup("", response.message, IconPopType.ALERT);
    }
  }

  getFilesPngIncorrecto(reason: any){
    sessionStorage.setItem('loading','false');
    this.mensajePopup("Resultado", reason.error.message, IconPopType.ERROR);
  }

  mensajePopup(title:string , mensaje:string, icon:string){
    let popMensaje :PopMensajeData= {
      title:title,
      mensaje:mensaje,
      icon:icon,
      success:true
    }
    this.dialog.open(PopMensajeComponent, {
      data: popMensaje
    })
      .afterClosed()
      .subscribe((confirmado: boolean) => {
        if (confirmado) {
          //aceptar
        }
      });
  }

  zoomInActa(ladoActa: string){
    const tamanioMaximo = 250;
    if (ladoActa == "actaLadoEscrutinio" && this.tamanio + 50 <= tamanioMaximo){
      this.tamanio += 50;
      const tamanioPorcentaje = `${this.tamanio}%`;
      const imagen= document.getElementById(ladoActa);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanio)); //CS New
    }else if(ladoActa == "actaLadoInstalacion" && this.tamanioInstalacion + 50 <= tamanioMaximo){
      this.tamanioInstalacion += 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById(ladoActa);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanioInstalacion)); //CS New
    }
  }

  zoomOutActa(ladoActa: string){
    const tamanioMinimo=100;
    if (ladoActa == "actaLadoEscrutinio" && this.tamanio - 50 >= tamanioMinimo){
      this.tamanio -= 50;
      const tamanioPorcentaje = `${this.tamanio}%`;
      const imagen= document.getElementById(ladoActa);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanio)); //CS New
    }else if (ladoActa == "actaLadoInstalacion" && this.tamanioInstalacion - 50 >= tamanioMinimo){
      this.tamanioInstalacion -= 50;
      const tamanioPorcentaje = `${this.tamanioInstalacion}%`;
      const imagen= document.getElementById(ladoActa);
      this.renderer.setStyle(imagen,'scale',tamanioPorcentaje);
      this.renderer.setStyle(imagen,'transform-origin',this.verActaService.getPositionByZoomAndDegree(this.anguloActa, this.tamanioInstalacion)); //CS New
    }
  }


  closePopup(){
    this.cerrarPop.emit(false);
  }
}
