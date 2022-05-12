import { LocalizacaoFilialCdService } from './../../../services/localizacao-filial-cd-service';
// import { LocalizacaoCdFilialService } from '../../../services/localizacao-cd-filial-service/localizacao-filial-cd-service';
import {
  Component,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  Input,
  ElementRef, OnDestroy
} from "@angular/core";
import {CdService} from "../../../services/center-distribution";
import {FilialService} from "../../../services/filial";
import {UtilsHelper, fadeInOut} from "src/app/commons";

import {LocalizacaoCdFilial} from "src/app/commons/services/classes/LocalizacaoCdFilial";

import {NewModalComponent} from "../..";
import {IDropdownSettings} from "ng-multiselect-dropdown";
import {Observable, fromEvent, Subscription, of} from "rxjs";
import {FormControl, FormBuilder, FormGroup} from "@angular/forms";
import {ENTER, COMMA} from "@angular/cdk/keycodes";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent
} from "@angular/material";
import {
  filter,
  map,
  debounceTime,
  distinctUntilChanged,
  startWith,
  tap
} from "rxjs/operators";
import {NotificationsService, NotificationType} from 'angular2-notifications';
import {isNullOrUndefined} from "util"; 

export class LocalizacaoCdFilialComboConfig {
  onlyNumber?: boolean = false;
  multi?: boolean = true;
  label?: string;
  outline?: boolean = false;
  
  get inputLabel() {
      return `${this.multi ? 'Selecionar localizações' : 'Selecionar localização'} ${this.label && this.outline == false ? this.label : ''}`
  }

  constructor(conf?: {onlyNumber?: boolean, multi?: boolean, label?: string, outline?: boolean}) {
      conf = conf || {};
      this.onlyNumber = conf.onlyNumber || this.onlyNumber;
      this.multi = isNullOrUndefined(conf.multi) ? this.multi : conf.multi;
      this.label = conf.label;
      this.outline = conf.outline || false;

  }
}

@Component({
  selector: "localizacao-cd-filial-combo",
  templateUrl: "localizacao-cd-filial-combo.component.html",
  styleUrls: ["localizacao-cd-filial-combo.component.scss"],
  providers: [FilialService, CdService],
  animations: [fadeInOut]
})

export class LocalizacaoCdFilialComboComponent implements OnInit , OnDestroy {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  totalLocalizacao = [];

  @Output() selecionados = new EventEmitter();
  @Input() porCategorias;
  @Input() config?: LocalizacaoCdFilialComboConfig = new LocalizacaoCdFilialComboConfig();
  @Input() control?: FormControl = new FormControl();
  public localizacaoControl = new FormControl();

  /*
   * FILTRO DE LocalizacaoCdFilial
   */
  public tadasLocalizacoes: LocalizacaoCdFilial[] = [];
  localizacao;
  public chipSelectedLocalizacao: LocalizacaoCdFilial[] = [];
  public filteredLocalizacao: Observable<LocalizacaoCdFilial[]>;
  private allowFreeTextAddLocalizacao = false;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  @ViewChild("LocalizacaoInput") LocalizacaoInput: ElementRef<HTMLInputElement>;
  @ViewChild("auto") matAutocomplete: MatAutocomplete;

  componentLoading = false;

  localizacaoSelecionadoLista: [];
  listaLocalizacao = [];

  valorTemporario = [{item_id: "", item_text: ""}];
  dropdownLocalizacaoList = this.valorTemporario;

  //DROPLIST SETTINGS
  dropdownSettings: IDropdownSettings = {
      singleSelection: false,
      idField: "item_id",
      textField: "item_text",
      selectAllText: "Selecionar Todos",
      unSelectAllText: "Remover Todos",
      itemsShowLimit: 1,
      allowSearchFilter: true,
      defaultOpen: false
  };

  controlSubscriber: Subscription;

  constructor(
      private LocalizacaoService: LocalizacaoFilialCdService,
      private formBuilder: FormBuilder,
      private _notifications: NotificationsService,
  ) {
  }

  mensagemTooltip(localizacao: LocalizacaoCdFilial) {
      return localizacao.cdLocalizacao;
  }

  checkNumbers($event) {
      return this.config.onlyNumber ? $event.keyCode != 69 : true;
  }
  
  //PERMITIR KEY SOMENTE NUMEROS
  keyPress(event) {
      if((event.keyCode < 48) || (event.keyCode > 57)){
      event.preventDefault()
      }
  }

  searchByName(value) {
      this.LocalizacaoService.getLocalizacaoContainsNome(value).subscribe(
          res => {
              this.tadasLocalizacoes = res;
              this.recuperarLocalizacaoFiltrados();
              this.componentLoading = false;
          },
          err => {
              this.componentLoading = false;
          }
      );
  }

  searchByCode(value) {
      this.LocalizacaoService
          .getLocalizacaoByIdVenda(value.replace(/\s/g, ""))
          .subscribe(
              (res: LocalizacaoCdFilial) => {

                  let resLocalizacao: LocalizacaoCdFilial[] = [];
                  let prod: LocalizacaoCdFilial = {
                      cdLocalizacao: res[0].cdLocalizacao,
                      nmLocalizacao: res[0].nmLocalizacao
                  };
                  resLocalizacao.push(prod);
                  this.tadasLocalizacoes = resLocalizacao;
                  this.recuperarLocalizacaoFiltrados();
                  this.componentLoading = false;
              },
              err => {
                  if (err.status === 404 || err.status === 400) {
                      this.notificarLocalizacaoNaoEncontrado(this.localizacaoControl.value);
                  }
                  this.componentLoading = false;
              }
          );
  }

  ngOnInit(): void {
      this.config = new LocalizacaoCdFilialComboConfig(this.config);
      if(!!this.control.value) this.chipSelectedLocalizacao = this.control.value
      this.controlSubscriber = this.control.valueChanges.subscribe(data => {
          if (!data) {
              this.chipSelectedLocalizacao = [];
              this.localizacaoControl.reset();
              this.localizacaoControl.enable();
              if (this.control.pristine) {
                  this.filteredLocalizacao = of([]);
                  this.LocalizacaoInput.nativeElement.value = '';
              }
          }
      });
      fromEvent(this.LocalizacaoInput.nativeElement, "keyup")
          .pipe(
              // get value
              map((event: any) => {
                  return event.target.value;
              }),
              // if character length greater then 1
              filter(res => res.length >= 1),
              // Time in milliseconds between key events
              debounceTime(1000),
              // If previous query is diffent from current, but the field is not pristine
              this.control.pristine ? tap(() => {
              }) : distinctUntilChanged()
              // subscription for response
          )
          .subscribe(value => {
              this.componentLoading = true;
              isNaN(value.replace(/\s/g, "")) ? this.searchByName(value) : this.searchByCode(value);

          });


  }


  notificarLocalizacaoNaoEncontrado(localizacaoId: any) {
      this._notifications.error('Oops!', `Não encontramos a localização ${localizacaoId}.`, {
          timeOut: 3000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: false
      });
  }

  notificarExclusaoLocalizacaoSelecionado(localizacao: LocalizacaoCdFilial) {
      let label = this.config.label;
      this._notifications.info(
          `Removido${!!label ? ' ' + label : ''}!`,
          localizacao.cdLocalizacao + '-' + localizacao.nmLocalizacao,
          {
              timeOut: 3000,
              showProgressBar: true,
              pauseOnHover: true,
              clickToClose: false
          });
  }


  ngOnChanges() {
  }

  getDescriptionlocalization (localizacao: LocalizacaoCdFilial): string {
      return localizacao.cdLocalizacao + ' ' + (!this.config.multi ? '- ' + localizacao.nmLocalizacao : '');
  }

  recuperarLocalizacaoFiltrados() {
      // FILTRO DE LOCALIZAÇÃO
      this.filteredLocalizacao = this.localizacaoControl.valueChanges.pipe(
          startWith(null),
          map(localizacao => this.filterOnValueChange(localizacao))
      );

  }

  private filterOnValueChange(localizacao: LocalizacaoCdFilial): LocalizacaoCdFilial[] {
      let result: LocalizacaoCdFilial[] = [];
      //
      // Remove the engineers we have already selected from all engineers to
      // get a starting point for the autocomplete list.

      let allLocalizacaoLessSelected = this.tadasLocalizacoes.filter(
          localizacao => this.chipSelectedLocalizacao.indexOf(localizacao) < 0
      );

      if (localizacao) {
          result = this.filterLocalizacao(allLocalizacaoLessSelected);
      } else {
          result = allLocalizacaoLessSelected.map(localizacao => localizacao);
      }

      return result;
  }

  enableDisable() {
      //habilitar desabilitar field

      (!!this.control.value && this.control.value.length > 0) && !this.config.multi ? this.localizacaoControl.disable() : this.localizacaoControl.enable();
  }

  private filterLocalizacao(listaLocalizacao: LocalizacaoCdFilial[]): LocalizacaoCdFilial[] {
      let listaLocalizacaoFiltrados: LocalizacaoCdFilial[] = [];
      let localizacaoEncontradas = listaLocalizacao.filter(
          localizacao =>
              localizacao.nmLocalizacao
                  .toLowerCase()
                  .indexOf(localizacao.nmLocalizacao.toLowerCase()) === 0
      );
      if (listaLocalizacaoFiltrados.length || this.allowFreeTextAddLocalizacao) {
          //
          // either the engineer name matched some autocomplete options
          // or the name didn't match but we're allowing
          // non-autocomplete engineer names to be entered
          //
          listaLocalizacaoFiltrados = localizacaoEncontradas;
      } else {
          //
          // the engineer name didn't match the autocomplete list
          // and we're only allowing engineers to be selected from the list
          // so we show the whjole list
          //
          listaLocalizacaoFiltrados = listaLocalizacao;
      }
      //
      // Convert filtered list of engineer objects to list of engineer
      // name strings and return it
      //
      return listaLocalizacaoFiltrados.map(localizacao => localizacao);
  }

  setLocalizacaoList() {
      let tmp = [];
      for (let i = 0; i < 1; i++) {
          tmp.push({item_id: 0, item_text: ""});
      }
      this.dropdownLocalizacaoList = tmp;
  }

  private selectLocalizacao(localizacaoSelecionada: LocalizacaoCdFilial) {


      let encontrouLocalizacaoTexto = this.tadasLocalizacoes.filter(
          localizacao => localizacao.nmLocalizacao == localizacaoSelecionada.nmLocalizacao
      );
      let encontrouLocalizacaoCodigo = this.tadasLocalizacoes.filter(
          localizacao => localizacao.cdLocalizacao == localizacaoSelecionada.cdLocalizacao
      );
      if (encontrouLocalizacaoTexto.length) {
          this.chipSelectedLocalizacao.push(encontrouLocalizacaoTexto[0]);
      } else if (encontrouLocalizacaoCodigo.length) {
          this.chipSelectedLocalizacao.push(encontrouLocalizacaoCodigo[0]);
      } else {
          this.chipSelectedLocalizacao.push({
              nmLocalizacao: localizacaoSelecionada.nmLocalizacao,
              cdLocalizacao: localizacaoSelecionada.cdLocalizacao
          });
      }
      this.selecionados.emit(this.chipSelectedLocalizacao);
  }

  public addLocalizacao(event): void {
      if (!this.allowFreeTextAddLocalizacao) {

          return;
      }
     
      if (this.matAutocomplete.isOpen) {
          return;
      }
      this.selectLocalizacao(event);

      this.resetInputs();
  }

  public removeLocalizacao(localizacao: LocalizacaoCdFilial): void {
      const index = this.chipSelectedLocalizacao.indexOf(localizacao);
      if (index >= 0) {
          this.chipSelectedLocalizacao.splice(index, 1);
          this.notificarExclusaoLocalizacaoSelecionado(localizacao);
          this.resetInputs();
      }
  }

  public localizacaoSelected(event: MatAutocompleteSelectedEvent): void {
      this.selectLocalizacao(event.option.value);
      this.nottificarLocalizacaoSelecionado(event.option.value);
      this.resetInputs();
  }

  public options = {
      position: ["top", "right"],
      timeOut: 4000,
      lastOnBottom: true,
      showProgressBar: true,
      pauseOnHover: true,
      clickToClose: false
  };

  nottificarLocalizacaoSelecionado(lozalizacao: LocalizacaoCdFilial) {
      const label = this.config.label;
      this._notifications.success(
          `Selecionado${!!label ? ' ' + label : ''}!`,
          lozalizacao.cdLocalizacao + '-' + lozalizacao.nmLocalizacao,
          {
              timeOut: 3000,
              showProgressBar: true,
              pauseOnHover: true,
              clickToClose: false
          });
  }

  private resetInputs() {
      // clear input element

      this.LocalizacaoInput.nativeElement.value = "";
      // clear control value and trigger engineerControl.valueChanges event
      this.localizacaoControl.setValue([]);
      this.control.setValue(this.chipSelectedLocalizacao);
      this.enableDisable();

  }

  ngOnDestroy(): void {
      if (this.controlSubscriber) this.controlSubscriber.unsubscribe();
  }

}
