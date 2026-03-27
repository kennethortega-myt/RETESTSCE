import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { MaterialModule } from 'src/app/material/material.module';
import { InicioRoutingModule } from './inicio-routing.module';

@NgModule({
  declarations: [
    LoginComponent],
  imports: [
    CommonModule,
    MaterialModule,
    InicioRoutingModule
  ]
})
export class InicioModule { }
