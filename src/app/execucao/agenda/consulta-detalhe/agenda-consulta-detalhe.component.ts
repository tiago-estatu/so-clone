import { Component, OnInit, ViewChild, EventEmitter, Output, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfiguracaoCD } from '../ConfiguracaoCD';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HeaderService } from '../../../commons/services/header.service';
import { NewModalComponent, fadeInOut } from 'src/app/commons';
import { AgendaService } from 'src/app/commons/services/agenda/agenda-service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rd-agenda-consulta-detalhe',
  templateUrl: './agenda-consulta-detalhe.component.html',
  styleUrls: ['./agenda-consulta-detalhe.component.scss'],
  animations: [fadeInOut]
})
export class AgendaConsultaDetalheComponent implements OnInit {
  componentLoading: boolean = false;
  constructor(private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private agendaService: AgendaService,
    public dialogRef: MatDialogRef<AgendaConsultaDetalheComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any[]) {
      const agendasData: ConfiguracaoCD[] = [];

    }


  // )

  dropdownSettings: any = {};
  dropdownSettingsOne: any = {};

  diaCompraSelecionadoLista = [];
  dropdownDiaCompraLista = [];

  frequenciaSelecionadoLista = [];
  dropdownFrequenciaLista = [];

  todosDiaCompraParaPesquisa = '';
  todosFrequenciaParaPesquisa = '';
  // tslint:disable-next-line: member-ordering
  rotaVoltar = 'execucao/agenda';
  // tslint:disable-next-line: member-ordering
  tituloPagina = 'Detalhes da Agenda';
  // tslint:disable-next-line: member-ordering
  configuracaoCD: ConfiguracaoCD;
  agendaConsutaForm: FormGroup;
  mensagemModal;
  tituloModal;
  imagemModal;

  // tslint:disable-next-line: member-ordering
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  @Output() EnviarDados = new EventEmitter();
  cdOperador = localStorage.getItem('cdOperador');

  ngOnInit() {

    this.headerService.setTitle('Alterar Agenda Cadastro');
    this.configuracaoCD = JSON.parse(localStorage.getItem('elemento'));
    this.agendaConsutaForm = this.formBuilder.group({
      centroDistribuicao: [this.configuracaoCD.cdRegionais],
      fornecedor: [this.configuracaoCD.cdFornecedores]
    });

    // DROPLIST LISTA
    this.dropdownDiaCompraLista = [
      // { item_id: 1, item_text: 'Sábado' },
      { item_id: 2, item_text: 'Segunda-Feira' },
      { item_id: 3, item_text: 'Terça-Feira' },
      { item_id: 4, item_text: 'Quarta-Feira' },
      { item_id: 5, item_text: 'Quinta-Feira' },
      { item_id: 6, item_text: 'Sexta-Feira' },
    ];

    this.dropdownFrequenciaLista = [
      // { item_id: 1, item_text: 'Diario' },
      { item_id: 7, item_text: 'Semanal' },
      { item_id: 15, item_text: 'Quinzenal' },
      { item_id: 30, item_text: 'Mensal' },
    ];

    // DROPLIST SETTINGS
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };

    this.dropdownSettingsOne = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.preencheTodosDiaCompraParaPesquisa();
    this.preencheTodosFrequenciaParaPesquisa();
  }

  preencheTodosFrequenciaParaPesquisa() {
    this.todosFrequenciaParaPesquisa = '';
    let selecionados = [];
    selecionados = this.frequenciaSelecionadoLista;
    if (selecionados !== undefined) {
      for (let i = 0; i < selecionados.length; i++) {
        this.todosFrequenciaParaPesquisa += selecionados[i]['item_id'] + '-';
      }
    }
    this.todosFrequenciaParaPesquisa = this.retirarUltimoString(this.todosFrequenciaParaPesquisa);
  }

  preencheTodosDiaCompraParaPesquisa() {
    this.todosDiaCompraParaPesquisa = '';
    let selecionados = [];
    selecionados = this.diaCompraSelecionadoLista;
    if (selecionados !== undefined) {
      for (let i = 0; i < selecionados.length; i++) {
        this.todosDiaCompraParaPesquisa += selecionados[i]['item_id'] + '-';
      }
    }
    this.todosDiaCompraParaPesquisa = this.retirarUltimoString(this.todosDiaCompraParaPesquisa);
  }

  retirarUltimoString(texto: string): string {
    const novoTexto = texto.substring(0, texto.length - 1);
    return novoTexto;
  }

  reset() {
    // CD
    this.diaCompraSelecionadoLista = [];

    // LOJA

  }

  atualizarFrequenciaAgenda() {

    let frequencia: any;

    this.agendaService.getAtualizaFrequenciaAgenda(frequencia);
  }

}
