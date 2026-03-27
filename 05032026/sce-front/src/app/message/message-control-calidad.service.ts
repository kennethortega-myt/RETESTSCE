import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SrcImagenesPaso1 } from '../model/control-calidad/ImagenesPaso1';
import { SrcImagenesPaso2 } from '../model/control-calidad/DataPaso2';
import { DataPaso3, SrcImagenesAgrupolPaso3 } from '../model/control-calidad/DataPaso3';

@Injectable({
  providedIn: 'root'
})
export class MessageControlCalidadService {

  constructor() { }

  public srcImagenesPaso1: BehaviorSubject<SrcImagenesPaso1> = new BehaviorSubject<SrcImagenesPaso1>(null);
  
  public srcImagenesPaso2: BehaviorSubject<SrcImagenesPaso2> = new BehaviorSubject<SrcImagenesPaso2>(null);

  public dataPaso3: BehaviorSubject<DataPaso3> = new BehaviorSubject<DataPaso3>(null);

  public srcImagenesAgrupolPaso3: BehaviorSubject<SrcImagenesAgrupolPaso3> = new BehaviorSubject<SrcImagenesAgrupolPaso3>(null);

  public srcImagenesPrefPaso3: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(null);

  public hayErrorImagenes: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);  
  
  public revisoPaso2: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public revisoPaso3: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public revisoActa: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public revisoResoluciones: BehaviorSubject<number> = new BehaviorSubject<number>(null);

}
