import {  Component, Input, Output, EventEmitter  } from '@angular/core';

@Component({
  selector: 'app-image-map',
  templateUrl: './image-map.component.html',
  styleUrls: ['./image-map.component.scss']
})
export class ImageMapComponent {

  @Input()  src: string = '';

  @Input() coordinates: ImageMapCoordinate[] = [];

  @Input()  canEdit: boolean = false;

  @Input()  clase: any = {'area':true, 'seccionador-2':true};

  @Output() readonly onClick: EventEmitter<ImageMapCoordinate> = new EventEmitter();

  constructor() { }

  getCoordinateStyle(coordinate: ImageMapCoordinate): object {
    return {
      top: `${coordinate.y}px`,
      left: `${coordinate.x}px`,
      bottom: `${coordinate.bottom}px`,
      right: `${coordinate.right}px`
    };
  }

  onAreaClick(coordinate:any) {
    this.onClick.emit(coordinate);
  }

  onAreaContext(e: MouseEvent, coordinate: ImageMapCoordinate) {
    if(this.canEdit)
    {
      if(coordinate) {
        console.log('editing')

      }
      else {
        console.log('creating')
      }

      e.stopPropagation();
      return false;
    }
    return true;
  }

  onAreaCreate(x: number, y: number): ImageMapCoordinate {
    const coordinate = new ImageMapCoordinate({x, y, bottom: 100, right: 100});
    return coordinate
  }

  onAreaEdit(coordinate: ImageMapCoordinate): ImageMapCoordinate {
    return coordinate;
  }

}

class ImageMapCoordinate {
  x: number = 0
  y: number = 0
  bottom: number = 100
  right: number = 100
  name?: string

  constructor(init?: Partial<ImageMapCoordinate>) {
    Object.assign(this, init);
  }
}
