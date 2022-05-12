import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { interfaceItim } from './InterfaceItim';
import { take, takeUntil } from 'rxjs/operators';

import {
  MaskedDate,
  ServicePath,
  APIService,
  HeaderService,
  isAllSelected,
  masterToggle,

} from 'src/app/commons';
import { INTERFACE_DATA } from './demo-data';

interface oneOption {
  codRotinaInterface: string;
  nomeInterface: string;
}

@Component({
  selector: 'parametros-cadastro.component',
  templateUrl: './parametros-cadastro.component.html',
  styleUrls: ['./parametros-cadastro.component.scss']
})
export class ParametrosCadastroComponent implements OnInit {
   //DROPLISTS
  dropdownInterfaceLista = [] = INTERFACE_DATA;
  interfaceSelecionadoLista = [];
  dropdownSettings: any = {};
  componentLoading = false;
  mensagemModal = '';
  tituloModal = '';
  imagemModal = '';

  dateTimeMask = MaskedDate; // para mascara no campo bsdatepicker datas
  maxDate: Date;
  expandir = true;
  masterToggle = masterToggle;
  loaded = true;
  inputData = [''];
  constructor(
    private apiConfig: APIService,
    private headerService : HeaderService
  ) {
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate());

  }

  ngOnInit() {

    this.headerService.setTitle("Parâmetros para Execução Interfaces");
    //DROPLIST SETTINGS
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 4,
      allowSearchFilter: true
    };
  }

  limparTela(){
    
  }
  consultar(){

  }
}
