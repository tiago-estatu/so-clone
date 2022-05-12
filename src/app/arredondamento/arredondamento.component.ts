import { Component, OnInit } from '@angular/core';
import { HeaderService, routeAnimation } from 'src/app/commons';

@Component({
  selector: 'rd-arredondamento',
  templateUrl: './arredondamento.component.html',
  styleUrls: ['./arredondamento.component.scss'],
  animations: [routeAnimation]
})
export class ArredondamentoComponent implements OnInit {
  constructor(
    private headerService: HeaderService
    ) {}
  ngOnInit() {
    this.headerService.setTitle('Arredondamentos');
  }
 }