import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Constantes} from 'src/app/helper/constantes';
import {IDetalleConfiguracionDocumentoElectoral} from 'src/app/interface/detalleConfiguracionElectoral.interface';
import {IDatosGeneralResponse} from 'src/app/interface/general.interface';
import {DetalleConfiguracionService} from 'src/app/service-api/detalle-configuracion.service';
import {DetalleTipoElectoralService} from 'src/app/service-api/detalle-tipo-electoral.service';
import {SeccionService} from 'src/app/service-api/seccion.service';
import {GeneralService} from 'src/app/service/general-service.service';
import {DocumentoElectoralService} from "../../../../service-api/documento-electoral.service";
import {MatDialog} from "@angular/material/dialog";
import {PopAdicionalComponent} from "./pop-adicional/pop-adicional.component";
import {Router} from "@angular/router";
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-paso2',
  templateUrl: './paso2.component.html',
})
export class Paso2Component implements OnInit {

  tipoEleccion: IDatosGeneralResponse = {id: 0, nombre: ''};
  listDocumentoElectoral: Array<any> = [];
  tipoDatos: Array<any> = [];
  formGroupParent: FormGroup;
  formGroupConfigLateral: FormGroup;
  formGroupRangoLateral: FormGroup;
  detalleTipoEleccion: any = {id: 0, nombre: ''};
  listDetalleConfig: Array<IDetalleConfiguracionDocumentoElectoral> = [];
  listDetalleConfigTmp: Array<IDetalleConfiguracionDocumentoElectoral> = [];
  dataGuardar: string;
  controlBotonesIndex: boolean = false;
  seccionDataControl: FormControl = new FormControl('', [Validators.required]);
  tipoDatoControl: FormControl = new FormControl(0, [Validators.required]);
  seccionData: IDatosGeneralResponse = {id: 0, nombre: ''};
  listTamanio: any[] = [];
  listOrientacion: any[] = [];
  listMultipagina: any[] = [];


  constructor(
    private detalleTipoDocumentoEleccionService: DetalleTipoElectoralService,
    private detalleConfiguracionService: DetalleConfiguracionService,
    private documentoElectoralService: DocumentoElectoralService,
    public formBuilder: FormBuilder,
    private seccionService: SeccionService,
    private generalService: GeneralService,
    private router: Router,
    public dialog: MatDialog) {
    this.formGroupParent = new FormGroup({});
    this.formGroupConfigLateral = this.formBuilder.group({
      abreviatura: [],
      tipoImagen: [],
      escanerAmbasCaras: [],
      tamanioHoja: [],
      multipagina: [],
      codigoBarraOrientacion: []
    })
    this.formGroupRangoLateral = this.formBuilder.group({
      rangoInicial: [],
      rangoFinal: [],
      digitoChequeo: [],
      digitoError: []
    })
    this.verificarTipoEleccionSession();
    this.listTipoDato();
  }

  ngOnInit(): void {
    this.formGroupParent = this.formBuilder.group({});
    this.listCatalogs();
  }

  listCatalogs() {
    this.documentoElectoralService.listAllCatalogos().subscribe(response => {
      this.listTamanio = response.data.mae_tamanio_hoja;
      this.listMultipagina = response.data.mae_paginado_archivo_imagen;
      this.listOrientacion = response.data.mae_orientacion;
    })
  }

  verificarTipoEleccionSession() {
    const dataSession = sessionStorage.getItem(Constantes.TIPO_ELECCION);
    if (dataSession) {
      this.tipoEleccion = JSON.parse(dataSession);

      this.obtenerDetalleTipoEleccion();
    }
  }

  obtenerDetalleTipoEleccion() {
    this.detalleTipoDocumentoEleccionService.obtenerDetalleTipoElectoral(this.tipoEleccion.id, 2).subscribe(response => {
      sessionStorage.setItem('loading', 'false');
      if (response.success) {
        this.listDocumentoElectoral = response.data.map(x => {
          return {
            id: x.id,
            nombre: x.documentoElectoral.nombre,
            abreviatura: x.documentoElectoral.abreviatura,
            tipoImagen: x.documentoElectoral.tipoImagen,
            escanerAmbasCaras: x.documentoElectoral.escanerAmbasCaras,
            tamanioHoja: x.documentoElectoral.tamanioHoja,
            multipagina: x.documentoElectoral.multipagina,
            codigoBarraOrientacion: x.documentoElectoral.codigoBarraOrientacion,
            rangoInicial: x.rangoInicial,
            rangoFinal: x.rangoFinal,
            digitoChequeo: x.digitoChequeo,
            digitoError: x.digitoError
          } as any
        });
        if (this.listDocumentoElectoral.length > 0) {
          this.tipoDocumentoSeleccionado(this.listDocumentoElectoral[0]);
        }
      }
    }, error => {
      sessionStorage.setItem('loading', 'false');
    });
  }

  validarTipo(tipoId: number) {
    if (this.formGroupParent.get(tipoId + '-radio').value) {
      this.formGroupParent.setControl(tipoId + "-select", new FormControl("", [Validators.required]));
      this.formGroupParent.get(tipoId + "-select").enable();
    } else {
      this.formGroupParent.setControl(tipoId + "-select", new FormControl("", []));
      this.formGroupParent.get(tipoId + "-select").disable();
    }
    this.formGroupParent.get(tipoId + "-select").updateValueAndValidity();
  }

  tipoDocumentoSeleccionado(data: IDatosGeneralResponse) {
    this.detalleTipoEleccion = data as any;
    console.log(this.detalleTipoEleccion);
    this.detalleConfiguracionService.obtenerDetalleConfiguracionElectoral(this.detalleTipoEleccion.id, 0).subscribe((response) => {
      if (response.success) {
        this.listDetalleConfig = response.data;
        for (let config of this.listDetalleConfig) {
          this.formGroupParent.setControl(config.seccion.id + "-radio", new FormControl(config.habilitado === 1, [Validators.required]));
          this.formGroupParent.setControl(config.seccion.id + "-select", new FormControl(config.tipoDato ? config.tipoDato : "", [Validators.required]));
          if (!this.formGroupParent.get(config.seccion.id + "-radio").value) {
            this.formGroupParent.get(config.seccion.id + "-select").disable();
          }
        }
        this.formGroupConfigLateral.get("abreviatura").setValue(this.detalleTipoEleccion.abreviatura);
        this.formGroupConfigLateral.get("multipagina").setValue(this.detalleTipoEleccion.multipagina)
        this.formGroupConfigLateral.get("tamanioHoja").setValue(this.detalleTipoEleccion.tamanioHoja)
        this.formGroupConfigLateral.get("tipoImagen").setValue(this.detalleTipoEleccion.tipoImagen)

        this.formGroupRangoLateral.get("rangoInicial").setValue(this.detalleTipoEleccion.rangoInicial);
        this.formGroupRangoLateral.get("rangoFinal").setValue(this.detalleTipoEleccion.rangoFinal);
        this.formGroupRangoLateral.get("digitoChequeo").setValue(this.detalleTipoEleccion.digitoChequeo);
        this.formGroupRangoLateral.get("digitoError").setValue(this.detalleTipoEleccion.digitoError);

        this.formGroupConfigLateral.get("codigoBarraOrientacion").setValue(this.detalleTipoEleccion.codigoBarraOrientacion)
        this.dataGuardar = JSON.stringify({
          list: this.listDetalleConfig,
          docu: {...this.formGroupConfigLateral.getRawValue(), ...this.formGroupRangoLateral.getRawValue()}
        });
      }
    });
  }

  guardar(isContinuar: boolean) {
    if (this.formGroupParent.invalid) {
      const secciones = this.listDetalleConfig
        .filter(c => this.formGroupParent
          .get(`${c.seccion.id}-select`)
          ?.hasError('required'))
        .map(c => c.seccion.nombre);

      const mensaje = secciones.length
        ? `Debe seleccionar el tipo de dato para las secciones: ${secciones.join(', ')}`
        : '';
       this.generalService.openDialogoGeneral({
        mensaje: mensaje,
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    }
    sessionStorage.setItem('loading', 'true');
    this.listDetalleConfig = this.parserList(this.listDetalleConfig);
    if (this.hasChanges()) {
      console.log("La data ha cambiado");
      this.detalleConfiguracionService.guardar(this.listDetalleConfig, {...this.formGroupConfigLateral.getRawValue(), ...this.formGroupRangoLateral.getRawValue()}).subscribe(async (response) => {
        await this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });
        this.obtenerDetalleTipoEleccion();
        sessionStorage.setItem('loading', 'false');
        if (isContinuar) {
          this.router.navigate(['/main/configuraciones/paso3'])
        }
      }, error => {
        sessionStorage.setItem('loading', 'false');
      });
    } else {
      console.log("La data no ha cambiado");
      sessionStorage.setItem('loading', 'false');
      if (isContinuar) {
        this.router.navigate(['/main/configuraciones/paso3'])
      }
    }
  }

  hasChanges(): boolean {
    return this.dataGuardar !== JSON.stringify({
      list: this.listDetalleConfig,
      docu: {...this.formGroupConfigLateral.getRawValue(), ...this.formGroupRangoLateral.getRawValue()}
    });
  }

  async continuar() {
    this.listDetalleConfig = this.parserList(this.listDetalleConfig);
    let count = this.listDetalleConfig.filter(x => x.habilitado === 1).length;
    if (count === 0) {
      await this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar alguna sección",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
      return;
    } else {
      // @ts-ignore
      let lista = this.listDetalleConfig.filter(x => x.habilitado === 1 && (x.tipoDato === 0 || x.tipoDato === "")).length;
      if (lista > 0) {
        await this.generalService.openDialogoGeneral({
          mensaje: `Existe ${lista} secciones sin especificar un valor`,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: false
        });
        return;
      }
    }
    this.guardar(true);
  }

  private parserList(lista: any) {
    for (let config of lista) {
      config.habilitado = this.formGroupParent.get(config.seccion.id + "-radio")?.value ? 1 : 0;
      config.tipoDato = this.formGroupParent.get(config.seccion.id + "-select")?.value;
    }
    return lista;
  }

  openDialogNewSeccion() {
    const dialogRef = this.dialog.open(PopAdicionalComponent, {
      maxWidth: '600px',
      width: '100%',
      disableClose: true,
      data: this.seccionData
    });

    dialogRef.componentInstance.guardarSeccionEvent.subscribe(result => {

      if (result.success) {
        this.seccionData = result.data;
         this.guardarSeccion().then(() => {
          dialogRef.close(result);
        });

      }
      this.controlBotonesIndex = false;
    });
  }

  guardarSeccion() {

    return new Promise<void>((resolve, reject) => {

      sessionStorage.setItem('loading', 'true');
      let data: IDetalleConfiguracionDocumentoElectoral = {
        activo: 1,
        habilitado: 0,
        detalleTipoEleccionDocumentoElectoral: this.detalleTipoEleccion,
        seccion: this.seccionData,
        tipoDato: 0
      };
      this.seccionService.save({
        id: this.seccionData.id,
        activo: 1,
        nombre: this.seccionData.nombre,
        usuario: this.generalService.obtenerUsuarioSession()
      }).subscribe(response => {
        sessionStorage.setItem('loading', 'false');
        if (response.success) {
          console.log(response);
          data.seccion = response.data;

          if (this.seccionData.id === 0) {
            this.listDetalleConfig.push(data);
            this.listDetalleConfigTmp.push(data);
            this.guardar(false);

          } else {
            let index = this.listDetalleConfig.findIndex(documento => documento.seccion.id === this.seccionData.id);
            if (index != -1) {
              this.listDetalleConfig[index].seccion = response.data;
            }

            let index2 = this.listDetalleConfigTmp.findIndex(documento => documento.seccion.id === this.seccionData.id);
            if (index2 != -1) {
              this.listDetalleConfigTmp[index2].seccion = response.data;
            }
          }
          this.controlBotonesIndex = false;
          this.seccionDataControl.setValue('');
          this.tipoDatoControl.setValue(0);
          resolve();
        } else  {
          reject(new Error('Failed to save document'));
        }
      }, async (error) => {
        sessionStorage.setItem('loading', 'false');
        console.log("error:" +  JSON.stringify(error));
        let errorMensaje = error.error.message;
        await this.generalService.openDialogoGeneral({
          mensaje: errorMensaje,
          icon: IconPopType.ALERT,
          title: TitlePop.INFORMATION,
          success: true
        });
        reject(error);
      });
    });
  }

  listTipoDato() {
    this.detalleTipoDocumentoEleccionService.listAllCatalogos().subscribe(response => {
      this.tipoDatos = response.data.mae_tipo_dato;
    })
  }

}
