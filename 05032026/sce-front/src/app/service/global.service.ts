// src/app/services/global.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private _isNacionUser: boolean;

  set isNacionUser(value: boolean) {
    this._isNacionUser = value;
  }

  get isNacionUser(): boolean {
    return this._isNacionUser;
  }

  reemplazarDobleSlash(url: string): string {
    return url.replaceAll(/(https?:\/\/)|(\/{2,})/g, (match, p1) => p1 || '/');
  }

}
