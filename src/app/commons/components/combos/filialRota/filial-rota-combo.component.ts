import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  ChangeDetectorRef,
  ViewRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from "@angular/core";
import { CdService } from "../../../services/center-distribution";
import { LoadingService, UtilsHelper } from "src/app/commons";
import { IDropdownSettings } from "ng-multiselect-dropdown";
import { fadeInOut } from "src/app/commons/const";
import { HttpParams } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import { FormBuilder, FormControl } from '@angular/forms';
import { debounceTime, tap } from 'rxjs/operators';
import { FilialRotaService } from 'src/app/commons/services/filial-rota';

export class FilialRotaComboConfig {
  multi?: boolean = true;
  limitSelection?: number = 999;
  placeholder?: string;
  standalone?: boolean = true;
  coldStart?: boolean;
  constructor(multi?: boolean, placeholder?: string, limitSelection?: number, standalone:boolean = true, coldStart?:boolean) {
      this.multi = isNullOrUndefined(multi) ? this.multi : multi;
      this.placeholder = placeholder;
      this.limitSelection = limitSelection;
      this.standalone = standalone;
      this.coldStart = coldStart;
  }
}
@Component({
  selector: "filial-rota-combo",
  templateUrl: "filial-rota-combo.component.html",
  styleUrls: ["filial-rota-combo.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilialRotaComboComponent implements OnInit, OnDestroy {
  @Input() config?: FilialRotaComboConfig = new FilialRotaComboConfig();
  @Output() selecionados = new EventEmitter();
  @Input() cdsSelecionados;
  @Input() control?: FormControl = new FormControl();
  dropdownSettings: IDropdownSettings;
  filialRotaSelecionados = [];
  subs = [];
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
      noDataAvailablePlaceholderText: 'CD não possuí filial rota.'
    }
  }

  constructor(
    private _service: FilialRotaService, 
    private _cdService: CdService , 
    private _fb: FormBuilder, 
    private _utils: UtilsHelper,
    private _cdr: ChangeDetectorRef,
    private _loadService: LoadingService) {
  }

  ngOnInit(): void {
    this.control = this._fb.control("");
    this.carregarSettingsComponent();
    this.consultarRotaFilial();
    this.subscriberToChanges();
    this.escutarCDSelecionados();
  }

  consultarRotaFilial(){
    if(!this.config.coldStart){
      this._service.getFilialRota(this.gerarParametro()).subscribe();
    }
  }
  get disabled(){
    return !(this._service.dataSource.value.length > 0);
  }
  gerarParametro(): HttpParams{
    let params: HttpParams = new HttpParams();
     if(!this._utils.isEmpty(this.cdsSelecionados)){
       params = params.set('cdRegional',this.cdsSelecionados)
     }
     return params;
   }

   escutarCDSelecionados(){
    if(!this.config.standalone){
      this.subs.push(this._cdService.$cdSelecionado.pipe(tap(() => this.limparSelecionados()),debounceTime(2000)).subscribe(data => {
        this.consultarRotaFilial();
      }))
    }
  }

   limparSelecionados(){
    this.filialRotaSelecionados = [];
    this.selecionados.emit(this.filialRotaSelecionados);
    this._service.$selecionados.next(this.filialRotaSelecionados );
  }

  subscriberToChanges(){
    this.subs.push(this._service.$selecionados.subscribe(data => { 
      if(data.length === 0) this.filialRotaSelecionados = [];
      if(!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
    }))
  }
  
  selecionado(event: any[]) {
    let todosSelecionados: number[] = [];
  
    if(event.length > 1){
      this.filialRotaSelecionados = event;
    }

    this.filialRotaSelecionados.forEach(x =>
      todosSelecionados.push(x["item_id"])
    );

    this.emitirEventoSelecionar(todosSelecionados);

    !this.config.multi ? this.control.setValue( todosSelecionados ) : null;
  }

  get filialRota(){
    return this._service.dataSource;
  }

  emitirEventoSelecionar(value){
    this.selecionados.emit(value);
    this._service.$selecionados.next(value);
  }

  get componentLoading(){
    return this._loadService.getStatus();
  }


  ngOnChanges() {
    // this.limparSelecionados();

    this.consultarRotaFilial();
    this.limparSelecionados();
  }

  ngOnDestroy() {
    this.subs.forEach(subscription => {
      if(subscription) subscription.unsubscribe()
    })
    }

}
