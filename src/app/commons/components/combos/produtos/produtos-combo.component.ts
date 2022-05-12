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

import {ProdutoService} from "src/app/commons";
import {Produto} from "src/app/commons/services/classes/Produto";

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

export class ProdutosComboConfig {
    onlyNumber?: boolean = false;
    multi?: boolean = true;
    label?: string;
    outline?: boolean = false;
    get inputLabel() {
        return `Selecionar produto${this.multi ? 's' : ''} ${this.label && this.outline == false ? this.label : ''}`
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
    selector: "produto-combo",
    templateUrl: "produtos-combo.component.html",
    styleUrls: ["produtos-combo.component.scss"],
    providers: [FilialService, CdService],
    animations: [fadeInOut]
})


export class ProdutoComboComponent implements OnInit, OnDestroy {
    @ViewChild(NewModalComponent) modalChild: NewModalComponent;

    totalProdutos = [];

    @Output() selecionados = new EventEmitter();
    @Input() porCategorias;
    @Input() config?: ProdutosComboConfig = new ProdutosComboConfig();
    @Input() control?: FormControl = new FormControl();
    public produtoControl = new FormControl();

    /*
     * FILTRO DE PRODUTO
     */
    public todosProdutos: Produto[] = [];
    produtos;
    public chipSelectedProdutos: Produto[] = [];
    public filteredProdutos: Observable<Produto[]>;
    private allowFreeTextAddProduto = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    @ViewChild("produtoInput") produtoInput: ElementRef<HTMLInputElement>;
    @ViewChild("auto") matAutocomplete: MatAutocomplete;

    componentLoading = false;

    produtoSelecionadoLista: [];
    listaProdutos = [];

    valorTemporario = [{item_id: "", item_text: ""}];
    dropdownProdutoList = this.valorTemporario;

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
        private produtoService: ProdutoService,
        private formBuilder: FormBuilder,
        private _notifications: NotificationsService,
    ) {
    }

    mensagemTooltip(produto: Produto) {
        return produto.dsProduto;
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
        this.produtoService.getProdutoContainsNome(value).subscribe(
            res => {
                this.todosProdutos = res;
                this.recuperarProdutosFiltrados();
                this.componentLoading = false;
            },
            err => {
                this.componentLoading = false;
            }
        );
    }

    searchByCode(value) {
        this.produtoService
            .getProdutoByIdVenda(value.replace(/\s/g, ""))
            .subscribe(
                (res: Produto) => {
                    let resProdutos: Produto[] = [];
                    let prod: Produto = {
                        cdProduto: res.cdProduto,
                        dsProduto: res.dsProduto
                    };
                    resProdutos.push(prod);
                    this.todosProdutos = resProdutos;
                    this.recuperarProdutosFiltrados();
                    this.componentLoading = false;
                },
                err => {
                    if (err.status === 404 || err.status === 400) {
                        this.notificarProdutoNaoEncontrado(this.produtoControl.value);
                    }
                    this.componentLoading = false;
                }
            );
    }

    ngOnInit(): void {
        this.config = new ProdutosComboConfig(this.config);
        if(!!this.control.value) this.chipSelectedProdutos = this.control.value
        this.controlSubscriber = this.control.valueChanges.subscribe(data => {
            if (!data) {
                this.chipSelectedProdutos = [];
                this.produtoControl.reset();
                this.produtoControl.enable();
                if (this.control.pristine) {
                    this.filteredProdutos = of([]);
                    this.produtoInput.nativeElement.value = '';
                }
            }
        });
        fromEvent(this.produtoInput.nativeElement, "keyup")
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


    notificarProdutoNaoEncontrado(productId: any) {
        this._notifications.error('Oops!', `Não encontramos o produto ${productId}.`, {
            timeOut: 3000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: false
        });
    }

    notificarExclusaoProdutoSelecionado(produto: Produto) {
        let label = this.config.label;
        this._notifications.info(
            `Removido${!!label ? ' ' + label : ''}!`,
            produto.cdProduto + '-' + produto.dsProduto,
            {
                timeOut: 3000,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: false
            });
    }


    ngOnChanges() {
    }

    getDescriptionProduct(produto: Produto): string {
        return produto.cdProduto + ' ' + (!this.config.multi ? '- ' + produto.dsProduto : '');
    }

    recuperarProdutosFiltrados() {
        // FILTRO DE PRODUTO
        this.filteredProdutos = this.produtoControl.valueChanges.pipe(
            startWith(null),
            map(produto => this.filterOnValueChange(produto))
        );

    }

    private filterOnValueChange(produto: Produto): Produto[] {
        let result: Produto[] = [];
        //
        // Remove the engineers we have already selected from all engineers to
        // get a starting point for the autocomplete list.

        let allProdutosLessSelected = this.todosProdutos.filter(
            produto => this.chipSelectedProdutos.indexOf(produto) < 0
        );

        if (produto) {
            result = this.filterProduto(allProdutosLessSelected);
        } else {
            result = allProdutosLessSelected.map(produto => produto);
        }

        return result;
    }

    enableDisable() {
        //habilitar desabilitar field

        (!!this.control.value && this.control.value.length > 0) && !this.config.multi ? this.produtoControl.disable() : this.produtoControl.enable();
    }

    private filterProduto(listaProdutos: Produto[]): Produto[] {
        let listaProdutoFiltrados: Produto[] = [];
        let produtosEncontrados = listaProdutos.filter(
            produto =>
                produto.dsProduto
                    .toLowerCase()
                    .indexOf(produto.dsProduto.toLowerCase()) === 0
        );
        if (listaProdutoFiltrados.length || this.allowFreeTextAddProduto) {
            //
            // either the engineer name matched some autocomplete options
            // or the name didn't match but we're allowing
            // non-autocomplete engineer names to be entered
            //
            listaProdutoFiltrados = produtosEncontrados;
        } else {
            //
            // the engineer name didn't match the autocomplete list
            // and we're only allowing engineers to be selected from the list
            // so we show the whjole list
            //
            listaProdutoFiltrados = listaProdutos;
        }
        //
        // Convert filtered list of engineer objects to list of engineer
        // name strings and return it
        //
        return listaProdutoFiltrados.map(produto => produto);
    }

    setProdutoList() {
        let tmp = [];
        for (let i = 0; i < 1; i++) {
            tmp.push({item_id: 0, item_text: ""});
        }
        this.dropdownProdutoList = tmp;
    }



    private selectProduto(produtoSelecionado: Produto) {


        let encontrouProdutoTexto = this.todosProdutos.filter(
            produto => produto.dsProduto == produtoSelecionado.dsProduto
        );
        let encontrouProdutoCodigo = this.todosProdutos.filter(
            produto => produto.cdProduto == produtoSelecionado.cdProduto
        );
        if (encontrouProdutoTexto.length) {
            this.chipSelectedProdutos.push(encontrouProdutoTexto[0]);
        } else if (encontrouProdutoCodigo.length) {
            this.chipSelectedProdutos.push(encontrouProdutoCodigo[0]);
        } else {
            this.chipSelectedProdutos.push({
                dsProduto: produtoSelecionado.dsProduto,
                cdProduto: produtoSelecionado.cdProduto
            });
        }
        this.selecionados.emit(this.chipSelectedProdutos);
    }

    public addProduto(event): void {
        if (!this.allowFreeTextAddProduto) {

            return;
        }
       
        if (this.matAutocomplete.isOpen) {
            return;
        }
        this.selectProduto(event);

        this.resetInputs();
    }

    public removeProduto(produto: Produto): void {
        const index = this.chipSelectedProdutos.indexOf(produto);
        if (index >= 0) {
            this.chipSelectedProdutos.splice(index, 1);
            this.notificarExclusaoProdutoSelecionado(produto);
            this.resetInputs();
        }
    }

    public produtoSelected(event: MatAutocompleteSelectedEvent): void {
        this.selectProduto(event.option.value);
        this.nottificarProdutoSelecionado(event.option.value);
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

    nottificarProdutoSelecionado(produto: Produto) {
        const label = this.config.label;
        this._notifications.success(
            `Selecionado${!!label ? ' ' + label : ''}!`,
            produto.cdProduto + '-' + produto.dsProduto,
            {
                timeOut: 3000,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: false
            });
    }

    private resetInputs() {
        // clear input element

        this.produtoInput.nativeElement.value = "";
        // clear control value and trigger engineerControl.valueChanges event
        this.produtoControl.setValue([]);
        this.control.setValue(this.chipSelectedProdutos);
        this.enableDisable();

    }


    ngOnDestroy(): void {
        if (this.controlSubscriber) this.controlSubscriber.unsubscribe();
    }

}
