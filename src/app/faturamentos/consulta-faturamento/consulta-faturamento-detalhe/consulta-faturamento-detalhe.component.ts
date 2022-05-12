import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';

import {
  MaskedDate,
  ServicePath,
  APIService,
  HeaderService,

} from 'src/app/commons';
import { FATURAMENTO_DETALHE } from '../../data';
@Component({
  selector: 'rd-consulta-faturamento-detalhe',
  templateUrl: './consulta-faturamento-detalhe.component.html',
  styleUrls: ['./consulta-faturamento-detalhe.component.scss']
})
export class ConsultaFaturamentoDetalheComponent implements OnInit {
  rotaVoltar = '/faturamento/consulta';
  tituloPagina = 'Detalhe Faturamento';
  
  faturamentoForm: FormGroup;

  //TOGGLE
  marked = false;
  //TABLE
  value = '';
  displayedColumns: string[] = ['selecionar', 'cdProduto', 'descricaoProduto', 'setor', 'valorUnit', 'qtdCompra'];
  dataSource = new MatTableDataSource(FATURAMENTO_DETALHE);
  selection = new SelectionModel<any>(true, []);
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  constructor(
    private formBuilder: FormBuilder,
    private headerService: HeaderService,
  ) { 
    this.faturamentoForm = this.formBuilder.group({
      idPedido: ['1'],
      cdRegional: ['900'],
      inputCD: ['900 - EMBU-SP'],
      inputFornecedor: ['300 - GRANLESTE MOTORES LTDA'],
      inputFilial: ['6004 - RAIA DROGASIL - BOTAFOGO - A'],
      rota: ['1 - ROTA NOME 3'],
      totalSkus: ['5'],
      filial: [''],
      custo: ['0'],
      cubagem: ['1'],
      transmissao: ['1']
    });
  }

  ngOnInit() {
    this.headerService.setTitle('Emissão de Faturamento');
    this.isAllSelected();
  }

  toggleVisibility(e) {
    this.marked = e.target.checked;
  }
}
