import {CanActivateFn, Router} from "@angular/router";
import {inject} from "@angular/core";
import {AuthService} from "../service/auth-service.service";
import {AuthStatus} from "../model/enum/auth-status.enum";

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authStatus() === AuthStatus.authenticated){
    return true;
  }
  router.navigateByUrl('/inicio');
  return false;
}
