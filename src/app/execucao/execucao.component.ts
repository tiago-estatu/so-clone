import { Component, OnInit } from '@angular/core';
import { HeaderService } from 'src/app/commons';

@Component({
  selector: 'rd-execucao',
  templateUrl: './execucao.component.html'
})
export class ExecucaoComponent implements OnInit {

  constructor(
    private headerService: HeaderService,
  ) { }

  ngOnInit() {
    this.headerService.setTitle('Interface - Execução');
  }

}
