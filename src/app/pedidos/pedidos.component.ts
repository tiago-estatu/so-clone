import { Component, OnInit } from '@angular/core';
import {  routeAnimation } from 'src/app/commons';
@Component({
  selector: 'rd-pedidos',
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
  animations: [routeAnimation]
})
export class PedidosComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
