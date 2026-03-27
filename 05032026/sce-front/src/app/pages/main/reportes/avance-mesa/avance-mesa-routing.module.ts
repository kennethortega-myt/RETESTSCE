import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AvanceMesaComponent } from "./avance-mesa.component";


const routes: Routes = [
    {
        path: '',
        component: AvanceMesaComponent
    }
]
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class AvanceMesaRoutingModule {

}