import { SistemaFaturamentoModel } from './../../commons/services/classes/SistemaFaturamento.model';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

import { Http } from '@angular/http';
import { HttpParams } from '@angular/common/http';
import { ServicePath } from './../../commons/const/ServicePath';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper } from 'src/app/commons';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';



@Component({
  selector: 'rd-sistema-atual-faturamento-loja',
  templateUrl: './sistema-atual-faturamento-loja.component.html',
  styleUrls: ['./sistema-atual-faturamento-loja.component.scss'],
  animations: [fadeInOut]
})
export class SistemaAtualFaturamentoLojaComponent implements OnInit {

  dataSource: SistemaFaturamentoModel[];

  constructor(
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _http: Http
    ) { }

    // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
    @ViewChild('elementCD') elementCD: ElementRef;
    @ViewChild('elementFilial') elementFilial: ElementRef;
    @ViewChild('elementRota') elementRota: ElementRef;

    // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
    expandir: Boolean = true;

    // LOADING (INTERAÇÃO COM O USER)
    componentLoading: Boolean = false;

    // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
    _todosCDSelecionado = [];
    _todasFiliaisSelecionadas = [];
    _todasRotasSelecionadas = [];

  ngOnInit() {

    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Sistema Atual de Faturamento Loja');
  }

  /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
  /***************************************************************************************************/

  // CONTROLA OS DADOS SELECIONADOS NOS FILTROS DE CONSULTA
  // CD's SELECIONADOS
  todosCentroDistribuicaoSelecionados(callBack) {
    this._todosCDSelecionado = callBack;
  }
  getCentroDistribuicoes(): number[] {
    if (this._utils.isEmpty(this._todosCDSelecionado)) {
      return [];
    }
    return this._todosCDSelecionado;
  }

  todosFilialSelecionado(callBack) {
    this._todasFiliaisSelecionadas = callBack;
  }

  // FILIAIS SELECIONADAS
  preencherFiliaisSelecionadas(callBack) {
    this._todasFiliaisSelecionadas = callBack;
  }
  getFiliais(): number[] {
    if (this._utils.isEmpty(this._todasFiliaisSelecionadas)) {
      return [];
    }
    return this._todasFiliaisSelecionadas;
  }

  preencherRotasSelecionadas(callBack) {
    this._todasRotasSelecionadas = callBack;
  }
  getRotas(): number[] {
    if (this._utils.isEmpty(this._todasRotasSelecionadas)) {
      return [];
    }
    return this._todasRotasSelecionadas;
  }

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._todosCDSelecionado.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, filtro incompleto!',
        html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong>.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    }
  }

  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta(): HttpParams {

    let params: HttpParams = new HttpParams();

    // BUSCAR LISTA DOS CENTRO DE DISTRIBUIÇÃO SELECIONADOS
    const centroDistribuicao = this.getCentroDistribuicoes();
    if (centroDistribuicao.length > 0) {
      params = params.set('cdRegional', centroDistribuicao.toString());
    }

    // BUSCAR LISTA DE FILIAIS SELECIONADAS
    const filiais = this.getFiliais();
    if (filiais.length > 0) {
      params = params.set('cdFilial', filiais.toString());
    }
    // BUSCAR LISTA DE ROTAS SELECIONADAS
    const rotas = this.getRotas();
    if (rotas.length > 0) {
      params = params.set('cdRota', rotas.toString());
    }
    return params;
  }


  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this.elementCD['cdSelecionadoLista'] = [];
    this._todosCDSelecionado = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this._todasFiliaisSelecionadas = [];
    this._todasRotasSelecionadas = [];
    this.elementRota['selecionadoLista'] = [];
  }

  getTodasFiliaisSelecionadas(): number[]{
    let listarFiliais = [];
    this.dataSource.filter(dataSource => dataSource.selecionado === true).forEach(filial => {
      listarFiliais.push(filial.cdFilial);
    });
    return listarFiliais;
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  /****************************************************************************************************/
  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {
    this.componentLoading = true;

    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.contemAlgumFiltro()) {
      // console.log('Filtros antes do GET', this.gerarFiltroParaConsulta().toString());

      // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
      this.exportarRelatorioSistemaAtualFaturamento(this.gerarFiltroParaConsulta().toString()).then(() => {
        this.componentLoading = false;
      });
    } else {
      this.componentLoading = false;
    }
  }

  // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
  exportarRelatorioSistemaAtualFaturamento(filtroPesquisa: string): Promise<Boolean> {
    // NOMEANDO O ARQUIVO EXCEL
    const nomeDoArquivoExcel = 'relatorio-sistema-atual-faturamento-loja';
    return new Promise((resolve) => {
      this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_SISTEMA_ATUAL_FATURAMENTO_LOJA + '?' + filtroPesquisa)
        .toPromise()
        .then((res: any) => {

          if (res && res['_body']) {

            // FAÇO O DOWNLOAD DO EXCEL
            this.downloadFile(res['_body'], nomeDoArquivoExcel);

            Swal.fire({
              title: 'Download concluído com sucesso!',
              text: 'Por favor, verifique seus downloads para abrir a exportação.',
              icon: 'success',
              confirmButtonText: 'Ok, obrigado',
              customClass: { confirmButton: 'setBackgroundColor' }
            });
            resolve(true);
          }
        })
        .catch((error) => {
          resolve(false);
          // CHAMO METÓDO DE TRATAMENTO DE ERROS
          this.handleError(error);
        });
    });
  }

  // DOWNLOADER DO EXCEL DE DADOS
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
  handleError(error: any) {
    if (error.status === 404) {
      Swal.fire({
        title: 'Não encontramos nenhum registro!',
        html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else if (error.status === 0) {
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
        html: `Log error: ${error.error.mensagem}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }

}
