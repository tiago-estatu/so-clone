import {
    Component,
    OnInit,
    ViewChild,
    Output,
    EventEmitter,
    Input,
    ElementRef, OnDestroy
} from "@angular/core";
import {UtilsHelper, fadeInOut, FilialService, Filial} from "src/app/commons";

import {NewModalComponent} from "../..";
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
import {NotificationsService} from 'angular2-notifications';
import {isNullOrUndefined} from "util";

export class Config {
    onlyNumber?: boolean = false;
    multi?: boolean = true;
    label?: string;

    get inputLabel() {
        return `Selecionar filia${this.multi ? 'is' : 'l'} ${this.label || ''}`
    }

    constructor(onlyNumber?: boolean, multi?: boolean, label?: string) {
        this.onlyNumber = onlyNumber || this.onlyNumber;
        this.multi = isNullOrUndefined(multi) ? this.multi : multi;
        this.label = label;

    }
}

@Component({
    selector: "rd-filial-selector",
    templateUrl: "filial-selector.component.html",
    styleUrls: ["filial-selector.component.scss"],
    providers: [FilialService],
    animations: [fadeInOut]
})


export class FilialSelectorComponent implements OnInit, OnDestroy {
    @ViewChild(NewModalComponent) modalChild: NewModalComponent;

    totalFilial = [];

    @Output() selecionados = new EventEmitter();
    @Input() config?: Config = new Config();
    @Input() control?: FormControl = new FormControl();
    public filialControl = new FormControl();

    /*
     * FILTRO
     */
    public allFilialFound: Filial[] = [];
    filiais;
    public chipSelected: Filial[] = [];
    public filtered: Observable<Filial[]>;
    private allowFreeTextAdd = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    @ViewChild("filialInput") filialInput: ElementRef<HTMLInputElement>;
    @ViewChild("auto") matAutocomplete: MatAutocomplete;

    componentLoading = false;

    filialSelecionadoLista: [];
    listaFilial = [];

    valorTemporario = [{item_id: "", item_text: ""}];
    dropdownList = this.valorTemporario;

    controlSubscriber: Subscription;
    constructor(
        private service: FilialService,
        private formBuilder: FormBuilder,
        private _notifications: NotificationsService,
    ) {
    }

    mensagemTooltip(filial: Filial) {
        return filial.nm_fantasia;
    }

    checkNumbers($event) {
        return this.config.onlyNumber ? $event.keyCode != 69 : true;
    }

    searchByName(value) {
        this.service.getAllFilialByName(value).subscribe(
            res => {
                this.allFilialFound = res;
                this.recuperarFiltrados();
                this.componentLoading = false;
            },
            err => {
                this.componentLoading = false;
            }
        );
    }

    searchByCode(value) {
        this.service
            .getFilialByListCode(value.replace(/\s/g, ""))
            .subscribe(
                (res: Filial[]) => {
                    this.allFilialFound = res;
                    this.recuperarFiltrados();
                    this.componentLoading = false;
                },
                err => {
                    if (err.status === 404) {
                        this.notificarNaoEncontrado(this.filialControl.value);
                    }else if(err.status === 400){
                        this.notificarExcecoes(err);
                    }
                    this.componentLoading = false;
                }
            );
    }

    ngOnInit(): void {
        this.config = new Config(this.config.onlyNumber, this.config.multi, this.config.label);
        this.controlSubscriber = this.control.valueChanges.subscribe(data => {
            if(!data) {
                this.chipSelected = [];
                this.filialControl.reset();
                this.filialControl.enable();
                if(this.control.pristine) {
                    this.filtered = of([]);
                    this.filialInput.nativeElement.value = '';
                }
            }
        });
        fromEvent(this.filialInput.nativeElement, "keyup")
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
                this.control.pristine ? tap(() => {}) : distinctUntilChanged()
                // subscription for response
            )
            .subscribe(value => {
                this.componentLoading = true;
                isNaN(value.replace(/\s/g, "")) ? this.searchByName(value) : this.searchByCode(value);

            });


    }


    notificarNaoEncontrado(cd_filial: any) {
        this._notifications.error('Oops!', `Não encontramos a filial ${cd_filial}.`, {
            timeOut: 3000,
            showProgressBar: true,
            pauseOnHover: true,
            clickToClose: false
        });
    }

    notificarExcecoes(ex){
        this._notifications.error('Oops!', ex.error.mensagem, )

    }
    /**Notificar que a filial selecionado foi retirada como espelho cadastrado.
     * @param  {Filial} filial
     */
    notificarExclusaoSelecionado(filial: Filial) {
        let label = this.config.label;
        this._notifications.info(
            `Removido${!!label ? ' ' + label : ''}!`,
            filial.cd_filial + '-' + filial.nm_fantasia,
            {
                timeOut: 3000,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: false
            });
    }

    getDescriptionFilial(filial: Filial): string {
        return filial.cd_filial + ' ' + (!this.config.multi ? '- ' + filial.nm_fantasia : '');
    }

    recuperarFiltrados() {
        // FILTRO
        this.filtered = this.filialControl.valueChanges.pipe(
            startWith(null),
            map(filial => this.filterOnValueChange(filial))
        );

    }
    
    private filterOnValueChange(filial: Filial): Filial[] {
        let result: Filial[] = [];
        //
        // Remove the engineers we have already selected from all engineers to
        // get a starting point for the autocomplete list.
        let allLessSelected = this.allFilialFound.filter(
            filial => this.chipSelected.indexOf(filial) < 0
        );

        if (filial) {
            result = this.filterFilial(allLessSelected);
        } else {
            result = allLessSelected.map(filial => filial);
        }

        return result;
    }
    /**Selecionar filial
     * @param  {} filial
     */
    selecionarFilial(filial) {
        //Emitir evento apra componente pai

        this.selecionados.emit(this.chipSelected);
        this.control.setValue(this.chipSelected);
        this.control.value.length > 0 ? this.filialControl.disable() : this.filialControl.enable();
    }

    private filterFilial(lista: Filial[]): Filial[] {
        let listaFiltrados: Filial[] = [];
        let encontrados = lista.filter(
            filial =>
                filial.nm_fantasia
                    .toLowerCase()
                    .indexOf(filial.nm_fantasia.toLowerCase()) === 0
        );
        if (listaFiltrados.length || this.allowFreeTextAdd) {
            //
            // either the engineer name matched some autocomplete options
            // or the name didn't match but we're allowing
            // non-autocomplete engineer names to be entered
            //
            listaFiltrados = encontrados;
        } else {
            //
            // the engineer name didn't match the autocomplete list
            // and we're only allowing engineers to be selected from the list
            // so we show the whjole list
            //
            listaFiltrados = lista;
        }
        //
        // Convert filtered list of engineer objects to list of engineer
        // name strings and return it
        //
        return listaFiltrados.map(filial => filial);
    }

    setList() {
        let tmp = [];
        for (let i = 0; i < 1; i++) {
            tmp.push({item_id: 0, item_text: ""});
        }
        this.dropdownList = tmp;
    }
   
    private selectFilial(selecionado: Filial) {
        let encontrouTexto = this.allFilialFound.filter(
            filial => filial.nm_fantasia == selecionado.nm_fantasia
        );
        let encontrouPorCodigo = this.allFilialFound.filter(
            filial => filial.cd_filial == selecionado.cd_filial
        );
        if (encontrouTexto.length) {
            this.chipSelected.push(encontrouTexto[0]);
        } else if (encontrouPorCodigo.length) {
            this.chipSelected.push(encontrouPorCodigo[0]);
        } else {
            this.chipSelected.push({
                cd_filial: selecionado.cd_filial,
                nm_fantasia: selecionado.nm_fantasia
            });
        }
    }

    public addFilial(event): void {
        if (!this.allowFreeTextAdd) {
            // only allowed to select from the filtered autocomplete list

            return;
        }
        //
        // Only add when MatAutocomplete is not open
        // To make sure this does not conflict with OptionSelected Event
        //
        if (this.matAutocomplete.isOpen) {
            return;
        }
        this.selectFilial(event);

        this.resetInputs();
    }

    public removeFilial(filial: Filial): void {
        const index = this.chipSelected.indexOf(filial);
        if (index >= 0) {
            this.chipSelected.splice(index, 1);
            this.notificarExclusaoSelecionado(filial);
            this.resetInputs();
        }
    }

    public filialSelected(event: MatAutocompleteSelectedEvent): void {
        this.selectFilial(event.option.value);
        this.notificarSelecionado(event.option.value);
        this.resetInputs();
    }

    public options = {
        position: ["top", "right"],
        timeOut: 4000,
        lastOnBottom: true,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: false
    }

    notificarSelecionado(filial: Filial) {
        const label = this.config.label;
        this._notifications.success(
            `Selecionado${!!label ? ' ' + label : ''}!`,
            filial.cd_filial + '-' + filial.nm_fantasia,
            {
                timeOut: 3000,
                showProgressBar: true,
                pauseOnHover: true,
                clickToClose: false
            });
    }

    private resetInputs() {
        // clear input element
        this.filialInput.nativeElement.value = "";
        // clear control value and trigger engineerControl.valueChanges event
        this.filialControl.setValue([]);
        this.control.setValue(this.chipSelected);
        this.control.value.length > 0 ? this.filialControl.disable() : this.filialControl.enable();

    }

    ngOnDestroy(): void {
        if(this.controlSubscriber) this.controlSubscriber.unsubscribe();
    }

}
