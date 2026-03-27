import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hojas-asistencia',
  templateUrl: './hojas-asistencia.component.html'
})
export class HojasAsistenciaComponent {

  activeMenu: string = '';

  constructor(public router: Router) {}

  navegar(url: any) {
    if (url !== '') {
      this.activeMenu = url;
      this.router.navigate([url]);
    }
  }
}
