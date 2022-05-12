import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper } from 'src/app/commons';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { ServicePath } from '../../commons/const/ServicePath';

@Component({
  selector: 'rd-estorno-suspensao-loja',
  templateUrl: './estorno-suspensao-loja.component.html',
  styleUrls: ['./estorno-suspensao-loja.component.scss'],
  animations: [fadeInOut]
})
export class EstornoSuspensaoLojaComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _http: Http
  ) { }

  // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
  @ViewChild('elementCD') elementCD: ElementRef;
  @ViewChild('elementFilial') elementFilial: ElementRef;


  // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
  expandir: Boolean = true;

  // LOADING (INTERAÇÃO COM O USER)
  componentLoading: Boolean = false;

  // INFOS SOBRE CREDENCIAS DE USUÁRIO (LOGIN)
  cdOperador = localStorage.getItem('cdOperador');

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  _dataInicialConsulta: any;
  _dataFinalConsulta: any;
  _dataInicial = new Date();
  _dataFinal = new Date();
  _todosCDSelecionado = [];
  _todasFiliaisSelecionadas = [];

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Estorno Suspensão Loja');
  }

  /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
  /***************************************************************************************************/

  // CONTROLA OS DADOS SELECIONADOS NOS FILTROS DE CONSULTA
  // CD SELECIONADO
  todosCentroDistribuicaoSelecionados(callBack) {
    this._todosCDSelecionado = callBack;
  }
  getCentroDistribuicao(): number[] {
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

  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta(): HttpParams {

    let params: HttpParams = new HttpParams()

      // DATA INICIAL E A DATA FINAL
      .set('dtInicial', this._validator.formataData(this._dataInicialConsulta))
      .set('dtFinal', this._validator.formataData(this._dataFinalConsulta));

      // BUSCAR LISTA DE FILIAIS SELECIONADAS
      const codigosFiliaisSelecionadas = this.getFiliais();
      if (codigosFiliaisSelecionadas.length > 0) {
        params = params.set('cdFilial', codigosFiliaisSelecionadas.toString());
      }

      // BUSCAR LISTA DE CD SELECIONADOS
      const codigosCDSelecionados = this.getCentroDistribuicao();
      if (codigosCDSelecionados.length > 0) {
        params = params.set('cdRegional', codigosCDSelecionados.toString());
      }
    return params;
  }

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._todosCDSelecionado.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, Filtro incompleto!',
        // tslint:disable-next-line: max-line-length
        html: 'Por favor, selecione o filtro <strong>CD</strong> e <strong>Data</strong> para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    }
  }

  // FAÇO A VALIDAÇÃO DO PERÍODO MÁXIMO DE PESQUISA (HOJE + 29 DIAS)
  // RECEBO (4) PARAMS (DATA INICIO, DATA FIM, VALOR MÁXIMO DE DIAS PARA PESQUISA, JANELA DE DIAS CONVERTIDO (MILISECUNDOS))
  rangeMaximoTrintaDias(primeiroDia: any, ultimoDia: any, qtdMaxDias: number, diasConvertidos: number) {

    // RECEBO PARAMETRO DA QUANTIDADE MAX DE DIAS NO RANGE DE BUSCA
    const limitandoQtdDiasDePesquisa = new Date();
    limitandoQtdDiasDePesquisa.setDate(limitandoQtdDiasDePesquisa.getDate() + qtdMaxDias);

    // RECEBO DATA INICIO DA PESQUISA
    const primeiroDiaDoRange = primeiroDia;
    primeiroDiaDoRange.setDate(primeiroDiaDoRange.getDate());

    // RECEBO DATA FINAL DA PESQUISA
    const ultimoDiaDoRange = ultimoDia;
    ultimoDiaDoRange.setDate(ultimoDiaDoRange.getDate());

    // VERIFICO SE A DIFERNÇA ENTRE O (ULTIMO DIA) E O (PRIMEIRO DIA) É MAIOR QUE (DIAS CONVERIDOS)
    const diferencaEmMilisegundos = (ultimoDiaDoRange.getTime() - primeiroDiaDoRange.getTime());

    // RETORNO
    return (diferencaEmMilisegundos > diasConvertidos ? true : false);
  }


  // VALIDAR AS DATA INSERIDAS
  validarDataInserida(): boolean {
    // VARIAVEIS PARA CONFIGURAÇÕES (CUSTOMIZADAS) PARA OS SWEETALERT (MODAIS)
    let titulo: string;
    let texto: string;
    let icone: SweetAlertIcon; // SweetAlertIcon:string ('success' | 'error' | 'warning' | 'info' | 'question')
    const btOkObrigado = 'Ok, Obrigado';
    /*******************************************************************/

    let retornoValidacaoDatas = true;
    // DATAS NãO FORAM PREENCHIDAS
    if (this._utils.isEmpty(this._dataInicial) || this._utils.isEmpty(this._dataFinal)) {
      icone = 'warning';
      titulo = 'Atenção, é necessário selecionar as datas.';
      texto = 'Por favor, preencher as <strong>datas</strong>.';
      retornoValidacaoDatas = false;

      // PESQUISA (MAIOR) QUE O MÁXIMO DE DIAS PERMITIDOS
    } else if (this.rangeMaximoTrintaDias(this._dataInicial, this._dataFinal, 30, 2592000000) === true) {
      icone = 'warning';
      titulo = 'Atenção, data fora de vigência!';
      texto = 'A pesquisa máxima é de 30 dias.';
      retornoValidacaoDatas = false;
    }

    // DISPARO O MODAL DE ALERTA (CUSTOMIZADA)
    if (!retornoValidacaoDatas) {
      Swal.fire({
        title: titulo,
        html: texto,
        icon: icone,
        confirmButtonText: btOkObrigado,
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else {
      this._dataInicialConsulta = this._dataInicial;
      this._dataFinalConsulta = this._dataFinal;
    }

    return retornoValidacaoDatas;
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this._dataInicialConsulta = '';
    this._dataFinalConsulta = '';
    this._dataInicial = new Date();
    this._dataFinal = new Date();
    this.elementCD['cdSelecionadoLista'] = [];
    this._todosCDSelecionado = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this._todasFiliaisSelecionadas = [];
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  /****************************************************************************************************/


  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {

    this.componentLoading = true;

    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.validarDataInserida()) {
      if (this.contemAlgumFiltro()) {

        // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this.exportarRelatorioEstornoSuspensao(this.gerarFiltroParaConsulta().toString()).then(() => {
          this.componentLoading = false;

        });

      } else {
        this.componentLoading = false;
      }
    } else {
      this.componentLoading = false;
    }
  }

  // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
  exportarRelatorioEstornoSuspensao(filtroPesquisa: string): Promise<Boolean> {

    // NOMEANDO O ARQUIVO EXCEL
    const nomeDoArquivoExcel = 'relatorio_estorno_suspensao';

    return new Promise((resolve) => {
      this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_ESTORNO_SUSPENSAO + '?' + filtroPesquisa)
        .toPromise()
        .then((res: any) => {

          if (res && res['_body']) {

            // FAÇO O DOWNLOAD DO EXCEL
            this.downloadFile(res['_body'], nomeDoArquivoExcel);

            Swal.fire({
              title: 'Download concluído com sucesso!',
              text: 'Por favor, verifique seus downloads para abrir o arquivo exportado.',
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
    const msgLogErro = error.json();

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
    } else if (error.status === 400) {
      Swal.fire({
        title: 'Atenção!',
        html: `${msgLogErro.mensagem}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else {
      Swal.fire({
        title: 'Oops!',
        html: `${msgLogErro.mensagem}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }
}

