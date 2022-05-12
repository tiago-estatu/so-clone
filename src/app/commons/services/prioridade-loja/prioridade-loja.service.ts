import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { throwError, concat, of } from 'rxjs';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { PrioridadeDeLojaModel } from './prioridadeDeLoja.model';
import { retry, catchError } from 'rxjs/operators';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { error } from 'protractor';
import { ResponseUpload } from './../classes/ResponseUpload';
import { UploadHelper } from './../../helpers/upload.helper';
import { RequestModel, PrioridadeLojaMock } from './prioridade-loja.mock';


@Injectable({
  providedIn: 'root'
})


export class PrioridadeLojaService {



  mocker;
  constructor(
        private _httpClient: HttpClient) {this.mocker = new PrioridadeLojaMock(_httpClient);}

    componentLoading: Boolean;

    // URL'S PARA REQUISIÇÕES
    _servicePath = `${ServicePath.HTTP_URL_PRIORIDADE_LOJA}`;
    _urlTodosServicos = {

        // RETORNA OS DADOS SOBRE OS GRUPOS DE PRIORIDADE DAS FILIAIS SELECIONADAS (GET)
        consultarPrioridadeDeFiliais: this._servicePath + 'prioridadeFilial?',

        // EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS (GET)
        exportarFiltrosPreSelecionados: this._servicePath + 'prioridadeFilial/export?',

        // EXPORTAÇÃO MODELO EM BANCO (GET)
        exportarModeloCsvBranco: this._servicePath + 'prioridadeFilial/export/template',

        // EXPORTAÇÃO MODELO EM BANCO (POST)
        importar: this._servicePath + 'prioridadeFilial/upload',

        // ALTERAR PRIORIDADE DE LOJA (PUT(alteração)) OU (DELETE(retirar qualquer prioridade))
        alterarPrioridadeLoja: this._servicePath + 'prioridadeFilial'

    };

    // BUSCAR FILIAS
    getAllLojas(queryString: any): Observable<PrioridadeDeLojaModel[]> {
        return this._httpClient.get<PrioridadeDeLojaModel[]>(this._urlTodosServicos.consultarPrioridadeDeFiliais + queryString);
    }

    // ALTERO A PRIORIDADE DE LOJA (PARAMS: ARRAY DE OBJETOS)
    alteroPrioridadeLoja(parametros: any): Observable<any> {
        return this._httpClient.put(this._urlTodosServicos.alterarPrioridadeLoja, parametros);
    }

    // REMOVO A PRIORIDADE DE LOJA (PARAMS: ARRAY DE OBJETOS)
    deletePrioridadeLoja(parametros: any): Observable<any> {
        // NO DELETE É SEMPRE NECESSÁRIO ENIVAR O HEADERS
        const options = {headers: new HttpHeaders({'content-type': 'application/json', }), body: parametros};
        return this._httpClient.delete(this._urlTodosServicos.alterarPrioridadeLoja, options);
    }

    // REQUISIÇÕES DE EXPORTAÇÃO (CSV)
    // PARAMS: URL + (query(se existir)) + nome do arquivo
    exportRequest(urlTobeFech: string, nomeDoArquivoExcel: string): Observable<boolean> {
        this._httpClient.get(urlTobeFech, {observe: 'response', responseType: 'text'})
            .subscribe(
                (data) => {
                    this.downloadFile(data.body, nomeDoArquivoExcel);
                    this.swallAlertMsgDownloadSucesso();
                },
                ex => {
                    if (typeof(ex.error) == 'string') ex.error = JSON.parse(ex.error);
                    this.handleError(ex)
                });
        return of(true);
    }


    // PRIORIDADE DE ALTERADA COM SUCESSO
    swallAlertMsgAlteradoSucesso(tituloParaMsgSucesso: string) {
        Swal.fire({
            title: `${tituloParaMsgSucesso}`,
            icon: 'success',
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
        });
    }

    // DOWNLOAD CONCLUIDO COM SUCESSO
    swallAlertMsgDownloadSucesso() {
        Swal.fire({
            title: 'Download concluído com sucesso!',
            text: 'Por favor, verifique seus downloads para abrir a exportação.',
            icon: 'success',
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
        });
    }

    // IMPORTAÇÃO
    importFile(file: any): Observable<any> {
        const body = new FormData();
        body.append('file', file);
        body.append('cdOperador', localStorage.getItem('cdOperador'));
        const request: RequestModel = {
            endpoint: this._urlTodosServicos.importar,
            body: body
        };

        return this.mocker.importFile(request);
    }

  // DOWNLOADER DE EXCEL DE DADOS
    downloadFile(data: any, nomeDoArquivoExcel: string) {
        const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
        const EXCEL_EXTENSION = '.csv';
        const blob = new Blob(['\ufeff' + data], { type: EXCEL_TYPE });
        const dwldLink = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // if Safari open in new window to save file with random filename.
        const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
        if (isSafariBrowser) {
            dwldLink.setAttribute('target', 'blank');
        }

        dwldLink.setAttribute('href', url);
        dwldLink.setAttribute('download', nomeDoArquivoExcel + EXCEL_EXTENSION);
        dwldLink.style.visibility = 'hidden';
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    // TRATAMENTO DE ERROS
    handleError(ex: any) {
        if (ex.status === 404) {
            Swal.fire({
                title: 'Não encontramos nenhum registro!',
                html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        } else if (ex.status === 0) {
            Swal.fire({
                title: 'Serviço de consulta está fora!',
                html: 'Por favor entre em contato com a equipe técnica.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        } else {
            Swal.fire({
                title: 'Atenção! Erro desconhecido por favor entre em contato com a equipe técnica.',
                html: `Log error: ${ex.error.mensagem}`,
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        }
    }


}




