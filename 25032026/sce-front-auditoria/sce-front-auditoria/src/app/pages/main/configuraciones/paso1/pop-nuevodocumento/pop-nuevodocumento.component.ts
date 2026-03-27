import {Component, EventEmitter, Inject, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DocumentoElectoralService} from "../../../../../service-api/documento-electoral.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-pop-nuevodocumento',
  templateUrl: './pop-nuevodocumento.component.html',
  styleUrls: ['./pop-nuevodocumento.component.scss']
})
export class PopNuevodocumentoComponent implements OnInit {
  @Output() guardarDocuEvent = new EventEmitter<any>();
  formGroupConfigLateral: FormGroup;
  listTamanio: any[] = [];
  listOrientacion: any[] = [];
  listMultipagina: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<PopNuevodocumentoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private documentoElectoralService: DocumentoElectoralService,
    public formBuilder: FormBuilder,) {
    this.formGroupConfigLateral = new FormGroup({});
    this.formGroupConfigLateral = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        this.noWhitespaceValidator
      ]],
      abreviatura: ['', [Validators.required]],
      tipoImagen: [],
      escanerAmbasCaras: [],
      codigoBarraOrientacion: ['', [Validators.required]],
      tamanioHoja: ['', [Validators.required]],
      multipagina: ['', [Validators.required]]
    })
    this.listCatalogs();
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  ngOnInit(): void {
    if (this.data.id !== 0) {
      this.formGroupConfigLateral.get("nombre").setValue(this.data.nombre);
      this.formGroupConfigLateral.get("abreviatura").setValue(this.data.abreviatura);
      this.formGroupConfigLateral.get("tipoImagen").setValue(this.data.tipoImagen);
      this.formGroupConfigLateral.get("tamanioHoja").setValue(this.data.tamanioHoja);
      this.formGroupConfigLateral.get("multipagina").setValue(this.data.multipagina);
      this.formGroupConfigLateral.get("codigoBarraOrientacion").setValue(this.data.codigoBarraOrientacion);
    }

  }

  guardar(): void {
    this.guardarDocuEvent.emit({
      success: true,
      data: { id: this.data.id, ...this.formGroupConfigLateral.getRawValue(), configuracionGeneral: 0, visible: 1 }
    });
  }

  listCatalogs() {
    this.documentoElectoralService.listAllCatalogos().subscribe(response => {

      this.listTamanio = response.data.mae_tamanio_hoja;
      this.listMultipagina = response.data.mae_paginado_archivo_imagen;
      this.listOrientacion = response.data.mae_orientacion;
    })
  }

}
