import { Http } from '@angular/http';
import { UtilsHelper } from './../commons/helpers/utils.helper';
import { ValidatorHelper } from './../commons/helpers/validator.helper';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'rd-estorno',
  templateUrl: './estorno.component.html',
  styleUrls: ['./estorno.component.scss'],
  animations: [routeAnimation]

})
export class EstornoComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _http: Http
  ) { }

  ngOnInit() {
  }

}
