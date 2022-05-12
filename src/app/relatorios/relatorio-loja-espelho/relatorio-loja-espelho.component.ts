import { Observable, of } from 'rxjs';
import { fadeInOut } from './../../commons/const/animation';
import { ServicePath } from './../../commons/const/ServicePath';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Http } from '@angular/http';
import { ValidatorHelper } from './../../commons/helpers/validator.helper';
import { HttpParams, HttpClient } from '@angular/common/http';
import { UtilsHelper } from './../../commons/helpers/utils.helper';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HeaderService } from './../../commons/services/header.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'rd-relatorio-loja-espelho',
  templateUrl: './relatorio-loja-espelho.component.html',
  styleUrls: ['./relatorio-loja-espelho.component.scss'],
  animations: [fadeInOut]

})
export class RelatorioLojaEspelhoComponent implements OnInit {

  relatorioForm = new FormGroup({
    _inputDeConsulta: new FormControl(''),
  });

  constructor(
    // private formBuilder: FormBuilder,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _httpClient: HttpClient
  ) { }

  // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
  expandir: Boolean = true;

  // LOADING (INTERAÇÃO COM O USER)
  componentLoading: Boolean = false;

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  _dataInicialConsulta: any;
  _dataFinalConsulta: any;
  _dataInicial = new Date();
  _dataFinal = new Date();
  _inputDeConsulta = [];
  _inputSelecionado = document.querySelector('inputFiltro');
  _todasLojasDigitadas = [];
  _todasLojasDigitadasString = this._todasLojasDigitadas;
  _placeHolder = 'Digite o código da loja sem demanda';
  _placeHolderProdutoEspelho = 'Digite o código da loja espelho';
  valorDoInput = '1';
  btnCadastroVigente = '';
  _veficarBotaoDesabilitado = false;

  cdOperador = localStorage.getItem('cdOperador')



  // MÉTODO PARA LIMPAR O CAMPO O "LIXO GERADO" NO CAMPO INPUT QUANDO O USAR APERTA TECLA SPACE
  keyUpMetodo(tecla) {
    if ((tecla.keyCode > 64 && tecla.keyCode < 91) || (tecla.keyCode > 191 && tecla.keyCode <= 255)) {
      this.relatorioForm.get('_inputDeConsulta').setValue('');
      this._veficarBotaoDesabilitado = false;
    } else if (this.relatorioForm.get('_inputDeConsulta').value === '') {
      this._veficarBotaoDesabilitado = false;
    } else if (tecla.code === 'Space') {
      this._veficarBotaoDesabilitado = false;
      this.relatorioForm.get('_inputDeConsulta').setValue('');
    } else {
      this._veficarBotaoDesabilitado = true;
    }
  }

  capturarInput(e) {
    this.valorDoInput = e.value;
    this.relatorioForm.get('_inputDeConsulta').setValue('');
    if (e.value === '1') {
      this._placeHolder = 'Digite o código do loja sem demanda';
    } else {
      this._placeHolder = this._placeHolderProdutoEspelho;
    }

  }

  ngOnInit() {
    // TÍTULO DA PAGÍNA
    this._headerService.setTitle('Relatório Loja Espelho');
  }

  getLojaEspelho(): number[] {
    let loja = this.relatorioForm.get('_inputDeConsulta').value;
    if (!this._utils.isEmpty(loja)) {
      loja = loja.split(',');
      loja = loja.filter(filial => filial !== '');
    }
    return loja;
  }

  getLojaSemDemanda(): number[] {
    let semDemanda = this.relatorioForm.get('_inputDeConsulta').value;
    if (!this._utils.isEmpty(semDemanda)) {
      semDemanda = semDemanda.split(',');
      semDemanda = semDemanda.filter(filial => filial !== '');
    }
    return semDemanda;
  }

  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta(): HttpParams {
    let params: HttpParams = new HttpParams()
      .set('dtInicio', this._validator.formataData(this._dataInicialConsulta))
      .set('cdOperador', this.cdOperador)

    // BUSCAR LISTA DE LOJAS DIGITADAS
    if (this.valorDoInput === '2') {
      let codigosLojaEspelho = this.getLojaEspelho();
      if (codigosLojaEspelho === null) {
        codigosLojaEspelho = [];
      } else if (codigosLojaEspelho.length > 0) {
        params = params.set('cdFilialEspelho', codigosLojaEspelho.toString());
      }
    } else {
      // BUSCAR LISTA DE LOJAS SEM DEMANDA DIGITADOS
      let codigosLojaSemDemanda = this.getLojaSemDemanda();
      if (codigosLojaSemDemanda === null) {
        codigosLojaSemDemanda = [];
      } else if (codigosLojaSemDemanda.length > 0) {
        params = params.set('cdFilial', codigosLojaSemDemanda.toString());
      }
    }
    return params;
  }

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this.getLojaSemDemanda() !== null && this.getLojaSemDemanda().length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, Filtro incompleto!',
        html: 'Por favor, selecione o filtro de <strong>loja sem demanda</strong> ou <strong>loja espelho</strong> para prosseguir.',
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
      titulo = 'Atenção, é necessário selecionar a data inicial de exportação.';
      texto = 'Por favor, preencher a data.';
      retornoValidacaoDatas = false;

      // DATA INICIAL (MAIOR) QUE DATA FINAL
    } else if (this._dataInicial > this._dataFinal) {
      icone = 'warning';
      titulo = 'Atenção, data Inicial maior que data Final!';
      texto = 'Por favor, <strong>data inicial</strong> deve ser menor que a <strong>data atual</strong>.';
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
    this._dataInicial = this._validator.formataData(new Date());
    this._dataFinal = new Date();
    this.relatorioForm.get('_inputDeConsulta').setValue('');
    this._veficarBotaoDesabilitado = false;
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  /****************************************************************************************************/
  exportarCadastroVigente() {
    this.componentLoading = true;
    if (this.validarDataInserida()) {
      this.exportRequest(ServicePath.HTTP_EXPORT_RELATORIO_LOJA_ESPELHO
        + '?' + this.gerarFiltroParaConsulta().toString(), 'relatorio_cadastro_vigente');

      this.componentLoading = false;
    } else {
      this.componentLoading = false;
    }
  }


  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {
    this.componentLoading = true;

    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.validarDataInserida()) {
      if (this.contemAlgumFiltro()) {
        // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this.exportRequest(ServicePath.HTTP_EXPORT_RELATORIO_LOJA_ESPELHO
          + '?' + this.gerarFiltroParaConsulta().toString(), this.nomeArquivoExcel());
        this.componentLoading = false;
      } else {
        this.componentLoading = false;
      }
    } else {
      this.componentLoading = false;
    }
  }

  nomeArquivoExcel() {
    return this.valorDoInput !== '1' ? 'relatorio_loja_espelho' : 'relatorio_loja_sem_demanda';
  }

  // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
  exportRequest(urlTobeFech: string, nomeDoArquivoExcel?: string): Observable<boolean> {
    this._httpClient.get(urlTobeFech, { observe: 'response', responseType: 'text' })
      .subscribe((data) => {
        let _data = JSON.parse(data['body'])
        this.showModalConfig(`${_data.type}`, `${_data.mensagem}`, 'success');
      },
        ex => {
          if (typeof (ex.error) == 'string') ex.error = JSON.parse(ex.error);
          this.handleError(ex)
        });
    return of(true);
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

  // // DOWNLOAD CONCLUIDO COM SUCESSO
  // swallAlertMsgDownloadSucesso() {
  //   Swal.fire({
  //     title: 'Download concluído com sucesso!',
  //     text: 'Por favor, verifique seus downloads para abrir a exportação.',
  //     icon: 'success',
  //     confirmButtonText: 'Ok, obrigado',
  //     customClass: { confirmButton: 'setBackgroundColor' }
  //   });
  // }

  // CONFIGURAÇÕES DO MODAL
  showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
    let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
    let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
    Swal.fire({ ...options, ...message })
  }


    // TRATAMENTO DE ERROS
    handleError(error: any) {
      this.componentLoading = false
      if (typeof (error) == 'string') error = JSON.parse(error)
      if (error.status === 404) {
          this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
      } else if (error.status === 0 || error.status === 400 ||  error.status === 403 || error.status === 500) {
          this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
      } else {
          this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
      }
  }
}


