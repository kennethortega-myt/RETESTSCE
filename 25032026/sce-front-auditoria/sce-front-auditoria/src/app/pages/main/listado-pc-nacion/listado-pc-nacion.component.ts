import { Component, inject } from '@angular/core';
import { AccesoPcNacionService } from 'src/app/service/acceso-pc-nacion.service';
import { ListadoPcTablaComponent } from '../listado-pc-tabla/listado-pc-tabla.component';
import { ListadoPcBaseComponent } from '../listado-pc-base/listado-pc-base.component';

  @Component({
    selector: 'app-listado-pc-nacion',
    standalone: true,
    imports: [ListadoPcTablaComponent],
    templateUrl: './listado-pc-nacion.component.html'
  })
  export class ListadoPcNacionComponent extends ListadoPcBaseComponent {

    private readonly _accesoPcNacionService = inject(AccesoPcNacionService);

    protected get accesoPcService(): any {
      return this._accesoPcNacionService;
    }
  }
