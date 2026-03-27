import { Component, DestroyRef, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { filter, forkJoin, switchMap, tap } from 'rxjs';
import { Utility } from 'src/app/helper/utility';
import { UtilityService } from 'src/app/helper/utilityService';
import { AmbitoBean } from 'src/app/model/ambitoBean';
import { CentroComputoBean } from 'src/app/model/centroComputoBean';
import { IconPopType } from 'src/app/model/enum/iconPopType';
import { FiltroMesaPorUbigeoBean } from 'src/app/model/reportes/filtroMesaPorUbigeo';
import { FiltroUbigeoDepartamentoBean } from 'src/app/model/FiltroUbigeoDepartamentoBean';
import { FiltroUbigeoDistritoBean } from 'src/app/model/filtroUbigeoDistritoBean';
import { FiltroUbigeoProvinciaBean } from 'src/app/model/filtroUbigeoProvinciaBean';
import { GenericResponseBean } from 'src/app/model/genericResponseBean';
import { ProcesoElectoralResponseBean } from 'src/app/model/procesoElectoralResponseBean';
import { ProcesoAmbitoBean } from 'src/app/model/procesoAmbitoBean';
import { UbigeoDepartamentoBean } from 'src/app/model/UbigeoDepartamentoBean';
import { UbigeoDistritoBean } from 'src/app/model/ubigeoDistritoBean';
import { UbigeoProvinciaBean } from 'src/app/model/ubigeoProvinciaBean';
import { GeneralService } from 'src/app/service/general-service.service';
import { ReporteMesasUbigeoService } from 'src/app/service/reporte-mesas-ubigeo.service';

@Component({
  selector: 'app-reporte-mesas-ubigeo-cc',
  templateUrl: './reporte-mesas-ubigeo-cc.component.html',
  styleUrls: ['./reporte-mesas-ubigeo-cc.component.scss']
})
export class ReporteMesasUbigeoCcComponent implements OnInit {

  @ViewChild('idDivImagen') midivReporte!: ElementRef<HTMLElement>;

  destroyRef:DestroyRef = inject(DestroyRef);

  public listProceso: Array<ProcesoElectoralResponseBean>;
  public listAmbitos: Array<AmbitoBean>;
  public listDepartamento: Array<UbigeoDepartamentoBean>;
  public listProvincia: Array<UbigeoProvinciaBean>;
  public listDistrito: Array<UbigeoDistritoBean>;
  public ambito: ProcesoAmbitoBean;
  public listCentrosComputo: Array<CentroComputoBean>;
  public formGroupReporte: FormGroup;
  public isShowReporte: boolean;
  public pdfBlob: Blob;
  public tituloAlert="Listado de mesas por ubigeo";

  constructor(
    private generalService : GeneralService,
    private reporteMesasUbigeoService: ReporteMesasUbigeoService,
    private formBuilder: FormBuilder,
    private utilityService: UtilityService
  ) {
    // super();
    this.listProceso = [];
    this.listAmbitos = [];
    this.listDepartamento = [];
    this.listProvincia = [];
    this.listDistrito = [];
    this.ambito = new ProcesoAmbitoBean();
    this.ambito.nombreTipoAmbito = "ODPE";
    this.listCentrosComputo = [];
    this.isShowReporte = false;
    this.formGroupReporte = this.formBuilder.group({
      procesoFormControl: ['0'],
      ambitoFormControl: ['0'],
      centroComputoFormControl: ['0'],
      departamentoFormControl: ['0'],
      provinciaFormControl: ['0'],
      distritoFormControl: ['0'],
    });
  }

  ngOnInit() {
    this.generalService.obtenerProcesos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        {
          next: (response : GenericResponseBean<Array<ProcesoElectoralResponseBean>>) => {
            if (response.success){
              this.listProceso = response.data;
            }else{
              this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
            }
          },
          error: () => {
            this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los procesos", IconPopType.ERROR);
          }
        }
      );

    //listeners para los combos
    this.onProcesoChanged();
    this.onAmbitoChanged();
    this.onCentroComputoChanged();
    this.onDepartamentoChanged();
    this.onProvinciaChanged();
    this.onDistritoChanged();
  }

  onProcesoChanged():void{
    this.formGroupReporte.get('procesoFormControl')!.valueChanges
    .pipe(
      tap(() => {
        this.formGroupReporte.get('ambitoFormControl').setValue('0');
        this.isShowReporte = false;
        this.listAmbitos = [];
      }),
      filter(value => value != '0'),
      switchMap(idProceso => {
        return forkJoin([
          this.generalService.getListAmbitos(),
          this.generalService.getTipoAmbitoPorProceso(idProceso)
        ])
      }),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe({
      next: (response) => {
        this.listAmbitos = response[0].data;
        if(response[1].data == null){
          this.ambito = new ProcesoAmbitoBean();
        } else{
          this.ambito = response[1].data;
        }
      },
      error: () => {
        this.utilityService.mensajePopup(this.tituloAlert, "No se pudo obtener los ambitos.", IconPopType.ERROR);
      }
    });
  }

  onAmbitoChanged():void{
    this.formGroupReporte.get('ambitoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('centroComputoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listCentrosComputo = [];
        }),
        filter(value => value != '0'),
        switchMap(idAmbito => this.generalService.getCentrosComputo()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response.success){
            this.listCentrosComputo= response.data;
          }else{
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
        },
        error: () => {
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los centros de cómputo", IconPopType.ERROR);
        }
      });
  }

  onCentroComputoChanged(): void{
    this.formGroupReporte.get('centroComputoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('departamentoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listDepartamento = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoDepartamentoBean = new FiltroUbigeoDepartamentoBean();
          filtro.idProceso = this.formGroupReporte.get('procesoFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          return this.generalService.getDepartamentoPorProceso(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response){
            this.listDepartamento = response.data;
          }else{
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
        },
        error: (error) => {
          console.log(error)
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los departamentos", IconPopType.ERROR);
        }
      });
  }

  onDepartamentoChanged(){
    this.formGroupReporte.get('departamentoFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('provinciaFormControl').setValue('0');
          this.isShowReporte = false;
          this.listProvincia = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoProvinciaBean = new FiltroUbigeoProvinciaBean();
          filtro.idProceso = this.formGroupReporte.get('procesoFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
          return this.generalService.getProvinciaPorProceso(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response){
            this.listProvincia = response.data;
          }else{
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
        },
        error: () => {
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar las provincias", IconPopType.ERROR);
        }
      });
  }

  onProvinciaChanged(){
    this.formGroupReporte.get('provinciaFormControl')!.valueChanges
      .pipe(
        tap(() => {
          this.formGroupReporte.get('distritoFormControl').setValue('0');
          this.isShowReporte = false;
          this.listDistrito = [];
        }),
        filter(value => value != '0'),
        switchMap(idCentroComputo => {
          let filtro: FiltroUbigeoDistritoBean = new FiltroUbigeoDistritoBean();
          filtro.idProceso = this.formGroupReporte.get('procesoFormControl').value;
          filtro.idAmbito = this.formGroupReporte.get('ambitoFormControl').value;
          filtro.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value;
          filtro.departamento = this.formGroupReporte.get('departamentoFormControl').value;
          filtro.provincia = this.formGroupReporte.get('provinciaFormControl').value;
          return this.generalService.getDistritoPorProceso(filtro);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          if (response){
            this.listDistrito = response.data;
          }else{
            this.utilityService.mensajePopup(this.tituloAlert, response.message, IconPopType.ALERT);
          }
        },
        error: () => {
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible cargar los distritos", IconPopType.ERROR);
        }
      });
  }

  onDistritoChanged():void{
    this.formGroupReporte.get('distritoFormControl')!.valueChanges
      .subscribe(idCentroComputo => {
        this.isShowReporte = false;
      })
    ;
  }

  buscarReporte(){
    if(!this.sonValidosLosDatosMinimos()) return;

    let filtroMesaPorUbigeoBean: FiltroMesaPorUbigeoBean = new FiltroMesaPorUbigeoBean();
    filtroMesaPorUbigeoBean.idProceso = this.formGroupReporte.get('procesoFormControl').value;

    filtroMesaPorUbigeoBean.idAmbito = this.formGroupReporte.get('ambitoFormControl').value === '0' ? null :
      this.formGroupReporte.get('ambitoFormControl').value;
      filtroMesaPorUbigeoBean.idCentroComputo = this.formGroupReporte.get('centroComputoFormControl').value === '0' ? null :
      this.formGroupReporte.get('centroComputoFormControl').value;
      filtroMesaPorUbigeoBean.departamento = this.formGroupReporte.get('departamentoFormControl').value === '0' ? null :
      this.formGroupReporte.get('departamentoFormControl').value;
      filtroMesaPorUbigeoBean.provincia = this.formGroupReporte.get('provinciaFormControl').value === '0' ? null :
      this.formGroupReporte.get('provinciaFormControl').value;
      filtroMesaPorUbigeoBean.idUbigeo = this.formGroupReporte.get('distritoFormControl').value === '0' ? null :
      this.formGroupReporte.get('distritoFormControl').value;

    sessionStorage.setItem('loading','true');
    this.isShowReporte = true;

    this.reporteMesasUbigeoService.getReporteMesasUbigeoPdf(filtroMesaPorUbigeoBean)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.generarReporte(response);
        },
        error: () => {
          this.isShowReporte = false;
          this.utilityService.mensajePopup(this.tituloAlert, "No fue posible obtener el reporte de avance de mesas.", IconPopType.ERROR);
        }
      });
  }

  sonValidosLosDatosMinimos() :boolean{
    if(!this.formGroupReporte.get('procesoFormControl').value ||
      this.formGroupReporte.get('procesoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, "Seleccione un proceso", IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupReporte.get('ambitoFormControl').value ||
      this.formGroupReporte.get('ambitoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, `Seleccione un ${this.ambito.nombreTipoAmbito}`, IconPopType.ALERT);
      return false;
    }
    if(!this.formGroupReporte.get('centroComputoFormControl').value ||
      this.formGroupReporte.get('centroComputoFormControl').value === '0'){
      this.utilityService.mensajePopup(this.tituloAlert, `Seleccione un centro de cómputo`, IconPopType.ALERT);
      return false;
    }
    return true;
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

}
