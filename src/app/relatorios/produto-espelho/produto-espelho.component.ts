import { fadeInOut } from './../../commons/const/animation';
import { ServicePath } from './../../commons/const/ServicePath';
import { Http } from '@angular/http';
import { ValidatorHelper } from './../../commons/helpers/validator.helper';
import { HttpParams } from '@angular/common/http';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { UtilsHelper } from './../../commons/helpers/utils.helper';
import { HeaderService } from './../../commons/services/header.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'rd-produto-espelho',
  templateUrl: './produto-espelho.component.html',
  styleUrls: ['./produto-espelho.component.scss'],
  animations: [fadeInOut]

})
export class ProdutoEspelhoComponent implements OnInit {
  relatorioForm = new FormGroup({
    _dataInicial: new FormControl(new Date()),
    dataFinal: new FormControl(new Date()),
    _inputDeConsulta: new FormControl(''),
    produtosConsulta: new FormControl('')
  });


  constructor(
    private formBuilder: FormBuilder,
    private _headerService: HeaderService,
    private _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _http: Http
  ) { }

  // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
  expandir: Boolean = true;

  // LOADING (INTERAÇÃO COM O USER)
  componentLoading: Boolean = false;

  cdOperador = localStorage.getItem('cdOperador');

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  _dataInicialConsulta: any;
  _dataFinalConsulta: any;
  _dataInicial = new Date();
  _dataFinal = new Date();
  _inputDeConsulta = [];
  _inputSelecionado = document.querySelector('inputFiltro');
  _todosProdutosDigitados = [];
  _placeHolder = 'Digite o código do produto sem demanda';
  _placeHolderProdutoEspelho = 'Digite o código do produto espelho';
  valorDoInput = '1';

  capturarInput(e) {
    this.valorDoInput = e.value;
    this.relatorioForm.get('_inputDeConsulta').reset();
    if (e.value === '1') {
      this._placeHolder = 'Digite o código do produto sem demanda';
    } else {
      this._placeHolder = this._placeHolderProdutoEspelho;
    }
  }

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Produto Espelho');
  }

  getProdutoEspelho(): number[] {
    let produto = this.relatorioForm.get('_inputDeConsulta').value;
    if (!this._utils.isEmpty(produto)) {
      produto = produto.split(',');
      produto = produto.filter(filial => filial !== '');
    }
    return produto;
  }

  getProdutoSemDemanda(): number[] {
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

    // BUSCAR LISTA DE PRODUTOS DIGITADOS
    if (this.valorDoInput === '2') {
      const codigosProdutoEspelho = this.getProdutoEspelho();
      if (codigosProdutoEspelho.length > 0) {
        params = params.set('cdProdutoEspelho', codigosProdutoEspelho.toString());
      }
    } else {
      // BUSCAR LISTA DE PRODUTOS DIGITADOS
      const codigosProdutosSemDemanda = this.getProdutoSemDemanda();
      if (codigosProdutosSemDemanda.length > 0) {
        params = params.set('cdProdutoSemDemanda', codigosProdutosSemDemanda.toString());
      }
    }
    return params;
  }

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this.getProdutoSemDemanda().length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, Filtro incompleto!',
        // tslint:disable-next-line: max-line-length
        html: 'Por favor, selecione o filtro de <strong>produto sem demanda</strong> ou <strong>produto espelho</strong> para prosseguir.',
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
      titulo = 'Atenção, é necessário selecionar a data Inial de exportação.';
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
    this.relatorioForm.reset();
    this.relatorioForm.setValue({
      _dataInicial: new Date(),
      dataFinal: new Date(),
      _inputDeConsulta: (''),
      produtosConsulta: (''),
    });
    this._dataInicialConsulta = '';
    this._dataFinalConsulta = '';
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
        this.exportarRelatorio(this.gerarFiltroParaConsulta().toString()).then(() => {
          this.componentLoading = false;
          this.limparCampos();

        });
      } else {
        this.componentLoading = false;
      }
    } else {
      this.componentLoading = false;
    }
  }

  // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
  exportarRelatorio(filtroPesquisa: string): Promise<Boolean> {

    // NOMEANDO O ARQUIVO EXCEL
    const nomeDoArquivoExcel = 'relatorio_produto_espelho';

    return new Promise((resolve) => {
      this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_PRODUTO_ESPELHO + '?' + filtroPesquisa)
        .toPromise()
        .then((res: any) => {
          let result = JSON.parse(res['_body'])

          Swal.fire({
            title: `${result.type}`,
            html: `${result.mensagem}`,
            icon: 'success',
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
          });
          resolve(true);
        })
        .catch((error) => {
          resolve(false);
          // CHAMO METÓDO DE TRATAMENTO DE ERROS
          this.handleError(error);
        });
    });
  }

  // TRATAMENTO DE ERROS
  handleError(error: any) {

    if (error.status === 0) {
      Swal.fire({
        title: 'Serviço de consulta está fora!',
        html: 'Por favor entre em contato com a equipe técnica.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else if (error.status === 400 || error.status === 500) {
      Swal.fire({
        title: 'Atenção!',
        html: `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });

    }
    this.limparCampos();

  }
}
