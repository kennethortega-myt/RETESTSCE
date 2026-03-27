import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ProcesamientoManualBaseComponent } from '../procesamiento-manual-base/procesamiento-manual-base';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TablaTotalesPreferencialesProcesamientoManualFormStrategy } from 'src/app/pages/shared/strategy/tablaTotalesPreferencialesProcesamientoManualForm.strategy';
import { IProcesamientoManualFormGroupStrategy } from 'src/app/interface/procesamientoManualFormGroupStrategy.interface';
import { InputBehaviorService } from 'src/app/service/inputBehaviorService';
import { MessageProcesamientoManualService } from 'src/app/message/message-procesamiento-manual.service';
import { InputBehaviorConfig } from 'src/app/interface/tablaVotos/inputBehaviorConfig.interface';
import { InputIndices } from 'src/app/interface/tablaVotos/inputIndices.interface';
import { UtilityService } from 'src/app/helper/utilityService';
import { VerificationVoteItemBean } from 'src/app/model/verificationVoteItemBean';
import { VerificationVotePreferencialItemBean } from 'src/app/model/verificationVotePreferencialItemBean';

@Component({
  selector: 'app-procesamiento-manual-votos-totales-preferenciales',
  templateUrl: './procesamiento-manual-votos-totales-preferenciales.component.html',
  styleUrl: './procesamiento-manual-votos-totales-preferenciales.component.css',
})
export class ProcesamientoManualVotosTotalesPreferencialesComponent
extends ProcesamientoManualBaseComponent implements OnInit, OnDestroy {

  @ViewChildren('lazyImage') lazyImages!: QueryList<ElementRef>;
  @ViewChildren('lazyImagePref') lazyImagesPref!: QueryList<ElementRef>;


  private readonly inputBehaviorConfig: InputBehaviorConfig;

  constructor(
    formBuilder: FormBuilder,
    inputBehaviorService: InputBehaviorService,
    messageProcesamientoManualService: MessageProcesamientoManualService,
    cdr: ChangeDetectorRef,
    utilityService:UtilityService
  ) {
    super(formBuilder, inputBehaviorService, messageProcesamientoManualService, cdr, utilityService);
    this.inputBehaviorConfig = {
      formGroupTotal: this.formGroupSeccionVoto,
      formGroupPref: this.formGroupSeccionVotoPref,
      getControlName: (rowIndex: number, colIndex?: number) => this.getControlName(rowIndex, colIndex),
      onVotoChange: (indices: InputIndices, value: string) => this.handleVotoChange(indices),
      cdr: this.cdr
    };
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected createFormStrategy(): IProcesamientoManualFormGroupStrategy {
    return new TablaTotalesPreferencialesProcesamientoManualFormStrategy(
      this.formGroupSeccionVoto,
      this.formGroupSeccionVotoPref
    );
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

  protected override resetSeccionVotoItems(): void {
    this.actaParaProcesamientoManualBean.voteSection.items.forEach(voto => {
      if (voto.estado != this.Constantes.CODIGO_ESTADO_ACHURADO){
        voto.userValue = '0';
      }
      if (voto.votoPreferencial){
        voto.votoPreferencial.forEach(votoPref => {
          if(votoPref.estado != this.Constantes.CODIGO_ESTADO_ACHURADO){
            votoPref.userValue = '0';
          }
        })
      }
    });
    this.messageProcesamientoManualService.setDataActaParaProcesamientoManualBean(this.actaParaProcesamientoManualBean);
  }

  protected override onDoubleClick(event: MouseEvent): void {
    const input = (event.target as HTMLElement).closest('input');
    if (!input) return;

    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;
    const agrupacion = this.actaParaProcesamientoManualBean.voteSection.items[rowIndex];

    const voto: VerificationVoteItemBean | VerificationVotePreferencialItemBean = colIndex !== undefined ?  agrupacion.votoPreferencial[colIndex]: agrupacion;

    if (voto?.estado === this.Constantes.CODIGO_ESTADO_ACHURADO) return;

    this.inputBehaviorService.setEditingMode(true, rowIndex, colIndex, this.cdr);

    setTimeout(() => {
      input.select();
    }, 0);
  }

  protected override habilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.enable();
    });

    // Habilitar formulario de votos preferenciales
    const paramsPref = this.formGroupSeccionVotoPref.get('params') as FormGroup;
    Object.keys(paramsPref.controls).forEach(key => {
      paramsPref.get(key)?.enable();
    });
  }

  protected override deshabilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.setValue('');
      params.get(key)?.disable();
    });

    // Deshabilitar formulario de votos preferenciales
    const paramsPref = this.formGroupSeccionVotoPref.get('params') as FormGroup;
    Object.keys(paramsPref.controls).forEach(key => {
      paramsPref.get(key)?.setValue('');
      paramsPref.get(key)?.disable();
    });
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = this.actaParaProcesamientoManualBean.voteSection.cantidadVotosPreferenciales || 0;
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
    const votoItem = this.actaParaProcesamientoManualBean.voteSection.items[indices.rowIndex];
    if (!votoItem) return;

    if (indices.colIndex !== undefined){
      // es preferencial
      const votoPref = votoItem.votoPreferencial?.[indices.colIndex];
      this.changeVoto(votoPref.fileId, true, indices.rowIndex, indices.colIndex);
    }else{
      //es total
      const fileId = votoItem.fileId;
      this.changeVoto(fileId,false, indices.rowIndex);
    }
  }

  getIndicesFromInputPref(input: HTMLInputElement): { rowIndex: number, colIndex: number } | null {
    const regex = /mat-input-pref-(\d+)-(\d+)/;
    const match = regex.exec(input.id);

    if (match) {
      return {
        rowIndex: parseInt(match[1], 10),
        colIndex: parseInt(match[2], 10)
      };
    }

    return null;
  }
}
