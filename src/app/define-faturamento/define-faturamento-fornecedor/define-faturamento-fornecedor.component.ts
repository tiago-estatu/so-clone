import { HttpParams } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { wrapListenerWithPreventDefault } from '@angular/core/src/render3/instructions';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonToggleChange } from '@angular/material';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CdService, fadeIn, fadeInOut, FornecedorService, HeaderService } from 'src/app/commons';
import { CentroDistribuicaoComboConfig } from 'src/app/commons/components/combos';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { FabricanteService } from 'src/app/commons/services/fabricante/fabricante.service';
import { DefineFaturamentoFornecedorService, FornecedorStore } from './define-faturamento-fornecedor.service';


@Component({
    selector: 'rd-define-faturamento-fornecedor',
    templateUrl: './define-faturamento-fornecedor.component.html',
    styleUrls: ['./define-faturamento-fornecedor.component.scss'],
    animations: [fadeInOut, fadeIn],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefineFaturamentoFornecedorComponent implements OnInit, OnDestroy {
    componentLoading = false;


    totalDeItems = 0;
    pageNumber: number = 0;
    itemsPorPagina: number = 10;
    filterForm: FormGroup;
    queryFilters: QueryFilters;
    comboConfig = new CentroDistribuicaoComboConfig(false);

    hadChange = false;


    private _subscription: Subscription;
    constructor(
        private _fb: FormBuilder,
        private _header: HeaderService,
        private defineFaturamentoService: DefineFaturamentoFornecedorService,
        private _cdService: CdService,
        private _fornecedorService: FornecedorService,
        private _fabricanteService: FabricanteService,

    ) {
    }

    ngOnInit() {
        this._header.setTitle('Sistema Faturamento CD');
        this.initForm();
        this.initQuery();


    }

    initForm() {
        this.filterForm = this._fb.group({
            cdRegional: ['', Validators.required],
            cdFornecedor: [''],
            cdFabricante: ['', Validators.required],
        })
    }

    initQuery() {
        this.queryFilters = new QueryFilters([
            new RequestParamModel('cdRegional', [], 'cdRegional'), 
            new RequestParamModel('cdFornecedor', [], 'cdFornecedor'),
            new RequestParamModel('cdFabricante', [], 'cdFabricante'),
            new RequestParamModel('size', 999, 'size')
        ], this.filterForm);
    }


    clearGrid() {
        this.defineFaturamentoService.fornecedores.next({ status: 'LOAD', data: [] })
    }

    limparCampos() {
        this.hadChange = false;

        this._cdService.limpar();
        this._fornecedorService.limpar();
        this._fabricanteService.limpar();
        this.filterForm.reset();
        this.clearGrid();
    }

    selectField(data: { field: string, data: any }) {
        let dict = { 'fc': 'cdFornecedor', 'fb': 'cdFabricante', 'cd': 'cdRegional' };
        let valueForPatch = {};
        valueForPatch[dict[data.field]] = data.data;
        this.filterForm.patchValue(valueForPatch);
        this.clearGrid()
    }


    consultar() {
        this.hadChange = false;
        const ds = this.defineFaturamentoService.getFornecedores(this.queryFilters);
    }

    isDataSourceChange() {
        const store: FornecedorStore = this.dataSource.value;
        this.hadChange = false;
        store.data.forEach(data => {
            let original = data.faturamentoOriginal;
            let alterado = data.faturamento
            if (original != alterado) {
                this.hadChange = true;
            }
        })
    }

    get dataSource() {
        return this.defineFaturamentoService.fornecedores;
    }

    getFormStatus(name: string) {
        return this.filterForm.get(name).disabled
    }


    toTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    get fornecedores() {
        return this.defineFaturamentoService.fornecedores
    }

    get fornecedorList() {
        return this._fornecedorService.fornecedores;
    }

    changeFaturamento(fornecedor) {

        fornecedor.changeFaturamento();
        this.isDataSourceChange();

    }

    updateFaturamento() {
        this.defineFaturamentoService.updateFaturamento();
        this.isDataSourceChange();

    }

    ngOnDestroy() {
        if (this._subscription) this._subscription.unsubscribe();
    }
}