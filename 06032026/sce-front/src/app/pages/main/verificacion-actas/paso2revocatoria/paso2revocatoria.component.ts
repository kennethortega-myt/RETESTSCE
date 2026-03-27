import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef, effect, ElementRef, HostListener,
  inject,
  OnDestroy,
  OnInit, QueryList, signal,
  ViewChildren
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {take} from "rxjs";

import {VerificacionActaService} from "../../../../service/verificacion-acta.service";
import {
  FocusElementVeri,
  MessageVerificacionActasService
} from "../../../../message/message-verificacion-actas.service";
import {VerificationVoteSectionResponseBean} from '../../../../model/verificationVoteSectionResponseBean';
import {VerificationVoteItemBean} from '../../../../model/verificationVoteItemBean';
import {VerificationVotePreferencialItemBean} from '../../../../model/verificationVotePreferencialItemBean';
import {Constantes} from '../../../../helper/constantes';
import {ITableEditingContext} from '../../../../interface/tablaVotos/tableEditingContext.interface';
import {ITableEditingConfiguration} from '../../../../interface/tablaVotos/tableEditingConfiguration.interface';

@Component({
  selector: 'app-paso2revocatoria',
  templateUrl: './paso2revocatoria.component.html'
})
export class Paso2revocatoriaComponent implements OnInit, OnDestroy, AfterViewInit{

  private readonly componentId = 'paso2revocatoria';
  private readonly tablaContext: ITableEditingContext;
  private readonly tablaConfig: ITableEditingConfiguration = {
    maxLength: 3,
    allowHash: true,
    allowNumbers: true
  };

  @ViewChildren('inputRefs') inputRefs: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('lazyImagePref') lazyImagesPref!: QueryList<ElementRef>;

  destroyRef:DestroyRef = inject(DestroyRef);

  public formGroupSeccionVoto: FormGroup;
  public seccionVoto: VerificationVoteSectionResponseBean;
  public cantVotosRevo: number;
  public tipoSoluTecnologica: string;
  times= [];

  private readonly editingInputs: Map<string, boolean> = new Map();

  formularioListo = signal<boolean>(false);

  tituloCabecera: { [key: number]: string } = {
    1: "SI",
    2: "NO",
    3: "Votos en blanco",
    4: "Votos nulos",
    5: "Votos impugnados"
  };

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly verificacionActaService: VerificacionActaService,
    private readonly messageVerificacionActasService:MessageVerificacionActasService,
    private readonly cdr: ChangeDetectorRef,
    //private readonly tablaEdicionService: TablaEdicionService
  ) {
    this.seccionVoto = new VerificationVoteSectionResponseBean();
    this.cantVotosRevo = 0;
    this.tipoSoluTecnologica = '';
    this.formGroupSeccionVoto = this.formBuilder.group({
      params : this.formBuilder.group({}),
    });

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

  ngOnInit() {
    this.messageVerificacionActasService.getPaso2DataVerificacionBean()
      .pipe(take(1))
      .subscribe(value => this.setDatosIniciales(value.voteSection,value.tipoSoluTecnologica));

  }

  private habilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.enable(); // Habilitar control
    });
  }

  private deshabilitarFormulario(): void {
    const params = this.formGroupSeccionVoto.get('params') as FormGroup;
    Object.keys(params.controls).forEach(key => {
      params.get(key)?.setValue(''); // Limpiar valor
      params.get(key)?.disable();   // Deshabilitar control
    });
  }

  private resetSeccionVotoItems(): void {
    this.seccionVoto.items.forEach(voto => {
      voto.votoRevocatoria.forEach(votoRevo => {
        if (votoRevo.fileId != null && votoRevo.isEditable){
          votoRevo.userValue = '';
        }
      })
    });

    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto,this.tipoSoluTecnologica, 'revocatoria');
  }

  setDatosIniciales(data: VerificationVoteSectionResponseBean, tipoSoluTecnologica: string) {
    this.seccionVoto = data;
    this.tipoSoluTecnologica = tipoSoluTecnologica;
    this.cantVotosRevo = 5;
    this.times = Array.from({ length: this.cantVotosRevo }, (_, index) => index + 1);

    this.seccionVoto.items.forEach((item, i) => {
      this.procesarVotos(item, i);
    });
    this.setStaticImages();
    this.formularioListo.set(true);
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, 'revocatoria');
    this.cdr.detectChanges();
  }

  setStaticImages() {

    const imageBlob = '../../../../../../assets/img/doc/votoImgNegro.png';

    this.seccionVoto.items.forEach(voto => {
      if (voto.votoRevocatoria){
        voto.votoRevocatoria.forEach(votoRevo => {
          if (votoRevo.fileId === null){
            this.setearImagen(votoRevo,imageBlob);
          }else{
            votoRevo.isEditable = (votoRevo.systemValue =='' && votoRevo.userValue !== null) || votoRevo.systemValue !=='';
          }
        })
      }

    });
    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, 'revocatoria');
  }
  private procesarVotos(item: VerificationVoteItemBean, index: number) {
    if (item.votoRevocatoria != null && item.votoRevocatoria.length > 0) {
      item.votoRevocatoria.slice(0,5).forEach((dataRevo: VerificationVotePreferencialItemBean, j: number) => {
        const controlName = `${dataRevo.fileId}-${index}-${j}`;
        (this.formGroupSeccionVoto.get("params") as FormGroup).addControl(
          controlName,
          new FormControl({
            value: dataRevo.fileId == null ? '' : dataRevo.userValue,
            disabled: false
          })
        );
      });
    }
  }

  private setearImagen(voto: VerificationVotePreferencialItemBean, imagePath: string){
    voto.isEditable = false;
    voto.filePngUrl = imagePath;
  }

  onFocusChange(element: FocusElementVeri) {
    this.messageVerificacionActasService.setFocus(element);
  }

  changeVoto(fileId:number,i:number,j :number){
    const controlName = `${fileId}-${i}-${j}`;

    const control = this.formGroupSeccionVoto.get("params")?.get(controlName);
    let value = (control?.value || '').toString()

    //solo permitir digitos o un solo #
    const validado = this.validateInput(value);
    if (value !== validado){
      control?.setValue(validado);
      value = validado;
    }


    if (value == ''){
      this.seccionVoto.items[i].votoRevocatoria[j].userValue=null;
    }else{
      this.seccionVoto.items[i].votoRevocatoria[j].userValue=value;
    }

    this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto,this.tipoSoluTecnologica, 'revocatoria');
  }

  async loadImagePref(fileId: number, imgElement: HTMLImageElement) {
    try {
      const blob = await this.verificacionActaService.getFileV2(fileId);
      const imageUrl = URL.createObjectURL(blob);

      let votoPref: VerificationVotePreferencialItemBean | undefined;

      this.seccionVoto.items.forEach(votoTotal => {
        if (votoTotal.votoRevocatoria){
          const encontrado = votoTotal.votoRevocatoria.find(v => v.fileId === fileId);
          if (encontrado) votoPref = encontrado;
        }
      });

      if (votoPref) {
        votoPref.filePngUrl = imageUrl;
        votoPref.isEditable = votoPref.systemValue !== '';
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, 'revocatoria');
      }
      imgElement.src = imageUrl;

    } catch {
      imgElement.src = '../../../../../assets/img/doc/no_imagen_voto.png';

      let votoPrefCorrecto: VerificationVotePreferencialItemBean | undefined;

      this.seccionVoto.items.forEach(votoTotal => {
        if (votoTotal.votoRevocatoria){
          const votoPrefAux = votoTotal.votoRevocatoria.find(v => v.fileId === fileId);
          if (votoPrefAux) {
            votoPrefCorrecto = votoPrefAux;
          }
        }
      });

      if (votoPrefCorrecto) {
        votoPrefCorrecto.filePngUrl = '../../../../../assets/img/doc/no_imagen_voto.png';
        votoPrefCorrecto.isEditable = false;
        this.messageVerificacionActasService.setPaso2DataVerificacionBean(this.seccionVoto, this.tipoSoluTecnologica, 'revocatoria');
      }
    }
  }

  startLazyLoading(): void {
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

    this.lazyImagesPref.forEach(img => observer.observe(img.nativeElement));
    sessionStorage.setItem('loading', 'false');
  }

  private async handleIntersectingImage(entry: IntersectionObserverEntry, obs: IntersectionObserver): Promise<void> {
    const imgElement = entry.target as HTMLImageElement;
    const indexI = this.getAttributeAsNumber(imgElement, 'data-index-i');
    const indexJ = this.getAttributeAsNumber(imgElement, 'data-index-j');

    if (indexI !== -1) {
      const votoPref = this.seccionVoto.items[indexI]?.votoRevocatoria[indexJ];
      if (votoPref) {
        await this.loadOrSetImage(votoPref, imgElement);
      }
    }

    obs.unobserve(imgElement);
    await this.delay(2);
  }

  private getAttributeAsNumber(element: HTMLImageElement, attributeName: string): number {
    const attr = element.getAttribute(attributeName);
    return attr ? Number(attr) : -1;
  }

  private async loadOrSetImage(votoPref: any, imgElement: HTMLImageElement): Promise<void> {
    if (!votoPref.filePngUrl) {
      await this.loadImagePref(votoPref.fileId, imgElement);
    } else {
      imgElement.src = votoPref.filePngUrl;
    }
  }

  ngAfterViewInit() {

    sessionStorage.setItem('loading', 'true'); // Activa loading

    setTimeout(() => {
      this.startLazyLoading();
    }, 200); // 🔹 Deja que la UI se renderice primero
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  // ===== MÉTODOS DELEGADOS AL SERVICIO =====
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
  }

  onFocus(event: FocusEvent): void {
  }

  onBlur(): void {

  }

  onDoubleClick(event: MouseEvent): void {


  }

  isEditingMode(i: number, j: number): boolean {
    return true;
  }

  onInputVoto(fileId: number, i: number, j: number, event: Event): void {

  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // No hacemos nada específico aquí, pero podemos usarlo si es necesario
  }

// Método para validar la entrada según nuestras reglas (similar a sceNumerosHash)
  private validateInput(value: string): string {
    if (value === '#' || value.toLowerCase() === 'i') return '#';

    const digits = value.replace(/\D/g, '');
    return digits.substring(0,3);

  }

  ngOnDestroy() {
    //
  }

  protected readonly Constantes = Constantes;
  protected readonly FocusElementVeri = FocusElementVeri;
}
