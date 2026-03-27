import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {AgrupolBean} from "../model/resoluciones/acta-jee-bean";

@Injectable({
  providedIn: 'root',
})
export class MessageVerificacionResolucionService{
  private readonly dataSourceAgrupacionesPoliticas = new BehaviorSubject<Array<AgrupolBean>>(new Array<AgrupolBean>);
  private readonly cantidadVotosPref = new BehaviorSubject<number>(0);

  constructor() {
  }

  setCantidadVotosPref(cantVotoPre: number){
    this.cantidadVotosPref.next(cantVotoPre);
  }

  getCantidadVotosPref(): Observable<number>{
    return this.cantidadVotosPref.asObservable();
  }

  setDataSourceAgrupacionesPoliticas(AP: Array<AgrupolBean>){
    this.dataSourceAgrupacionesPoliticas.next(AP);
  }

  getDataSourceAgrupacionesPoliticas(): Observable<Array<AgrupolBean>>{
    return this.dataSourceAgrupacionesPoliticas.asObservable();
  }
}
