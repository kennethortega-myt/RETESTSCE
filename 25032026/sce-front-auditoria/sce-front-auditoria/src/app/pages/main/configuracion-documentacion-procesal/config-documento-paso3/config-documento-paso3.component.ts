import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {IDatosGeneralResponse} from "../../../../interface/general.interface";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IDetalleConfiguracionDocumentoElectoral} from "../../../../interface/detalleConfiguracionElectoral.interface";
import {IareaCoordinates, IRelativeCoordinatesInterface} from "../../../../interface/IRelativeCoordinates.interface";
import {DetalleTipoElectoralService} from "../../../../service-api/detalle-tipo-electoral.service";
import {DetalleConfiguracionService} from "../../../../service-api/detalle-configuracion.service";
import {GeneralService} from "../../../../service/general-service.service";
import {CoordenasService} from "../../../../service-api/coordenas.service";
import {Router} from "@angular/router";
import {Constantes} from "../../../../helper/constantes";
import {firstValueFrom} from 'rxjs';
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';
import {Utility} from 'src/app/helper/utility';

@Component({
  selector: 'app-config-documento-paso3',
  templateUrl: './config-documento-paso3.component.html',
  styleUrls: ['./config-documento-paso3.component.scss']
})
export class ConfigDocumentoPaso3Component implements OnInit {

  @ViewChild('fileUploader') fileUploader:ElementRef;

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
    private readonly detalleTipoDocumentoEleccionService: DetalleTipoElectoralService,
    private readonly detalleConfiguracionService: DetalleConfiguracionService,
    public formBuilder: FormBuilder,
    private readonly generalService: GeneralService,
    private readonly coordenadasService: CoordenasService,
    private readonly router: Router) {
    this.formGroupParent = new FormGroup({});
    this.obtenerDetalleTipoDocumentoEleccion();
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
    this.detalleTipoDocumentoEleccionService.obtenerDetalleTipoElectoral(0, 3).subscribe(response => {
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
      this.imagenSeleccionado = Utility.dataURLtoFile('data:image/png;base64,' + this.detalleTipoEleccion.img, this.detalleTipoEleccion.archivo.nombreOriginal);
      this.dataConfig.init = true;
    } else {
      this.imagenSeleccionado = undefined;
    }
    if(this.fileUploader){
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


  async guardarArchivo(isValidar: boolean) {
    if (isValidar) {
      if (this.requestCoordenates.areas.length < this.listDetalleConfig.length) {
        await this.generalService.openDialogoGeneral({mensaje:"Debe de trazar todas las secciones",icon:IconPopType.ALERT,title:'Advertencia',success:false});
        return;
      }
    }

    try {

      sessionStorage.setItem('loading','true');

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
      await firstValueFrom(this.detalleTipoDocumentoEleccionService.guardarArchivo(this.detalleTipoEleccion.id, this.imagenSeleccionado));
      this.detalleConfiguracionService.guardar(this.listDetalleConfig,null).subscribe(async (response) => {
        await this.generalService.openDialogoGeneral({mensaje:response.message,icon:IconPopType.CONFIRM,title:TitlePop.INFORMATION,success:true});
        if(isValidar){
          this.router.navigate(['/main/configuracionDocumentacionProcesal'])
        }
        sessionStorage.setItem('loading','false');
      });
    }catch (e) {
      sessionStorage.setItem('loading','false');
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
      for(let conf of this.listDetalleConfig){
        if(conf.id == area.id){
          conf.selected = true;
        }
      }
      this.requestCoordenates.areas.push(areas);
    })

  }

  async seleccionarSeccion(seccion: IDetalleConfiguracionDocumentoElectoral) {
    if(this.imagenSeleccionado){
      this.colorRect = seccion.colorHex;
      this.seccionSeleccionado = seccion;
      this.dataConfig = {idDocumento: this.detalleTipoEleccion.id, color: seccion.colorHex, idSeccion: seccion.id};
    }else{
      await this.generalService.openDialogoGeneral({mensaje:"Debe seleccionar una imagen",icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});
    }

  }

  onKeyDown(event: KeyboardEvent, config: any): void {
    if (event.key === 'Enter' || event.key === ' ') { // Detectar Enter o Espacio
      event.preventDefault(); // Evita que la página se desplace al presionar espacio
      this.seleccionarSeccion(config);
    }
  }

}
