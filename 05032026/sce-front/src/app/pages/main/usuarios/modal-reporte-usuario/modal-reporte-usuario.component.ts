import {Component, ElementRef, inject, OnInit, Renderer2,AfterViewInit, ViewChild} from '@angular/core';
import { NgIf} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {generarPdf} from '../../../../transversal/utils/funciones';

@Component({
  selector: 'app-modal-reporte-usuario',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogActions,
    MatDialogContent,
    ReactiveFormsModule,
    NgIf,
    MatDialogClose
  ],
  templateUrl: './modal-reporte-usuario.component.html',
  styleUrl: './modal-reporte-usuario.component.scss'
})
export class ModalReporteUsuarioComponent implements OnInit, AfterViewInit {

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;
  private readonly dialogRef: MatDialogRef<ModalReporteUsuarioComponent> =
    inject(MatDialogRef<ModalReporteUsuarioComponent>);
  public readonly data =
    inject<any>(MAT_DIALOG_DATA);

  constructor(private readonly renderer: Renderer2) {
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');
    generarPdf(this.data, this.midivReporte);
  }

}
