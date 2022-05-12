import {Component, OnInit, Output, EventEmitter, Input} from "@angular/core";
import { UtilsHelper } from "src/app/commons";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { fadeInOut } from "src/app/commons/const";
import Swal from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { GrupoPrioridadeLojaService } from 'src/app/commons/services/grupo-prioridade-loja/grupo-prioridade-loja.service';
import { PrioridadeLojaModel } from 'src/app/commons/services/grupo-prioridade-loja/grupoPrioridadeLoja.model';


@Component({
  selector: 'combo-Prioridade-Loja',
  templateUrl: './grupo-prioridade-loja.component.html',
  styleUrls: ['./grupo-prioridade-loja.component.scss'],
  providers: [GrupoPrioridadeLojaService],
  animations: [fadeInOut]
})

export class GrupoPrioridadeLojaComponent implements OnInit {
    constructor(
        private _service: GrupoPrioridadeLojaService,
        private _utils: UtilsHelper
        ) {}



    @Output() selecionados = new EventEmitter();
    @Input() selecaoUnicaGruposPrioridade;
    componentLoading = false;
    dropdownSettingsSelecionarUm: any = {};
    dropdownLista = [];
    selecionadoLista = [];


    // DROPLIST SETTINGS
    dropdownSettings: IDropdownSettings = {
      singleSelection: null,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 1,
      allowSearchFilter: false,
      defaultOpen: false
    };


    ngOnInit(): void {
        this.dropdownLista = [];
        this.selecionadoLista = [];

        this.dropdownSettingsSelecionarUm = {
            singleSelection: this.selecaoUnicaGruposPrioridade,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: 'Selecionar Todos',
            unSelectAllText: 'Remover Todos',
            itemsShowLimit: 2,
            limitSelection: 998,
            allowSearchFilter: false,
            defaultOpen: false
        };

        // POPULAR DROPLIST
        this.preencherGruposPrioridade();
    }

    ngOnChanges(): void {
      this.preencherGruposPrioridade();
      this.limparSelecionados();
    }

    preencherGruposPrioridade() {
      this.componentLoading = true;
          this._service.getGrupoPrioridadeDeLoja().subscribe(
            (res: PrioridadeLojaModel[]) => {
              const tmp = [];
              res.forEach(prioridadeLojaIterface => {

                  // DESCRIÇÃO (id)
                  tmp.push({
                      item_id: prioridadeLojaIterface.cdGrupo,
                      item_text: `${prioridadeLojaIterface.dsGrupo}`,
                    });
              });
              this.dropdownLista = tmp;
              this.componentLoading = false;
            },
            ex => {
              Swal.fire({
                title: 'Oops!',
                html: ex.error.mensagem + 'prioridade de loja combo!',
                icon: 'warning',
                confirmButtonText: 'Ok, obrigado',
              });
            }
          ).add(() => {
            this.componentLoading = false;
          }).unsubscribe();
    }


    limparSelecionados() {
      this.selecionadoLista = [];
      this.selecionados.emit([]);
    }

    selecionado() {
      const todosSelecionados: number[] = [];
      this.selecionadoLista.forEach(x => todosSelecionados.push(x['item_id']));
      this.selecionados.emit(todosSelecionados);
    }
  }
