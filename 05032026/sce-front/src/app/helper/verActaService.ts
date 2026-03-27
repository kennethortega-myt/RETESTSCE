import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerActaService{

  getPositionByZoomAndDegree(degree:number, zoom:number){
    if (degree%360 > 0) {
      degree = degree%360
    }else if(degree%360 === 0){
      degree = 360
    }
    const positions = {
      100: {
        90:'77% 50% 0',
        180:'50% 50% 0',
        270:'50% 32% 0',
        360:'50% 50% 0'
      },
      150: {
        90:'72% 69% 0', //1% 0% 0
        180:'60% 60% 0',
        270:'69% 30% 0',
        360:'1% 0% 0'
      },
      200: {
        90:'62% 80% 0',
        180:'67% 67% 0',
        270:'79% 26% 0',
        360:'1% 0% 0'
      },
      250: {
        90:'54% 86% 0',
        180:'71% 71% 0',
        270:'86% 22% 0',
        360:'1% 0% 0'
      },
    }
    return positions[zoom][degree];
  }
}
