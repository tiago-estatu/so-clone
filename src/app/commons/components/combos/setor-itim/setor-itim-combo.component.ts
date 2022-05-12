import { FormControl , FormBuilder } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { fadeInOut } from './../../../const/animation';
import { SetorItimService } from './../../../services/setor-itim/setor-itim.service';

import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectorRef, ViewRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'rd-setor-itim-combo',
  templateUrl: './setor-itim-combo.component.html',
  styleUrls: ['./setor-itim-combo.component.scss'],
  providers: [SetorItimService],
  animations: [fadeInOut]
})

export class SetorItimComboComponent implements OnInit {
  @Input() control?: FormControl;
  @Output() selecionados = new EventEmitter();
  subs = [];
  dropdownSettings: IDropdownSettings;
  grupo = [];
  setorSelecionado = [];

  constructor(
    private _service: SetorItimService,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.control = this.control || this._fb.control("");
    this.grupo = [];

    this.subscriberToChanges();

    this.control = this.control || this._fb.control("");

    this.carregarSettingsComponent();

    this.preencherGruposSetorItim();

  }

  ngOnChanges(): void {
    this.preencherGruposSetorItim();
    this.limparSelecionados();
  }

  subscriberToChanges() {
    this.subs.push(this._service.$selecionados.subscribe(data => {
      if (data.length === 0) this.setorSelecionado = []
      if (this.control) this.control.setValue(data)
      if (!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))
  }

  carregarSettingsComponent() {
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 1,
      limitSelection: 998,
      allowSearchFilter: false,
      defaultOpen: false
    }
  }

  preencherGruposSetorItim() {
    // this.componentLoading = true;
    this._service.getGrupoPrioridadeDeLoja().subscribe(
      (res: any[]) => {
        const tmp = [];
        res.forEach(prioridadeLojaIterface => {

          // DESCRIÇÃO (id)
          tmp.push({
            item_id: prioridadeLojaIterface.cdGrupo,
            item_text: `${prioridadeLojaIterface.dsGrupo}`,
          });
        });
        this.grupo = tmp;
        // this.componentLoading = false;
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
      // this.componentLoading = false;
    }).unsubscribe();
  }


  limparSelecionados() {
    this.selecionados.emit([]);

  }

  selecionado() {
   
    const todosSelecionados: number[] = [];
    this.setorSelecionado.forEach(x => todosSelecionados.push(x['item_id']));
    this.selecionados.emit(todosSelecionados);
    this._service.$selecionados.next(todosSelecionados);
    
}

}
