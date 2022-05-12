import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import Swal from 'sweetalert2';


@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem('loginOperador') !== undefined || null) {
      return true;
    } else {
      this.router.navigateByUrl('/login', {
        queryParams: {
          return: state.url
        }
      }).then(() => {
        Swal.fire({
          icon: 'warning',
          title: 'Você foi deslogado!',
          text: 'Por segurança, estamos deslogando seu usuário.',
          confirmButtonText: 'Ok, obrigado.',
          customClass: {confirmButton: 'setBackgroundColor'}
       });
      });
      return false;
    }
  }

}
