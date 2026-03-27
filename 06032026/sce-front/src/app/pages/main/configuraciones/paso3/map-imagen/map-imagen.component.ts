import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {GeneralService} from "../../../../../service/general-service.service";
import {IconPopType} from '../../../../../model/enum/iconPopType';

@Component({
  selector: 'app-map-imagen',
  templateUrl: './map-imagen.component.html',
  styleUrls: ['./map-imagen.component.scss']
})
export class MapImagenComponent implements AfterViewInit, OnChanges {


  @ViewChild('canvas', {static: true}) canvasRef!: ElementRef;
  @ViewChild('imageElement') imageElement!: ElementRef;

  @Input() imageFile?: File;
  @Input() dataConfig: { idDocumento: number, color: string, idSeccion: number, init?:boolean } = {
    idDocumento: 0,
    color: "",
    idSeccion: 0,
    init: false
  };
  @Input()   rectangulos: {
    nro?: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
    height: number,
    color: string,
    id?: number
  }[] = [];
  @Output() coordenadas = new EventEmitter<any>();


  currentFile?: File;
  progress = 0;
  message = '';
  preview = '';
  title = 'curso-basico';
  x1: any;
  y1: any;
  x2: any;
  y2: any;
  isDrawing = false;
  drawing = false;

  canvas: any;
  image: any;
  ctx: any;
  base64Data: any;
  dataConfigOld: any = {idDocumento: -1};

  constructor(private http: HttpClient, private generalService: GeneralService) {

  }

  ngAfterViewInit() {
    this.initValues();

  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['rectangulos'] && !changes['rectangulos'].firstChange){
      this.rectangulos = changes['rectangulos'].currentValue;
      this.redibujarCanvas();
    }
    if (changes['imageFile']) {
      const current: File | undefined = changes['imageFile'].currentValue;
      const previous: File | undefined = changes['imageFile'].previousValue;
      if (!current) {
        this.image = new Image();
      }
      const changed = !previous || (
        current &&
        (current.size !== previous?.size || current.name !== previous?.name)
      );
      this.imageFile = current;
      if (changed) {
        this.image = new Image();
        this.selectFile();
      }
    }
    if (changes['dataConfig']) {
      const current = changes['dataConfig'].currentValue;
      const previous = changes['dataConfig'].previousValue;

      const changed = !previous ||
        current.idDocumento !== previous.idDocumento ||
        current.color !== previous.color ||
        current.idSeccion !== previous.idSeccion ||
        current.init !== previous.init;

      if (changed) {
        this.dataConfigOld = { ...current };
        this.selectFile();
      }
    }

  }

  cargarImagen(ctx: any, base: any) {

    this.image = new Image();
    this.image.onload = () => {

      this.canvas.width = this.image.width; // Establecer el ancho del canvas al ancho de la imagen
      this.canvas.height = this.image.height; // Establecer la altura del canvas a la altura de la imagen

      const scale = Math.min(this.canvas.width / this.image.width, this.canvas.height / this.image.height);
      const width = this.image.width * scale;
      const height = this.image.height * scale;
      const x = (this.canvas.width - width) / 2;
      const y = (this.canvas.height - height) / 2;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Limpia el lienzo antes de dibujar la imagen
      this.ctx.drawImage(this.image, x, y, width, height); // Dibuja la imagen en la posición del evento del mouse
       this.redibujarCanvas();
    };
    this.base64Data = base;
    this.image.src = this.base64Data;


  }

  handleMouseDown(event: MouseEvent) {
    this.drawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // Factor de escala horizontal
    const scaleY = this.canvas.height / rect.height; // Factor de escala vertical

    this.x1 = (event.clientX - rect.left) * scaleX;
    this.y1 = (event.clientY - rect.top) * scaleY;

    const radius = 1.5;

    this.ctx.beginPath();
    this.ctx.arc(this.x1, this.y1, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'orange';
    this.ctx.fill();
    this.ctx.closePath();
  }

  async handleMouseUp(event: MouseEvent) {
    this.drawing = false;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width; // Factor de escala horizontal
    const scaleY = this.canvas.height / rect.height; // Factor de escala vertical

    this.x2 = (event.clientX - rect.left) * scaleX;
    this.y2 = (event.clientY - rect.top) * scaleY;

    const radius = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(this.x2, this.y2, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = 'skyblue';
    this.ctx.fill();
    this.ctx.closePath();

    const width = this.x2 - this.x1;
    const height = this.y2 - this.y1;
    this.ctx.strokeStyle = this.dataConfig.color;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.x1, this.y1, width, height);
    const rectangle = {
      nro: this.rectangulos.length + 1,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      width,
      height,
      color: this.dataConfig.color,
      id: this.dataConfig.idSeccion
    };
    if(rectangle.id === 0 && this.dataConfig.idDocumento != 0){
      await this.generalService.openDialogoGeneral({mensaje:"Debe seleccionar una sección",icon:IconPopType.ALERT,title:'Advertencia',success:false});
    }
    else if (rectangle.height > 0 && rectangle.width > 0 && rectangle.id != 0) {
      const findIndex = this.rectangulos.findIndex(rect => rect.id === rectangle.id);
      if (findIndex !== -1) {
        this.rectangulos.splice(findIndex, 1);
      }
      this.rectangulos.push(rectangle);
    }

    this.coordenadas.emit(this.rectangulos);
    this.redibujarCanvas();
  }

  handleMouseMove(event: MouseEvent) {
    if (this.drawing) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width; // Factor de escala horizontal
      const scaleY = this.canvas.height / rect.height; // Factor de escala vertical

      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.redibujarCanvas();
      const radius = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(this.x1, this.y1, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'orange';
      this.ctx.fill();
      this.ctx.closePath();

      const width = x - this.x1;
      const height = y - this.y1;
      this.ctx.strokeStyle = this.dataConfig.color;
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(this.x1, this.y1, width, height);
    }
  }

  redibujarCanvas() {

    try {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // Vuelve a dibujar la imagen
      this.ctx.drawImage(this.image, 0, 0);
      if (this.imageFile) {
      // Vuelve a dibujar los rectángulos
      this.rectangulos.forEach(rectangulos => {
        this.ctx.strokeStyle = rectangulos.color;
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(rectangulos.x1, rectangulos.y1, rectangulos.width, rectangulos.height);
      });
      }
    } catch (error) {
      // Maneja el error aquí, muestra un mensaje o toma alguna acción específica
      console.error("Error al dibujar la imagen en el lienzo:", error);
    }
  }

  selectFile(): void {
    this.message = '';
    this.preview = '';
    this.progress = 0;

    if (this.imageFile) {
      const file: File | null = this.imageFile;

      if (file) {
        this.preview = '';
        this.currentFile = file;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.preview = e.target.result;
          this.cargarImagen(this.ctx, this.preview)
        };
        reader.readAsDataURL(this.currentFile);
      }
    } else {
      this.initValues();
    }
  }

  initValues() {
    this.canvas = HTMLCanvasElement = this.canvasRef.nativeElement;
    this.canvas.height = 1200; // Establecer la altura del canvas en 400 píxeles
    this.canvas.width = 900; // Establecer el ancho del canvas en 400 píxeles
    this.ctx = this.canvas.getContext('2d');
    this.rectangulos = []; // Reiniciar el arreglo de rectángulos
  }

}
