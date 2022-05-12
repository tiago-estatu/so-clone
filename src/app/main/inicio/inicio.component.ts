import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/commons';

@Component({
  selector: 'rd-inicio',
  templateUrl: './inicio.component.html',
})
export class InicioComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
  ) { }

  ngOnInit() {
    this.headerService.setTitle('Página inicial');
  }

  get operador() {
    return localStorage.getItem('cdOperador')
  }

}
