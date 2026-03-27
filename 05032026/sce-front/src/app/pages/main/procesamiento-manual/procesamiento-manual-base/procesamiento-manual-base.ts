import {ChangeDetectorRef, Component, computed, effect, inject, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { take } from 'rxjs';
import { Constantes } from 'src/app/helper/constantes';
import { IAgrupacionPolitica } from 'src/app/interface/agrupacionPolitica.interface';
import { IProcesamientoManualFormGroupStrategy } from 'src/app/interface/procesamientoManualFormGroupStrategy.interface';
import { InputIndices } from 'src/app/interface/tablaVotos/inputIndices.interface';
import { MessageProcesamientoManualService } from 'src/app/message/message-procesamiento-manual.service';
import { InputBehaviorService } from 'src/app/service/inputBehaviorService';
import { UtilityService } from '../../../../helper/utilityService';
import { VerificationActaResponseBean } from 'src/app/model/verificationActaResponseBean';



@Component({
  template: '' // Componente abstracto
})
export abstract class ProcesamientoManualBaseComponent
implements OnInit, OnDestroy{

  public actaParaProcesamientoManualBean: VerificationActaResponseBean;
  times: number[] = [];
  public cantVotosPrefe: number;

  isSyncingLeft: boolean = false;
  isSyncingRight: boolean = false;

  protected formStrategy: IProcesamientoManualFormGroupStrategy;
  protected formGroupSeccionVoto: FormGroup;
  protected formGroupSeccionVotoPref: FormGroup;
  protected cvasFC = new FormControl({value:"", disabled:false});
  protected checkSinDatosFC = new FormControl({value:false, disabled:false});
  protected checkSinFirmasFC = new FormControl({value:false, disabled:false});
  protected checkSolNulidadFC = new FormControl({value:false, disabled:false});
  protected formGroupIntalacion: FormGroup;
  protected formGroupEscrutinio: FormGroup;
  public isHoraEscrutinioN: boolean = false;

  public FECHA_PROCESO = {year: 2026, month: 3, day: 12};
  public fechaProcesoDate = new Date(
    this.FECHA_PROCESO.year,
    this.FECHA_PROCESO.month,
    this.FECHA_PROCESO.day
  );

  public minFechaInstalacion: Date = new Date(
    this.FECHA_PROCESO.year,
    this.FECHA_PROCESO.month,
    this.FECHA_PROCESO.day - 1
  );
  public maxFechaInstalacion: Date = new Date(
    this.FECHA_PROCESO.year,
    this.FECHA_PROCESO.month,
    this.FECHA_PROCESO.day
  );

  public minFechaEscrutinio: Date = new Date(
    this.FECHA_PROCESO.year,
    this.FECHA_PROCESO.month,
    this.FECHA_PROCESO.day - 1
  );
  public maxFechaEscrutinio: Date = new Date(
    this.FECHA_PROCESO.year,
    this.FECHA_PROCESO.month,
    this.FECHA_PROCESO.day + 1
  );

  protected constructor(
    protected readonly formBuilder: FormBuilder,
    protected readonly inputBehaviorService: InputBehaviorService,
    protected readonly messageProcesamientoManualService: MessageProcesamientoManualService,
    protected readonly cdr: ChangeDetectorRef,
    protected readonly utilityService:UtilityService,
    ) {
      this.initializeComponent();

    }

  private initializeComponent(): void {
    this.actaParaProcesamientoManualBean = new VerificationActaResponseBean();
    this.cantVotosPrefe = 0;

    this.formGroupSeccionVoto = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });

    this.formGroupSeccionVotoPref = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });

    this.formGroupIntalacion = this.formBuilder.group({
      fechaInstalacion:[{ value: this.fechaProcesoDate, disabled: true }],
      horaInicioFormControl:['']
    });

    this.formGroupEscrutinio = this.formBuilder.group({
      fechaEscrutinio:[this.fechaProcesoDate],
      horaFinFormControl:[''],
    });


  }

  private configurarFormControls(): void {

    this.formStrategy = this.createFormStrategy();
    this.formStrategy.configurarFormControls(this.actaParaProcesamientoManualBean.voteSection.items, this.cantVotosPrefe);
  }

  trackByFileId(index: number, item: IAgrupacionPolitica): number {
    return item.idDetActa;
  }

  public ngOnInit(): void {
    this.messageProcesamientoManualService.getDataActaParaProcesamientoManualBean()
      .pipe(take(1))
      .subscribe(value => this.setDatosIniciales(value));
  }

  public setDatosIniciales(actaParaProcesamientoManualBean: VerificationActaResponseBean): void {
    this.actaParaProcesamientoManualBean = actaParaProcesamientoManualBean;
    this.inicializarConfiguracion();
    this.configurarFormControls();
    this.setearObservaciones();
  }

  public ngOnDestroy(): void {
    //
  }

  private setearObservaciones(): void {
    this.actaParaProcesamientoManualBean.signSection.status = 1;
    this.actaParaProcesamientoManualBean.signSection.userStatus = "true";
    this.actaParaProcesamientoManualBean.observationSection.nullityRequest = false;
    this.actaParaProcesamientoManualBean.observationSection.noData = false;
  }

  public changeCvas(){
    this.actaParaProcesamientoManualBean.dateSectionResponse.total.numberUserValue = this.cvasFC.value;
  }

  public changeCheckSinFirmas(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.actaParaProcesamientoManualBean.signSection.userStatus = isChecked ? "false": "true";
    this.actaParaProcesamientoManualBean.signSection.status = isChecked ? 0 : 1;
  }

  public changeCheckSolNulidad(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.actaParaProcesamientoManualBean.observationSection.nullityRequest = isChecked;

  }

  public changeCheckSinDatos(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.utilityService.popupConfirmacionConAcciones(
        event,
        'Usted eligió registrar el acta Sin Datos, se limpiarán los campos. ¿Está seguro de continuar?',
        ()=> this.confirmarSinDatos(),
        ()=> this.cancelarSinDatos()
      );
    }else{
      this.actaParaProcesamientoManualBean.observationSection.noData = false;
      this.habilitarFormulario();
    }

    this.cdr.markForCheck();
  }

  private confirmarSinDatos(){
    this.resetSeccionVotoItems();
    this.deshabilitarFormulario();
    this.actaParaProcesamientoManualBean.observationSection.noData = true;
  }
  private cancelarSinDatos(){
    this.checkSinDatosFC.setValue(false);
  }

  onScroll(container: string): void {
    const leftContainer = document.getElementById('left-container');
    const rightContainer = document.getElementById('right-container');

    if (container === 'left' && !this.isSyncingRight) {
      this.isSyncingLeft = true;
      if (rightContainer) rightContainer.scrollTop = leftContainer?.scrollTop || 0;
    } else if (container === 'right' && !this.isSyncingLeft) {
      this.isSyncingRight = true;
      if (leftContainer) leftContainer.scrollTop = rightContainer?.scrollTop || 0;
    }

    this.isSyncingLeft = false;
    this.isSyncingRight = false;
  }

  // ===================================================================
  // MÉTODOS COMUNES DE LA BASE
  // ===================================================================
  protected validateInput(value: string): string {
    if (value === '#' || value.toLowerCase() === 'i') return '#';

    const digits = value.replace(/\D/g, '');
    return digits.substring(0,3);
  }

  protected onInputVoto(fileId: number, preferencial: boolean, event: Event, i: number,j ?:number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const validado = this.validateInput(value);

    if (value !== validado) {
      const controlName = preferencial ? `${fileId}-${i}-${j}` : `${fileId}-${i}`;
      const control = preferencial ? this.formGroupSeccionVotoPref.get('params')?.get(controlName) : this.formGroupSeccionVoto.get('params')?.get(controlName);
      control?.setValue(validado);

      // Reestablecer el cursor al final para evitar "brinco" visual
      setTimeout(() => {
        input.setSelectionRange(validado.length, validado.length);
      });
    }
  }


  protected getIndicesFromId(id: string): { rowIndex: number; colIndex?: number } | null {
    const patterns = [
      {
        type: 'preferencial',
        regex: /mat-input-pref-(\d+)-(\d+)/,
        extract: (match: RegExpExecArray) => ({
          rowIndex: parseInt(match[1], 10),
          colIndex: parseInt(match[2], 10)
        })
      },
      {
        type: 'total',
        regex: /mat-input-total-(\d+)/,
        extract: (match: RegExpExecArray) => ({
          rowIndex: parseInt(match[1], 10)
        })
      }
    ];

    for (const pattern of patterns) {
      const match = pattern.regex.exec(id);
      if (match) {
        return pattern.extract(match);
      }
    }

    return null;
  }

  // Métodos para usar en templates
  protected isEditingMode(i: number, j?: number): boolean {
    return this.inputBehaviorService.isEditingMode(i, j);
  }

  protected onBlur(): void {
    this.inputBehaviorService.handleBlur(this.cdr);
  }

  protected getControlName(rowIndex: number, colIndex?: number): string {
    const fileId = null

    return colIndex !== undefined ? `${fileId}-${rowIndex}-${colIndex}`: `${fileId}-${rowIndex}`;
  }


  public changeVoto(fileId:number,preferencial: boolean ,i:number,j ?:number){

    const controlName = preferencial ? `${fileId}-${i}-${j}` : `${fileId}-${i}`;
    const formGroup = preferencial ? this.formGroupSeccionVotoPref : this.formGroupSeccionVoto;
    const control = formGroup.get("params")?.get(controlName);

    if (!control) return;

    let value = (control.value ?? '').toString();
    const validado= this.validateInput(value);

    if (value !== validado) {
      control?.setValue(validado);
      value = validado;
    }

    const userValue = value.trim() === '' ? '0' : value;

    const item = this.actaParaProcesamientoManualBean.voteSection.items[i];
    if (preferencial && j !== undefined && item.votoPreferencial?.[j]) {
      item.votoPreferencial[j].userValue = userValue;
    } else {
      item.userValue = userValue;
    }

    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.actaParaProcesamientoManualBean);

  }

  public changeHoraInicio(){
    const hora: string = this.formGroupIntalacion.get('horaInicioFormControl')?.value;
    const fecha: Date = this.formGroupIntalacion.get('fechaInstalacion')?.value;

    let fechaStr = this.formatDateToDDMMYYYY(fecha);

    this.actaParaProcesamientoManualBean.dateSectionResponse.start.userValue = `${fechaStr} ${hora}`;
    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.actaParaProcesamientoManualBean);
  }

  changeHoraFin(){
    const hora: string = this.formGroupEscrutinio.get('horaFinFormControl')?.value || '';

    if (hora === Constantes.CO_VALOR_N) {
      this.isHoraEscrutinioN=true;
      this.actaParaProcesamientoManualBean.dateSectionResponse.end.userValue = Constantes.CO_VALOR_N;
    } else {
      this.isHoraEscrutinioN = false;
      const fecha: Date = this.formGroupEscrutinio.get('fechaEscrutinio')?.value;
      if (fecha) {
        const fechaStr = this.formatDateToDDMMYYYY(fecha);
        this.actaParaProcesamientoManualBean.dateSectionResponse.end.userValue = `${fechaStr} ${hora}`.trim();
      } else {
        this.actaParaProcesamientoManualBean.dateSectionResponse.end.userValue = '';
      }
    }

    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.actaParaProcesamientoManualBean);
  }

  private formatDateToDDMMYYYY(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }


  protected abstract inicializarConfiguracion(): void;
  protected abstract createFormStrategy(): IProcesamientoManualFormGroupStrategy;
  protected abstract onFocus(event: FocusEvent): void;
  protected abstract onKeyDown(event: KeyboardEvent): void;
  protected abstract handleVotoChange(indices: InputIndices): void;
  protected abstract resetSeccionVotoItems(): void;
  protected abstract habilitarFormulario(): void;
  protected abstract deshabilitarFormulario(): void;
  protected abstract onDoubleClick(event: MouseEvent): void;

  protected readonly Constantes = Constantes;


}
