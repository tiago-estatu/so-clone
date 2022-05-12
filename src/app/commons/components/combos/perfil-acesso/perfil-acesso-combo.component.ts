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

import { IDropdownSettings } from "ng-multiselect-dropdown";
import { fadeInOut, LoadingService, UtilsHelper } from "src/app/commons";
import { FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import Swal from 'sweetalert2';
import { PerfilAcessoService } from "src/app/commons/services/perfil-acesso";
import { config } from "rxjs";

export class PerfilAcessoComboConfig {
  multi?: boolean = false;
  placeholder?: string;
  standalone?: boolean;
  titlePerfil?: string;
  jsonComDescricao?: boolean;
  get inputLabel() {
      return `Selecionar Perfi${this.multi ? 's' : 'l'} ${this.placeholder || ''}`
  }

  constructor(multi?: boolean, placeholder?: string, standalone?: boolean, titlePerfil?: string) {
    this.multi = multi===false ? multi : this.multi;
    this.placeholder = placeholder;
    this.standalone = standalone;
    this.titlePerfil = null != titlePerfil ? titlePerfil: 'Perfil de acesso';
  }
}

@Component({
  selector: "perfil-acesso-combo",
  templateUrl: "perfil-acesso-combo.component.html",
  styleUrls: ["perfil-acesso-combo.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerfilAcessoComboComponent implements OnInit {
  placeholder: string = 'Selecionar perfil de acesso';
  tituloCombo: string = this.placeholder;
  dropdownSettings: IDropdownSettings = {};
  perfilSelecionadoLista = [];

  @Input() config?: PerfilAcessoComboConfig = new PerfilAcessoComboConfig();
  @Input() control?: FormControl = new FormControl();

  @Output() selecionados = new EventEmitter();

  subs = [];
  constructor(
    private _service: PerfilAcessoService,
    private _loadService: LoadingService,
    private _cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if(null != this.config.titlePerfil){
      this.tituloCombo = this.config.titlePerfil;
    }
    this.subs.push(this._service.$selecionado.subscribe(data => {
      if(data.length === 0) this.perfilSelecionadoLista = [];
      if(this.control) this.control.setValue(data)
      if(!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))

    this.carregarSettingsComponent();
      this.carregar();
  }


  carregar(){
    this.perfilSelecionadoLista = [];
    this._service.getAllPerfilAcesso().subscribe(
      (res) => {
      },
      (err) => {
      }
    )
  }

  haveConfig(): boolean{
    return !isNullOrUndefined(this.config);
  }

  selecionar(event) {

    let todosSelecionados: number[] = [];
    if(event.length > 1){
      this.perfilSelecionadoLista = event;
    }

    if(null != this.config.jsonComDescricao){
      todosSelecionados = this.perfilSelecionadoLista;
    }else{
      todosSelecionados = this.perfilSelecionadoLista.map(x => (x["item_id"]));
    }
    this.emitirEventoSelecionado(todosSelecionados);

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
    return this._service.dataSource;
  }

  emitirEventoSelecionado(value){
    this.selecionados.emit(value);
    this._service.$selecionado.next(value);
  }

  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if(subscription) subscription.unsubscribe()
    })
  }
}
