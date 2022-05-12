import { AuthenticationService } from 'src/app/commons';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthAdm implements CanActivate {
  // OBJ ARRAY RECEBIDO DO SERVIÇO DE AUTENTICADOR
  rotas = localStorage.getItem('rotas')

  constructor(
    private router: Router,
    private AuthenticationService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean>{

      // RECEBO ARRAY CONTENDO TODAS AS ROTAS DE ACORDO COM O PERFIL LOGADO
      if (this.rotas.includes(state.url.trimLeft().substr(1)) === false) {
          this.AuthenticationService.showMsgAcessoNegado()
          this.router.navigateByUrl('/inicio');
          return false
      } else {
          return true
      }
  }

}
