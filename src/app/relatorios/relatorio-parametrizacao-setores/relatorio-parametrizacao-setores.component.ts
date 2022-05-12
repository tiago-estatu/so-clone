import { fadeIn, fadeInOut } from './../../commons/const/animation';
import { HeaderService } from './../../commons/services/header.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdService, LoadingService, UtilsHelper, ValidatorHelper } from 'src/app/commons';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';

import { Http } from '@angular/http';
import { ServicePath } from '../../commons/const/ServicePath';

@Component({
  selector: 'rd-relatorio-parametrizacao-setores',
  templateUrl: './relatorio-parametrizacao-setores.component.html',
  styleUrls: ['./relatorio-parametrizacao-setores.component.scss'],
  animations: [fadeIn, fadeInOut]
})

export class RelatorioParametrizacaoSetoresComponent implements OnInit {

  form: FormGroup;
  queryFilters: QueryFilters;
  fileControl: FormControl = new FormControl('');
  @ViewChild('elementGrupoPrioridade') elementGrupoPrioridade: ElementRef;

  constructor(
    private _headerService: HeaderService,
    private _fb: FormBuilder,
    private _utils: UtilsHelper,
    private _loader: LoadingService,
    private _cdService: CdService,
    private _validator: ValidatorHelper,
    private _http: Http,
  ) { }

  expandir = true;

  _todosCDSelecionado = [];
  _setorCdSelecionado = [];
  _todosGruposSelecionados = [];
  _dataInicial = new Date();
  _dataFinal = new Date();
  cdOperador = localStorage.getItem('cdOperador');

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Parametrização de Setores');

    this.form = this._fb.group({
      cdRegional: [[], Validators.required],
      cdSetorSeparacao: [[]],
      dtInicio: [new Date(), Validators.required],
      dtFim: [new Date(), Validators.required]
    })
  }

  gerarFiltros() {
    this.queryFilters = new QueryFilters([
      new RequestParamModel('cdOperador', this.cdOperador),
      new RequestParamModel('cdRegional', []),
      new RequestParamModel('cdSetorSeparacao', []),
      new RequestParamModel('itimSetorSeparacao', this._todosGruposSelecionados),
      new RequestParamModel('dtFim', new Date(), 'dtFim', this._validator.formataData),
      new RequestParamModel('dtInicio', new Date(), 'dtInicio', this._validator.formataData),
    ], this.form)
  }

  // DROPLIST CD's SELECIONADOS
  todosCentroDistribuicaoSelecionados = (callBack) => this._todosCDSelecionado = callBack;
  getCdRegional = () => (this._utils.isEmpty(this._todosCDSelecionado)) ? [] : this._todosCDSelecionado;

  // DROPLIST SETOR CD SELECIONADOS
  setorCdSelecionados = (callBack) => this._setorCdSelecionado = callBack;
  getSetorCd = () => (this._utils.isEmpty(this._setorCdSelecionado)) ? [] : this._setorCdSelecionado;

  // DROPLIST GRUPOS SELECIONADOS
  gruposItimSelecionados = (callBack) =>  this._todosGruposSelecionados = callBack;

  getGruposItim = () => {
    (this._utils.isEmpty(this._todosGruposSelecionados)) ? [] : this._todosGruposSelecionados;
  }

  get getDtInicio() {
    return this.form.get('dtInicio').value;
  }
  get getDtFim() {
    return this.form.get('dtFim').value;
  }
  get getDtInicioFormatada() {
    return this._validator.formataData(this.form.get('dtInicio').value);
  }
  get getDtFimFormatada() {
    return this._validator.formataData(this.form.get('dtFim').value);
  }

  getFormField(field: string): FormControl { return this.form.get(field) as FormControl; }

  get componentLoading() { return this._loader.getStatus() }

  // VERIFICAÇÃO SE A LÓGICA DE SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._todosCDSelecionado.length > 0) {
      return true;
    } if (this.validarDataInserida()) {
      Swal.fire({
        title: 'Atenção, filtro incompleto!',
        html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong>.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    } else {
      this.msgObrigatorio()
    }
  }

  msgObrigatorio() {
    Swal.fire({
      title: 'Atenção, filtro incompleto!',
      html: 'Por favor, selecione <strong>Centro e Distribuição</strong>, <strong>Data Inicial</strong> e <strong>Data Final</strong>.',
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
    const dtInicio = this.getDtInicio;
    const dtFim = this.getDtFim;

    // DATAS NãO FORAM PREENCHIDAS
    if (this._utils.isEmpty(dtInicio) || this._utils.isEmpty(dtFim)) {
      icone = 'warning';
      titulo = 'Atenção, é necessário selecionar as datas.';
      texto = 'Por favor, preencher <strong>data inicial</strong> e <strong>data final</strong>.';
      retornoValidacaoDatas = false;

      // DATA INICIAL (MAIOR) QUE DATA FINAL
    } else if (dtInicio > dtFim) {
      icone = 'warning';
      titulo = 'Atenção, data fora de vigência!';
      texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
      retornoValidacaoDatas = false;

      // PESQUISA MAIOR QUE O MÁXIMO DE DIAS PERMITIDOS (DIA ATUAL + 29)
    } else if (this._utils.rangeMaximoEmDias(dtInicio, dtFim, 29) === true) {
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
    }

    return retornoValidacaoDatas;
  }

  // LIMPAR DADOS PRÉ-SELECIONADOS
  limparCampos() {
    this._cdService.limpar();
    this.elementGrupoPrioridade['selecionadoLista'] = [];
    this._todosGruposSelecionados = [];
    this._todosCDSelecionado = [];
    this._setorCdSelecionado = [];
    this._dataInicial = new Date();
    this._dataFinal = new Date();
  }


  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {
    this.gerarFiltros()
    this._loader.carregar();
    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.contemAlgumFiltro()) {
      if (this.validarDataInserida()) {
        // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_PARAMETRIZACAO_SETORES + this.queryFilters.criarFiltro())
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
      customClass: {
        confirmButton: 'setBackgroundColor',
        title: 'setFontSize'
      },
    });
  }

  // TRATAMENTO DE ERROS
  handleError(error: any) {

    // let errorMensagem = JSON.parse(error._body) 
    let msg = error.mensagem || 'Por favor entre em contato com a equipe técnica.'

    if (error.status === 0) {
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
        html: `${msg}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      this.limparCampos();
    } else {
      Swal.fire({
        title: 'Oops!',
        html: `${msg}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }
}
