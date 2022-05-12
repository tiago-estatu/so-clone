import { AuthenticationService } from 'src/app/commons';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidoAuth implements CanActivate {
  // OBJ ARRAY RECEBIDO DO SERVIÇO DE AUTENTICADOR
  rotas = localStorage.getItem('rotas')

  constructor(
    private router: Router,
    private AuthenticationService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean>{

    // SEPARO O BASE PATH DA URL CUSTOMIZADA PARA FAZER A VERFICAÇÃO
    let urlBaseDiretorio = state.url.trimLeft().substr(1).split('/').slice(0,1).toString();

    // RECEBO ARRAY CONTENDO TODAS AS ROTAS DE ACORDO COM O PERFIL LOGADO
    if (this.rotas.includes(urlBaseDiretorio) === false) {
          this.AuthenticationService.showMsgAcessoNegado()
          this.router.navigateByUrl('/inicio');
          return false
      } else {
          return true
      }
  }

}
