import { Component, Input, OnInit } from '@angular/core';
import { ActaPendienteControlCalidad } from 'src/app/model/control-calidad/ActaPendienteControlCalidad';

@Component({
  selector: 'app-seccion-datos-acta',
  templateUrl: './seccion-datos-acta.component.html',
  styleUrl: './seccion-datos-acta.component.scss'
})
export class SeccionDatosActaComponent implements OnInit{  

  @Input() acta: ActaPendienteControlCalidad;
  numeroActaCopia: string = '';
  tipoEleccion: string = '';
  ubigeo: string = '';

  ngOnInit(): void {
    if(this.acta) {
      this.numeroActaCopia = `${this.acta.mesa}-${this.acta.copia}${this.acta.digitoChequeo}`;
      this.tipoEleccion = this.acta.nombreEleccion;
      this.ubigeo = `${this.acta.ubigeoDepa} / ${this.acta.ubigeoProv} / ${this.acta.ubigeoNombre}`;      
    }
  }
}
