import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, finalize, Observable, throwError } from "rxjs";

@Injectable()
export class HttpLoadingInterceptorService implements HttpInterceptor {    

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        sessionStorage.setItem('loading','true');

        return next.handle(req).pipe(finalize(() => {
            sessionStorage.setItem('loading','false');
        }),
        catchError((error: HttpErrorResponse) => {
            sessionStorage.setItem('loading','false');
            return throwError(() => error);
        })
    );
    }
}