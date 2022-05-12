import { HeaderService } from './../../commons/services/header.service';
import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { fadeInOut, fadeIn, ValidatorHelper, UtilsHelper, LoadingService } from 'src/app/commons';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { Http } from '@angular/http';
import { ServicePath } from '../../commons/const/ServicePath';

@Component({
  selector: 'rd-relatorio-prioridade-loja',
  templateUrl: './relatorio-prioridade-loja.component.html',
  styleUrls: ['./relatorio-prioridade-loja.component.scss'],
  animations: [fadeInOut, fadeIn]
})
export class RelatorioPrioridadeLojaComponent implements OnInit {

  constructor(
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _fb: FormBuilder,
    private _http: Http,
    private _loader: LoadingService,

  ) { }

  // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
  @ViewChild('elementCD') elementCD: ElementRef;
  @ViewChild('elementFilial') elementFilial: ElementRef;
  @ViewChild('elementGrupoPrioridade') elementGrupoPrioridade: ElementRef;

  // VARIAVEL ULTILIZADA NA SELEÇÃO UNICA DOS FILTROS
  selecaoUnicaGruposPrioridade = true;

  expandir = true;

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  _todosCDSelecionado = [];
  _todasFiliaisSelecionadas = [];
  _todosGruposSelecionados = [];
  _dataInicialConsulta: any;
  _dataFinalConsulta: any;
  _dataInicial = new Date();
  _dataFinal = new Date();
  cdOperador = localStorage.getItem('cdOperador');
  fileControl: FormControl;

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Prioridade de Loja');
    this.fileControl = this._fb.control('');
  }

  /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
  /***************************************************************************************************/

  // DROPLIST CD's SELECIONADOS
  todosCentroDistribuicaoSelecionados(callBack) {
    this._todosCDSelecionado = callBack;
  }
  getCentroDistribuicoes(): number[] {
    if (this._utils.isEmpty(this._todosCDSelecionado)) {
      return [];
    }
    return this._todosCDSelecionado;
  }

  // DROPLIST FILIAIS SELECIONADAS
  preencherFiliaisSelecionadas(callBack) {
    this._todasFiliaisSelecionadas = callBack;
  }
  getFiliais(): number[] {
    if (this._utils.isEmpty(this._todasFiliaisSelecionadas)) {
      return [];
    }
    return this._todasFiliaisSelecionadas;
  }

  // DROPLIST GRUPOS SELECIONADOS
  preencherGruposSelecionados(callBack) {
    this._todosGruposSelecionados = callBack;
  }
  getGrupos(): number[] {
    if (this._utils.isEmpty(this._todosGruposSelecionados)) {
      return [];
    }
    return this._todosGruposSelecionados;
  }

  // VERIFICAÇÃO SE A LÓGICA DE SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._todosCDSelecionado.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, filtro incompleto!',
        html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong>',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    }
  }

  msgObrigatorio() {
    Swal.fire({
      title: 'Atenção, filtro incompleto!',
      html: 'Por favor, selecione <strong>Centro e Distribuição</strong> e <strong>Data</strong>.',
      icon: 'warning',
      confirmButtonText: 'Ok, obrigado',
      customClass: { confirmButton: 'setBackgroundColor' }
    });
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
      titulo = 'Atenção, é necessário selecionar a data inicial e final.';
      texto = 'Por favor, preencher a vigência.';
      retornoValidacaoDatas = false;

      // DATA INICIAL (MAIOR) QUE DATA FINAL
    } else if (this._dataInicial > this._dataFinal) {
      icone = 'warning';
      titulo = 'Atenção, data fora de vigência!';
      texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
      retornoValidacaoDatas = false;

      // PESQUISA (MAIOR) QUE O MÁXIMO DE DIAS PERMITIDOS
    } else if (this.rangeMaximoNoventaDias(this._dataInicial, this._dataFinal, 30, 2505600000) === true) {
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

  // PREPARA OS PARAMETROS EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS
  gerarFiltroParaConsulta(): HttpParams {

    let params: HttpParams = new HttpParams();

    // DATA INICIAL E A DATA FINAL
    params = params.set('dtInicio', this._validator.formataData(this._dataInicialConsulta))
    params = params.set('dtFim', this._validator.formataData(this._dataFinalConsulta));
    params = params.set('cdOperador', this.cdOperador.toString()); 

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

    // BUSCAR LISTA DE GRUPO DE PRIORIDADE SELECIONADAS
    const grupoPrioridade = this.getGrupos();
    if (grupoPrioridade.length > 0) {
      params = params.set('cdGrupo', grupoPrioridade.toString());
    }
    return params;
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this.elementCD['cdSelecionadoLista'] = [];
    this._todosCDSelecionado = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this._todasFiliaisSelecionadas = [];
    this.elementGrupoPrioridade['selecionadoLista'] = [];
    this._todosGruposSelecionados = [];
    this._dataInicial = new Date();
    this._dataFinal = new Date();
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {
    this._loader.carregar();
    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.validarDataInserida()) {
      if (this.contemAlgumFiltro()) {
        // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_PRIORIDADE_LOJA + '?' + this.gerarFiltroParaConsulta().toString())
          .subscribe(
            data => {
              data = data.json();
              this.mostraModalEnviandoEmail(data);
            }, (error) => this.handleError(error)).add(() => this._loader.parar())
      } else { this._loader.parar() }
    } else { this._loader.parar() }
  }

  // MOSTRO MODAL MENSAGEM - RELATÓRIO ENVIADO PARA O E-MAIL
  mostraModalEnviandoEmail(data: any) {
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
    // this.componentLoading = false
    if (typeof (error) == 'string') error = JSON.parse(error)
    if (error.status === 404) {
      this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
    } else if (error.status === 0 || error.status === 400 || error.status === 500) {
      this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    } else {
      this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    }
  }

  // CONFIGURAÇÕES DO MODAL
  showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
    let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
    let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
    Swal.fire({ ...options, ...message })
  }

  // LOADING (INTERAÇÃO COM O USER)
  get componentLoading() {
    return this._loader.getStatus()
  }

}
