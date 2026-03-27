import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AuthComponent } from 'src/app/helper/auth-component';
import { ConfiguracionProcesoElectoralInterface } from 'src/app/interface/configuracionProcesoElectoral.interface';
import { Usuario } from 'src/app/model/usuario-bean';
import { ConfiguracionProcesoElectoralService } from 'src/app/service-api/configuracion-proceso-electoral.service';
import {MessageMainService} from "../../../message/message-main.service";
import {GlobalService} from "../../../service/global.service";

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
})
export class PrincipalComponent extends AuthComponent implements OnInit {

  public usuario: Usuario;
  listaProcesoElectoral: Array<ConfiguracionProcesoElectoralInterface> = [];
  accesoPerfil:Array<any>=[];
  activeMenu: string;

  private readonly perfilesNacion: string[] = ['ADM_NAC', 'REPO_NAC'];

  constructor (
    public Router:Router,
    private readonly configuracionProcesoService: ConfiguracionProcesoElectoralService,
    private readonly messageMainService: MessageMainService,
    private readonly globalService: GlobalService
  ){
    super();
    this.activeMenu = 'principal';
    this.messageMainService.setActiveMenu(this.activeMenu);
  }

  ngOnInit(): void {
    sessionStorage.setItem('loading','false');
    this.usuario = this.authentication();
    const perfilNacion = this.perfilesNacion.find( perfil => perfil === this.usuario.perfil.descripcion);
    this.globalService.isNacionUser = !!perfilNacion;
    this.messageMainService.getAccesoPerfil().subscribe(data => {
      this.accesoPerfil = data;
    });
  }

  seleccionar(menu: any, indice: number) {
    if(menu.tieneHijos){
      this.activeMenu = menu.hijos[0].url;
      this.messageMainService.setActiveMenu(this.activeMenu);
      this.messageMainService.setIndice(indice);
      this.Router.navigate([menu.hijos[0].url]);
    }else{
      this.activeMenu = menu.url;
      this.messageMainService.setActiveMenu(this.activeMenu);
      this.messageMainService.setIndice(indice);
      this.Router.navigate([menu.url]);
    }
  }

  listProceso() {
    this.configuracionProcesoService.listProcesoElectoral().subscribe(response => {
      this.listaProcesoElectoral = response.data;
    })
  }
}


