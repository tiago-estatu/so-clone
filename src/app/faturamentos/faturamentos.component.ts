import { Component, OnInit } from '@angular/core';
import {  routeAnimation } from 'src/app/commons';
@Component({
  selector: 'rd-faturamentos',
  templateUrl: './faturamentos.component.html',
  styleUrls: ['./faturamentos.component.scss'],
  animations: [routeAnimation]
})
export class FaturamentosComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
