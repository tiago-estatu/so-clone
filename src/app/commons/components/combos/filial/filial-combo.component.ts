import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ViewRef,
} from "@angular/core";
import { CdService } from "../../../services/center-distribution";
import { FilialService, FilialRegiaoModel } from "../../../services/filial";
import { LoadingService, UtilsHelper } from "src/app/commons";
import { fadeInOut } from "src/app/commons/const";
import {FormControl} from "@angular/forms";
import { isNullOrUndefined } from 'util';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { debounceTime, tap } from 'rxjs/operators';
import { FilialRotaService } from 'src/app/commons/services/filial-rota';
import { Subscription } from 'rxjs/internal/Subscription';
import { HttpParams } from '@angular/common/http';

export class FilialComboConfig {
  multi?: boolean = true;
  label?: string;
  coldStart?: boolean;
  get inputLabel() {
      return `Selecionar filia${this.multi ? 'is' : 'l'} ${this.label || ''}`
  }

  constructor(multi?: boolean, label?: string, coldStart?: boolean) {
      this.multi = isNullOrUndefined(multi) ? this.multi : multi;
      this.label = label;
      this.coldStart = coldStart;
  }
}

@Component({
  selector: "filial-combo",
  templateUrl: "filial-combo.component.html",
  styleUrls: ["filial-combo.component.scss"],
  animations: [fadeInOut]
})
export class FilialComboComponent implements OnInit {
  dropdownSettings: IDropdownSettings = {};

  @Input() config?: FilialComboConfig = new FilialComboConfig();
  @Input() control?: FormControl = new FormControl();
  @Output() selecionados = new EventEmitter();
  @Input()  cdsSelecionados;
  @Input()  regSelecionados;
  @Input()  rotasSelecionadas;
  @Input()  standalone?: boolean = true;
  dropdownFilialLista = [];
  filialSelecionadoLista = [];
  subs = [];

  subscriptionFilialRota: Subscription;

  constructor(
    private _service: FilialService, 
    private _filialRotaService: FilialRotaService, 
    private _utils: UtilsHelper,
    private _loadService: LoadingService) {}

  ngOnInit(): void {
    this.config = new FilialComboConfig(this.config.multi, this.config.label);
    this.carregarSettingsComponent();
    this.subscriberToChanges();
    
    this.preencherFilial();
  }

  carregarSettingsComponent(){
    this.dropdownSettings = {
      singleSelection: !this.config.multi,
      idField: "item_id",
      textField: "item_text",
      selectAllText: this.config.multi ? "Selecionar Todos" : undefined,
      unSelectAllText: this.config.multi ? "Remover Todos" : undefined,
      enableCheckAll:  this.config.multi,
      searchPlaceholderText: 'Consultar',
      itemsShowLimit: 2,
      limitSelection: this.config.multi ? 998 : 2,
      allowSearchFilter: true,
      defaultOpen: false,
      noDataAvailablePlaceholderText: 'Não encontramos filiais com estes filtros.',
    }
  }

  get filiais(){
    return this._service.filiais;
  }

  preencherFilial(){
    if(!this.config.coldStart) {
      this._service.getAllFilialByCdRegiao(this.gerarFiltroFilial()).subscribe();
    }
  }

  get disabled(){
    return !(this._service.filiais.value.length > 0);
  }
  get componentLoading(){
    return this._loadService.getStatus();
  }

  limparSelecionados(){
    this.filialSelecionadoLista = [];
    this.selecionados.emit([]);
  }

  gerarFiltroFilial(): HttpParams{
   let params: HttpParams = new HttpParams();
    if(!this._utils.isEmpty(this.cdsSelecionados)){
      params = params.set('cdRegional', this.cdsSelecionados);
    }
    if(!this._utils.isEmpty(this.regSelecionados)){
      params = params.set('cdFilialRegiaoMacro', this.regSelecionados);
    }
    if(!this._utils.isEmpty(this.rotasSelecionadas)){
      params = params.set('cdFilialRota', this.rotasSelecionadas);
    }

    return params;
  }

  selecionado(event) {
    let todosSelecionados: number[] = [];

    if(event.length > 1){
      this.filialSelecionadoLista = event;
    }

    this.filialSelecionadoLista.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
    this._service.$selecionados.next(todosSelecionados);
    !this.config.multi ? this.control.setValue( todosSelecionados ) : null;
  }

  subscriberToChanges(){
    this.subs.push(this._service.$selecionados.subscribe(data => { 
      if(data.length === 0) this.filialSelecionadoLista = []
    }))
  }
}
