import { Injectable } from '@angular/core';
import {SearchFilterResponse} from "../interface/general.interface";
import {environment} from "../../environments/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {Log} from "../interface/log.interface";
import {GenericResponseBean} from "../model/genericResponseBean";
import {IconPopType} from '../model/enum/iconPopType';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  initSearch: SearchFilterResponse<Log> = {list: [], page: 0, totalPages: 0, size: 0, total: 0}

  private readonly urlServidor: string;
  private readonly logsSubject = new BehaviorSubject<SearchFilterResponse<Log>>(this.initSearch);
  logs$: Observable<SearchFilterResponse<Log>> = this.logsSubject.asObservable();


  constructor(private readonly httpClient: HttpClient) {
    this.urlServidor = environment.apiUrl+'/';
  }

  listLogs(page:number, size:number, search?: string): void {
    let params = new HttpParams()
      .set('page', page)
      .set(IconPopType.ERROR, search ?? '')
      .set('size', size);
    this.httpClient.get<GenericResponseBean<SearchFilterResponse<Log>>>(`${this.urlServidor}log`, {params}).subscribe(data => {
      this.logsSubject.next(data.data);
    });
  }

}
