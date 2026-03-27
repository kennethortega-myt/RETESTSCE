import { Component, DestroyRef, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { MonitoreoNacionService } from 'src/app/service/monitoreo-nacion.service';
import { ReporteCandidatosOrgPoliticasService } from 'src/app/service/reporte-candidatos-org-politicas.service';

@Component({
  selector: 'app-reporte-candidatos-org-politicas-nacion',
  templateUrl: './reporte-candidatos-org-politicas-nacion.component.html',
})
export class ReporteCandidatosOrgPoliticasNacionComponent extends AuthComponent implements OnInit {

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  destroyRef:DestroyRef = inject(DestroyRef);

  public isShowReporte: boolean;
  public pdfBlob: Blob;
  public tituloAlert="Listado de organizaciones políticas";
  public usuario: Usuario;
  public formGroupReporte: FormGroup;
  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listEleccion: Array<EleccionResponseBean>;

  constructor(
    private monitoreoService: MonitoreoNacionService,
    private reporteCandidatosOrgPoliticasService: ReporteCandidatosOrgPoliticasService,
    private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
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
    this.monitoreoService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          if (response.success){
            this.listProceso = response.data;
            console.log(this.listProceso)
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
        switchMap(proceso => this.monitoreoService.obtenerEleccionesNacion(proceso.id,proceso.acronimo)),
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

    const idEleccion = this.formGroupReporte.get('eleccionFormControl').value;
    const codigoCc = this.usuario.codigoCentroComputo;

    let filtroOrgPolBean: FiltroOrganizacionesPoliticas = new FiltroOrganizacionesPoliticas();
    filtroOrgPolBean.idProceso = this.formGroupReporte.get('procesoFormControl').value.id;
    filtroOrgPolBean.idEleccion = idEleccion == 0 ? null : idEleccion;
    filtroOrgPolBean.centroComputo = codigoCc ?? null;
    filtroOrgPolBean.proceso = this.formGroupReporte.get('procesoFormControl').value.nombre
    filtroOrgPolBean.schema = this.formGroupReporte.get('procesoFormControl').value.nombreEsquemaPrincipal

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;

    this.reporteCandidatosOrgPoliticasService.getReporteCandidatosOrgPoliticaPdfNacion(filtroOrgPolBean, null)
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

    this.renderer.setProperty(this.midivReporte.nativeElement,'innerHTML','');
    
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

    return true;
  }

}
