import { map } from 'rxjs/operators';
import { query } from '@angular/animations';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';
import { ServicePath } from '../../const';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ResponseUpload, ResponseRegistrosInvalidos } from '../classes';
import { UtilsHelper } from '../../helpers';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { UploadHelper } from '../../helpers/upload.helper';
import { QueryFilters } from '../../models/query-param.model';
import { LoadingService } from '../loading/loading.service';
import { tap } from 'rxjs/internal/operators/tap';


export interface ParametrizacaoSetorModel {
    cdRegional: number;
    cdSetorSeparacao?: string;
    itimSetorSeparacao?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ParametrizacaoSetorService {
    $dataSource = new BehaviorSubject<ParametrizacaoSetorModel[]>([]);
    $paging = new BehaviorSubject<{ page: number, numberOfItems: number }>({ page: 1, numberOfItems: 0 })

    upload: UploadHelper = new UploadHelper({
        fileName: 'PARAMETRIZACAO_SETOR_',
        format: 'csv',
        columns: ['CD', 'SETOR RD', 'SETOR ITIM']
    });


    constructor(
        private _http: HttpClient,
        private _utils: UtilsHelper,
        private _loader: LoadingService, ) { }

    // CADASTRO VIA IMPORTAÇÃO DE DADOS
    importFile(fileData) {
        this._loader.carregar()
        let raw: FormData = new FormData();
        raw.append("file", fileData || '');

        raw.append('cdOperador', localStorage.getItem('cdOperador'));

        const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
        return this._http.post<ResponseUpload>(ServicePath.HTTP_PARAMETRIZACAO_SETOR + '/upload', raw, { headers: httpHeader })
            .pipe(tap(data => {
                this.showSwal(data.type, data.mensagem, 'success');
                this._loader.parar();
            }, err => {                
                this._loader.parar()
                this.showSwal('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${err.error.erro.message || 'sem log de erro'}`, 'warning');
            })).subscribe();
    }

    // BAIXAR EXECEL MODELO PARA CADASTRO VIA IMPORTAÇÃO
    downloadCSV() {
        this._loader.carregar()
        let excelName = this.upload.fileConfig.fileName + 'template';
        const httpOptions = {
            headers: new HttpHeaders({
                'Accept': 'text/plain, */*',
                'Content-Type': 'application/json'
            }),
            responseType: 'text' as 'json'
        };
        this._http.get<String>(ServicePath.HTTP_PARAMETRIZACAO_SETOR + '/export/template', httpOptions).subscribe(data => {
            this.upload.downloadFile(data, excelName)
            this._loader.parar()
        }, err => {
            this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel obter o template CSV. Verifique a sua conexão e tente novamente.', 'error')
            this._loader.parar()
        })
    }


    // FAÇO A CONSULTA DOS CADASTROS ATUAIS
    getParametrizacaoSetor(queryParam: any) {
        
        this._loader.carregar()

        let params: HttpParams = new HttpParams();
        let cdSelecionado = queryParam.getParam('cdRegional'); 
        
        params = params.set('cdRegional', cdSelecionado)

        this._http.get<{ content: ParametrizacaoSetorModel[], pageable: { page: number, numberOfItems: number } }>(ServicePath.HTTP_PARAMETRIZACAO_SETOR + '?' + params).subscribe(data => {
            this.$dataSource.next(data.content.map(e => ({ ...e, cdRegional: e.cdRegional, cdSetorSeparacao: e.cdSetorSeparacao, itimSetorSeparacao: e.itimSetorSeparacao })));
            this.$paging.next(data.pageable);
            this._loader.parar();
        }, err => {
            this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível obter as parametrizações. Verifique a sua conexão e tente novamente.', 'error')
            this._loader.parar()
        })
    }

    // CADASTRO NOVOS PARAMETROS FLUXO DE TELA
    cadastroNovoSetorFluxoTela(queryParam, objetoParaPayLoad, queriFilters) {
        // TEMPLATE PARA EXIBIÇÃO MODAL DE CONFIRMAÇÃO
        let template = `
            <ul class='modalConfirmaAlteracaoCadastro'>
                <li><strong>Alteração de cadastro para os seguintes dados:</strong></li>
                <li><strong>CD</strong> ${queryParam.get('cdRegional')}</li>
                <li><strong>Setor CD</strong> ${queryParam.get('cdSetorSeparacao')}</li>
                <li><strong>para Setor ITIM </strong>${queryParam.get('itimSetorSeparacao')}</li>
            </ul>`;

        // MODAL CONFIRMAÇÃO DE ALTERAÇÃO DOS DADOS
        Swal.fire({
            title: 'Atenção!',
            icon: 'warning',
            html: template,
            confirmButtonText: 'Ok, confirmar',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
        }).then((result) => {
            // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
            if (result.value === true) {
                this._loader.carregar();
                const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');

                let cdOperador = localStorage.getItem('cdOperador');

                // EXECUTANDO A CHAMADA DO SERVIÇO
                this._http.post(ServicePath.HTTP_PARAMETRIZACAO_SETOR + `?cdOperador=${cdOperador}`, objetoParaPayLoad, { headers: httpHeader })
                    .subscribe(data => {
                        this.showSwal('Sucesso', 'Os dados foram alterados com sucesso, o relatório será enviado via email.', 'success');
                    }, (err) => {
                        this._loader.parar()
                        this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel prosseguir com as alterações, tente novamente mais tarde.', 'error')
                    }).add(() => {
                        this.getParametrizacaoSetor(queriFilters)
                        this._loader.parar()
                    });
            } else {
                // SE USUÁRIO CANCELAR
                return
            }
        });

    }

    // ALTERAÇÃO DE PARAMETROS VIA GRID DA CONSULTA
    async alterarSetorFluxoTela(objetoParaPayLoad, param) {

        // MODAL CONFIRMAÇÃO DE ALTERAÇÃO DOS DADOS
        let template = `
            <ul class='modalConfirmaAlteracaoCadastro'>
                <li>Alteração de cadastro para os seguintes dados:</li>
                <li>CD <strong>${objetoParaPayLoad.cdRegional}</strong> com Setor CD <strong>${objetoParaPayLoad.cdSetorSeparacao}</strong></li>
                <li>agora selecione o Setor ITIM para prosseguir.</li>
            </ul>`;


        // SELECÃO DE SETOR ITIM NO DROPLIST
        let dropListHardCode = { '1': '1 - MEDICAMENTO', '2': '2 - PERFUMARIA', '3': '3 - MEZANINO', '4': '4 - VOLUMOSO' }
        let { value: selecionadoDropModal } = await Swal.fire({
            title: 'Atenção!',
            icon: 'warning',
            html: template,
            input: 'select',
            confirmButtonText: 'Ok, Alterar!',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
            inputPlaceholder: 'Selecionar setor ITIM',
            inputOptions: dropListHardCode,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    !value ? resolve('Por favor selecionar Setor ITIM para prosseguir!') : resolve();
                })
            }
        })

        // APÓS SELECÃO DO SETOR ITIM
        if (selecionadoDropModal) {
            this._loader.carregar();
            const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');

            // OBJETO DO PAYLOAD
            let linhaDaGrid = { cdRegional: objetoParaPayLoad.cdRegional, cdSetorSeparacao: objetoParaPayLoad.cdSetorSeparacao, itimSetorSeparacao: selecionadoDropModal }

            let cdOperador = localStorage.getItem('cdOperador');

            this._http.put(ServicePath.HTTP_PARAMETRIZACAO_SETOR + `?cdOperador=${cdOperador}`, linhaDaGrid, { headers: httpHeader })
                .subscribe(data => {
                    this.showSwal('Sucesso', 'Os dados foram alterados com sucesso', 'success');
                }, err => {
                    this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possivel prosseguir com as alterações, tente novamente mais tarde.', 'error')
                }).add(() => {
                    // ATUALIZA A GRID DE CONSULTA COM O NOVO VALOR DEFINIDO PARA O SETOR ITIM
                    this.getParametrizacaoSetor(param)
                    this._loader.parar()
                });
        }
    }

    showSwal(title: string, text: any, icone: any) {
        Swal.fire({ title: title, html: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
    }

    ngOnDestroy(){

    }
}
