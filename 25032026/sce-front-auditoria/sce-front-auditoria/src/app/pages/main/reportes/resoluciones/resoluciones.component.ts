import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {Constantes} from '../../../../helper/constantes';
import {AuthComponent} from '../../../../helper/auth-component';
import {Usuario} from '../../../../model/usuario-bean';

@Component({
  selector: 'app-resoluciones',
  templateUrl: './resoluciones.component.html'
})
export class ResolucionesComponent extends AuthComponent implements OnInit{

  usuario : Usuario;
  activeMenu: string = '';

  constructor(public router: Router) {
    super();
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
  }

  navegar(url: any) {
    if (url !== '') {
      this.activeMenu = url;
      this.router.navigate([url]);
    }
  }

  protected readonly Constantes = Constantes;
}
