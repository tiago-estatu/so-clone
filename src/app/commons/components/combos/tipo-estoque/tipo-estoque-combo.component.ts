import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter
} from '@angular/core';

import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { fadeInOut, NewModalComponent, TipoEstoqueService } from 'src/app/commons';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'tipo-estoque-combo',
  templateUrl: 'tipo-estoque-combo.component.html',
  styleUrls: ['tipo-estoque-combo.component.scss'],
  providers: [TipoEstoqueService],
  animations: [fadeInOut]
})
export class TipoEstoqueComboComponent implements OnInit {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;


  // VARIAVEIS DE TEXTOS PARA A MENSAGEM NO MODAL DE ERRO
  componentLoading = false;
  mensagemModal: any;
  imagemModal: any;
  tituloModal: any;

  dropdownEstoqueLista = [];
  tipoEstoqueLista = [];

  @Output()
  selecionados = new EventEmitter();

  constructor(private _service: TipoEstoqueService) {}
  settings: IDropdownSettings;

  ngOnInit(): void {

    // FAÇO O PREENCHIMENTO DO DROPLIST JÁ NO CARREGAMENTO DA TELA
    this.preencher();

    // SÃO AS CONFIGURAÇÕES DO DROPLIST
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false,
    };
  }

    // MÉTODO QUE LIMPA TODOS OS ÍTENS SELECIONADOS
    limparSelecionados() {
        const todosSelecionados: number[] = [];
        this.selecionados.emit(todosSelecionados);
    }

    // ARMAZENO TODOS OS ÍTENS SELECIONADOS
    selecionado(event: any[]) {
        const todosSelecionados: number[] = [];

        if (event.length > 1) {
            this.tipoEstoqueLista = event;
        }

        this.tipoEstoqueLista.forEach(x => todosSelecionados.push(x['item_id']));
        this.selecionados.emit(todosSelecionados);
    }

    // FAÇO O PREENCHIMENTO DO DROPLIST
    preencher() {
        // MOSTRO A ITERAÇÃO DO CARREGANDO (SEMPRE QUE O SERVIÇO ESTIVER COM LENTIDÃO)
        this.componentLoading = true;

        // FAÇO A CHAMADA DO SERVIÇO DO BACKEND PARA CARREGAMENTO DAS OPÇÕES
        this._service.getAllTipo().subscribe((res: any) => {

            const json = res;
            const tmp = [];
            for (let i = 0; i < json.length; i++) {
                tmp.push({
                    // FAÇO A CONCATENAÇÃO DO JSON + QUALQUER OUTRO TEXTO (OU CARACTER) PARA APRESENTAR NA VIEW
                    item_id: json[i].cdTipoEstoqueIdeal,
                    item_text: json[i].cdTipoEstoqueIdeal + ' - ' + json[i].dsTipoEstoqueIdeal
                });
            }

            this.dropdownEstoqueLista = tmp;

            }, ex => {
                // ESCONDE MENSAGEM DE CARREGANDO
                this.componentLoading = false;

                // TRATAMENTO DO ERRO (EXCESSÃO)
                if (ex.status === 404) {

                    // MOSTRA MODAL DE MENSAGEM DE ERRO
                    this.mensagemModal = ex.error.mensagem;
                    this.imagemModal = 'warning';
                    this.tituloModal = 'Nenhum dado encontrado';
                    this.modalChild.openModal = true;
                }
                this.modalChild.somErro = true;
            }

            ).add(() => {
                this.componentLoading = false;
            });
        }
    }
