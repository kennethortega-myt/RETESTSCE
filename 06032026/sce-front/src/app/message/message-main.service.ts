import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MessageMainService{
  accesoPerfil = new BehaviorSubject<Array<any>>(new Array<any>);
  activeMenu = new BehaviorSubject<string>('');
  indice = new BehaviorSubject<number>(0);

  setAccesoPerfil(accesoPerfil: Array<any>){
    this.accesoPerfil.next(accesoPerfil);
  }

  getAccesoPerfil(): Observable<Array<any>>{
    return this.accesoPerfil.asObservable();
  }

  setActiveMenu(activeMenu: string){
    this.activeMenu.next(activeMenu);
  }

  getActiveMenu(): Observable<string>{
    return this.activeMenu.asObservable();
  }

  setIndice(indice: number){
    this.indice.next(indice);
  }

  getIndice(): Observable<number>{
    return this.indice.asObservable();
  }
}
