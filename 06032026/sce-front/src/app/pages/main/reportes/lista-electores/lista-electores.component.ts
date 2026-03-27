import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-electores',
  templateUrl: './lista-electores.component.html'
})
export class ListaElectoresComponent {

  activeMenu: string = '';

  constructor(public router: Router) {}

  navegar(url: any) {
    if (url !== '') {
      this.activeMenu = url;
      this.router.navigate([url]);
    }
  }
}
