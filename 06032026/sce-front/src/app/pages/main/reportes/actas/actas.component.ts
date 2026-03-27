import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import {AuthComponent} from '../../../../helper/auth-component';
import {Usuario} from '../../../../model/usuario-bean';
import {Constantes} from '../../../../helper/constantes';

@Component({
  selector: 'app-actas',
  templateUrl: './actas.component.html',
})
export class ActasComponent extends AuthComponent implements OnInit {
  activeMenu: string = '';

  usuario : Usuario;

  constructor(public router: Router) {
    super();
  }

  navegar(url: any) {
    if (url !== '') {
      this.activeMenu = url;
      this.router.navigate([url]);
    }
  }

  ngOnInit(): void {
    this.usuario = this.authentication();
  }

  protected readonly Constantes = Constantes;
}
