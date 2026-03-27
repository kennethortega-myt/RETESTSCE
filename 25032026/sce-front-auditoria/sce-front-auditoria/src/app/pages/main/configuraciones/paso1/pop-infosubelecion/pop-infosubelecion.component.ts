import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {TipoEleccionService} from "../../../../../service-api/tipo-eleccion.service";
import {IDatosGeneralResponse} from "../../../../../interface/general.interface";

@Component({
  selector: 'app-pop-infosubelecion',
  templateUrl: './pop-infosubelecion.component.html',
  styleUrls: ['./pop-infosubelecion.component.scss']
})
export class PopInfosubelecionComponent implements OnInit {

  listTipoEleccion: Array<IDatosGeneralResponse> = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private tipoEleccionService: TipoEleccionService) {
  }

  ngOnInit(): void {
    if (this.data) {
      this.list(this.data.id);
    }
  }

  list(id: number) {
    this.tipoEleccionService.getHijos(id).subscribe(response => {
      this.listTipoEleccion = response.data;
      console.log(this.listTipoEleccion)
    })
  }

}
