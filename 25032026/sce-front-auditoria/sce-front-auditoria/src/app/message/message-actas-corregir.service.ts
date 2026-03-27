import {Injectable} from "@angular/core";
import {ActaPorCorregirBean} from "../model/actaPorCorregirBean";
import {BehaviorSubject, Observable} from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class MessageActasCorregirService{
  dataActaPorCorregirBean = new BehaviorSubject<ActaPorCorregirBean>(new ActaPorCorregirBean());

  setDataActaPorCorregirBean(actaPorCorregirBean:ActaPorCorregirBean){
    this.dataActaPorCorregirBean.next(actaPorCorregirBean);
  }

  getDataActaPorCorregirBean():Observable<ActaPorCorregirBean>{
    return this.dataActaPorCorregirBean.asObservable();
  }

}
