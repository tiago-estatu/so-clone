import { DataSource } from '@angular/cdk/collections';
import { MotivoSuspensaoFaturamentoModel } from './../../../services/motivo-suspensao/MotivoSuspensaoFaturamento.model';
import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { UtilsHelper } from 'src/app/commons';
import { NewModalComponent } from '../..';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { fadeInOut, fadeIn } from 'src/app/commons/const';
import { MotivoSuspensaoService } from './../../../services/motivo-suspensao/motivo-suspensao.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rd-motivo-suspensao-combo',
  templateUrl: './motivo-suspensao.component.html',
  styleUrls: ['./motivo-suspensao.component.scss'],
  animations: [fadeInOut, fadeIn]
})

 export class MotivoSuspensaoComboComponent implements OnInit {
    @ViewChild(NewModalComponent) modalChild: NewModalComponent;

    // RESET NO COMPOMENTE LOADING
    componentLoading = false;

    dropdownSettingsSelecionarUm: any = {};

    // VARIÁVEIS DE CONFIGURAÇÃO PARA A EXIBIÇÃO DA MODAL COM MSG DE ERRO
    mensagemModal;
    imagemModal;
    tituloModal;


    /* 
      // TIPO 1 - CD
      // TIPO 2 - FILIAL/LOJA
    */
    @Output()
    selecionados = new EventEmitter();

    @Input()
    tipoMotivo: number;

    // VARIAVEL QUE RECEBE OS DADOS DO DROPDOWN
    dropdownMotivoSuspensao = [];

    // ARMAZENO A LISTA DOS MOTIVOS APÓS FEITA A SELEÇÃO NO DROPDOWN
    motivoSelecionadoLista = [];

    // CONFIGURAÇÃO DO LAYOUT DO DROPDOWN
    dropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false
    };

    constructor(private _service: MotivoSuspensaoService, private _utils: UtilsHelper) {}


    ngOnInit(): void {
        this.dropdownSettingsSelecionarUm = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: 'Selecionar Todos',
            unSelectAllText: 'Remover Todos',
            itemsShowLimit: 2,
            limitSelection: 998,
            allowSearchFilter: true,
            defaultOpen: false
        };
        // FUNÇÃO QUE FAZ O CARREGAMENTO DOS DADOS NO DROPDOWN
        this.preencherMotivoSuspensao(this.tipoMotivo);
    }

    // tslint:disable-next-line: use-lifecycle-interface
    ngOnChanges() {
      this.motivoSelecionadoLista = [];

      // FUNÇÃO QUE FAZ O CARREGAMENTO DOS DADOS NO DROPDOWN
      this.preencherMotivoSuspensao(this.tipoMotivo);
    }


    // EXECUTO O CARREGAMENTO DOS DADOS NO DROPDOWN
    preencherMotivoSuspensao(tipoDoMotivo) {
        // INTERAÇÃO COM O USUÁRIO
        this.componentLoading = true;

        // CHAMADA PARA O SERVIÇO (CONSULTAR LISTA DE MOTIVOS FATURAMENTO SUSPENSO)
        this._service.getListaMotivoFaturamentoSupenso(tipoDoMotivo).subscribe(
        (res: MotivoSuspensaoFaturamentoModel[]) => {
            const tmp = [];

            for (let i = 0; i < res.length; i++) {
                const motivosFaturamentoSuspenso = res[i];

                // POPULANDO O DROPDOWN (Selecionar Motivo Suspensão)
                tmp.push({
                    item_id: motivosFaturamentoSuspenso.cdMotivoAgendaSuspena,
                    item_text: `${motivosFaturamentoSuspenso.cdMotivoAgendaSuspena} - ${motivosFaturamentoSuspenso.dsMotivoAgendaSuspena}`,

                });
            }

            this.dropdownMotivoSuspensao = tmp;
            this.componentLoading = false;
        },
        ex => {
            if (ex.status === 404) {
                this.mensagemModal = ex.error.mensagem;
                this.imagemModal = 'warning';
                this.tituloModal = 'Nenhum dado encontrado';
                this.modalChild.openModal = true;
            }
            this.modalChild.somErro = true;
            this.componentLoading = false;
        }).add(() => {
            this.componentLoading = false;
        });
    }

    selecionado() {
      const todosSelecionados: number[] = [];
      this.motivoSelecionadoLista.forEach(x =>
        todosSelecionados.push(x['item_id'])
      );
      this.selecionados.emit(todosSelecionados);
    }
  }

