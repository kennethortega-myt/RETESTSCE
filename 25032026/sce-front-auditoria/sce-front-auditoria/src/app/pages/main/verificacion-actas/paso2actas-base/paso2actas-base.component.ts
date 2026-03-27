import {
  AfterViewInit, ChangeDetectorRef,
  Component, effect,
  ElementRef,
  OnInit,
  QueryList,
  Renderer2,
  signal,
  ViewChildren
} from '@angular/core';
import {VerificationVoteSectionResponseBean} from '../../../../model/verificationVoteSectionResponseBean';
import {FormBuilder, FormGroup} from '@angular/forms';
import {IPaso2FormGroupStrategy} from '../../../../interface/paso2FormGroupStrategy.interface';
import {MatDialog} from '@angular/material/dialog';
import {
  FocusElementVeri,
  MessageVerificacionActasService
} from '../../../../message/message-verificacion-actas.service';
import {UtilityService} from '../../../../helper/utilityService';
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';
import {take} from 'rxjs';
import {VerificationVoteItemBean} from '../../../../model/verificationVoteItemBean';
import {VerificationVotePreferencialItemBean} from '../../../../model/verificationVotePreferencialItemBean';
import {InputBehaviorService} from '../../../../service/inputBehaviorService';
import {InputIndices} from '../../../../interface/tablaVotos/inputIndices.interface';

@Component({
  template: '' // Componente abstracto
})
export abstract class Paso2actasBaseComponent implements OnInit, AfterViewInit{

  public seccionVoto: VerificationVoteSectionResponseBean;
  public tipoSoluTecnologica: string;
  public tipoEleccionDescripcion: string;
  public formGroupSeccionVoto: FormGroup;
  public formGroupSeccionVotoPref: FormGroup;

  times: number[] = [];
  public cantVotosPrefe: number;

  protected formStrategy: IPaso2FormGroupStrategy

  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;
  protected readonly formularioListo = signal<boolean>(false);

  protected constructor(
    protected readonly formBuilder: FormBuilder,
    protected dialog: MatDialog,
    protected readonly renderer: Renderer2,
    protected readonly messageVerificacionActasService: MessageVerificacionActasService,
    protected readonly utilityService: UtilityService,
    protected readonly cdr: ChangeDetectorRef,
    protected readonly verificacionActaService: VerificacionActaService,
    protected readonly inputBehaviorService: InputBehaviorService
  ) {
    this.initializeComponent();

    effect(() => {
      const elementToFocus = this.messageVerificacionActasService.elementToFocus();

      if (elementToFocus === FocusElementVeri.INPUT_VOTO_FIRST) {
        setTimeout(() => this.inputRefs.first.nativeElement.focus());
      }

    });

    effect(() => {
      const sinDatos = this.messageVerificacionActasService.sinDatos();
      const estaListo = this.formularioListo();

      if (estaListo) {
        if (sinDatos) {
          // Si es sin datos: limpiar valores y deshabilitar
          this.resetSeccionVotoItems();
          this.deshabilitarFormulario();
        } else {
          // Si no es sin datos: habilitar formulario
          this.habilitarFormulario();
        }
        this.cdr.markForCheck();
      }
    });
  }

  private initializeComponent(): void {
    this.seccionVoto = new VerificationVoteSectionResponseBean();
    this.tipoSoluTecnologica = "";
    this.tipoEleccionDescripcion = "";
    this.cantVotosPrefe = 0;

    this.formGroupSeccionVoto = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });

    this.formGroupSeccionVotoPref = this.formBuilder.group({
      params: this.formBuilder.group({}),
    });
  }

  ngOnInit(): void {
    this.messageVerificacionActasService.getPaso2DataVerificacionBean()
      .pipe(take(1))
      .subscribe(value => this.setDatosIniciales(value));
  }

  setDatosIniciales(value : {voteSection: VerificationVoteSectionResponseBean, tipoSoluTecnologica: string, descripcionTipoEleccion: string}): void{
    this.seccionVoto = value.voteSection;
    this.tipoSoluTecnologica = value.tipoSoluTecnologica;
    this.tipoEleccionDescripcion = value.descripcionTipoEleccion;
    this.inicializarConfiguracion();
    this.configurarFormControls();
    this.setStaticImages();
    this.formularioListo.set(true);
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto,this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
    this.cdr.detectChanges();
  }

  private configurarFormControls(): void {
    this.formStrategy = this.createFormStrategy();
    this.formStrategy.configurarFormControls(this.seccionVoto.items, this.cantVotosPrefe);
  }

  ngAfterViewInit() {
    sessionStorage.setItem('loading', 'true');

    setTimeout(() => {
      this.startLazyLoading();
    }, 200);

  }

  // ===================================================================
  // MÉTODOS COMUNES DE LA BASE
  // ===================================================================

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getAttributeAsNumber(element: HTMLImageElement, attributeName: string): number {
    const attr = element.getAttribute(attributeName);
    return attr ? Number(attr) : -1;
  }

  protected validateInput(value: string): string {
    if (value === '#' || value.toLowerCase() === 'i') return '#';

    const digits = value.replace(/\D/g, '');
    return digits.substring(0,3);

  }

  protected async loadImageTotal(fileId: number, imgElement: HTMLImageElement) {
    try {
      const blob = await this.verificacionActaService.getFileV2(fileId);
      const imageUrl = URL.createObjectURL(blob);

      let votoTotal: VerificationVoteItemBean | undefined;

      const encontrado = this.seccionVoto.items.find(votoTotal => votoTotal.fileId === fileId);
      if (encontrado) votoTotal = encontrado;

      if (votoTotal) {
        votoTotal.filePngUrl = imageUrl;
        votoTotal.isEditable = votoTotal.systemValue !== '';
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
      }
      imgElement.src = imageUrl;

    } catch {
      imgElement.src = '../../../../../assets/img/doc/no_imagen_default.png';

      let votoTotalCorrecto: VerificationVoteItemBean | undefined;

      const votoTotalAux = this.seccionVoto.items.find(v => v.fileId === fileId);
      if (votoTotalAux){
        votoTotalCorrecto = votoTotalAux;
      }

      if (votoTotalCorrecto) {
        votoTotalCorrecto.filePngUrl = '../../../../../assets/img/doc/no_imagen_default.png';
        votoTotalCorrecto.isEditable = false;
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
      }
    }
  }

  protected async loadImagePref(fileId: number, imgElement: HTMLImageElement) {
    try {
      const blob = await this.verificacionActaService.getFileV2(fileId);
      const imageUrl = URL.createObjectURL(blob);

      let votoPref: VerificationVotePreferencialItemBean | undefined;

      this.seccionVoto.items.forEach(votoTotal => {
        if (votoTotal.votoPreferencial){
          const encontrado = votoTotal.votoPreferencial.find(v => v.fileId === fileId);
          if (encontrado) votoPref = encontrado;
        }
      });

      if (votoPref) {
        votoPref.filePngUrl = imageUrl;
        votoPref.isEditable = votoPref.systemValue !== '';
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
      }
      imgElement.src = imageUrl;

    } catch {
      imgElement.src = '../../../../../assets/img/doc/no_imagen_default.png';

      let votoPrefCorrecto: VerificationVotePreferencialItemBean | undefined;

      this.seccionVoto.items.forEach(votoTotal => {
        if (votoTotal.votoPreferencial){
          const votoPrefAux = votoTotal.votoPreferencial.find(v => v.fileId === fileId);
          if (votoPrefAux) {
            votoPrefCorrecto = votoPrefAux;
          }
        }
      });

      if (votoPrefCorrecto) {
        votoPrefCorrecto.filePngUrl = '../../../../../assets/img/doc/no_imagen_default.png';
        votoPrefCorrecto.isEditable = false;
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
      }
    }
  }

  protected setearImagenAchurado(voto: VerificationVoteItemBean | VerificationVotePreferencialItemBean, imagePath: string){
    voto.isEditable = false;
    voto.filePngUrl = imagePath;
  }

  protected setearImagenDefault(voto: VerificationVoteItemBean | VerificationVotePreferencialItemBean, imagePath: string){
    voto.isEditable = true;
    voto.filePngUrl = imagePath;
  }

  protected getControlName(rowIndex: number, colIndex?: number): string {
    if (colIndex !== undefined) {
      const fileId = this.seccionVoto.items[rowIndex]?.votoPreferencial[colIndex]?.fileId;
      return fileId ? `${fileId}-${rowIndex}-${colIndex}` : '';
    } else {
      const fileId = this.seccionVoto.items[rowIndex]?.fileId;
      return fileId ? `${fileId}-${rowIndex}` : '';
    }
  }

  protected async loadOrSetImage(votoTotal: any, imgElement: HTMLImageElement): Promise<void> {
    if (!votoTotal.filePngUrl) {
      await this.loadImageTotal(votoTotal.fileId, imgElement);
    } else {
      imgElement.src = votoTotal.filePngUrl;
    }
  }

  protected async loadOrSetImagePref(votoPref: any, imgElement: HTMLImageElement): Promise<void> {
    if (!votoPref.filePngUrl) {
      await this.loadImagePref(votoPref.fileId, imgElement);
    } else {
      imgElement.src = votoPref.filePngUrl;
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
  public isEditingMode(i: number, j?: number): boolean {
    return this.inputBehaviorService.isEditingMode(i, j);
  }

  public onBlur(): void {
    this.inputBehaviorService.handleBlur(this.cdr);
  }


  public onDoubleClick(event: MouseEvent): void {
    const input = (event.target as HTMLElement).closest('input');
    if (!input) return;

    const indices = this.getIndicesFromId(input.id);
    if (!indices) return;

    const { rowIndex, colIndex } = indices;
    const isPreferencial = colIndex !== undefined;

    const voto = isPreferencial
      ? this.seccionVoto.items[rowIndex]?.votoPreferencial?.[colIndex]
      : this.seccionVoto.items[rowIndex];

    if (voto?.fileId == null) return;

    if (!voto.isEditable) {
      input.readOnly = false;
      voto.isEditable = true;
      voto.userValue = '';
      this.messageVerificacionActasService.setPaso2DataVerificacionBean(
        this.seccionVoto,
        this.tipoSoluTecnologica,
        this.tipoEleccionDescripcion
      );
      this.cdr.detectChanges();
    }

    this.inputBehaviorService.setEditingMode(true, rowIndex, colIndex, this.cdr);

    setTimeout(() => {
      input.select();
    }, 0);
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

    const userValue = value.trim() === '' ? null : value;

    const item = this.seccionVoto.items[i];
    if (preferencial && j !== undefined && item.votoPreferencial?.[j]) {
      item.votoPreferencial[j].userValue = userValue;
    } else {
      item.userValue = userValue;
    }

    this.messageVerificacionActasService.setPaso2DataVerificacionBean(
      this.seccionVoto,
      this.tipoSoluTecnologica,
      this.tipoEleccionDescripcion
    );
  }

  onInputVoto(fileId: number, preferencial: boolean, event: Event, i: number,j ?:number): void {
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

  protected abstract inicializarConfiguracion(): void;
  protected abstract createFormStrategy(): IPaso2FormGroupStrategy;
  protected abstract setStaticImages(): void;
  protected abstract startLazyLoading(): void;
  protected abstract resetSeccionVotoItems(): void;
  protected abstract habilitarFormulario(): void;
  protected abstract deshabilitarFormulario(): void;
  protected abstract handleIntersectingImage(entry: IntersectionObserverEntry, obs: IntersectionObserver): Promise<void>;
  protected abstract observeImages(observer: IntersectionObserver): void;
  protected abstract onKeyDown(event: KeyboardEvent): void;
  protected abstract handleVotoChange(indices: InputIndices): void;
  protected abstract onFocus(event: FocusEvent): void;
}
