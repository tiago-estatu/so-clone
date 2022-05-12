import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { ParametroRecomendacao } from './ParametroRecomendacao';
import { Observable, of } from 'rxjs';
import { Recomendacao } from 'src/app/pedidos/consulta-pedido/recomendacao';
import { ServicePath } from '../../const';
import { ParametroRecomendacaoPageableModel } from './ParametroRecomendacaoPageable.model';
import { ParametroRecomendacaoItem } from './ParametrorRecomendacaoItem';
import Swal from 'sweetalert2';
import { exportarRelatorio } from './exportarRelatorio.model';
import { isNullOrUndefined } from 'util';
import { ValidatorHelper } from './../../helpers/validator.helper';

const EXCEL_EXTENSION = '.csv';
@Injectable({
  providedIn: 'root'
})
export class PedidoService {


  constructor(
    private _httpClient: HttpClient,
    private _validatorHelper: ValidatorHelper
    ) {

   }

    // FAÇO A EMISSÃO DO PEDIDO, QUANDO DENTRO DA PÁGINA DETALHE DO PEDIDO
    buscarPedidosPorCDFornecedorData(hParams: HttpParams): Observable<ParametroRecomendacaoPageableModel> {
      return this._httpClient.get<ParametroRecomendacaoPageableModel>(ServicePath.HTTP_URL_RECOMENDACAO_RESUMO, {params: hParams});
    }

    // FAÇO A CHAMADA PARA OBTER A PÁGINA DETALHE DO PEDIDO, ******** QUANDO NO RESULTADO DA LISTA DE RECOMENDAÇÃO ******
    getDetalhePedido(
      cdRegional: number,
      cdFornecedor: number,
      cdFabricante: number,
      dtPedido: string,
      cdOperador: number | string): Observable<Recomendacao[]> {

      // RETORNO DOS DADOS DA RECOMENDAÇÃO
      return this._httpClient.get<Recomendacao[]>(
        ServicePath.HTTP_URL_RECOMENDACAO_DETALHE +
        '?cdRegional=' + cdRegional +
        '&cdFornecedor=' + cdFornecedor +
        '&cdFabricante=' + cdFabricante +
        '&dtPedido=' + dtPedido +
        '&cdOperador=' + cdOperador
        );
  }


  // FAÇO A CHAMADA PARA EMITIR RECOMENDAÇÃO DE PEDIDOS
  getEmitirPedido(parametroRecomendacao: ParametroRecomendacao) {
     return this._httpClient.post(`${ServicePath.HTTP_URL_RECOMENDACAO}?cdOperador=${parametroRecomendacao.cdOperador}`, {
          'cdFornecedor': parametroRecomendacao.cdFornecedor,
          'cdRegional': parametroRecomendacao.cdRegional,
          'dtPedido': this._validatorHelper.formataDataComBarraPadraoBr(parametroRecomendacao.dtPedido),
          'cdFabricante': parametroRecomendacao.cdFabricante,
         });
  }

  // FAÇO A EMISSÃO DO PEDIDO, **** QUANDO DENTRO DA PÁGINA DETALHE DO PEDIDO ***
  emitirPedido(parametroRecomendacaoItem: ParametroRecomendacaoItem, cdOperador: number | string) {
      return this._httpClient.post(`${ServicePath.HTTP_URL_RECOMENDACAO_ITEM}?cdOperador=${cdOperador}`, parametroRecomendacaoItem);
  }


  exportarTodasRecomendacoes(filtro: HttpParams) {
    const FILE_DOWNLOAD_OPTIONS =  {
      headers: new HttpHeaders({
          'Accept': 'text/plain, */*',
          'Content-Type': 'application/json',
      }),
      responseType: 'text' as 'json',
      params: filtro
  };
      // REQUISIÇÕES DE EXPORTAÇÃO (CSV)
    this._httpClient.get<string>(ServicePath.HTTP_EXPORT_RELATORIO_PEDIDOS_RESUMO, FILE_DOWNLOAD_OPTIONS)
        .subscribe(
            (data) => {
                this.downloadFile(data, 'relatorio_recomendacao_' + filtro.get('dtCalculationDate'));
                this.swallAlertMsgDownloadSucesso();
            },
            ex => {
              if (typeof(ex.error) == 'string') ex.error = JSON.parse(ex.error);
              this.handleError(ex)});
    return of(true);
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

    exportarPorPedidos(pedidos: exportarRelatorio[]): Promise<Boolean> {
      const excelName = 'Pedido_recomendado';
      return new Promise((resolve) => {
        const FILE_DOWNLOAD_OPTIONS =  {
          headers: new HttpHeaders({
              'Accept': 'text/plain, */*',
              'Content-Type': 'application/json'
          }),
          responseType: 'text' as 'json'
      };
          this._httpClient.post(ServicePath.HTTP_EXPORT_RELATORIO_PEDIDOS, pedidos, FILE_DOWNLOAD_OPTIONS).subscribe(res => {
               this.downloadFile(res, excelName);
                this.swallAlertMsgDownloadSucesso();

                  resolve(true);
      }, ex => {
        if (typeof(ex.error) === 'string') {ex.error = JSON.parse(ex.error)}

        resolve(false);
        this.handleError(ex);
      });
  });
}




  downloadFile(data, excelFileName){
    let blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
      dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", excelFileName+EXCEL_EXTENSION);
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }
  handleError(error){
    if (error.status === 404) {
        Swal.fire({
            title: 'Não encontramos nenhum registro!',
            html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
            icon: 'warning',
            confirmButtonText: 'Ok Fechar',
            customClass: {confirmButton: 'setBackgroundColor'}
        });
    } else if (error.status === 0) {
        Swal.fire({
            title: 'Serviço de consulta está fora!',
            html: 'Por favor entre em contato com a equipe técnica.',
            icon: 'warning',
            confirmButtonText: 'Ok Fechar',
            customClass: {confirmButton: 'setBackgroundColor'}
        });
    } else {
        Swal.fire({
            title: 'Erro desconhecido!',
            html: `Log: ${error.error.mensagem}`,
            icon: 'warning',
            confirmButtonText: 'Ok Fechar',
            customClass: {confirmButton: 'setBackgroundColor'}
        });
    }
  }
}
