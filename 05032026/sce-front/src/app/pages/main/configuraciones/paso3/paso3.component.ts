import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Constantes} from 'src/app/helper/constantes';
import {IDetalleConfiguracionDocumentoElectoral} from 'src/app/interface/detalleConfiguracionElectoral.interface';
import {IDatosGeneralResponse} from 'src/app/interface/general.interface';
import {DetalleConfiguracionService} from 'src/app/service-api/detalle-configuracion.service';
import {DetalleTipoElectoralService} from 'src/app/service-api/detalle-tipo-electoral.service';
import {GeneralService} from 'src/app/service/general-service.service';
import {IareaCoordinates, IRelativeCoordinatesInterface} from "../../../../interface/IRelativeCoordinates.interface";
import {CoordenasService} from "../../../../service-api/coordenas.service";
import {Router} from "@angular/router";
import {firstValueFrom} from 'rxjs';
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-paso3',
  templateUrl: './paso3.component.html',
})
export class Paso3Component implements OnInit {

  @ViewChild('fileUploader') fileUploader: ElementRef;

  tipoEleccion: IDatosGeneralResponse = {id: 0, nombre: ''};
  listDocumentoElectoral: Array<IDatosGeneralResponse> = [];
  formGroupParent: FormGroup;
  detalleTipoEleccion: IDatosGeneralResponse = {id: 0, nombre: ''};
  listDetalleConfig: Array<IDetalleConfiguracionDocumentoElectoral> = [];

  tipoDocumentoElectoralControl: FormControl = new FormControl(0, [Validators.required]);
  imagenPrueba: string = "";
  imagenSeleccionado: any;
  colorRect: string = "#e92228";
  seccionSeleccionado: any = {id: 0};
  dataConfig: { idDocumento: number, color: string, idSeccion: number, init?: boolean } = {
    idDocumento: 0,
    color: "",
    idSeccion: 0,
    init: false
  };
  requestCoordenates: IRelativeCoordinatesInterface = {areas: [], image: '', abreviatura:''};
  responseCoordenates: Array<any> = [];


  constructor(
    private detalleTipoDocumentoEleccionService: DetalleTipoElectoralService,
    private detalleConfiguracionService: DetalleConfiguracionService,
    public formBuilder: FormBuilder,
    private generalService: GeneralService,
    private coordenadasService: CoordenasService,
    private router: Router) {
    this.formGroupParent = new FormGroup({});
    this.verificarTipoEleccionSession();
  }


  ngOnInit(): void {
    this.formGroupParent = this.formBuilder.group({});

  }


  verificarTipoEleccionSession() {
    const dataSession = sessionStorage.getItem(Constantes.TIPO_ELECCION);
    if (dataSession) {
      this.tipoEleccion = JSON.parse(dataSession);
      this.obtenerDetalleTipoDocumentoEleccion();
    }
  }

  obtenerDetalleTipoDocumentoEleccion() {
    this.detalleTipoDocumentoEleccionService.obtenerDetalleTipoElectoral(this.tipoEleccion.id, 2).subscribe(response => {
      if (response.success) {
        this.listDocumentoElectoral = response.data.map(x => {
          return {id: x.id, nombre: x.documentoElectoral.nombre, img: x.archivoBase64, archivo: x.archivo, abreviatura:x.documentoElectoral.abreviatura} as any
        });
      }
    });
  }

  tipoDocumentoSeleccionado() {
    console.log(this.tipoDocumentoElectoralControl.value)
    this.detalleTipoEleccion = this.tipoDocumentoElectoralControl.value;
    if (this.detalleTipoEleccion.img && this.detalleTipoEleccion.archivo) {
      this.imagenSeleccionado = this.dataURLtoFile('data:image/png;base64,' + this.detalleTipoEleccion.img, this.detalleTipoEleccion.archivo.nombreOriginal);
      this.dataConfig.init = true;
    } else {
      this.imagenSeleccionado = undefined;
    }
    if (this.fileUploader) {
      this.fileUploader.nativeElement.value = null;
    }
    this.imagenPrueba = "";
    this.detalleConfiguracionService.obtenerDetalleConfiguracionElectoral(this.detalleTipoEleccion.id, 1).subscribe((response) => {
      if (response.success) {
        this.listDetalleConfig = response.data;
        this.dataConfig.idDocumento = 0;
        let count = 1;
        let coordenadas = [];
        for (let conf of this.listDetalleConfig) {
          if (conf.pixelTopX !== null && conf.pixelTopY !== null) {
            const rect = {
              nro: count,
              x1: conf.pixelTopX,
              y1: conf.pixelTopY,
              x2: conf.pixelBottomX,
              y2: conf.pixelBottomY,
              width: conf.width,
              height: conf.height,
              color: conf.colorHex,
              id: conf.id
            }
            conf.selected = true;
            count++;
            coordenadas.push(rect);
          }

        }
        this.responseCoordenates = coordenadas;
        this.obtenerCoordenadas(coordenadas);
      }
    });
  }


  async upload(data: any) {
    console.log(data.files);
    if (data.files && data.files.length > 0) {
      const file = data.files[0];

      this.imagenSeleccionado = data.files[0];
      this.dataConfig.idDocumento = this.detalleTipoEleccion.id;
      try {
        const result = await this.toBase64(file) as any;
        this.imagenPrueba = result;
      } catch (error) {
        console.error(error);
        return;
      }
    }
  }

  toBase64 = (fileImg: any) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(fileImg);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  async obtenerDetalleConfigSinArea(areas: Array<IareaCoordinates>, detalles: Array<IDetalleConfiguracionDocumentoElectoral>) {
    const areaIds = new Set(areas.map(area => area.id));
    return detalles.filter(detalle => !areaIds.has(detalle.id));
  }

  async guardarArchivo(isValidar: boolean) {
    if (isValidar) {

      if(this.imagenSeleccionado === null || this.imagenSeleccionado === undefined || this.imagenSeleccionado === ""){
        await this.generalService.openDialogoGeneral({
          mensaje: "Debe seleccionar un archivo",
          icon: IconPopType.ALERT,
          title: 'Advertencia',
          success: false
        });
        return;
      }

      const detallesSinArea = await this.obtenerDetalleConfigSinArea(this.requestCoordenates.areas, this.listDetalleConfig);
      if (detallesSinArea.length > 0) {
        await this.generalService.openDialogoGeneral({
          mensaje: "Debe de trazar todas las secciones: " +detallesSinArea[0].seccion.nombre + " ...",
          icon: IconPopType.ALERT,
          title: 'Advertencia',
          success: false
        });
        return;
      }
    }

    try {

      sessionStorage.setItem('loading', 'true');

      const result = await this.toBase64(this.imagenSeleccionado) as any;
      this.requestCoordenates.image = result.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "");
      this.requestCoordenates.abreviatura = this.tipoDocumentoElectoralControl.value.abreviatura;

      const response = await firstValueFrom(this.coordenadasService.verificarImagen(this.requestCoordenates));
      if (response) {
        let i = 0;
        for (let area of this.requestCoordenates.areas) {
          const area2 = response[i];
          for (let detalleConfig of this.listDetalleConfig) {
            if (detalleConfig.id === area.id) {
              detalleConfig.pixelBottomX = area.bottomRight.x;
              detalleConfig.pixelBottomY = area.bottomRight.y;
              detalleConfig.pixelTopX = area.topLeft.x;
              detalleConfig.pixelTopY = area.topLeft.y;
              detalleConfig.coordenadaRelativaBottomX = area2.bottomRight.x;
              detalleConfig.coordenadaRelativaBottomY = area2.bottomRight.y;
              detalleConfig.coordenadaRelativaTopX = area2.topLeft.x;
              detalleConfig.coordenadaRelativaTopY = area2.topLeft.y;
              detalleConfig.width = area.width;
              detalleConfig.height = area.height;
            }
          }
          i++;
        }
      }
      const responseArchivo = await firstValueFrom(this.detalleTipoDocumentoEleccionService.guardarArchivo(this.detalleTipoEleccion.id, this.imagenSeleccionado));
      this.detalleConfiguracionService.guardar(this.listDetalleConfig, null).subscribe(async (response) => {
        await this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });
        if (isValidar) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['/main/configuraciones/paso3'])
          });

        }
        sessionStorage.setItem('loading', 'false');
      });
    } catch (e) {
      sessionStorage.setItem('loading', 'false');
      await this.generalService.openDialogoGeneral({
        mensaje: "Ocurrio un error al intentar guardar la información",
        icon: IconPopType.ERROR,
        title: TitlePop.INFORMATION,
        success: true
      });
    }
  }

  async obtenerCoordenadas(data: any[]) {
    this.requestCoordenates.areas = [];
    data.forEach((area, index) => {
      const areas: IareaCoordinates = {
        name: 'Área ' + (index + 1),
        topLeft: {
          x: area.x1,
          y: area.y1
        },
        bottomRight: {
          x: area.x2,
          y: area.y2
        },
        id: area.id,
        width: area.width,
        height: area.height
      };
      for (let conf of this.listDetalleConfig) {
        if (conf.id == area.id) {
          conf.selected = true;
        }
      }
      this.requestCoordenates.areas.push(areas);
    })

  }

  async seleccionarSeccion(seccion: IDetalleConfiguracionDocumentoElectoral) {
    if (this.imagenSeleccionado) {
      this.colorRect = seccion.colorHex;
      this.seccionSeleccionado = seccion;
      this.dataConfig = {idDocumento: this.detalleTipoEleccion.id, color: seccion.colorHex, idSeccion: seccion.id};
    } else {
      await this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar una imagen",
        icon: IconPopType.ALERT,
        title: TitlePop.INFORMATION,
        success: false
      });
    }

  }

  dataURLtoFile(dataurl: any, filename: any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[arr.length - 1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
  }

}
