import {Component, OnInit} from '@angular/core';
import {IDatosGeneralResponse} from "../../../interface/general.interface";
import {IDetalleTipoDocumentoElectoral} from "../../../interface/detalleTipoDocumentoElectoral.interface";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {TipoEleccionService} from "../../../service-api/tipo-eleccion.service";
import {GeneralService} from "../../../service/general-service.service";
import {DetalleTipoElectoralService} from "../../../service-api/detalle-tipo-electoral.service";
import {DocumentoElectoralService} from "../../../service-api/documento-electoral.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";
import {IconPopType, TitlePop} from '../../../model/enum/iconPopType';

@Component({
  selector: 'app-configuracion-documentacion-procesal',
  templateUrl: './configuracion-documentacion-procesal.component.html',
  styleUrls: ['./configuracion-documentacion-procesal.component.scss']
})
export class ConfiguracionDocumentacionProcesalComponent implements  OnInit{

  tipoEleccion: IDatosGeneralResponse = { id: 0, nombre: '' };
  listDocumentoElectoral: Array<IDetalleTipoDocumentoElectoral> = [];
  formGroupParent: FormGroup;
  bloquearPaso2: boolean = false;

  constructor(
    private readonly tipoEleccionService: TipoEleccionService,
    private readonly generalService: GeneralService,
    private readonly detalleTipoDocumentoEleccionService: DetalleTipoElectoralService,
    public formBuilder: FormBuilder,
    private readonly documentoElectoralService: DocumentoElectoralService,
    public dialog: MatDialog,
    private readonly router: Router
  ) {
    this.formGroupParent = new FormGroup({});
  }
  ngOnInit(): void {
    this.list();
    this.formGroupParent = this.formBuilder.group({});
  }

  list() {
    sessionStorage.setItem('loading','true');
    this.detalleTipoDocumentoEleccionService.obtenerDetalleDocumentoElectoral().subscribe((response) => {
      if (response.success) {
        this.listDocumentoElectoral = response.data;

        for(let docu of this.listDocumentoElectoral){
          docu.tipoEleccion = null;
          this.formGroupParent.setControl(docu.documentoElectoral.id +"-radio",new FormControl(docu.requerido, [Validators.required]));
        }
        console.log(this.listDocumentoElectoral);
      }
      sessionStorage.setItem('loading','false');
    });
  }


  async continuar(){

    for(let docu of this.listDocumentoElectoral){
      docu.requerido = this.formGroupParent.get(docu.documentoElectoral.id +"-radio")?.value ? 1 : 0;
    }
    if(this.verificarRequerido(this.listDocumentoElectoral)){
      await this.generalService.openDialogoGeneral({mensaje:'Debe seleccionar algún documento electoral',icon:IconPopType.ALERT,title:TitlePop.INFORMATION,success:false});

    }else{
      await this.guardar();

    }


  }

  async guardar(){
    sessionStorage.setItem('loading','true');
    for(let docu of this.listDocumentoElectoral){
      docu.requerido = this.formGroupParent.get(docu.documentoElectoral.id +"-radio")?.value ? 1 : 0;
    }
    console.log(this.listDocumentoElectoral);
    this.detalleTipoDocumentoEleccionService.guardar(this.listDocumentoElectoral).subscribe(async (response) =>{
      await this.generalService.openDialogoGeneral({mensaje:response.message,icon:IconPopType.CONFIRM,title:TitlePop.INFORMATION,success:false});

      this.bloquearPaso2 = false;
      this.router.navigate(['main/configuracionDocumentacionProcesal2'])
      sessionStorage.setItem('loading','false');
    }, error => {
      sessionStorage.setItem('loading','false');
    });
  }


  verificarRequerido(data:Array<IDetalleTipoDocumentoElectoral>){
    let count = 0;
    for(let x of data){
      if(x.requerido === 0){
        count += 1;
      }
    }
    return data.length === count;
  }


}
