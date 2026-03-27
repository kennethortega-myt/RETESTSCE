import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "../service/auth-service.service";
import {AuthStatus} from "../model/enum/auth-status.enum";

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === AuthStatus.authenticated){
    router.navigateByUrl('/main/principal');
    return false;
  }
  return true;
}
