import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'rd-minimo-maximo',
  templateUrl: './minimo-maximo.component.html',
  styleUrls: ['./minimo-maximo.component.scss'],
  animations: [routeAnimation]
})
export class MinimoMaximoComponent implements OnInit {
  constructor(
    private headerService: HeaderService
    ) {}
  ngOnInit() {
    this.headerService.setTitle('Estoque Mínimo e Máximo');
  }
 }