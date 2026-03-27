import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InicioModule } from './pages/inicio/inicio.module';
import { MainModule } from './pages/main/main.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from "./pages/shared/shared.module";

import { MatDialogModule } from '@angular/material/dialog';

import { TokenInterceptor } from './service/token.interceptor';
import { MatChipsModule } from '@angular/material/chips';

import { NgxExtendedPdfViewerModule } from "ngx-extended-pdf-viewer";
import { MY_DATE_FORMAT } from "./helper/date-formats";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from '@angular/material/input';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [

    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    InicioModule,
    ReactiveFormsModule,
    InicioModule,
    MainModule,
    //FileUploadModule,
    BrowserAnimationsModule,
    SharedModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    NgxExtendedPdfViewerModule,

  ],
  providers: [
    MatDatepickerModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    /*
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoadingInterceptorService,
      multi: true
    },*/
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
