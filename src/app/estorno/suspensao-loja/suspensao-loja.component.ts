import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper, EstornoAgendaFaturamentoService, AgendaFaturamentoModel, EstornoFaturamentoModel, ResponseEstornoFaturamentoModel } from 'src/app/commons';
import {  HttpParams } from '@angular/common/http';
import { EstornoFaturamentoDetalheComponent } from './suspender-faturamento-detalhe/suspender-faturamento-detalhe.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'rd-suspensao-loja',
  templateUrl: './suspensao-loja.component.html',
  styleUrls: ['./suspensao-loja.component.scss'],
  animations: [fadeInOut]
})
export class SuspensaoLojaComponent implements OnInit {
  constructor(
    private _service: EstornoAgendaFaturamentoService,
    private _dialogRef: MatDialog,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
  ) {
  }

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
  _todosProdutosDigitados;
  _todasFiliaisSelecionadas = [];
  _dataAtual = new Date();
  _msgProdutos = 'Digite os códigos separos por virgula';
  dataSource = [];
  nenhumItemSelecionado = true;
  itemsPerPage = 30;
  curPage = 1;
  totalItems = 0;
  selecionarTodos: Boolean = false; 
  //DEFINIÇÃO DO TAMANHO DO MODAL
  _widthModal = '600px';
  _heightModal = 'auto';


  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Estorno Suspensão Loja');


   this.setDatas();
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

setDatas(){
  this._dataInicial = new Date();
  this._dataFinal = new Date();

  this._dataInicial.setDate(this.getDataAmanha());
  this._dataFinal.setDate(this.getDataAmanha());
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

// VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
contemAlgumFiltro(): boolean {
  if (this._todosCDSelecionado.length > 0) {
    return true;
  } else {
    Swal.fire({
      title: 'Atenção, filtro incompleto!',
      // tslint:disable-next-line: max-line-length
      html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong> e <strong>Data</strong> para prosseguir.',
      icon: 'warning',
     confirmButtonText: 'Ok, obrigado',
      customClass: { confirmButton: 'setBackgroundColor' }
    });
    return false;
  }
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
      titulo = 'Atenção, filtros incompletos.';
      texto = 'É necessário selecionar as <strong>Datas</strong> e <strong>Centro de Distribuição</strong>.';
      retornoValidacaoDatas = false;
    }

    // DATA INICIAL (MAIOR) QUE DATA FINAL
    // else if (this._dataInicial > this._dataFinal) {
    //   icone = 'warning';
    //   titulo = 'Atenção, data fora de vigência!';
    //   texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
    //   retornoValidacaoDatas = false;
    // }

    // DISPARO O MODAL DE ALERTA (CUSTOMIZADA)
    if (!retornoValidacaoDatas) {
      Swal.fire({
        title: titulo,
        html: texto,
        icon: icone,
        confirmButtonText: btOkObrigado,
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }

    return retornoValidacaoDatas;
  }

  getDataAmanha() {
    var dias = 1;
    var dataAtual = new Date();
    dataAtual.setDate(dataAtual.getDate() + dias);
    return dataAtual.getDate();
  }
  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta(): HttpParams {

    let params: HttpParams = new HttpParams()
      .set('dtInicial', this._validator.formataData(this._dataInicialConsulta))
      .set('dtFinal', this._validator.formataData(this._dataFinalConsulta));

    // BUSCAR LISTA DOS CENTRO DE DISTRIBUIÇÃO SELECIONADOS
    const centroDistribuicao = this.getCentroDistribuicoes();
    if (centroDistribuicao.length > 0) {
      params = params.set('cdRegional', centroDistribuicao.toString());
    }

    // BUSCAR LISTA DAS FILIAIS
    const cdFilial = this.getFiliais();
    if (cdFilial.length > 0) {
      params = params.set('cdFilial', cdFilial.toString());
    }
    return params;
  }
limparGrid(){
  this.totalItems = 0;
  this.dataSource = [];
  this.curPage = 1;
  this.nenhumItemSelecionado = true;
}
  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this._dataInicialConsulta = '';
    this._dataFinalConsulta = '';
    this.elementCD['cdSelecionadoLista'] = [];
    this._todosCDSelecionado = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this._todasFiliaisSelecionadas = [];
    this.setDatas();
    this.limparGrid();

  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  /****************************************************************************************************/
  // MÉTODO DE CONSULTA
  consultaDados() {
    this.limparGrid();
    
      this._dataInicialConsulta = this._dataInicial;
      this._dataFinalConsulta = this._dataFinal;

    if (this.validarDataInserida() && this.contemAlgumFiltro()) {
      this.componentLoading = true;
        this._service.consultar(this.gerarFiltroParaConsulta()).subscribe(response => {
          this.dataSource = response;
          this.totalItems = this.dataSource.length;
          this.componentLoading = false;
        }, ex => {
          this.handleError(ex);
          this.componentLoading = false;
        } );
    }
  }
// MÉTODO DE ESTORNAR SELECIONADOS
estornarSelecionados(){
  let dados: AgendaFaturamentoModel[] = this.dataSource;
  let idFornecedorAgendas: number[] = [];
 
  dados = dados.filter( agenda => agenda.selecionado === true);
  dados.forEach(x => {
   idFornecedorAgendas.push(x.idFornecedorAgenda);
  })

  let jsonEnviar: EstornoFaturamentoModel = {
    cdOperador: this.cdOperador,
    dataInicio: this._validator.formataData(this._dataInicialConsulta),
    dataFim: this._validator.formataData(this._dataFinalConsulta),
    idFornecedorAgendas: idFornecedorAgendas
  };

  this.componentLoading = true;
  this._service.estornarSuspensao(jsonEnviar).subscribe(res => {
    Swal.fire({
      title: 'Agendas estornadas com sucesso!',
      html: this.gerarMsgModalSucesso(res),
      icon: 'success',
      confirmButtonText: 'Ok Fechar',
      customClass: { confirmButton: 'setBackgroundColor' }
    }).then(() => {
      this.consultaDados();
    });

    this.componentLoading = false;
  }, ex =>{
    Swal.fire({
      title: 'Ooops!',
      html: `${UtilsHelper.handleError(ex)}`,
      icon: 'warning',
      confirmButtonText: 'Ok Fechar',
      customClass: { confirmButton: 'setBackgroundColor' }
    }).then(() =>{
      this.consultaDados();
    });
    this.componentLoading = false;
  });
}

gerarMsgModalSucesso(res: ResponseEstornoFaturamentoModel[]){
   return  (`
   <table>
     <tr><td>Foram estornadas as agendas do período <strong>${this._validator.formataData(this._dataInicialConsulta)}</strong> até <strong>${this._validator.formataData(this._dataFinalConsulta)}</strong>.</td></tr>
   </table>
 `);
}

calcularQuantidadeTotalDeAgendasEstornadas(res: ResponseEstornoFaturamentoModel[]): number{
  let soma = 0;
  res.forEach(x => soma += x.quantidadeDatasEstornadas);
  return soma;
}

// VERIFICO SE EXISTE ALGUM ITEN
itemSelecionado() {
  this.nenhumItemSelecionado = (this.dataSource.filter(el => el.selecionado).length === 0);
}

// SELECIONAR (TODOS) OS CHECKBOX NA GRID DE RESULTADOS
selecionarTodosItens(event) {
    let contemSuspenso = false;
    this.dataSource.forEach(el => {
        el.selecionado = event.checked;
        contemSuspenso = true;
    });
    this.nenhumItemSelecionado = contemSuspenso;
    this.itemSelecionado();

}
 // EXIBIR A MODAL SUSPENDER FATURAMENTO DETALHE
 exibirModalFaturamentoSuspensoDetalhe(itensLinhaGrid) {
  this._dialogRef.open(EstornoFaturamentoDetalheComponent, {
      width: this._widthModal,
      height: this._heightModal,
      data: itensLinhaGrid
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
    }else if (error.status === 0) {
      Swal.fire({
        title: 'Serviço de consulta está fora!',
        html: 'Por favor entre em contato com a equipe técnica.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else {
      Swal.fire({
        title: 'Ooops!',
        html: `${UtilsHelper.handleError(error)}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }
}
