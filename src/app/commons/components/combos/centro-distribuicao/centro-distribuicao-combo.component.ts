import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewRef
} from "@angular/core";
import {
  CdService,
} from "../../../services/center-distribution";

import { IDropdownSettings } from "ng-multiselect-dropdown";
import { fadeInOut, LoadingService, UtilsHelper } from "src/app/commons";
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import Swal from 'sweetalert2';

export class CentroDistribuicaoComboConfig {
  multi?: boolean = true;
  placeholder?: string;
  standalone?: boolean;
  coldStart?: boolean;
  get inputLabel() {
      return `Selecionar Centro Distribuiç${this.multi ? 'ões' : 'ão'} ${this.placeholder || ''}`
  }

  constructor(multi?: boolean, placeholder?: string, standalone?: boolean, coldStart?: boolean) {
    this.multi = multi===false ? multi : this.multi;
    this.placeholder = placeholder;
    this.coldStart = coldStart;
    this.standalone = standalone;
  }
}

@Component({
  selector: "centro-distribuicao-combo",
  templateUrl: "centro-distribuicao-combo.component.html",
  styleUrls: ["centro-distribuicao-combo.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CentroDistribuicaoComboComponent implements OnInit {
  placeholder: string = 'Selecionar centro distribuição';
  dropdownSettings: IDropdownSettings = {};
  cdSelecionadoLista = [];

  @Input() config?: CentroDistribuicaoComboConfig = new CentroDistribuicaoComboConfig();
  @Input() control?: FormControl = new FormControl();

  @Output()
  selecionados = new EventEmitter();

  subs = [];
  constructor(
    private _service: CdService,
    private _loadService: LoadingService,
    private _cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subs.push(this._service.$cdSelecionado.subscribe(data => {
      if(data.length === 0) this.cdSelecionadoLista = [];
      if(this.control) this.control.setValue(data)
      if(!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))

    this.carregarSettingsComponent();
    if(!this.config.coldStart) {
      this.carregaCD();
    }
  }


  carregaCD(){
    this.cdSelecionadoLista = [];
    this._service.getListCD().subscribe(
      (res) => {
      },
      (err) => {
      }
    )
  }

  haveConfig(): boolean{
    return !isNullOrUndefined(this.config);
  }

  selecionarCd(event) {
    let todosSelecionados: number[] = [];
    if(event.length > 1){
      this.cdSelecionadoLista = event;
    }
    todosSelecionados = this.cdSelecionadoLista.map(x => (x["item_id"]));

    this.emitirEventoCdSelecionado(todosSelecionados);

  }

  getPlaceholder(){
    this.placeholder = isNullOrUndefined(this.config) ? this.placeholder : this.config.placeholder;
  }

  showModalWarning(title?: string, content?: string, type?) {
    let options = {
        confirmButtonText: 'Ok, Obrigado',
        customClass: { confirmButton: 'setBackgroundColor',
        showCancelButton: false }
    };
    let message = {
        title: title || 'Oops!',
        html: content || 'Não foi possível realizar a ação',
        icon: type || 'warning',
    };

    Swal.fire({ ...options, ...message })

  }

  /**
   * Método em que carrega as configurações do componente
   */
  carregarSettingsComponent(){
    const todosPermitidos = this.haveConfig()? this.config.multi : false;
    this.dropdownSettings = {
      singleSelection: !todosPermitidos,
      idField: "item_id",
      textField: "item_text",
      selectAllText: !todosPermitidos ? "Selecionar Todos" : undefined,
      unSelectAllText: !todosPermitidos ? "Remover Todos" : undefined,
      enableCheckAll:  !todosPermitidos,
      searchPlaceholderText: 'Consultar',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false,
      noDataAvailablePlaceholderText: 'Não encontramos nenhum registro.'
    }
  }

  get componentLoading(){
    return this._loadService.getStatus();
  }

  get dataSource(){
    return this._service.centroDisbuicoes;
  }

  emitirEventoCdSelecionado(value){
    this.selecionados.emit(value);
    this._service.$cdSelecionado.next(value);
  }

  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if(subscription) subscription.unsubscribe()
    })
  }
}
