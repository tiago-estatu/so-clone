import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/commons';
import { Router } from "@angular/router";

@Component({
  selector: 'rd-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss'],
})
export class ErrorPageComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.headerService.setTitle('');
    this.returnHome(this.router);
  }

  returnHome = (router) => setTimeout(() => router.navigateByUrl('/inicio'),4000)

}
