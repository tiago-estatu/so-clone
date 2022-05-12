import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ValidatorHelper, fadeInOut } from 'src/app/commons';
import { Router } from '@angular/router';


@Component({
  selector: 'rd-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [fadeInOut]
})
export class LoginComponent implements OnInit {


  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private service: AuthenticationService,
    public validator: ValidatorHelper,
    private router: Router
  ) {
    this.loginForm = this.fb.group(
      {
        usuario: ['', [Validators.required]],
        senha: ['', [Validators.required]]
      });
    validator.formGroup = this.loginForm;
  }

  public options = {
    position: ["top", "right"],
    timeOut: 5000,
    lastOnBottom: true
  }


  ngOnInit() {
    localStorage.clear();
  }

  loginSubmit() {

    //this.router.navigateByUrl('/execucao');
      this.service.login();
  }

}
