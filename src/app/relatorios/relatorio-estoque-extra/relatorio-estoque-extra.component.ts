import { error } from 'protractor';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper } from 'src/app/commons';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { ServicePath } from '../../commons/const/ServicePath';
import { MotivoConfigModel } from 'src/app/commons/components/combos/motivo-estoque-extra/motivo-estoque-extra-combo.component';

@Component({
  selector: 'rd-relatorio-estoque-extra',
  templateUrl: './relatorio-estoque-extra.component.html',
  styleUrls: ['./relatorio-estoque-extra.component.scss'],
  animations: [fadeInOut]
})
export class RelatorioEstoqueExtraComponent implements OnInit {

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _http: Http
  ) { }

  // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
  @ViewChild('elementMotivo') elementMotivo: ElementRef;
  @ViewChild('elementTipoEstoque') elementTipoEstoque: ElementRef;

  pathService: MotivoConfigModel = {
    pathService: 'estoqueExtra/relatorio/motivos',
  }

  // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
  expandir: Boolean = true;

  // LOADING (INTERAÇÃO COM O USER)
  componentLoading: Boolean = false;

  // INFOS SOBRE CREDENCIAS DE USUÁRIO (LOGIN)
  cdOperador = localStorage.getItem('cdOperador');

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  _todosMotivosSelecionados = [];
  _tipoEstoqueSelecionados = [];
  _dataInicialConsulta: any;
  _dataFinalConsulta: any;
  _dataInicial = new Date();
  _dataFinal = new Date();
  _todosProdutosSelecioandos = [];
  _msgParaHabilitarProdutos = 'Digite os códigos dos produtos separados por virgula';
  _msgParaHabilitarFilial = 'Digite os códigos das filiais separos por virgula';
  _todosProdutosDigitados = [];
  _todasFiliaisDigitadas = [];
  _codigo_LMPM_dropList = '3';


  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Estoque Extra');


    // DISPARO VERIFICAÇOES CONDICIONAIS PARA CONSULTA LMPM
    const $capturarEventoFocusOut = (<HTMLElement>document.querySelector('#focusOut'));
    $capturarEventoFocusOut.addEventListener('click', (e) => {
        e.stopPropagation();
        this.validacaoDropListConsultaLMPM();
    });
    $capturarEventoFocusOut.addEventListener('blur', (e) => {
        e.stopPropagation();
        (<HTMLElement>document.querySelector('#legendaLMPM')).style.display = 'none';
    });
  }

  /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
  /***************************************************************************************************/

  // CONTROLA OS DADOS SELECIONADOS NOS FILTROS DE CONSULTA

  // MOTIVOS SELECIONADOS
  todosMotivosSelecionados(callBack) {
    this._todosMotivosSelecionados = callBack;
  }

  getMotivosEstoque() {
    if (this._utils.isEmpty(this._todosMotivosSelecionados)) {
      return [];
    }
    return this._todosMotivosSelecionados;
  }

  // TIPOS SELECIONADOS
  tipoEstoqueSelecionados(callBack) {
    this._tipoEstoqueSelecionados = callBack;
  }
  getTipoEstoque() {
    if (this._utils.isEmpty(this._tipoEstoqueSelecionados)) {
      return [];
    }
    return this._tipoEstoqueSelecionados;
  }

  // FILIAL SELECIONADA
  getFiliais() {
    let filiais = this._todasFiliaisDigitadas;
    if (this._utils.isEmpty(filiais)) {
      return [];
    }
    filiais = filiais.toString().split(',');
    filiais = filiais.filter(prod => prod !== '');
    return filiais;
  }

  getProdutos() {
    let produtos = this._todosProdutosDigitados;
    if (this._utils.isEmpty(produtos)) {
      return [];
    }
    produtos = produtos.toString().split(',');
    produtos = produtos.filter(prod => prod !== '');
    return produtos;
  }



    // VERIFICAR SE LMPM ESTÁ SOZINHO NA CONSULTA
    // CONSULTA DE LMPM DEVERÁ SER EM FLUXO SEPARADO
    validacaoDropListConsultaLMPM () {
        const item = this._todosMotivosSelecionados;
        const targetBlockNone = (<HTMLElement>document.querySelector('#legendaLMPM'));

        // O ARRAY ITEM NÃO PODE CONTER MOTIVO SELECIONADO ('3') E O LENGTH SER MAIOR QUE (1)
        // LMPM DEVE SER EXECUTADO INDIVIDUALMENTE
        if ((item.indexOf(this._codigo_LMPM_dropList) !== -1) && (item.length > 1)) {
            targetBlockNone.style.display = 'block';

        } else if (item.indexOf(this._codigo_LMPM_dropList) !== -1) {

            // ARRAY CONTENDO APENAS LMPM FAÇO A TROCA DO LABEL DO INPUT TEXT
            this._msgParaHabilitarProdutos = 'Motivo LMPM apenas (01) Sku por pesquisa';

        } else {
            this._msgParaHabilitarProdutos = 'Digite os códigos dos produtos separados por virgula';
        }
    }


  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta(): HttpParams {

    let params: HttpParams = new HttpParams()

      // DATA INICIAL E A DATA FINAL
      .set('dtInicioVigencia', this._validator.formataData(this._dataInicialConsulta))
      .set('dtFimVigencia', this._validator.formataData(this._dataFinalConsulta));

    // BUSCAR LISTA MOTIVOS SELECIONADOS
    const motivos = this.getMotivosEstoque();
    if (motivos.length > 0) {
      params = params.set('cdMotivo', motivos.toString());
    }

    // BUSCAR LISTA TIPOS SELECIONADOS
    const tipos = this.getTipoEstoque();
    if (tipos.length > 0) {
      params = params.set('cdTipo', tipos.toString());
    }

    // BUSCAR LISTA DE FILIAIS DIGITADOS
    const codigosFiliaisDigitados = this.getFiliais();
    if (codigosFiliaisDigitados.length > 0) {
      params = params.set('cdFilial', codigosFiliaisDigitados.toString());
    }

    // BUSCAR LISTA DE PRODUTOS DIGITADOS
    const codigosProdutosDigitados = this.getProdutos();
    if (codigosProdutosDigitados.length > 0) {
      params = params.set('cdProduto', codigosProdutosDigitados.toString());
    }

    params = params.set('cdOperador', this.cdOperador.toString());

    return params;
  }

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._todosMotivosSelecionados.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, Filtro incompleto!',
        // tslint:disable-next-line: max-line-length
        html: 'Por favor, selecione o filtro <strong>Motivo</strong>, e <strong>Data</strong> para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    }
  }

  // FAÇO A VALIDAÇÃO DO PERÍODO MÁXIMO DE PESQUISA (HOJE + 29 DIAS)
  // RECEBO (4) PARAMS (DATA INICIO, DATA FIM, VALOR MÁXIMO DE DIAS PARA PESQUISA, JANELA DE DIAS CONVERTIDO (MILISECUNDOS))
    rangeMaximoNoventaDias(primeiroDia: any, ultimoDia: any, qtdMaxDias: number, diasConvertidos: number) {

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
      texto = 'Por favor, preencher a vigência.';
      retornoValidacaoDatas = false;

      // DATA INICIAL (MAIOR) QUE DATA FINAL
    } else if (this._dataInicial > this._dataFinal) {
      icone = 'warning';
      titulo = 'Atenção, data fora de vigência!';
      texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
      retornoValidacaoDatas = false;

      // PESQUISA (MAIOR) QUE O MÁXIMO DE DIAS PERMITIDOS
    } else if (this.rangeMaximoNoventaDias(this._dataInicial, this._dataFinal, 30, 2592000000) === true) {
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
    this._todosMotivosSelecionados = [];
    this.elementMotivo['motivoSelecionadoLista'] = [];
    this._tipoEstoqueSelecionados = [];
    this.elementTipoEstoque['tipoEstoqueLista'] = [];
    this._todasFiliaisDigitadas = [];
    this._todosProdutosDigitados = [];
    (<HTMLElement>document.querySelector('#legendaLMPM')).style.display = 'none';
    this._msgParaHabilitarProdutos = 'Digite os códigos dos produtos separados por virgula';
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {

    this.componentLoading = true;

    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.validarDataInserida()) {
      if (this.contemAlgumFiltro()) {

        // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_ESTOQUE_EXTRA + '?' + this.gerarFiltroParaConsulta().toString())
        .subscribe(data => {
            data = data.json();
            this.mostraModalEnviandoEmail(data);
          }, (error) => this.handleError(error)).add(() => this.componentLoading = false)

        this.componentLoading = false;

      } else { this.componentLoading = false}
    } else {this.componentLoading = false}
  }

  // MOSTRO MODAL MENSAGEM - RELATÓRIO ENVIADO PARA O E-MAIL
  mostraModalEnviandoEmail (data:any) {
    Swal.fire({
      title: `${data.type}`,
      html: `${data.mensagem}`,
      icon: 'success',
      confirmButtonText: 'Ok, obrigado',
      customClass: { confirmButton: 'setBackgroundColor' }
    });
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

      this.limparCampos();

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

        this.limparCampos();

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


}

