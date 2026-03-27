import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ILoginRequest, ILoginResponse } from '../interface/login.interface';
import { HttpClient } from '@angular/common/http';
import { IGenericInterface } from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  login(data:ILoginRequest){
   return this.http.post<IGenericInterface<ILoginResponse>>(`${this.baseUrl}/login`,data);
  }

}
