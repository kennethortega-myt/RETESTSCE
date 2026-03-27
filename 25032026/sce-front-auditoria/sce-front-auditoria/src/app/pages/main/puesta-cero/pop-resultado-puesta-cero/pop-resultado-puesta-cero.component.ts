import {Component} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-pop-resultado-puesta-cero',
  templateUrl: './pop-resultado-puesta-cero.component.html'
})
export class PopResultadoPuestaCeroComponent {
  constructor(public dialogRef: MatDialogRef<PopResultadoPuestaCeroComponent>,
              private formBuilder: FormBuilder) {
  }

  aceptar(){
    this.dialogRef.close(true);
  }

}
