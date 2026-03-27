import {CanDeactivateFn, UrlTree} from "@angular/router";
import {ControlComponent} from "../pages/main/control/control.component";
import {Observable, of} from "rxjs";
import {inject} from "@angular/core";
import {ControlDigitalizacionService} from "../service/control-digitalizacion.service";
import {catchError, map} from "rxjs/operators";
import {Constantes} from "../helper/constantes";

export const canDeactivateControlGuard: CanDeactivateFn<ControlComponent> = (
  component: ControlComponent
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree  =>{
  //injectando depenencias
  const controlService = inject(ControlDigitalizacionService);

  if (component.actaSeleccionada?.estado === Constantes.CE_ESTADO_MESA_BLOQUEADO){
    return controlService.liberarActa(component.actaSeleccionada.actaId.toString()).pipe(
      map(()=> true),
      catchError(err => {return of(false)})
    );
  }else{
    return of(true);
  }
}




