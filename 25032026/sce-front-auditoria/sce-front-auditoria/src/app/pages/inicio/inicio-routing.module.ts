import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import { LoginComponent } from './login/login.component';

import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
    {path: '', component: LoginComponent},
    {path: 'login', component: LoginComponent}
 ];

@NgModule({
    imports: [
        MatIconModule,
        RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InicioRoutingModule {
}
