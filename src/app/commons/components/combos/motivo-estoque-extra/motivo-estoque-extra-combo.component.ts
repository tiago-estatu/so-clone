import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { UtilsHelper } from 'src/app/commons';
import { NewModalComponent } from '../..';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { fadeInOut, fadeIn } from 'src/app/commons/const';
import { MotivoEstoqueService } from 'src/app/commons/services';
import Swal from 'sweetalert2';
import { M } from '@angular/cdk/keycodes';

export class MotivoConfigModel {
  pathService: string;
}
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rd-motivo-estoque-extra-combo',
  templateUrl: './motivo-estoque-extra-combo.component.html',
  styleUrls: ['./motivo-estoque-extra-combo.component.scss'],
  animations: [fadeInOut, fadeIn]
})

 export class MotivoEstoqueExtraComboComponent implements OnInit {
    @ViewChild(NewModalComponent) modalChild: NewModalComponent;

    // RESET NO COMPOMENTE LOADING
    componentLoading = false;

    dropdownSettingsSelecionarUm: any = {};

    @Input()
    config: MotivoConfigModel = {
      pathService: 'motivoEstoqueExtra'
    };

    @Output()
    selecionados = new EventEmitter();

    // VARIAVEL QUE RECEBE OS DADOS DO DROPDOWN
    dropdownMotivo = [];

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

    constructor(private _service: MotivoEstoqueService, private _utils: UtilsHelper) {}


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
        this.preencherMotivos();
    }

    // tslint:disable-next-line: use-lifecycle-interface
    ngOnChanges() {
      this.motivoSelecionadoLista = [];
    }


    // EXECUTO O CARREGAMENTO DOS DADOS NO DROPDOWN
    preencherMotivos() {
        // INTERAÇÃO COM O USUÁRIO
        this.componentLoading = true;

        // CHAMADA PARA O SERVIÇO (CONSULTAR LISTA DE MOTIVOS DE ESTOQUE EXTRA)
        this._service.getAllMotivo(this.config.pathService).subscribe(
        (res:[]) => {
            const tmp = [];

            for (let i = 0; i < res.length; i++) {
                const motivoEstoqueExtra= res[i];
                // POPULANDO O DROPDOWN (Selecionar Motivo)
                tmp.push({
                    item_id: `${motivoEstoqueExtra['cdMotivoEstoqueIdeal']}`,
                    item_text: `${motivoEstoqueExtra['cdMotivoEstoqueIdeal']} - ${motivoEstoqueExtra['dsMotivoEstoqueIdeal']}`,

                });
            }

            this.dropdownMotivo = tmp;
            this.componentLoading = false;
        },
        ex => {
            if (ex.status === 404) {
                Swal.fire({
                  title: 'Nenhum dado encontrado',
                  html: ex.error.mensagem,
                  icon: 'warning',
                  confirmButtonText: 'Ok, obrigado',
                  customClass: {confirmButton: 'setBackgroundColor'}
              });
            }
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

