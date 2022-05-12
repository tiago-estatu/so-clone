import {Observable, of, Subscription, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest} from "@angular/common/http";
import {SubstitutoGenericoModel} from "./substituto-generico.model";
import {environment} from "../../../../environments/environment";
import {QueryFilters} from "../../models/query-param.model";
import {delay, tap} from "rxjs/operators";
import {fromPromise} from "rxjs-compat/observable/fromPromise";
import {UploadHelper} from "../../helpers/upload.helper";
import {Produto, ResponseUpload} from "../classes";
import {UtilsHelper} from "../../helpers";
import Swal, {SweetAlertOptions} from "sweetalert2";
const FILE_DOWNLOAD_OPTIONS =  {
    headers: new HttpHeaders({
        'Accept': 'text/plain, */*',
        'Content-Type': 'application/json'
    }),
    responseType: 'text' as 'json'
};
export class RequestModel {
    body?: any;
    queryParams?: QueryFilters;
    params?: string[];
    customHeaders?: HttpHeaders;
    endpoint: string
}


export class SubstitutoMock {
    baseDelay = 800;
    utils = new UtilsHelper();
    environment: any = {...environment};

    constructor(private http: HttpClient) {
        this.feedMock();
        this.environment.local = this.environment.local || false;
    }

    uploader: UploadHelper = new UploadHelper({
        fileName: 'SUBSTITUTOS_',
        format: '.csv',
        columns: ['']
    });

    baseMock: SubstitutoGenericoModel[];


    getSubstitutesList(request: RequestModel): Observable<SubstitutoGenericoModel[]> {
        this.feedMock();
        if (this.environment.local) {
            if (this.baseMock.filter(item => item.cdProduto === request.queryParams.getParam('cdProduto', false)).length > 0) {
                this.baseMock = [new SubstitutoGenericoModel({
                    cdProduto: 1,
                    prioridade: 1,
                    dsProduto: `produto #${1000 + 1}`,
                    cdFornecedor: 1 % 2 ? 1 : 2,
                    nmFantasiaFornecedor: 1 % 2 ? 'Fornecedor 1' : 'Fornecedor 2',
                    cdCategoriaMaster: 1,
                    dsCategoriaMaster: 'Master 1',
                    cdPrincipioAtivoComposto: 1,
                    dsPrincipioAtivoComposto: 'Dipirona',
                    clCurvaFis: 'F',
                    cdGrupoSubstituto: 1
                })];
                return of(this.baseMock).pipe(delay(this.baseDelay))
            } else {
                return of(this.baseMock).pipe(delay(this.baseDelay))
            }
        } else {
            return this.http.get<SubstitutoGenericoModel[]>(request.endpoint + request.queryParams.criarFiltro())
        }
    }

    generateReport(request: RequestModel): Observable<SubstitutoGenericoModel[]> {
        if (this.environment.local) {
            throw new Error('Not implemented');
        } else {
            return this.http.get<SubstitutoGenericoModel[]>(request.endpoint)
        }
    }

    updateSubstitutes(request: RequestModel): Observable<SubstitutoGenericoModel[]> {
        if (this.environment.local) {
            request.body = request.body.sort((a, b) => a.prioridade - b.prioridade);
            this.baseMock = request.body;
            return of(this.baseMock).pipe(delay(this.baseDelay))
        } else {
            return this.http.put<SubstitutoGenericoModel[]>(request.endpoint + request.queryParams.criarFiltro(), request.body)
        }
    }


    insertSubstitute(request: RequestModel): Observable<SubstitutoGenericoModel> {
        if (this.environment.local) {
            if (!request.body.prioridade || request.body.prioridade < 1 || request.body.prioridade > 20) {
                let err = new HttpErrorResponse({
                    status: 400,
                    error: {
                        title: {
                            400: 'Prioridade deve ser um numero de 1 a 20',
                            409: 'Prioridade repetida, já existe um produto com essa prioridade'
                        },
                        mensagem: 'Verifique os campos e tente novamente'
                    }
                });
                this.utils.showError(err);
                return throwError(err);

            }
            let formated: SubstitutoGenericoModel = {
                ...request.body,
                dsCategoriaMaster: 'Master 1',
                cdCategoriaMaster: 1,
                clCurvaFis: 'F',
                dsPrincipioAtivoComposto: 'Dipirona',
                dsFornecedor: 'Fornecedor',
                cdFornecedor: 1,
                cdPrincipioAtivoComposto: 1,
                dsProduto: 'Produto #' + request.body.cdProduto
            };
            return of(formated).pipe(delay(this.baseDelay))
        } else {
            return this.http.post<SubstitutoGenericoModel>(request.endpoint + request.queryParams.criarFiltro(), request.body)
        }
    }

    downloadActives(request: RequestModel) {
        if(this.environment.local) {
            let downloadPromise = new Promise((resolve, reject) => {
                this.uploader.downloadFile(`1;2;3`,'actives');
                resolve(true);
            });
            return fromPromise(downloadPromise).pipe(delay(this.baseDelay))
        }else {
            return this.http.get<string>(request.endpoint  + request.queryParams.criarFiltro(), FILE_DOWNLOAD_OPTIONS)
        }
    }

    downloadSearch(request: RequestModel) {
        if(this.environment.local) {
            let downloadPromise = new Promise((resolve, reject) => {
                resolve('1;2;3');
            });
            return fromPromise(downloadPromise).pipe(delay(this.baseDelay))
        }else {
            return this.http.get(request.endpoint + request.queryParams.criarFiltro(), FILE_DOWNLOAD_OPTIONS)
        }
    }

    exportModel(request: RequestModel): Subscription {
        if (this.environment.local) {

            let downloadPromise = new Promise((resolve, reject) => {
                resolve(`Prioridade;${Array(20).fill(0).map((itm, idx) => idx + 1).join(';')};
            Cod Produto;${Array(20).fill(0).map((itm, idx) => " ").join(';')};`);
            });

            return fromPromise(downloadPromise).pipe(delay(this.baseDelay)).subscribe(data => {
            }, err => {
            })
        }else {

            return this.http.get<string>(request.endpoint, FILE_DOWNLOAD_OPTIONS)
                .subscribe(data => {
                    if (!!data) {
                        this.uploader.downloadFile(data, this.uploader.fileConfig.fileName+'template');
                    }else {
                        throw new Error('arquivo invalido')
                    }
                }, err => {
                    let options: SweetAlertOptions = {
                        title: 'Oops',
                        html: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
                        icon: 'warning',
                        confirmButtonText: 'Ok Fechar',
                        customClass: {confirmButton: 'setBackgroundColor'}
                    };
                    Swal.fire(options);
                })

        }

    }

    removeProduct(request: RequestModel): Observable<any> {
        if (this.environment.local) {
            request.body = request.body.sort((a, b) => a.prioridade - b.prioridade);
            this.baseMock = request.body;
            return of(this.baseMock).pipe(delay(this.baseDelay))
        } else {
            let options = {
                body: request.body,
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                })
            };
            return this.http.delete<SubstitutoGenericoModel[]>(request.endpoint + request.queryParams.criarFiltro(), options)
        }
    }

    validateProduct(request: RequestModel): Observable<SubstitutoGenericoModel> {

        if (this.environment.local) {
            //throwError({status: 400, error: {mensagem: 'Produto excluido'}})
            let errors = {
                400: throwError(new HttpErrorResponse({status: 400, error: {mensagem: 'Produto não vendável'}})),
                404: throwError(new HttpErrorResponse({status: 404, error: {mensagem: 'Oops!'}})),
                500: throwError(new HttpErrorResponse({
                    status: 500,
                    error: {mensagem: 'Nãe e possível selecionar esse produto'}
                }))
            };
            let cod = Number(request.params[0]);
            let err = errors[cod] || errors[500];
            return cod >= 400 ? err : of({
                cdProduto: cod,
                dsProduto: 'teste'
            }).pipe(delay(this.baseDelay))
        } else {
            return this.http.get<SubstitutoGenericoModel>(request.endpoint + '/' + request.params.join(','))

        }
    }

    importFile(request: RequestModel): Observable<any> {
        if(environment.local) {
            return of({
                qtTotalRegistroComErro: 0,
                qtTotalRegistrosNovos: 10,
                qtTotalRegistrosAlterados: 0,
                qtTotalRegistros: 10
            })
        }
        const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
        return this.http.post<ResponseUpload>(
            request.endpoint,
            request.body,
            {headers: httpHeader}
        );
    }

    private feedMock() {
        let mockList = new Array(20).fill(0).map((val, index) => new SubstitutoGenericoModel(
            {
                cdProduto: index + 1,
                prioridade: index + 1,
                dsProduto: `produto #${1000 + index}`,
                cdFornecedor: index % 2 ? 1 : 2,
                dsFornecedor: index % 2 ? 'Fornecedor 1' : 'Fornecedor 2',
                cdCategoriaMaster: 1,
                dsCategoriaMaster: 'Master 1',
                cdPrincipioAtivoComposto: 1,
                dsPrincipioAtivoComposto: 'Dipirona',
                clCurvaFis: 'F',
            }
        ));

        this.baseMock = mockList;
    }


}
