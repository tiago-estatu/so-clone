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
import { NewModalComponent } from "../..";

import { IDropdownSettings } from "ng-multiselect-dropdown";
import { CdService, fadeInOut, FornecedorService, LoadingService, UtilsHelper } from "src/app/commons";
import { HttpParams } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { FormControl } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';
import { FabricanteService } from 'src/app/commons/services/fabricante/fabricante.service';

export class FabricanteComboConfig {
  multi?: boolean = true;
  placeholder?: string;
  standalone?: boolean;
  coldStart?: boolean;

  get inputLabel() {
      return `Selecionar Fabricante${this.multi ? 's' : ''} ${this.placeholder || ''}`
  }

  constructor(multi?: boolean, placeholder?: string, standalone?: boolean, coldStart?: boolean) {
      this.multi = isNullOrUndefined(multi) ? this.multi : multi;
      this.placeholder = placeholder;
    this.standalone = standalone;
    this.coldStart = coldStart;
  }
}

@Component({
  selector: "rd-fabricante-combo",
  templateUrl: "fabricante-combo.component.html",
  styleUrls: ["fabricante-combo.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FabricanteComboComponent implements OnInit {
  @Input() config?: FabricanteComboConfig = new FabricanteComboConfig();
  @Input() control?: FormControl = new FormControl();
  dropdownSettings: IDropdownSettings;
  fabricanteSelecionado = [];
  @Output()
  selecionados = new EventEmitter();

  @Input()
  disabled: boolean;

  @Input() standalone?:boolean = true;

  @Input()
  cdsSelecionados;

  @Input()
  fornecedorSelecionados;

  subs = [];

  constructor(
    private _service: FabricanteService,
    private _fornecedorService: FornecedorService,
    private _cdService: CdService,
    private _utils: UtilsHelper,
    private loadService: LoadingService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarSettingsComponent();
    this.subscriberToChanges();
    if(!this.config.coldStart) {
      this.preencheFabricante();
    }
    if(!this.standalone){
      this.CDSelecionados()
      this.FornecedoresSelecionados();
    }
  }

  /**
   * Método em que carrega as configurações do componente
   */
  carregarSettingsComponent(){
    this.dropdownSettings = {
      singleSelection: isNullOrUndefined(this.config) ? false : !this.config.multi,
      idField: "item_id",
      textField: "item_text",
      searchPlaceholderText: 'Consultar',
      selectAllText: "Selecionar Todos",
      unSelectAllText: "Remover Todos",
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false,
      limitSelection: 999,
      noDataAvailablePlaceholderText: 'CD não possuí fabricantes.'
    }
  }

  subscriberToChanges(){
    this.subs.push(this._service.$fabricantesSelecionado.subscribe(data => {
      if(data.length === 0) this.fabricanteSelecionado = [];
      if(!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))
  }

  limparSelecionados(){
    this.fabricanteSelecionado = [];
    this.selecionados.emit(this.fabricanteSelecionado);
    this._service.limpar();
  }



  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];

    if(event.length > 1){
      this.fabricanteSelecionado = event;
    }
    this.fabricanteSelecionado.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );
    this.selecionados.emit(todosSelecionados);
    this._service.$fabricantesSelecionado.next(todosSelecionados)
  }

  preencheFabricante() {
    this._service.buscarTodosFabricantes(this.gerarParametro()).subscribe(
      (res) => {
        this.disabled = false
      },
      (error) => {
        this.limparSelecionados();
        this.limparGrid();
        this.disabled = true;
      }
    );

  }
  limparGrid(){
    this._service.fabricantes.next([]);
  }
  get componentLoading(){
    return this.loadService.getStatus();
  }

 /**
   * Método que retorna os parametros de CD
   * @returns HttpParams
   */
  gerarParametro(): HttpParams{
    let cdsSelecionados = this.cdsSelecionados || this._cdService.$cdSelecionado.value;
    let fornecedorSelecionados = this.fornecedorSelecionados || this._fornecedorService.$fornecedorSelecionado.value;
    let params: HttpParams = new HttpParams();
     if(!this._utils.isEmpty(cdsSelecionados)){
       params = params.set('cdRegional',cdsSelecionados)
     }
     if(!this._utils.isEmpty(fornecedorSelecionados)){
      params = params.set('cdFornecedor',fornecedorSelecionados)
    }
     return params;
   }

   get fabricantes(){
    return this._service.fabricantes;
  }

  CDSelecionados(){
    this.subs.push(this._cdService.$cdSelecionado.pipe(debounceTime(500)).subscribe(data => {
      this.limparSelecionados();
    }))

  }

  FornecedoresSelecionados(){
    this.subs.push(this._fornecedorService.$fornecedorSelecionado.pipe(debounceTime(500)).subscribe(data =>{
      this.preencheFabricante();
      this.limparSelecionados();
    }))
  }


  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if(subscription) subscription.unsubscribe()
    })
  }
}
