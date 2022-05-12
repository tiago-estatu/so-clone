import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ValidatorHelper } from 'src/app/commons/helpers/validator.helper';
import { NotificationsService } from 'angular2-notifications';
import { FormBuilder, FormGroup } from '@angular/forms';
import { APIService } from './api.service';
import { ServicePath } from 'src/app/commons/const/ServicePath';
import Swal from 'sweetalert2';

@Injectable()
export class AuthenticationService {

  constructor(
    public http: HttpClient,
    private router: Router,
    private validator: ValidatorHelper,
    private _notifications: NotificationsService,
    private _fb: FormBuilder,
    private apiConfig: APIService,
  ) {}

  form: FormGroup;
  types = ['alert', 'error', 'info', 'warn', 'success'];
  animationTypes = ['fromRight', 'fromLeft', 'scale', 'rotate'];

  login() {
    this.validator.submitted = true;
    this.validator.errorMessage = undefined;
    this.validator.errorLoaded = true;
    this.validaForm();
  }

  getPerfilOperadorPorLogin() {
    let urlLogin = ServicePath.HTTP_LOGIN + this.validator.formGroup.value.usuario.toLowerCase();
    return this.apiConfig.GET(urlLogin);
  }

  logar(loginSenhaBase64) {
    this.http.post(ServicePath.HTTP_GERA_TOKEN, "{}", this.getHeader(loginSenhaBase64)).subscribe(
      data => {
        this.setToken(data);
        this.setOperador();
      }, error => {
        this.validator.errorLoaded = false;
        this.exibeErroNaPagina(error);
      }
    )
  }

  setOperador() {
      this.getPerfilOperadorPorLogin().subscribe(data => {
          this.setNomeOperador(data);
          this.setCdOperador(data);
          localStorage.setItem('loginOperador', this.validator.formGroup.value.usuario.toLowerCase());

          this.http.get(ServicePath.HTTP_AUTORIZADOR_ROTAS + `?cdOperador=${localStorage.getItem('cdOperador')}`)
            .subscribe((response) => {
                localStorage.setItem('rotas', JSON.stringify(response));
                this.router.navigateByUrl('/inicio');
          }, error => {
            this.exibeErroNaPagina(error);
          })
      }, error => {
        this.exibeErroNaPagina(error);
      }).add(() => {this.validator.errorLoaded = false});
  }


  exibeErroNaPagina(erro) {
    this.form = this._fb.group({
        type: 'error',
        title: 'Erro!',
        content: erro.error.message ? erro.error.message : 'Erro desconhecido',
        timeOut: 5000,
        showProgressBar: true,
        pauseOnHover: false,
        clickToClose: true,
        animate: 'fromRight'
    });

    const temp = this.form.getRawValue();
    const title = temp.title;
    const content = temp.content;
    const type = temp.type;

    delete temp.title;
    delete temp.content;
    delete temp.type;

    this._notifications.create(title, content, type, temp);
  }

  getHeader(loginBase64) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'authorization': loginBase64
      }
    };
  }

  validaForm() {
    if (this.validator.formGroup.value.usuario == "" && this.validator.formGroup.value.senha == "") {
      this.form = this._fb.group({
          type: 'error',
          title: 'Erro!',
          content: 'Digite seu usuário e senha para continuar',
          timeOut: 5000,
          showProgressBar: true,
          pauseOnHover: false,
          clickToClose: true,
          animate: 'fromRight'
      });

      const temp = this.form.getRawValue();
      const title = temp.title;
      const content = temp.content;
      const type = temp.type;

      delete temp.title;
      delete temp.content;
      delete temp.type;

      this._notifications.create(title, content, type, temp);
      this.validator.errorLoaded = false;
    }
    else {
      this.logar(this.criachaveBase64());
    }
  }

  criachaveBase64() {
    const loginSenha = 'LDAP/' + this.validator.formGroup.value.usuario.toLowerCase() + ':' + this.validator.formGroup.value.senha;
    return "Basic " + btoa(loginSenha);
  }

  logout() {
    localStorage.clear();
    this.router.navigateByUrl('/login');
  }

  private setNomeOperador(auth: any) {
    localStorage.setItem("nomeOperador", auth.value.nome);
  }

  private setCdOperador(auth: any) {
    localStorage.setItem("cdOperador", auth.value.id);
  }

  private setToken(auth: any) {
    localStorage.setItem("token", auth.value.authentication);

    const logout = new Date().getTime() + 1800000;
    localStorage.setItem("expiracaoToken", `${logout}`);
  }

  showMsgAcessoNegado () {
    Swal.fire({
      icon: "warning",
      title: "Acesso negado!",
      text: "Suas credencias não permitem acesso a esse conteúdo, entre em contato com seu gestor.",
      confirmButtonText: "Ok, obrigado.",
      customClass: {confirmButton: 'setBackgroundColor'}
    });
  }

}
