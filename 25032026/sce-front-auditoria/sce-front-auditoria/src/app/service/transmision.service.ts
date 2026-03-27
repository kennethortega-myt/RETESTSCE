import { HttpClient } from "@angular/common/http";
import {Injectable} from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root',
})
export class TransmisionActaService{

    baseUrl = environment.apiUrlORC;

    constructor(private readonly http: HttpClient) { }

    transmitir(idActa:number): Observable<boolean>{
        return this.http.get<any>(`${this.baseUrl.replace(/\/$/, '')}/transmision/acta/`+idActa);
    }

}
