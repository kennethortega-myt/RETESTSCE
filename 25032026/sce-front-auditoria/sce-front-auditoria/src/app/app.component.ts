import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  HostListener,
  inject
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from "./service/auth-service.service";
import {AuthStatus} from "./model/enum/auth-status.enum";
import {Router} from "@angular/router";
import {DetectorInactividadService} from "./helper/detectorInactividadService";
import localeEs from '@angular/common/locales/es';
import {registerLocaleData} from "@angular/common";
import {DevToolsDetectorService} from "./service/dev-tools-detector.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterContentChecked{
  title = 'sce-front';

  loadginDialog: any;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  public finishedAuthCheck = computed<boolean>(() => {
    if (this.authService.authStatus() === AuthStatus.checking){
      return false;
    }
    return true;
  });

  public authStatusChangedEffect = effect(() => {

    if ((globalThis.opener && globalThis.opener !== globalThis) || this.router.url.includes('popup=true')) {
      return; // No realizar redirecciones en ventanas emergentes
    }

    switch (this.authService.authStatus()){
      case AuthStatus.checking:
        return;
      case AuthStatus.authenticated:
        this.router.navigateByUrl('/main/principal');
        this.detectorInactividadService.startMonitoring();
        return;
      case AuthStatus.notAuthenticated:
        this.router.navigateByUrl('/inicio');
        this.detectorInactividadService.stopMonitoring();
        sessionStorage.setItem('loading','false');
        this.dialog.closeAll();
        return;
    }
  })

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey && event.key === 'u') ||
      (event.ctrlKey && event.shiftKey && event.key === 'I') ||
      (event.ctrlKey && event.shiftKey && event.key === 'C') ||
      (event.key === 'F12')) {
      event.preventDefault();
    }
  }

  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
  }


  constructor(
    private readonly dialogo: MatDialog,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly detectorInactividadService: DetectorInactividadService,
    private readonly devToolsService: DevToolsDetectorService
  ) {
    registerLocaleData(localeEs);
  }

  ngAfterContentChecked() {
    this.changeDetectorRef.detectChanges();
  }

  isLoading() {
    if (sessionStorage.getItem('loading') === 'true') {
      return true;
    } else {
      return false;
    }

  }
}
