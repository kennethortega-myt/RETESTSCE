import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ProcesamientoManualBaseComponent } from '../procesamiento-manual-base/procesamiento-manual-base';
import { TablaTotalesProcesamientoManualFormStrategy } from 'src/app/pages/shared/strategy/tablaTotalesProcesamientoManualForm.strategy';
import { IProcesamientoManualFormGroupStrategy } from 'src/app/interface/procesamientoManualFormGroupStrategy.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MessageProcesamientoManualService } from 'src/app/message/message-procesamiento-manual.service';
import { InputBehaviorService } from 'src/app/service/inputBehaviorService';
import { InputBehaviorConfig } from 'src/app/interface/tablaVotos/inputBehaviorConfig.interface';
import { InputIndices } from 'src/app/interface/tablaVotos/inputIndices.interface';
import { UtilityService } from 'src/app/helper/utilityService';

@Component({
  selector: 'app-procesamiento-manual-votos-totales',
  templateUrl: './procesamiento-manual-votos-totales.component.html',
  styleUrl: './procesamiento-manual-votos-totales.component.css',
})
export class ProcesamientoManualVotosTotalesComponent extends ProcesamientoManualBaseComponent implements OnInit {
  private readonly inputBehaviorConfig: InputBehaviorConfig;

  constructor(
    formBuilder: FormBuilder,
    inputBehaviorService: InputBehaviorService,
    messageProcesamientoManualService: MessageProcesamientoManualService,
    cdr: ChangeDetectorRef,
    utilityService:UtilityService,
  ){
    super(formBuilder, inputBehaviorService, messageProcesamientoManualService, cdr, utilityService);
    this.inputBehaviorConfig = {
      formGroupTotal: this.formGroupSeccionVoto,
      formGroupPref: this.formGroupSeccionVotoPref,
      getControlName: (rowIndex: number, colIndex?: number) => this.getControlName(rowIndex, colIndex),
      onVotoChange: (indices: InputIndices, value: string) => this.handleVotoChange(indices),
      cdr: this.cdr
    };
  }

  protected createFormStrategy(): IProcesamientoManualFormGroupStrategy {
    return new TablaTotalesProcesamientoManualFormStrategy(
      this.formGroupSeccionVoto
    );
  }

  protected override onDoubleClick(event: MouseEvent): void {
    const input = (event.target as HTMLElement).closest('input');
    if (!input) return;

    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;
    const isPreferencial = colIndex !== undefined;

    const voto =  this.actaParaProcesamientoManualBean.voteSection.items[rowIndex];

    if (!isPreferencial && voto.nombreAgrupacionPolitica == null) return;

    this.inputBehaviorService.setEditingMode(true, rowIndex, colIndex, this.cdr);

    setTimeout(() => {
      input.select();
    }, 0);
  }



  protected override resetSeccionVotoItems(): void {
    this.actaParaProcesamientoManualBean.voteSection.items.forEach(voto => {
      if (voto.estado != this.Constantes.CODIGO_ESTADO_ACHURADO){
        voto.userValue = '0'
      }
    });
    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.actaParaProcesamientoManualBean);
    this.cdr.markForCheck();
  }

  protected override habilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
      Object.keys(params.controls).forEach(key => {
        params.get(key)?.enable(); // Habilitar control
      });
  }

  protected override deshabilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.setValue(''); // Limpiar valor
      params.get(key)?.disable();   // Deshabilitar control
    });
  }



  protected onFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;
    this.inputBehaviorService.setEditingMode(false, rowIndex, colIndex, this.cdr);

    setTimeout(() => {
      input.setSelectionRange(0, 0);
    }, 0);
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = 0;
    this.times = Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);
  }

  // ===================================================================
  //FUNCIONALIDAD DE INPUT BEHAVIOR USANDO EL SERVICIO
  // ===================================================================

  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    this.inputBehaviorService.handleKeyDown(event, this.inputBehaviorConfig);
  }

  protected handleVotoChange(indices: InputIndices): void {
    const fileId = this.actaParaProcesamientoManualBean.voteSection.items[indices.rowIndex].fileId;
    this.changeVoto(fileId, false, indices.rowIndex);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

}
