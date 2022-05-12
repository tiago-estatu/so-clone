import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  MaskedDate,
  ServicePath,
  APIService,
  HeaderService,

} from 'src/app/commons';
import { CD_DATA, ROTA_DATA, FATURAMENTO_DATA, FILIAL_DATA } from '../data';

@Component({
  selector: 'rd-consulta-faturamento',
  templateUrl: './consulta-faturamento.component.html',
  styleUrls: ['./consulta-faturamento.component.scss']
})
export class ConsultaFaturamentoComponent implements OnInit {
  displayedColumnFaturamento: string[] = ['selecionar', 'idFaturamento', 'filial', 'inputCD', 'rota', 'qtdSkus', 'custo', 'cubagem', 'transmissao'];
  objStyleStatus;
  dataSource = [] = FATURAMENTO_DATA;
  selection = new SelectionModel<any>(true, []);
  //DROPLISTS
  dropdownCDLista = [] = CD_DATA;
  dropdownRotaLista = [] = ROTA_DATA;
  dropdownFilialLista = [] = FILIAL_DATA;
  cdSelecionadoLista = [];
  rotaSelecionadoLista = [];
  filialSelecionadoLista = [];
  dropdownSettings: any = {};
  expandir = true;



  //FORMULÁRIO
  formFaturamento: FormGroup;

  maxDate: Date;
  //TABLE 
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => this.selection.select(row));
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  getMyStyles(status) {
    if(status == 1){
    return {
       'color': 'darkgreen'
    };
  }else if(status == 0){
    return {
      'color':'#ffc107'
    };
  }else if(status == -1){
    return {
      'color' : 'darkred'
    };
  }
}
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private headerService: HeaderService,
  ) {
  }

  ngOnInit() {
    this.headerService.setTitle('Emissão de Faturamento');

    //DROPLIST SETTINGS
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };

    //Montando o Formulário
    this.formFaturamento = this.formBuilder.group({
    });
  }
  limparTela(){
    
  }
  consultar() {

  }
  efetivar(){
  }
  goTo(event) {
    event.preventDefault();
    this.router.navigateByUrl("/faturamento/detalhe");
  }
}
