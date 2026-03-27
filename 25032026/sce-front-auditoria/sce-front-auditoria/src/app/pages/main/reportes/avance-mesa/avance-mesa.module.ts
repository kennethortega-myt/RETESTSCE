import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { SharedModule } from "src/app/pages/shared/shared.module";
import { AvanceMesaComponent } from "./avance-mesa.component";
import { AvanceMesaRoutingModule } from "./avance-mesa-routing.module";
import { MaterialModule } from "src/app/material/material.module";

@NgModule({
    declarations:[
        AvanceMesaComponent
    ],
    imports:[
        MaterialModule,
        AvanceMesaRoutingModule,
        SharedModule,
        NgxExtendedPdfViewerModule,
        CommonModule,
        FormsModule,
    ],
    exports:[
        MatTableModule,
        FormsModule,
        CommonModule
    ]
})
export class AvanceMesaModule { }
