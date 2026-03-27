import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {
  IComboResponse,
  IGenericInterface
} from '../interface/general.interface';

@Injectable({
  providedIn: 'root'
})
export class OrganizacionPoliticaService {

  private readonly baseUrl: string;

  constructor(private readonly http: HttpClient) {
    this.baseUrl = environment.apiUrlORC;
  }

  list() {
    return this.http.get<IGenericInterface<Array<IComboResponse>>>(`${this.baseUrl}agrupacion-politica/combo`);
  }


}
