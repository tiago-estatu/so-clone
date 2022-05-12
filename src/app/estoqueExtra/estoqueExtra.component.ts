import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'estoqueExtra',
  templateUrl: './estoqueExtra.component.html',
  animations: [routeAnimation]
})
export class EstoqueExtraComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }

}
