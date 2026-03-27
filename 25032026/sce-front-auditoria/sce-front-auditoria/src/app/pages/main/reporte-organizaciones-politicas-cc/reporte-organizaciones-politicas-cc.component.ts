import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Utility } from 'src/app/helper/utility';
import { UtilityService } from 'src/app/helper/utilityService';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { EleccionResponseBean } from 'src/app/model/eleccionResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { FiltroOrganizacionesPoliticas } from 'src/app/model/reportes/filtroOrganizacionesPoliticas';
import { Usuario } from 'src/app/model/usuario-bean';
import { GeneralService } from 'src/app/service/general-service.service';
import { ReporteOrganizacionesPoliticasService } from 'src/app/service/reporte-organizaciones-politicas.service';

@Component({
  selector: 'app-reporte-organizaciones-politicas-cc',
  templateUrl: './reporte-organizaciones-politicas-cc.component.html',
})
export class ReporteOrganizacionesPoliticasCcComponent extends AuthComponent implements OnInit {

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  public isShowReporte: boolean;
  public pdfBlob: Blob;
  public usuario: Usuario;
  public readonly formGroupReporte: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;

  private readonly tituloAlert = "Listado de organizaciones políticas";
  private readonly destroyRef = inject(DestroyRef);
  
  constructor(
    private readonly reporteOrganizacionesPoliticasService: ReporteOrganizacionesPoliticasService,
    private readonly utilityService: UtilityService,
    private readonly formBuilder: FormBuilder,
    private readonly generalService : GeneralService,
  ) {
    super();
    this.isShowReporte = false;
    this.listProceso = [];
    this.listEleccion = [];
    this.formGroupReporte = this.formBuilder.group({
      procesoFormControl: ['0'],
      eleccionFormControl: ['0'],
    });
  }

  ngOnInit() {
    this.usuario = this.authentication();
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success){
            this.listProceso = response.data;
          }else{
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
        },
        error: (error) => {
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
        }
      });

    //listeners para los combos
    this.onProcesoChanged();
    this.onEleccionChanged();
  }

  onProcesoChanged():void{
    this.formGroupReporte.get('procesoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('eleccionFormControl').setValue('0');
          this.isShowReporte = false;
          this.listEleccion = [];
        }),
        filter(value => value != '0'),
        switchMap(idProceso => this.generalService.obtenerElecciones(idProceso)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.listEleccion = response.data;
        },
        error: (error) => {
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las elecciones", IconPopType.ALERT);
        },
        complete: () => console.info("completo en obtenerElecciones")
      });
  }

  onEleccionChanged():void{
    this.formGroupReporte.get('eleccionFormControl')!.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.isShowReporte = false
        },
        error: () => {}
      });
  }


  buscarReporte(){

    if(!this.sonValidosLosDatosMinimos()) return;

    let filtroOrgPolBean: FiltroOrganizacionesPoliticas = new FiltroOrganizacionesPoliticas();
    filtroOrgPolBean.idProceso = this.formGroupReporte.get('procesoFormControl').value;
    filtroOrgPolBean.idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
    filtroOrgPolBean.centroComputo = this.usuario.codigoCentroComputo;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;

    this.reporteOrganizacionesPoliticasService.getReporteOrganizacionesPoliticasPdf(filtroOrgPolBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de organizaciones políticas.", IconPopType.ERROR);
        }
      });
  }


  generarReporte(response: GenericResponseBean<string>){
    sessionStorage.setItem('loading','false');

    if (response.success){
      this.pdfBlob = Utility.base64toBlob(response.data,'application/pdf');

      const blobUrl = URL.createObjectURL(this.pdfBlob);
      const object = document.createElement("object");
      object.setAttribute("width", "100%");
      object.setAttribute("height", "620");
      object.setAttribute("data", blobUrl);

      this.midivReporte.nativeElement.insertAdjacentElement('afterbegin' , object);

    }else{
      this.isShowReporte = false;
      this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
    }
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupReporte.get('procesoFormControl').value ||
      this.formGroupReporte.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupReporte.get('eleccionFormControl').value ||
      this.formGroupReporte.get('eleccionFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione una elección", IconPopType.ALERT);
      return false;
    }
    return true;
  }

}
