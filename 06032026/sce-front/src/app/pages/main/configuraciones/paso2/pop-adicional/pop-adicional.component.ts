import {Component, EventEmitter, Inject, Output} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-pop-adicional',
  templateUrl: './pop-adicional.component.html',

})
export class PopAdicionalComponent {

  @Output() guardarSeccionEvent = new EventEmitter<any>();
  formGroup: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<PopAdicionalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public formBuilder: FormBuilder,) {
    this.formGroup = new FormGroup({});
    this.formGroup = this.formBuilder.group({
      nombre:['',[
        Validators.required,
        this.noWhitespaceValidator
      ]]
    })
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  guardar(): void {

    //this.dialogRef.close({success: true,data:{id:this.data.id,...this.formGroup.getRawValue()}});
    this.guardarSeccionEvent.emit({
      success: true,
      data: { id:this.data.id,...this.formGroup.getRawValue() }
    });

  }

}
