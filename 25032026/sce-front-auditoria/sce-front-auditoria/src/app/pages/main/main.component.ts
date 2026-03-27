import { Component, DestroyRef, inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { AuthComponent } from 'src/app/helper/auth-component';
import { Usuario } from 'src/app/model/usuario-bean';
import { AuthorizationService } from '../../service/authorization.service';

// Iconos librerías
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { MatExpansionPanel } from "@angular/material/expansion";
import { MessageMainService } from "../../message/message-main.service";
import { Subscription } from "rxjs";

const ARROWLIST_ICON2 =

  '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" ' +
  'viewBox="0 0 16 16" style="enable-background:new 0 0 16 16;" xml:space="preserve"> ' +
  '<path d="M9.1,14.8c-0.1-0.1-0.2-0.3-0.2-0.4s0.1-0.3,0.2-0.4l3-3H3.1c-0.3,0-0.6-0.1-0.9-0.4c-0.2-0.2-0.4-0.5-0.4-0.9V1.6 ' +
  'c0-0.2,0.1-0.3,0.2-0.4C2.1,1,2.3,1,2.4,1C2.6,1,2.8,1,2.9,1.2C3,1.3,3.1,1.4,3.1,1.6v8.1h9L9.1,6.8C9,6.6,8.9,6.5,8.9,6.3 ' +
  'C8.9,6.1,9,6,9.1,5.9c0.1-0.1,0.3-0.2,0.5-0.2S9.9,5.7,10,5.8l4,4c0.1,0.1,0.1,0.1,0.1,0.2c0,0.1,0,0.1,0,0.2c0,0.1,0,0.2,0,0.2 ' +
  'c0,0.1-0.1,0.1-0.1,0.2l-4,4.1C9.8,15,9.7,15,9.5,15C9.3,15,9.2,15,9.1,14.8z"/> ' +
  '</svg>';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html'
})
export class MainComponent extends AuthComponent implements OnInit {

  @ViewChildren('panelRefs') panelRefs: QueryList<MatExpansionPanel>;

  panelOpenState = false;
  public usuario: Usuario;
  destroyRef: DestroyRef = inject(DestroyRef);
  verMenu = false;
  activeMenu: string = 'principal';
  indice: number = 0;
  private readonly subscription: Subscription;
  private readonly subscriptionIndice: Subscription;

  constructor(
    public Router: Router,
    private readonly messageMainService: MessageMainService,
    private readonly authorizationService: AuthorizationService,
    // Iconos constructor
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {

    super();
    //Iconos lista
    iconRegistry.addSvgIconLiteral('arrow_list2', sanitizer.bypassSecurityTrustHtml(ARROWLIST_ICON2));
    this.subscription = this.messageMainService.getActiveMenu().subscribe(menu => {
      this.activeMenu = menu;
    });
    this.subscriptionIndice = this.messageMainService.getIndice().subscribe(indice => {
      this.indice = indice;
      if (this.panelRefs) {
        if (this.indice <= this.panelRefs.toArray().length) {
          this.panelRefs.toArray()[this.indice].open();
        }
      }
    });
  }
  ngOnInit(): void {
    this.cargarMenu();
  }

  cargarMenu() {
    this.usuario = this.authentication();

    // Usar el servicio centralizado para obtener el menú autorizado
    this.accesoPerfil = this.authorizationService.getAuthorizedMenu();
    this.messageMainService.setAccesoPerfil(this.accesoPerfil);
  }

  inicio() {
    this.Router.navigateByUrl('/main/principal')
    this.activeMenu = 'principal';

    this.accesoPerfil = [];
    this.verMenu = false;
    this.cargarMenu()
  }



  seleccionar(menu: any) {
    if (menu.url !== '') {
      // Verificar permisos antes de navegar
      if (!this.authorizationService.hasPermissionForRoute(menu.url)) {
        console.warn(`Acceso denegado a: ${menu.url}`);
        alert('No tienes permisos para acceder a este módulo.');
        return;
      }

      this.verMenu = true;
      this.activeMenu = menu.url;
      this.messageMainService.setActiveMenu(this.activeMenu);
      this.Router.navigate([menu.url]);
    }
  }

  accesoPerfil: Array<any> = [];

}
