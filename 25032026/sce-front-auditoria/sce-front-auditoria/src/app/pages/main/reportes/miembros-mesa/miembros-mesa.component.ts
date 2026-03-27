import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../service/global.service';


@Component({
  selector: 'app-miembros-mesa',
  templateUrl: './miembros-mesa.component.html'
})
export class MiembrosMesaComponent {

  activeMenu: string = '';
  esPerfilNacion: boolean = this.globalService.isNacionUser;

  constructor(
    private readonly router: Router,
    private readonly globalService: GlobalService,
  ) {}

    navegar(url: any) {
      if (url !== '') {
        this.activeMenu = url;
        this.router.navigate([url]);
      }
    }
}
