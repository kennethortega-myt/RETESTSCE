import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {ModalDescargaAnexosComponent} from './modal-descarga-anexos/modal-descarga-anexos.component';
import {MatDialog} from '@angular/material/dialog';
import {MonitoreoNacionService} from "../../../service/monitoreo-nacion.service";
import {firstValueFrom} from "rxjs";
import {ProcesoElectoralResponseBean} from "../../../model/procesoElectoralResponseBean";
import {FormControl} from "@angular/forms";
import {ReportesNacionService} from "../../../service/reportes-nacion.service";
import {CentroComputoBean} from "../../../model/centroComputoBean";
import {AnexosService} from "../../../service/anexos.service";
import {GeneralService} from '../../../service/general-service.service';
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-anexos',
  templateUrl: './anexos.component.html',
})
export class AnexosComponent implements OnInit {

  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  listProceso: Array<ProcesoElectoralResponseBean> = [];
  procesoFormControl = new FormControl();
  centroComputoFormControl = new FormControl();
  public listCentrosComputo: Array<CentroComputoBean> = [];

  constructor(
    private readonly monitoreoService: MonitoreoNacionService,
    private readonly reporteNacionService: ReportesNacionService,
    public generalService: GeneralService,
    private readonly anexoService: AnexosService,
    private readonly dialog: MatDialog,
  ) {

  }

  ngOnInit(): void {
    this.monitoreoService
      .obtenerProcesos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((response) => {
      if (response.success) {
        this.listProceso = response.data;
      }
    });
  }

  obtenerCentro() {

    this.reporteNacionService.getCentrosComputo(this.procesoFormControl.value.acronimo).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(response => {
      if (response.success) {
        this.listCentrosComputo = response.data;
      }
    })
  }


  downloandAnexo1 = async () => {
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.anexo1({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "Anexo1.zip");

  }

  downloandVotos = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.votos({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_VOTOS.txt");
  }
  downloandVotosCifras = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.votosCifras({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_CIFRA.txt");
  }
  downloandTablaActas = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.tablaActas({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_COMPUACTAS.txt");
  }
  downloandMesasNoInstaladas = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.mesasNoinstaladas({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_MESANOINSTA.txt");
  }
  downloandMaestraOrganiPoli = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.maestraOrganizacionPolitica({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "Maestra.zip");
  }

  downloandUbigeo = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.maestroUbigeo({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_UBIGEO.txt");
  }

  downloandODPE = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.odpe({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "ONPE_TBL_ODPE.txt");
  }

  downloandAnexo2 = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.anexo2({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "Anexo2.zip");
  }
  downloandTotal = async ()=>{
    if(this.validarRequeridos()){
      return;
    }
    const data = await firstValueFrom(this.anexoService.all({
      acronimo: this.procesoFormControl.value.acronimo,
      centroComputo: this.centroComputoFormControl.value.id,
      esquema: this.procesoFormControl.value.nombreEsquemaPrincipal,
      usuarioConsulta: "admin"
    }));
    this.download(data, "AnexosJne.zip");
  }

  download = async (data: any, name: string) => {
    const blob = new Blob([data], {type: 'application/octet-stream'});
    const url = globalThis.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openModal(): void {
    const dialogRef = this.dialog.open(ModalDescargaAnexosComponent, {
      backdropClass: 'modalBackdrop',
      panelClass: 'modalPanel',
      width: '490px',
      autoFocus: false,
      maxHeight: '90vh',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se cerró');
    });
  }

  validarRequeridos(){
    if(!this.procesoFormControl.value){
      this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar un proceso",
        icon: IconPopType.ALERT,
        success: true,
        title: TitlePop.INFORMATION
      })
      return true;
    }
    if(!this.centroComputoFormControl.value){
      this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar centro de cómputo",
        icon: IconPopType.ALERT,
        success: true,
        title: TitlePop.INFORMATION
      })
      return true;
    }
    return false;
  }

}
