
import {Component, Inject, OnInit, OnDestroy} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {PopObservacionOmisoInterface} from "../../../../interface/popObservacionOmiso.interface";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-modalobservacion',
  templateUrl: './modal-observacion-omisos.component.html',
})
export class ModalObservacionOmisosComponent implements OnInit, OnDestroy {


  public imgObservacionesOmiso: SafeUrl;
  public txtObservacionOmiso: string;

  constructor(
    public dialogRef: MatDialogRef<ModalObservacionOmisosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopObservacionOmisoInterface,
    private readonly sanitizer: DomSanitizer
  ) {
    this.imgObservacionesOmiso=this.sanitizer.bypassSecurityTrustUrl('');
    this.txtObservacionOmiso= "";
  }

  ngOnInit() {
    this.imgObservacionesOmiso = this.data.pngImageUrlObservacionOmiso? this.data.pngImageUrlObservacionOmiso : this.sanitizer.bypassSecurityTrustUrl('');
    this.txtObservacionOmiso = this.data.txtObservacionOmiso? this.data.txtObservacionOmiso : '';
  }

  preventEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
    }
  }

  ngOnDestroy() {
    //Método vacío.
  }

  onCloseClick(isBoton: boolean): void {
    this.dialogRef.close({obs:this.txtObservacionOmiso, isBoton});
  }
}
