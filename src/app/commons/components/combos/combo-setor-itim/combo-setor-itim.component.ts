import { fadeInOut } from '../../../const/animation';
import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BehaviorSubject } from 'rxjs';
import { SetorItimService } from '../../../services/setor-itim/setor-itim.service';

@Component({
  selector: 'rd-combo-setor-itim',
  template: `

        <!-- LABEL TITLE -->
        <div class="title-form vig">
            <i class="fa fa-0-5x fa-files-o"></i>
            Selecione setor ITIM
        </div>
        <!-- LABEL TITLE -->

        <!-- DROPDOWN INPUT -->
        <ng-multiselect-dropdown
            [ngModelOptions]="{ standalone: true }"
            [(ngModel)]="selecionadoLista"
            name="comboGrupoSetorItim"
            [placeholder]="'Selecionar setor ITIM'"
            [data]="$motivos | async | dropmap: 'cdGrupo':'dsGrupo'"
            (onSelect)="selecionado()"
            (onDeSelect)="selecionado()"
            [settings]="dropdownSettings">
        </ng-multiselect-dropdown>
        <!-- DROPDOWN INPUT -->
    `,
  styleUrls: ['./combo-setor-itim.scss'],
  providers: [SetorItimService],
})
export class comboSetorItim implements OnInit {

    constructor(
      private _service: SetorItimService,
      private _fb: FormBuilder
      ) {}

    @Output() selecionados = new EventEmitter();
    @Input() control?: FormControl;

    dropdownSettings:IDropdownSettings = {
        singleSelection: true,
        idField: "item_id",
        textField: "item_text"
    };

    selecionadoLista = [];
    $motivos = new BehaviorSubject<any[]>([]);


    ngOnInit() {
        this.control = this.control || this._fb.control("");

        this.selecionadoLista = [];

        // CARREGAR DADOS DO DROPLIST
        this.carregarDados();
    }


    ngOnChanges(): void {
      this.carregarDados();
      this.limparSelecionados();
    }

    carregarDados() {
        this._service.getGrupoPrioridadeDeLoja().subscribe(data => {
            this.$motivos.next(data || [])
        })
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
