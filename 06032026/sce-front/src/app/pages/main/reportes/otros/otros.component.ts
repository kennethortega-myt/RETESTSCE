import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from 'src/app/service/global.service';

@Component({
  selector: 'app-otros',
  templateUrl: './otros.component.html',
})
export class OtrosComponent implements OnInit{

  activeMenu: string = '';  
  public isNacion: boolean;
  constructor(public router: Router,
    private globalService: GlobalService
  ) {    
  }

  public ngOnInit(): void {
    this.isNacion = this.globalService.isNacionUser;    
  }

  navegar(url: any) {
    if (url !== '') {
      this.activeMenu = url;
      this.router.navigate([url]);
    }
  }
}
