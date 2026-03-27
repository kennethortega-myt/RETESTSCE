import { Component, inject } from '@angular/core';
import { AccesoPcService } from 'src/app/service/acceso-pc.service';
import { ListadoPcTablaComponent } from '../listado-pc-tabla/listado-pc-tabla.component';
import { ListadoPcBaseComponent } from '../listado-pc-base/listado-pc-base.component';

@Component({
  selector: 'app-listado-pc',
  standalone: true,
  imports: [ListadoPcTablaComponent],
  templateUrl: './listado-pc.component.html'
})
export class ListadoPcComponent extends ListadoPcBaseComponent {

  private readonly _accesoPcService = inject(AccesoPcService);

  protected get accesoPcService(): any {
    return this._accesoPcService;
  }


}
