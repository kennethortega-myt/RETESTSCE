import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  effect,
  ElementRef, HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChildren
} from '@angular/core';
import {Paso2actasBaseComponent} from '../paso2actas-base/paso2actas-base.component';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {UtilityService} from '../../../../helper/utilityService';
import {VerificacionActaService} from '../../../../service/verificacion-acta.service';
import {MessageVerificacionActasService} from '../../../../message/message-verificacion-actas.service';
import {InputBehaviorService} from '../../../../service/inputBehaviorService';
import {VerificationVoteSectionResponseBean} from '../../../../model/verificationVoteSectionResponseBean';
import {IPaso2FormGroupStrategy} from '../../../../interface/paso2FormGroupStrategy.interface';
import {
  TablaTotalesPreferencialesPaso2FormStrategy
} from '../../../shared/strategy/tablaTotalesPreferencialesPaso2Form.strategy';
import {InputBehaviorConfig} from '../../../../interface/tablaVotos/inputBehaviorConfig.interface';
import {InputIndices} from '../../../../interface/tablaVotos/inputIndices.interface';

@Component({
  selector: 'app-paso2TablaTotalesPreferenciales2',
  templateUrl: './paso2-tabla-totales-preferenciales.component.html'
})
export class Paso2TablaTotalesPreferencialesComponent extends Paso2actasBaseComponent implements OnInit, OnDestroy, AfterViewInit{
  @ViewChildren('lazyImage') lazyImages!: QueryList<ElementRef>;
  @ViewChildren('lazyImagePref') lazyImagesPref!: QueryList<ElementRef>;

  private isSyncingLeft = false;
  private isSyncingRight = false;

  private readonly inputBehaviorConfig: InputBehaviorConfig;

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
      formGroupPref: this.formGroupSeccionVotoPref,
      getControlName: (rowIndex: number, colIndex?: number) => this.getControlName(rowIndex, colIndex),
      onVotoChange: (indices: InputIndices, value: string) => this.handleVotoChange(indices),
      cdr: this.cdr
    };

    effect(()=> {
      const inputId = this.messageVerificacionActasService.inputIdToFocus();
      if(inputId){
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
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(new VerificationVoteSectionResponseBean(),'','');
  }

  protected inicializarConfiguracion(): void {
    this.cantVotosPrefe = this.seccionVoto.cantidadVotosPreferenciales;
    this.times = Array.from({length: this.cantVotosPrefe}, (_, index) => index + 1);
  }

  protected createFormStrategy(): IPaso2FormGroupStrategy {
    return new TablaTotalesPreferencialesPaso2FormStrategy(
      this.formBuilder,
      this.formGroupSeccionVoto,
      this.formGroupSeccionVotoPref
    );
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

      if (votoTotal.votoPreferencial){
        votoTotal.votoPreferencial.forEach(votoPref => {
          if (votoPref.fileId === null){
            this.setearImagenAchurado(votoPref,imageBlob);
          }else if (votoPref.fileId === -1){
            this.setearImagenDefault(votoPref,imagenDefault);
          }else{
            votoPref.isEditable = (votoPref.systemValue == '' && votoPref.userValue !== null) || votoPref.systemValue !== '';
          }
        })
      }

    });
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
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

  protected resetSeccionVotoItems(): void {
    this.seccionVoto.items.forEach(voto =>  {
      if (voto.fileId != null && voto.isEditable){
        voto.userValue = ''
      }
      // Agregar reset para votos preferenciales
      if (voto.votoPreferencial) {
        voto.votoPreferencial.forEach(votoPref => {
          if (votoPref.fileId != null && votoPref.isEditable) {
            votoPref.userValue = '';
          }
        });
      }
    });

    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto,this.tipoSoluTecnologica, this.tipoEleccionDescripcion);
  }

  protected habilitarFormulario(): void {
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

  protected deshabilitarFormulario(): void {
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

  protected async handleIntersectingImage(entry: IntersectionObserverEntry, obs: IntersectionObserver): Promise<void> {
    const imgElement = entry.target as HTMLImageElement;
    const indexI = this.getAttributeAsNumber(imgElement, 'data-index-i');
    const indexJ = this.getAttributeAsNumber(imgElement, 'data-index-j');

    if (indexJ === -1) {
      const votoTotal = this.seccionVoto.items[indexI];
      if (votoTotal) {
        await this.loadOrSetImage(votoTotal, imgElement);
      }
    }else{
      //voto preferencial
      const votoPref = this.seccionVoto.items[indexI]?.votoPreferencial[indexJ];
      if (votoPref) {
        await this.loadOrSetImagePref(votoPref, imgElement);
      }
    }
    obs.unobserve(imgElement);
    await this.delay(1);
  }

  protected observeImages(observer: IntersectionObserver): void {
    this.lazyImages.forEach(img => observer.observe(img.nativeElement));
    this.lazyImagesPref.forEach(img => observer.observe(img.nativeElement));
  }

  // ===================================================================
  //FUNCIONALIDAD DE INPUT BEHAVIOR USANDO EL SERVICIO
  // ===================================================================
  @HostListener('keydown', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    this.inputBehaviorService.handleKeyDown(event, this.inputBehaviorConfig);
  }

  protected handleVotoChange(indices: InputIndices): void {
    const votoItem = this.seccionVoto.items[indices.rowIndex];
    if (!votoItem) return;

    if (indices.colIndex !== undefined){
      // es preferencial
      const votoPref = votoItem.votoPreferencial?.[indices.colIndex];
      if(votoPref?.fileId){
        this.changeVoto(votoPref.fileId, true, indices.rowIndex, indices.colIndex);
      }
    }else{
      //es total
      const fileId = votoItem.fileId;
      if (fileId) {
        this.changeVoto(fileId,false, indices.rowIndex);
      }
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
}
