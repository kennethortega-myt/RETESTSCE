import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {AuthService} from '../../../../service/auth-service.service';
import {Login} from '../../../../model/login';
import {ReporteCierreActividadesService} from '../../../../service/reporte/reporte-cierre-actividades.service';
import {SharedModule} from '../../../shared/shared.module';
import {PopDataGenerico} from '../../../../interface/popDataGenerico.interface';
import {Utility} from '../../../../helper/utility';

@Component({
  selector: 'app-popup-reporte-reanudar-actividades',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule, MatListModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, SharedModule],
  templateUrl: './popup-reporte-reanudar-actividades.html',
})
export class PopupReporteReanudarActividades implements OnInit {

  destroyRef: DestroyRef = inject(DestroyRef);
  login = new Login();

  pdfBlob: Blob;
  public nombreArchivoReporte: string = "";
  constructor(
    private readonly authenticationService: AuthService,
    private readonly dialogRef: MatDialogRef<PopupReporteReanudarActividades>,
    private readonly reporteCierreActividadesService: ReporteCierreActividadesService,
    @Inject(MAT_DIALOG_DATA) public data: PopDataGenerico
  ) {
  }

  ngOnInit() {
    let e1 = document.getElementById("idDivImagen");      //e.firstElementChild can be used.

    if(e1!==null){
      let child = e1.lastElementChild;
      while (child) {
        e1.removeChild(child);
        child = e1.lastElementChild;
      }
    }

    this.pdfBlob = Utility.base64toBlob(this.data.base64Pdf,'application/pdf');
    this.nombreArchivoReporte = "reporte_reanudar_actividades.pdf";

    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let object = document.createElement("object");
    object.setAttribute("width", "100%");
    object.setAttribute("height", "620");
    object.setAttribute("data",blobUrl);

    document.getElementById("idDivImagen").appendChild(object);
  }

  cerrar(): void {
    this.dialogRef.close()
  }

  descargarPdf(){
    const blobUrl = URL.createObjectURL(this.pdfBlob);
    let a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.download = this.nombreArchivoReporte;
    document.body.appendChild(a);
    a.click();
  }

}
