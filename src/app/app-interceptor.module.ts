import { Injectable, NgModule } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { AuthenticationService } from './commons';
@Injectable()
export class HttpsRequestInterceptor implements HttpInterceptor {

  constructor(private router: Router, private loadingBarService: LoadingBarService, private authService: AuthenticationService) { }

  // MODAL MENSAGENS
  modal(title: string, text: any, icone: any) {Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })}

  // INTERCEPTOR
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let dupReq: any;
    if (localStorage.hasOwnProperty('accessToken') && !req.url.includes('/login')) {
      dupReq = req.clone({
        headers: req.headers
        .set('Content-Type', 'application/json')
        .set('application_token', 'fs')
        .set('Authorization', 'Bearer ' + localStorage.getItem('accessToken'))
      });
    } else {
      dupReq = req.clone()
    }

    let expiracaoToken: Date = new Date(parseInt(localStorage.getItem('expiracaoToken')));
    if (expiracaoToken.getTime() < new Date().getTime()) {
        this.loadingBarService.stop();
        this.modal('Atenção, sessão expirada!','Por favor, faça o login novamente.', 'info')
        this.authService.logout();
    } else {
      const logout = new Date().getTime() + 1800000;
      localStorage.setItem("expiracaoToken", `${logout}`);

      return next.handle(dupReq).pipe(map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.loadingBarService.stop();
          if (event.status === 203 || event.status === 204) {this.modal(`Atenção!, Erro ${event.status}`, event.body ? event.body : 'Não há resposta contato o servidor, contate o suporte.', 'warning')}
        }
        return event;

        })).pipe(catchError((error: HttpErrorResponse) => {
          if (error instanceof HttpErrorResponse) {
            this.loadingBarService.stop();
            if (error.status === 403) {this.authService.logout();this.modal('Atenção! acesso negado...', error ? error.error.mensagem : 'Fora do horário de funcionamento', 'warning')}
            if (error.status === 0 || error.status === 500) {this.modal('Erro de Conexão', 'Sem contato com o servidor, contate o suporte', 'error')}
        }
        return throwError(error);
      }));
    }
  }
}

@NgModule({
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: HttpsRequestInterceptor, multi: true,}]
})
export class Interceptor {}
