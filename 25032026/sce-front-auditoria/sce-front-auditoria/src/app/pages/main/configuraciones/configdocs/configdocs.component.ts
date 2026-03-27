import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {DocumentoElectoralService} from "../../../../service-api/documento-electoral.service";

@Component({
  selector: 'app-configdocs',
  templateUrl: './configdocs.component.html',
  styleUrls: ['./configdocs.component.scss']
})
export class ConfigdocsComponent implements OnInit {

  formGroupConfigLateral: FormGroup;
  listTamanio: any[] =[];
  listOrientacion: any[] =[];
  listMultipagina: any[] =[];

  constructor(
    private readonly documentoElectoralService: DocumentoElectoralService,
    private readonly formBuilder: FormBuilder,
  ) {
    this.formGroupConfigLateral = new FormGroup({});
    this.formGroupConfigLateral = this.formBuilder.group({
      abreviatura:[],
      tipoImagen:[],
      escanerAmbasCaras:[],
      tamanioHoja:[],
      multipagina:[]
    })

  }

  ngOnInit(): void {
    this.formGroupConfigLateral = this.formBuilder.group({});
    this.listCatalogs();
  }


  listCatalogs(){
    this.documentoElectoralService.listAllCatalogos().subscribe(response=>{
      console.log(response.data);
      this.listTamanio = response.data.mae_tamanio_hoja;
      this.listMultipagina = response.data.mae_paginado_archivo_imagen;
      this.listOrientacion = response.data.mae_orientacion;
    })
  }

}
