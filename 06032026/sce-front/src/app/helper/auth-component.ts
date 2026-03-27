import { Component, inject} from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Usuario } from '../model/usuario-bean';
import { Perfil } from '../model/perfil-bean';
import {first} from "rxjs/operators";
import {GeneralService} from "../service/general-service.service";
import {AuthService} from "../service/auth-service.service";
import {GenericResponseBean} from "../model/genericResponseBean";

const helper = new JwtHelperService();

@Component({
    selector: 'app-auth-utils',
    template: '',
})
export class AuthComponent{

    public generalService2 = inject(GeneralService);
    public auth2 = inject(AuthService)

    constructor() {
    }

    public authentication(): Usuario {
        let u: Usuario;
        let token = localStorage.getItem('token');
        if (token !== null) {
            u = new Usuario;
            let decodedToken = helper.decodeToken(token);
            u.userId = decodedToken['dil'];
            u.codigoCentroComputo = decodedToken['ccc'];
            u.nombreCentroComputo = decodedToken['ncc'];
            u.acronimoProceso = decodedToken['apr'];
            u.nombre = decodedToken['usr'];
            let p: Perfil = new Perfil;
            p.idPerfil = decodedToken['idp'];
            p.descripcion = decodedToken['per'];
            u.perfil = p;
        }else{
          u = new Usuario();
          let p: Perfil = new Perfil;
          p.idPerfil = null;
          p.descripcion = null;
          u.perfil = p;
          this.generalService2.cerrarSesion(this.auth2.currentUser()).pipe(first()).subscribe({
            next: (value: GenericResponseBean<string>)=> {
              this.auth2.cerrarSesion();
            },
            error: (error) => {
              this.auth2.logout();
            }
          })
        }
      return u;
    }

    public removerToken(){
        localStorage.clear();
        sessionStorage.clear();
    }

}
