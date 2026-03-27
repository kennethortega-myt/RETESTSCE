import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialogo-confirmacion-extsin',
  templateUrl: './dialogo-confirmacion-extsin.component.html',//extraviadas siniestradas
  styleUrls: ['./dialogo-confirmacion-extsin.component.css']
})
export class DialogoConfirmacionExtsinComponent implements OnInit {

constructor(

  public dialogo: MatDialogRef<DialogoConfirmacionExtsinComponent>,
    @Inject(MAT_DIALOG_DATA) public mensaje: string) { }

    cancelar(): void {
      this.dialogo.close('cerrar');
    }
    encontrada(): void {
      this.dialogo.close('encontrada');
    }

    reconteo(): void{
      this.dialogo.close('reconteo');
    }

    anulada(): void {
      this.dialogo.close('anulada');
    }

  ngOnInit() {
    //Método vacío.
  }

}
