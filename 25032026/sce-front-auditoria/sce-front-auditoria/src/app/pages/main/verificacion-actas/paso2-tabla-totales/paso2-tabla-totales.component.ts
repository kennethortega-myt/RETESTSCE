import {
  AfterViewInit,
  ChangeDetectorRef,
  Component, DestroyRef,
  effect,
  ElementRef, HostListener, inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2, ViewChild, ViewChildren
} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {UtilityService} from '../../../../helper/utilityService';
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';
import {
  FocusElementVeri,
  MessageVerificacionActasService
} from '../../../../message/message-verificacion-actas.service';
import {InputBehaviorConfig} from '../../../../interface/tablaVotos/inputBehaviorConfig.interface';
import {InputBehaviorService} from '../../../../service/inputBehaviorService';
import {InputIndices} from '../../../../interface/tablaVotos/inputIndices.interface';
import {VerificationVoteSectionResponseBean} from '../../../../model/verificationVoteSectionResponseBean';
import {IPaso2FormGroupStrategy} from '../../../../interface/paso2FormGroupStrategy.interface';
import {PresidencialPaso2FormStrategy} from '../../../shared/strategy/presidencialPaso2Form.strategy';
import {Paso2actasBaseComponent} from '../paso2actas-base/paso2actas-base.component';
import {Constantes} from '../../../../helper/constantes';

@Component({
  selector: 'app-paso2TablaTotales',
  templateUrl: './paso2-tabla-totales.component.html'
})
export class Paso2TablaTotalesComponent extends Paso2actasBaseComponent implements OnInit, OnDestroy, AfterViewInit{

  @ViewChildren('lazyImage') lazyImages!: QueryList<ElementRef>;
  destroyRef:DestroyRef = inject(DestroyRef);
  private readonly inputBehaviorConfig: InputBehaviorConfig;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLElement>;

  private readonly scrollConfig = {
    itemsPerPage: 4,        // Mostrar 4 inputs por página
    scrollTriggerIndex: 4   // Hacer scroll cuando llegue al 5to input (índice 4)
  };

  constructor(
    formBuilder: FormBuilder,
    dialog: MatDialog,
    renderer: Renderer2,
    utilityService: UtilityService,
    verificacionActaService: VerificacionActaService,
    messageVerificacionActasService:MessageVerificacionActasService,
    cdr: ChangeDetectorRef,
    inputBehaviorService: InputBehaviorService
  ) {
    super(formBuilder, dialog, renderer, messageVerificacionActasService, utilityService, cdr,
      verificacionActaService, inputBehaviorService);

    this.inputBehaviorConfig = {
      formGroupTotal: this.formGroupSeccionVoto,
      formGroupPref: this.formGroupSeccionVotoPref, // No usado pero requerido
      getControlName: (rowIndex: number, colIndex?: number) => this.getControlName(rowIndex, colIndex),
      onVotoChange: (indices: InputIndices, value: string) => this.handleVotoChange(indices),
      cdr: this.cdr
    };

    effect(()=> {
      const inputId = this.messageVerificacionActasService.inputIdToFocus();
      const elementToFocus = this.messageVerificacionActasService.elementToFocus();
      if(inputId && elementToFocus){
        setTimeout(()=>{
          const inputElement = document.getElementById(inputId) as HTMLInputElement;
          if(inputElement){
            inputElement.focus();
            inputElement.select();
            inputElement.scrollIntoView({behavior: 'smooth', block: 'center'});
            this.messageVerificacionActasService.setInputIdToFocus(null);
          }
        },100);
      }
    });
  }


  override ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void{
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(new VerificationVoteSectionResponseBean(),'', '');
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = 0;
    this.times = Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);
  }

  protected setStaticImages(): void{
    const imageBlob = '../../../../../../assets/img/doc/votoImgNegro.png';
    const imagenDefault = '../../../../../assets/img/doc/imagen_voto_default.png';

    this.seccionVoto.items.forEach(votoTotal => {
      if(votoTotal.fileId === null){
        this.setearImagenAchurado(votoTotal, imageBlob);
      }else if(votoTotal.fileId === -1){
        this.setearImagenDefault(votoTotal, imagenDefault);
      }else{
        votoTotal.isEditable = (votoTotal.systemValue == '' && votoTotal.userValue !== null) || votoTotal.systemValue !== '';
      }
    });
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
  }

  protected createFormStrategy(): IPaso2FormGroupStrategy {
    return new PresidencialPaso2FormStrategy(
      this.formBuilder,
      this.formGroupSeccionVoto
    );
  }

  protected startLazyLoading(): void {
    const observer = new IntersectionObserver(
      async (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            await this.handleIntersectingImage(entry, obs);
          }
        }
      },
      { rootMargin: '100px' }
    );

    this.observeImages(observer);
    sessionStorage.setItem('loading', 'false');
  }

  protected async handleIntersectingImage(entry: IntersectionObserverEntry, obs: IntersectionObserver): Promise<void> {
    const imgElement = entry.target as HTMLImageElement;
    const indexI = this.getAttributeAsNumber(imgElement, 'data-index-i');

    const votoTotal = this.seccionVoto.items[indexI];
    if (votoTotal) {
      await this.loadOrSetImage(votoTotal, imgElement);
    }

    obs.unobserve(imgElement);
    await this.delay(1);
  }


  protected resetSeccionVotoItems(): void {
    this.seccionVoto.items.forEach(voto =>  {
      if (voto.fileId != null && voto.isEditable){
        voto.userValue = ''
      }
    });

    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto,this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
  }

  protected habilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.enable(); // Habilitar control
    });
  }

  protected deshabilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.setValue(''); // Limpiar valor
      params.get(key)?.disable();   // Deshabilitar control
    });
  }

  protected observeImages(observer: IntersectionObserver): void {
    this.lazyImages.forEach(img => observer.observe(img.nativeElement));
  }

  // ===================================================================
  //FUNCIONALIDAD DE INPUT BEHAVIOR USANDO EL SERVICIO
  // ===================================================================

  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    this.inputBehaviorService.handleKeyDown(event, this.inputBehaviorConfig);
  }

  // Métodos específicos para este componente
  protected handleVotoChange(indices: InputIndices): void {
    const fileId = this.seccionVoto.items[indices.rowIndex]?.fileId;
    if (fileId) {
      this.changeVoto(fileId, false, indices.rowIndex);
    }
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

  // ===================================================================
  // MÉTODOS ESPECÍFICOS DEL COMPONENTE
  // ===================================================================

  protected readonly Constantes = Constantes;
  protected readonly FocusElementVeri = FocusElementVeri;
}
