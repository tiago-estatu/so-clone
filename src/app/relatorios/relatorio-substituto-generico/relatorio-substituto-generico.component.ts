import { Component, OnDestroy, OnInit } from '@angular/core';
import { QueryFilters } from "../../commons/models/query-param.model";
import { RequestParamModel } from "../../commons/models/request-param.model";
import { ValidatorHelper } from "../../commons/helpers";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { SubstitutoGenericoService } from "../../commons/services/substituto-generico/substituto-generico.service";
import { HeaderService, Produto } from "../../commons/services";
import { catchError, switchMap } from "rxjs/operators";
import { of, Subscription, throwError } from "rxjs";
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut } from 'src/app/commons';

@Component({
    selector: 'rd-relatorio-substituto-generico',
    templateUrl: './relatorio-substituto-generico.component.html',
    styleUrls: ['./relatorio-substituto-generico.component.scss'],
    animations: [fadeInOut]

})
export class RelatorioSubstitutoGenericoComponent implements OnInit, OnDestroy {

    filters: QueryFilters;
    private _validator = new ValidatorHelper();
    filterForm: FormGroup;
    componentLoading = false;
    productSubscription: Subscription;
    cdOperador = localStorage.getItem('cdOperador');

    constructor(
        private _substitutoGenericoService: SubstitutoGenericoService,
        private _fb: FormBuilder,
        private _headerService: HeaderService) {
    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }

    handleProductError(err) {
        err.error.title = {
            400: 'Produto inválido',
            404: 'Produto não encontrado',
            500: 'Não e possível selecionar o produto'
        };
        this.filterForm.get('produto').reset();
        this._substitutoGenericoService.showError(err);
        return of(true)
    }

    ngOnInit() {
        // init filters with the keys and the form to be attached
        this.filters = new QueryFilters(
            [
                new RequestParamModel('cdProduto', null, 'produto', (val) => val[0] ? val[0].cdProduto : ''),
                new RequestParamModel('dtInicio', null, 'initial', this._validator.formataData),
                new RequestParamModel('dtFim', null, 'final', this._validator.formataData),
                new RequestParamModel('cdOperador', this.cdOperador.toString())
            ],
            this.initForm());
        this._headerService.setTitle('Relatório de Substitutos');
        this.initSubscription();
    }

    /**
     * Validates a product with the service the data argument is truthy
     * Handles the validation errors
     * @param data: Produto[]
     * @returns Observable<bool | any> a true observable or a http response observable
     */
    validateProduct(data: Produto[]) {
        return !data || !data[0]
            ?
            of(true)
            :
            // Pipe to catch error preventing the switchMap to stop streaming once a error is reach
            this._substitutoGenericoService.validate(data[0].cdProduto)
                .pipe(catchError(err => this.handleProductError(err)))
    }

    initSubscription() {
        this.productSubscription = this.filterForm.get('produto').valueChanges
            .pipe(switchMap(data => this.validateProduct(data)))
            .subscribe(data => { }, err => this.handleProductError(err))
    }

    initForm(): FormGroup {
        this.filterForm = this._fb.group({
            produto: [null],
            initial: [new Date()],
            final: [new Date()]
        });
        return this.filterForm;
    }

    gerarRelatorioViaEmail() {
        this.componentLoading = true;

        this._substitutoGenericoService.validate(this.filters.getParam('produto', true))
            .pipe(
                switchMap(result => {
                    return result ? this._substitutoGenericoService.chamadaApiConsulta(this.filters) : throwError(result);
                })
            )
            .subscribe(data => {
                this.componentLoading = false;
                this.showModalConfig(`${data.type}`, `${data.mensagem}`, 'success');
            }, err => this.handleError(err));
    }

    // downloads the current active subsitutes
    exportCurrentList(): void {
        this._substitutoGenericoService.downloadActives(this.filters);
    }

    // get abstract control as FormControl
    getControl(group: FormGroup, control: string): FormControl {
        return group.get(control) as FormControl
    }

    resetForm() {
        let date = new Date();
        this.filterForm.reset({ initial: date, final: date })
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        this.componentLoading = false
        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
        } else if (error.status === 0 || error.status === 400 || error.status === 500) {
            this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        } else {
            this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        }
    }


    // dettach formGroup from the filters
    ngOnDestroy(): void {
        this.filters.dettachForm();
        if (this.productSubscription) this.productSubscription.unsubscribe();
    }



}
