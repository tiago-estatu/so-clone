import { CdService } from 'src/app/commons/services';

import { SetorCdService } from './../../../services/setor-cd/setor-cd.service';
import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectorRef, ChangeDetectionStrategy, ViewRef } from '@angular/core';
import { fadeInOut } from "src/app/commons/const";
import { FormBuilder, FormControl } from "@angular/forms";

import { isNullOrUndefined } from 'util';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { LoadingService, UtilsHelper } from "src/app/commons";
import { HttpParams } from '@angular/common/http';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { tap } from 'rxjs/operators';




export class SetorCdComboConfig {
  label?: string;
  multi?: boolean = true;
  placeholder?: string;
  standalone?: boolean;
  coldStart?: boolean;
  checkOperator?: boolean;

  get inputLabel() {
    return `Selecionar setor${this.multi ? 'es' : 'l'} ${this.label || ''}`
  }


  constructor(label?: string, multi?: boolean, placeholder?: string, standalone?: boolean, coldStart?: boolean, checkOperator: boolean = false) {
    this.label = label;
    this.multi = isNullOrUndefined(multi) ? this.multi : multi;
    this.placeholder = placeholder;
    this.standalone = standalone;
    this.coldStart = coldStart;
    this.checkOperator = checkOperator;

  }
}

@Component({
  selector: 'rd-setor-cd-combo',
  templateUrl: './setor-cd-combo.component.html',
  styleUrls: ['./setor-cd-combo.component.scss'],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush


})

export class SetorCdComboComponent implements OnInit {

  @Input() config?: SetorCdComboConfig = new SetorCdComboConfig();
  @Input() control?: FormControl;
  @Input() standalone?: boolean = true;

  @Output() selecionados = new EventEmitter();
  @Input() cdsSelecionados;
  @Input() disabled: string;

  dropdownSettings: IDropdownSettings = {};
  dropdownSetorCDLista = [];
  setorCDSelecionadoLista = [];
  subs = [];

  constructor(
    private _service: SetorCdService,
    private _cdService: CdService,
    private _loadService: LoadingService,
    private _utils: UtilsHelper,
    private _fb: FormBuilder,
    private _cdr: ChangeDetectorRef,

  ) { }

  ngOnInit() {
    this.control = this.control || this._fb.control("");
    this.carregarSettingsComponent();

    if (!this.config.coldStart) {
    this.preencherSetor();
    }

    this.subscriberToChanges();
    this.escutarCDSelecionados()

  }

  subscriberToChanges() {
    this.subs.push(this._service.$selecionados.subscribe(data => {
      if (data.length === 0) this.setorCDSelecionadoLista = []
      if (this.control) this.control.setValue(data)
      if (!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))
  }

  limparSelecionados() {
    this.setorCDSelecionadoLista = [];
    this.selecionados.emit(this.setorCDSelecionadoLista);
    this._service.$selecionados.next(this.setorCDSelecionadoLista);

  }

  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];

    if (event.length > 1) {
      this.setorCDSelecionadoLista = event;
    }

    this.setorCDSelecionadoLista.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );

    this.selecionados.emit(todosSelecionados);
    this._service.$selecionados.next(todosSelecionados);
  }

  preencherSetor() {
      this._service.buscarTodosSetoresPorCds(this.gerarFiltroSetor()).subscribe(data => data);
  }

  gerarFiltroSetor(): HttpParams {
    let todosCdSelecionados = this.cdsSelecionados || this._cdService.$cdSelecionado.value;

    let params: HttpParams = new HttpParams();
    if (!this._utils.isEmpty(todosCdSelecionados)) {
      params = params.set('cdRegional', todosCdSelecionados);
    }
    return params;
  }

  carregarSettingsComponent(){
    this.dropdownSettings = {
      singleSelection: false,
      idField: "item_id",
      textField: "item_text",
      enableCheckAll:  false,
      searchPlaceholderText: 'Consultar',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      defaultOpen: false,
      limitSelection: 999,
      noDataAvailablePlaceholderText: 'Selecione algum CD'
    }
  }

  get setores() {
    return this._service.setorCD;
  }

  get componentLoading() {
    return this._loadService.getStatus();
  }

  escutarCDSelecionados() {
    if (!this.standalone) {
      this.subs.push(this._cdService.$cdSelecionado.pipe(tap(() => this.limparSelecionados()), debounceTime(500)).subscribe(data => {
         if (data && data.length > 0) this.preencherSetor();
      }))
    }
  }

  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if (subscription) subscription.unsubscribe()
    })
  }

}

