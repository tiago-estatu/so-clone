import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { SubstitutoGenericoModel } from "./substituto-generico.model";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { RequestModel, SubstitutoMock } from "./substituto-generico.mock";
import { ServicePath } from "../../const";
import Swal, { SweetAlertOptions } from "sweetalert2";
import { Produto } from "../classes";
import { UtilsHelper } from "../../helpers";
import { QueryFilters } from "../../models/query-param.model";
import { RequestParamModel } from "../../models/request-param.model";
import { tap } from "rxjs/operators";
import { UploadHelper } from "../../helpers/upload.helper";

@Injectable({
    providedIn: 'root'
})

export class SubstitutoGenericoService {
    private mocker: SubstitutoMock;
    utils = new UtilsHelper();
    uploader = new UploadHelper({
        fileName: 'SUBSTITUTOS_',
        format: '.csv',
        columns: Array(20).fill(0).map((itm, idx) => `${idx + 1}`),
        errorFirst: true
    });
    reports = {
        active: 'SUBSTITUTOS_VIGENTES',
        search: 'SUBSTITUTOS_'
    };
    endpoints = {
        getProductsList: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO,
        report: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO + '/relatorio',
        modeloCSV: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO + '/export/template',
        alterar: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO,
        cadastrar: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO,
        validar: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO,
        excluir: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO,
        importar: ServicePath.HTTP_URL_SUBSTITUTO_GENERICO + '/upload',
    };

    productsSubject = new BehaviorSubject<SubstitutoGenericoModel[]>([]);

    constructor(private http: HttpClient) {
        this.mocker = new SubstitutoMock(http);
        this.productsSubject = new BehaviorSubject<SubstitutoGenericoModel[]>([]);
    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }


    /**
     * Importar um arquivo de cadastro de substitutos
     * @param file
     * @return Observable<any>
     */
    importFile(file: any): Observable<any> {
        let body = new FormData();
        body.append('file', file);
        body.append('cdOperador', localStorage.getItem('cdOperador'));
        let request: RequestModel = {
            endpoint: this.endpoints.importar,
            body: body
        };

        return this.mocker.importFile(request).pipe(tap(data => {
            // this.uploader.importFileHandler(data)
        }, err => { this.uploader.importError(err) }))
    }

    /**
     * Obtem a lista completa de produtos espelhos para um cod de produto
     * @param productId
     * @returns subscription
     */
    getCurrentSubstituteList(productId: string): Subscription {
        let request: RequestModel = {
            endpoint: this.endpoints.getProductsList,
            queryParams: new QueryFilters([
                new RequestParamModel('cdProduto', productId)
            ])
        };
        return this.mocker.getSubstitutesList(request).subscribe(data => {
            this.productsSubject.next(data.map(item => new SubstitutoGenericoModel(item)));
        }, err => {
            this.productsSubject.next([]);
            err.error.title = {
                404: 'Não encontramos nenhum substituto',
                400: 'Código informado invalido',
                500: 'Não foi possível realizar a pesquisa'
            };
            this.showError(err)
        })
    }

    /**
     * Cadastrar novo substituto
     * @param substituto
     */
    create(substituto: { cdProduto: number, prioridade: number, cdGrupoSubstituto: number }): Observable<any> {
        let request: RequestModel = {
            body: substituto,
            endpoint: this.endpoints.cadastrar,
            queryParams: new QueryFilters([
                new RequestParamModel('cdOperador', localStorage.getItem('cdOperador'))
            ])
        };
        return this.mocker.insertSubstitute(request)
    }

    /**
     * Atualizar substitutos baseado no atual subject
     * @return Observable<any>
     */
    update(fromDelete, deleted: any[] = []): Observable<any> {
        let body = [...this.productsSubject.getValue(), ...deleted];
        let request: RequestModel = {
            endpoint: this.endpoints.alterar,
            body: body.map(item => new SubstitutoGenericoModel(item).strip()),
            queryParams: new QueryFilters([
                new RequestParamModel('cdOperador', localStorage.getItem('cdOperador'))
            ])
        };


        return fromDelete ? this.mocker.removeProduct(request) : this.mocker.updateSubstitutes(request);
    }

    /**
     * Downloads do modelo csv do servidor
     */
    exportModel(): Subscription {
        let request: RequestModel = {
            endpoint: this.endpoints.modeloCSV
        };

        return this.mocker.exportModel(request)
    }


    /**
     * Valida um cod de produto para ser adicionado como substituto no grupo
     * @param cdProduto
     * @return Observable<Product>
     */
    validate(cdProduto: number): Observable<SubstitutoGenericoModel | boolean> {
        let request: RequestModel = {
            endpoint: this.endpoints.validar,
            params: [cdProduto.toString()]
        };

        return this.mocker.validateProduct(request)
    }

    /**
     * Chama libraria utils para mostrar o erro
     * @param config, erro http com title e mensagem no error
     */
    showError(config: HttpErrorResponse) {
        this.utils.showError(config)
    }

    chamadaApiConsulta(filters: QueryFilters) {
        let endPoint = this.endpoints.report;
        return this.http.get<any>(endPoint + filters.criarFiltro()).pipe(tap(data => {

        }, err => {

            if (typeof (err.error) == 'string') err.error = JSON.parse(err.error)
            err.error.title = {
                404: 'Nenhum registro encontado',
                500: 'Não foi possível gerar o relatório'
            };
            this.utils.showError(err);

        }))
    }


    downloadSearch(filters: QueryFilters) {
        let request: RequestModel = {
            endpoint: this.endpoints.report,
            queryParams: filters
        };
        return this.mocker.downloadSearch(request).pipe(tap(data => {
            let [initial, final] = [filters.getParam('initial', false), filters.getParam('final', false)].map(item => {
                return `${item.getDate()}-${item.getMonth() + 1}-${item.getFullYear()}`
            });
            let name = `${this.reports.search}_PROD${filters.getParam('produto')}_${initial}_ATE_${final}`;
            this.uploader.downloadFile(data, name)
        }, err => {
            if (typeof (err.error) == 'string') err.error = JSON.parse(err.error)
            err.error.title = {
                404: 'Nenhum registro encontado',
                500: 'Não foi possível gerar o relatório'
            };
            this.utils.showError(err);
        }));
    }

    downloadActives(filters: QueryFilters) {
        let request: RequestModel = {
            endpoint: this.endpoints.report,
            queryParams: filters
        };

        this.mocker.downloadActives(request).subscribe(data => {
            let name = this.reports.active;
            let _data = JSON.parse(data.toString())
            this.showModalConfig(`${_data.type}`, `${_data.mensagem}`, 'success');
        }, err => this.handleError(err))
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
        } else if (error.status === 0 || error.status === 400 || error.status === 403 || error.status === 500) {
            this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        } else {
            this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        }
    }
}
