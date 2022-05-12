import { UtilsHelper } from './../../commons/helpers/utils.helper';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServicePath } from 'src/app/commons';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { LoadingService } from 'src/app/commons/services/loading';
import Swal from 'sweetalert2';


export class FaturamentoFornecedorModel {
    cdCentroDistribuicao: number;
    cdFabricante: number;
    dsFabricante: string;
    cdFornecedor: number;
    dsFornecedor: string;
    faturamento: 'SO' | 'ABF';
    faturamentoOriginal: 'SO' | 'ABF';

    get fornecedor() {
        return `${this.cdFornecedor} - ${this.dsFornecedor}`
    }
    get fabricante() {
        return `${this.cdFabricante} - ${this.dsFabricante}`
    }

    changeFaturamento() {
        this.faturamento = this.faturamento == 'SO' ? 'ABF' : 'SO';
        return this;
    }

    constructor(_) {
        this.cdCentroDistribuicao = _.cdRegional;
        this.cdFabricante = _.cdFabricante;
        this.dsFabricante = _.dsFabricante;
        this.cdFornecedor = _.cdFornecedor;
        this.dsFornecedor = _.dsFornecedor;
        this.faturamento = _.flAbastecimentoSo == 0 ? 'ABF' : 'SO';
        this.faturamentoOriginal = _.flAbastecimentoSo == 0 ? 'ABF' : 'SO';;

    }
}

export class FornecedorStore {
    data: FaturamentoFornecedorModel[];
    status: 'LOAD' | 'ERROR' | 'READY'
}

@Injectable()
export class DefineFaturamentoFornecedorService {
    _fornecedores = new Array(10).fill(0).map((_, idx) => {
        return new FaturamentoFornecedorModel({
            cdCentroDistribuicao: idx,
            cdFabricante: idx,
            dsFabricante: `fabricante ${idx}`,
            cdFornecedor: idx,
            dsFornecedor: `fornecedor ${idx}`,
            faturamento: idx % 3 ? 'SO' : 'ABF'
        })
    });
    fornecedores: BehaviorSubject<FornecedorStore> = new BehaviorSubject({ data: [], status: 'LOAD' });

    baseUrl = ServicePath.HTTP_URL_AGENDA_ABASTECIMENTO + 'faturamentoFornecedor';
    endpoints = {
        fetch: '',
        save: '/atualizar'
    }
    constructor(private _http: HttpClient, private _loader: LoadingService) {
    }

    getFornecedores(queryFilters: QueryFilters) {
        this._loader.carregar();
        this._http.get<any | any[]>(this.baseUrl + this.endpoints.fetch + queryFilters.criarFiltro())
            .pipe(map(response => {
                return response.content.map(fornecedor => new FaturamentoFornecedorModel(fornecedor))
            }))
            .subscribe(
                data => { this.fornecedores.next({ data: data, status: 'READY' }) 
            },
                error => {this.fornecedores.next({ data: error, status: 'ERROR' })
            this.showError(error)
            },
            ).add(() => {
                this._loader.parar()
            })
    }


    showSuccess(title, body) {
        this.showModal({ title: title, body: body, type: 'success' })
    }

    showError(err) {
        err.error.forEach(element => {
        });
 
        let title = err.title;
        if (typeof err.error.title == 'object') {
            title = err.error.title[err.status] || err.error.title[500]
        }
        this.showModal({ title: 'Oops!', text: UtilsHelper.handleError(err), type: 'error' }) 
    }

    showModal(config) {
        let options = {
            confirmButtonText: 'Ok, Obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
        };
        Swal.fire({
            ...options,
            title: config.title,
            text: config.text,
            icon: config.type,
        })
    }


    updateFaturamento() {
        Swal.fire({
            title: 'Atenção!',
            text: 'Deseja confirmar a alteração?',
            icon: 'warning',
            confirmButtonText: 'Ok, confirmar',
            cancelButtonText: 'Cancelar',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
        }).then((result) => {
            if (result.value === true) {

                let query = '?cdOperador=' + localStorage.getItem('cdOperador');
                let fornecedores = this.fornecedores.value.data.map(item => ({
                    cdRegional: item.cdCentroDistribuicao,
                    cdFornecedor: item.cdFornecedor,
                    cdFabricante: item.cdFabricante,
                    flAbastecimentoSo: item.faturamento
                }))
                this._http.put(this.baseUrl + this.endpoints.save + query, fornecedores)
                    .subscribe(
                        data => {
                            this.showSuccess('Sucesso', 'O faturamento foi atualizado.');
                        },
                        error => {
                            error.error.title = 'Não foi possível salvar';
                            this.showError(error);
                        }
                    )

            }
        });




    }
}