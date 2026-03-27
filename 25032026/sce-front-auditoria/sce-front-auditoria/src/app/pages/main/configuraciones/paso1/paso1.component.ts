import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Constantes} from 'src/app/helper/constantes';
import {IDetalleTipoDocumentoElectoral} from 'src/app/interface/detalleTipoDocumentoElectoral.interface';
import {IDatosGeneralResponse, IDocumentoElectoralResponse} from 'src/app/interface/general.interface';
import {DetalleTipoElectoralService} from 'src/app/service-api/detalle-tipo-electoral.service';
import {DocumentoElectoralService} from 'src/app/service-api/documento-electoral.service';
import {TipoEleccionService} from 'src/app/service-api/tipo-eleccion.service';
import {GeneralService} from 'src/app/service/general-service.service';
import {MatDialog} from '@angular/material/dialog';
import {PopInfosubelecionComponent} from './pop-infosubelecion/pop-infosubelecion.component';
import {PopNuevodocumentoComponent} from './pop-nuevodocumento/pop-nuevodocumento.component';
import {Router} from "@angular/router";
import {IconPopType, TitlePop} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-paso1',
  templateUrl: './paso1.component.html',
})
export class Paso1Component implements OnInit {
  listTipoEleccion: Array<IDatosGeneralResponse> = [];
  tipoEleccion: IDatosGeneralResponse = {id: 0, nombre: ''};
  listDocumentoElectoral: Array<IDetalleTipoDocumentoElectoral> = [];
  listDocumentoElectoralTmp: Array<IDetalleTipoDocumentoElectoral> = [];
  listDocumentoElectoralInicial: string;
  formGroupParent: FormGroup;
  documentoDataControl: FormControl = new FormControl('', [Validators.required]);
  controlBotonesIndex: boolean = false;
  documentoData: IDocumentoElectoralResponse = {id: 0, nombre: ''};
  bloquearPaso2: boolean = false;

  constructor(
    private tipoEleccionService: TipoEleccionService,
    private generalService: GeneralService,
    private detalleTipoDocumentoEleccionService: DetalleTipoElectoralService,
    public formBuilder: FormBuilder,
    private documentoElectoralService: DocumentoElectoralService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.formGroupParent = new FormGroup({});
  }

  ngOnInit(): void {
    this.list();
    this.formGroupParent = this.formBuilder.group({});
  }

  openDialogInfoElect() {
    const dialogRef = this.dialog.open(PopInfosubelecionComponent, {
      data: this.tipoEleccion
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openDialogNewDoc() {
    const dialogRef = this.dialog.open(PopNuevodocumentoComponent, {
      disableClose: true,
      data: this.documentoData
    });

    dialogRef.componentInstance.guardarDocuEvent.subscribe(result => {

      if (result.success) {
        this.documentoData = result.data;
        this.guardarDocu().then(() => {
          dialogRef.close(result);
        });
      }
      this.controlBotonesIndex = false;
    });
  }

  list() {
    this.tipoEleccionService.list().subscribe((response) => {
      if (response.success) {
        this.listTipoEleccion = response.data;
        this.tipoEleccionSeleccionado(this.listTipoEleccion[0]);
      }
    });
  }

  guardarTipoEleccion(data: string) {
    sessionStorage.setItem('loading', 'true');
    this.tipoEleccionService
      .save({
        activo: 1,
        nombre: data,
        usuario: this.generalService.obtenerUsuarioSession(),
      })
      .subscribe(async (response) => {
        if (response.success) {
          await this.generalService.openDialogoGeneral({
            mensaje: response.message,
            icon: IconPopType.CONFIRM,
            title: TitlePop.INFORMATION,
            success: true
          });
          this.list();
        }
        sessionStorage.setItem('loading', 'false');
      }, error => {
        sessionStorage.setItem('loading', 'false');
      });
  }

  tipoEleccionSeleccionado(data: IDatosGeneralResponse) {
    this.tipoEleccion = data;
    sessionStorage.setItem(Constantes.TIPO_ELECCION, JSON.stringify(this.tipoEleccion));
    this.detalleTipoDocumentoEleccionService.obtenerDetalleTipoElectoral(this.tipoEleccion.id, 0).subscribe(response => {
      if (response.success) {
        this.listDocumentoElectoral = response.data;
        this.listDocumentoElectoralInicial = JSON.stringify(this.listDocumentoElectoral)
        this.bloquearPaso2 = this.verificarPaso2(response.data);
        for (let docu of this.listDocumentoElectoral) {
          this.formGroupParent.setControl(docu.documentoElectoral.id + "-radio", new FormControl(docu.requerido === 1, [Validators.required]));
        }

      }
    });
  }

  async continuar() {
    for (let docu of this.listDocumentoElectoral) {
      docu.requerido = this.formGroupParent.get(docu.documentoElectoral.id + "-radio")?.value ? 1 : 0;
    }
    if (this.verificarRequerido(this.listDocumentoElectoral)) {
      await this.generalService.openDialogoGeneral({
        mensaje: "Debe seleccionar algún documento electoral",
        icon: IconPopType.ALERT,
        title: 'Advertencia',
        success: false
      });

    } else {
      await this.guardar();
      this.router.navigate(['/main/configuraciones/paso2']);
    }
  }
  hasChanges(): boolean {
    return this.listDocumentoElectoralInicial !== JSON.stringify(this.listDocumentoElectoral);
  }
  async guardar() {
    sessionStorage.setItem('loading', 'true');
    for (let docu of this.listDocumentoElectoral) {
      docu.requerido = this.formGroupParent.get(docu.documentoElectoral.id + "-radio")?.value ? 1 : 0;
    }
    if (this.hasChanges()) {
      console.log("La lista de documentos electorales ha cambiado");
      this.detalleTipoDocumentoEleccionService.guardar(this.listDocumentoElectoral).subscribe(async (response) => {
        await this.generalService.openDialogoGeneral({
          mensaje: response.message,
          icon: IconPopType.CONFIRM,
          title: TitlePop.INFORMATION,
          success: true
        });
        this.bloquearPaso2 = false;
        this.tipoEleccionSeleccionado(this.tipoEleccion);
        sessionStorage.setItem('loading', 'false');
      }, err => {
        sessionStorage.setItem('loading', 'false');
      });
    } else {
      console.log("La lista de documentos electorales no ha cambiado");
      sessionStorage.setItem('loading', 'false');
    }

  }

  editarDocu(data: IDetalleTipoDocumentoElectoral) {
    this.controlBotonesIndex = true;
    this.documentoDataControl.setValue(data.documentoElectoral.nombre);
    this.documentoData = data.documentoElectoral;
    const dialogRef = this.dialog.open(PopNuevodocumentoComponent, {
      disableClose: true,
      data: this.documentoData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.success) {
        this.documentoData = result.data;
        this.guardarDocu();
      }
      this.controlBotonesIndex = false;
    });
  }
  eliminarDocu(data: IDetalleTipoDocumentoElectoral) {
    sessionStorage.setItem('loading', 'true');
    this.documentoElectoralService.delete(data.documentoElectoral.id).subscribe(response => {
      this.tipoEleccionSeleccionado(this.tipoEleccion);
      const index = this.listDocumentoElectoralTmp.indexOf(data);
      if (index !== -1) {
        this.listDocumentoElectoralTmp.splice(index, 1);
      }
      sessionStorage.setItem('loading', 'false');
    })
  }

  cancelarDocu() {
    this.controlBotonesIndex = false;
    this.documentoDataControl.setValue('');
  }

  guardarDocu() {
    return new Promise<void>((resolve, reject) => {
      sessionStorage.setItem('loading', 'true');
      let data: IDetalleTipoDocumentoElectoral = {
        activo: 1,
        requerido: 0,
        documentoElectoral: this.documentoData,
        tipoEleccion: this.tipoEleccion
      };
      this.documentoElectoralService.save({
        activo: 1,
        usuario: this.generalService.obtenerUsuarioSession(), ...this.documentoData
      }).subscribe(response => {
        sessionStorage.setItem('loading', 'false');
        if (response.success) {
          data.documentoElectoral = response.data;

          if (this.documentoData.id === 0) {
            this.listDocumentoElectoral.push(data);
            this.listDocumentoElectoralTmp.push(data);
            this.guardar();

          } else {
            let index = this.listDocumentoElectoral.findIndex(documento => documento.documentoElectoral.id === this.documentoData.id);
            if (index != -1) {
              this.listDocumentoElectoral[index].documentoElectoral = response.data;
            }

            let index2 = this.listDocumentoElectoralTmp.findIndex(documento => documento.documentoElectoral.id === this.documentoData.id);
            if (index2 != -1) {
              this.listDocumentoElectoralTmp[index2].documentoElectoral = response.data;
            }
          }
          this.controlBotonesIndex = false;
          this.documentoDataControl.setValue('');
          resolve();
        } else {
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

  verificarPaso2(data: Array<IDetalleTipoDocumentoElectoral>) {
    let count = 0;
    let count2 = 0;
    for (let x of data) {
      if (!x.id) {
        count += 1;
      }
      if (x.requerido === 0) {
        count2 += 1;
      }
    }
    return data.length === count || data.length === count2;
  }

  verificarRequerido(data: Array<IDetalleTipoDocumentoElectoral>) {
    let count = 0;
    for (let x of data) {
      if (x.requerido === 0) {
        count += 1;
      }
    }
    return data.length === count;
  }

}



