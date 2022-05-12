import { Component, OnInit } from '@angular/core';
import { routeAnimation, AuthenticationService } from 'src/app/commons';
import { Router } from '@angular/router';

@Component({
  selector: 'rd-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [routeAnimation] // register the animation
})
export class MainComponent implements OnInit {

  constructor(
    private service: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    if (localStorage.getItem('loginOperador') === '') {
      this.router.navigateByUrl('/login');
    }
  }

  public getRouterOutletState(outlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  logoutSubmit() {
    this.service.logout();
  }

}


