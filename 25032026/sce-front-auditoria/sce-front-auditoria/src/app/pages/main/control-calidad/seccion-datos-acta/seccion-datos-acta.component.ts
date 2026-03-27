import { Component, Input, OnInit } from '@angular/core';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';

@Component({
  selector: 'app-seccion-datos-acta',
  templateUrl: './seccion-datos-acta.component.html',
})
export class SeccionDatosActaComponent implements OnInit{  

  @Input() acta: ActaPendienteControlCalidad;
  numeroActaCopia: string = '';
  tipoEleccion: string = '';
  ubigeo: string = '';

  ngOnInit(): void {
    if(this.acta) {
      if(!this.acta.copia || !this.acta.digitoChequeo) {
        this.numeroActaCopia = this.acta.mesa;
      } else {
        this.numeroActaCopia = `${this.acta.mesa}-${this.acta.copia}${this.acta.digitoChequeo}`;
      }      
      this.tipoEleccion = this.acta.nombreEleccion;
      this.ubigeo = `${this.acta.ubigeoDepa} / ${this.acta.ubigeoProv} / ${this.acta.ubigeoNombre}`;      
    }
  }
}
