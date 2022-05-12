import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  AfterViewInit,
  ChangeDetectionStrategy,
  ViewRef,
  ChangeDetectorRef
} from "@angular/core";

import { fadeInOut, FornecedorService, UtilsHelper } from "src/app/commons";
import { CdService, FornecedorModel, LoadingService } from 'src/app/commons/services';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { HttpParams } from '@angular/common/http';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { tap } from 'rxjs/operators';

export class FornecedorComboConfig {
  multi?: boolean = true;
  placeholder?: string;
  standalone?: boolean;
  coldStart?: boolean;
  checkOperator?: boolean;


  get inputLabel() {
    return `Selecionar fornecedor${this.multi ? 'es' : ''} ${this.placeholder || ''}`
  }


  constructor(multi?: boolean, placeholder?: string, standalone?: boolean, coldStart?: boolean, checkOperator: boolean = false) {
    this.multi = isNullOrUndefined(multi) ? this.multi : multi;
    this.placeholder = placeholder;
    this.standalone = standalone;
    this.coldStart = coldStart;
    this.checkOperator = checkOperator;
  }
}

@Component({
  selector: "rd-fornecedor-combo",
  templateUrl: "fornecedor-combo.component.html",
  styleUrls: ["fornecedor-combo.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FornecedorComboComponent implements OnInit {
  @Input() config?: FornecedorComboConfig = new FornecedorComboConfig();
  @Input() control?: FormControl;
  @Input() standalone?:boolean = true;
  dropdownSettings: IDropdownSettings;

  @Output() selecionados = new EventEmitter();
  @Input()  cdsSelecionados;
  @Input() disabled: string;
  fornecedorSelecionado = [];
  subs = [];
  constructor(
    private _service: FornecedorService,
    private _cdService: CdService,
    private _loadService: LoadingService,
    private _fb: FormBuilder,
    private _utils: UtilsHelper,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.control = this.control || this._fb.control("");
    this.carregarSettingsComponent();
    if(!this.config.coldStart) {
      this.consultarFornecedor();
    }
    this.subscriberToChanges();
    this.escutarCDSelecionados();
  }

  subscriberToChanges(){
    this.subs.push(this._service.$fornecedorSelecionado.subscribe(data => {
      if(data.length === 0) this.fornecedorSelecionado = [];
      if(this.control) this.control.setValue(data)
      if(!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))
  }

  limparSelecionados(){
    this.fornecedorSelecionado = [];
    this.selecionados.emit(this.fornecedorSelecionado);
    this._service.$fornecedorSelecionado.next(this.fornecedorSelecionado);
  }

  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];

    if(event.length > 1){
      this.fornecedorSelecionado = event;
    }

    this.fornecedorSelecionado.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );

    this.selecionados.emit(todosSelecionados);
    this._service.$fornecedorSelecionado.next(todosSelecionados);
  }

  consultarFornecedor(){
    this._service.buscarTodosFornecedoresPorCds(this.gerarParametro()).subscribe(data => data);
  }

  /**
   * Método que retorna os parametros de CD
   * @returns HttpParams
   */
  gerarParametro(): HttpParams{
    let cdsSelecionados = this.cdsSelecionados || this._cdService.$cdSelecionado.value;

    let params: HttpParams = new HttpParams();
    params = params.set('cdOperador',localStorage.getItem('cdOperador'))
     if(!this._utils.isEmpty(cdsSelecionados)){
       params = params.set('cdRegional',cdsSelecionados)
     }
    params = params.set('fgCompraCd', this.config.checkOperator ? 'false' : 'true')
     return params;
   }

  /**
   * Método em que carrega as configurações do componente
   */
  carregarSettingsComponent(){
    this.dropdownSettings = {
      singleSelection: isNullOrUndefined(this.config) ? false : !this.config.multi,
      idField: "item_id",
      textField: "item_text",
      enableCheckAll:  false,
      searchPlaceholderText: 'Consultar',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false,
      limitSelection: 999,
      noDataAvailablePlaceholderText: 'Fabricante não possuí fornecedor.'
    }
  }

  get fornecedores(){
    return this._service.fornecedores;
  }

  get componentLoading(){
    return this._loadService.getStatus();
  }

  escutarCDSelecionados(){
    if(!this.standalone){
      this.subs.push(this._cdService.$cdSelecionado.pipe(tap(() => this.limparSelecionados()),debounceTime(500)).subscribe(data => {
        if(data && data.length > 0) this.consultarFornecedor();
      }))
    }
  }


  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if(subscription) subscription.unsubscribe()
    })
  }

}
