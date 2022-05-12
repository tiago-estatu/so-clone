import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'rd-alerta-de-pedido',
  templateUrl: './alerta-de-pedido.component.html',
  animations: [routeAnimation] // register the animation
})
export class AlertaDePedidoComponent implements OnInit {

  constructor(
    private headerService: HeaderService
  ) { }

  ngOnInit() {
    this.headerService.setTitle('Alertas para pedido');
  }
}
