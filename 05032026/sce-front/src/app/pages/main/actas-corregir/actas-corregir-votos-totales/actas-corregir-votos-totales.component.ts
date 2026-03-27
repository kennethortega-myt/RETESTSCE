import {
  ChangeDetectorRef,
  Component,
  ElementRef, HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild, ViewChildren
} from "@angular/core";
import {ActasCorregirBaseComponent} from '../actas-corregir-base/actas-corregir-base.component';
import {FormBuilder} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {MessageActasCorregirService} from '../../../../message/message-actas-corregir.service';
import {UtilityService} from '../../../../helper/utilityService';
import {TablaEdicionService} from '../../../../helper/tablaEdicionService';
import {ITableEditingContext} from '../../../../interface/tablaVotos/tableEditingContext.interface';
import {ITableEditingConfiguration} from '../../../../interface/tablaVotos/tableEditingConfiguration.interface';
import {IFormGroupStrategy} from '../../../../interface/formGroupStrategy.interface';
import {IAgrupacionPolitica} from '../../../../interface/agrupacionPolitica.interface';
import {PresidencialFormStrategy} from '../../../shared/strategy/presidencialForm.strategy';
@Component({
  selector: 'app-actas-corregir-votos-totales',
  templateUrl: './actas-corregir-votos-totales.component.html',
  styleUrls: ['./actas-corregir-votos-totales.component.scss']
})
export class ActasCorregirVotosTotalesComponent extends ActasCorregirBaseComponent implements OnInit, OnDestroy{

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  private readonly componentId = 'actas-corregir-votos-totales';
  private readonly tablaContext: ITableEditingContext;
  private readonly tablaConfig: ITableEditingConfiguration = {
    maxLength: 3,
    allowHash: true,
    allowNumbers: true
  };

  //propiedades del componente
  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;


  constructor(
    formBuilder: FormBuilder,
    dialog: MatDialog,
    messageActasCorregirService: MessageActasCorregirService,
    renderer: Renderer2,
    utilityService: UtilityService,
    el: ElementRef,
    private readonly cdr: ChangeDetectorRef,
    private readonly tablaEdicionService: TablaEdicionService
  ) {
    super(formBuilder, dialog, messageActasCorregirService, renderer, utilityService, el);

    this.tablaContext = {
      formGroup: this.formGroupSeccionVoto,
      changeDetectorRef: this.cdr,
      onValueChange: (fileId, value, rowIndex) => {
        if (fileId) {
          this.changeVoto(fileId, rowIndex);
        }
      },
      getFileId: (rowIndex) => {
        return this.actaPorCorregirBean.agrupacionesPoliticas[rowIndex]?.idDetActa ?? null;
      },
      getControlName: (fileId, rowIndex) => {
        return fileId ? `${fileId}-${rowIndex}` : '';
      }
    };


  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.tablaEdicionService.initializeForComponent(this.componentId);
  }

  ngOnDestroy(): void {
    this.tablaEdicionService.destroyComponent(this.componentId);
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = 0;
    this.times = Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);
  }

  protected createFormStrategy(): IFormGroupStrategy {
    return new PresidencialFormStrategy(
      this.formBuilder,
      this.formGroupSeccionVoto,
      this.actaPorCorregirBean,
      this.messageActasCorregirService
    );
  }

  protected override procesarVotosEspecificos(agrPol: IAgrupacionPolitica): void {
    if (agrPol.votosOpciones && Array.isArray(agrPol.votosOpciones)) {
      for(const votOpc of agrPol.votosOpciones) {
        this.establecerTerceraDigitacion(votOpc);
      }
    }
  }

  //metodos especificos del componente

  ajustarScroll(event: FocusEvent): void {
    const fila = (event.target as HTMLElement).closest('.fila');
    if (fila) {
      fila.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  changeVoto(fileId: number, i: number): void {
    this.formStrategy.changeVoto(fileId, i);
  }

  //metodos delegados al servicio

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    this.tablaEdicionService.handleKeyDown(event, this.tablaContext, this.componentId, false, this.tablaConfig);
  }

  onFocus(event: FocusEvent): void {
    this.tablaEdicionService.handleFocus(event, this.componentId, this.tablaContext, false);
    this.ajustarScroll(event);
  }

  onBlur(): void {
    this.tablaEdicionService.handleBlur(this.componentId, this.tablaContext);
  }

  onDoubleClick(event: MouseEvent): void {
    const shouldAllowEdit = (rowIndex: number): boolean => {
      const voto = this.actaPorCorregirBean.agrupacionesPoliticas[rowIndex];
      return voto?.idDetActa != null;
    };

    this.tablaEdicionService.handleDoubleClick(event, this.componentId, this.tablaContext, false, shouldAllowEdit);
  }

  isEditingMode(i: number): boolean {
    return this.tablaEdicionService.isEditingMode(this.componentId, i );
  }

  onInputVoto(fileId: number, i: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const validado = this.tablaEdicionService.validateInput(value, this.tablaConfig);

    if (value !== validado) {
      const controlName = `${fileId}-${i}`;
      const control = this.formGroupSeccionVoto.get("params")?.get(controlName);
      control?.setValue(validado);

      setTimeout(() => {
        input.setSelectionRange(validado.length, validado.length);
      });
    }
  }

}
