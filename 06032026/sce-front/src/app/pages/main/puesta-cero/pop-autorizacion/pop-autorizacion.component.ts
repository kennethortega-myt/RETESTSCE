import {Component, Inject, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {PopAutorizacionData} from "../../../../interface/popAutorizacion.interface";
import {UtilityService} from '../../../../helper/utilityService';
import {IconPopType} from '../../../../model/enum/iconPopType';

@Component({
  selector: 'app-pop-autorizacion',
  templateUrl: './pop-autorizacion.component.html'
})
export class PopAutorizacionComponent implements OnInit{

  public formAutorizacion:FormGroup;
  private readonly popAutorizacionData:PopAutorizacionData;

  constructor(public dialogRef: MatDialogRef<PopAutorizacionComponent>,
              private readonly utilityService: UtilityService,
              private readonly formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: string) {
    this.popAutorizacionData = new PopAutorizacionData();
    this.formAutorizacion = this.formBuilder.group({
      clavePuestaCero:['']
    })
    console.log(this.data)
    if(!this.data){
      this.data = "El siguiente proceso ELIMINARÁ INFORMACIÓN que no podrá ser recuperada. Para confirmar la acción, ingrese su clave.";
    }
  }
  ngOnInit(): void {
    this.popAutorizacionData.success = false;
    this.popAutorizacionData.claveAutorizacion = '';
  }

  aceptar(){
    if(!this.sonValidosLosDatos()) return;

    this.popAutorizacionData.success = true;
    this.popAutorizacionData.claveAutorizacion = this.formAutorizacion.get('clavePuestaCero').value;

    this.dialogRef.close(this.popAutorizacionData);

  }

  sonValidosLosDatos() :boolean{
    if(!this.formAutorizacion.get('clavePuestaCero').value){
      this.utilityService.mensajePopup("Autorizaciones", "Ingrese una clave", IconPopType.ALERT);
      return false;
    }
    return true;
  }


  cancelar(){
    this.popAutorizacionData.success = false;
    this.popAutorizacionData.claveAutorizacion = '';

    this.dialogRef.close(this.popAutorizacionData);
  }

}
