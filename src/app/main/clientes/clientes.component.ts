import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'rd-clientes',
  templateUrl: './clientes.component.html',
  animations: [routeAnimation] // register the animation
})
export class ClientesComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
  ) { }

  ngOnInit() {
    this.headerService.setTitle('Clientes');
  }

}
