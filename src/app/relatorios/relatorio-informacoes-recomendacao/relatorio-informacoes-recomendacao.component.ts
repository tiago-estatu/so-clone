import { RecomendacaoService } from './../../commons/services/recomendacao/recomendacao.service';
import { fadeIn, fadeInOut } from './../../commons/const/animation';

import { HeaderService } from './../../commons/services/header.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { CdService, LoadingService , UtilsHelper, ValidatorHelper } from 'src/app/commons';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';



@Component({
  selector: 'rd-relatorio-informacoes-recomendacao',
  templateUrl: './relatorio-informacoes-recomendacao.component.html',
  styleUrls: ['./relatorio-informacoes-recomendacao.component.scss'],
  animations: [fadeIn, fadeInOut]

})
export class RelatorioInformacoesRecomendacaoComponent implements OnInit {
  form: FormGroup;
  queryFilters: QueryFilters;
  fileControl: FormControl = new FormControl('');


  constructor(
    private _fb: FormBuilder,
    private _service: RecomendacaoService,
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _loader: LoadingService,
    private _cdService: CdService,
    private _validator: ValidatorHelper,



  ) { }

  // VARIAVEL ULTILIZADA NA SELEÇÃO UNICA DOS FILTROS
  expandir = true;

  _todosCDSelecionado = [];
  _setorCdSelecionado = [];
  _todosGruposSelecionados = [];

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Relatório Recomendação');

    this.form = this._fb.group({ cdRegional: [[], Validators.required], cdSetorSeparacao: [[]], dtInicio: new Date, dtFim: new Date });

    this.queryFilters = new QueryFilters([
      new RequestParamModel('cdRegional', []),
      new RequestParamModel('cdSetorSeparacao', []),
      new RequestParamModel('dtInicio', new Date(), 'dtInicio', this._validator.formataData),
      new RequestParamModel('dtFim', new Date(), 'dtFim',this._validator.formataData),
      new RequestParamModel('page', 0),
      new RequestParamModel('size', 10),
    ], this.form)

  }
  // get getDtInicio(){
  //   return  this.filterForm.get('dtInicio').value;
  // }
  // get getDtFim(){
  //   return  this.filterForm.get('dtFim').value;
  // }

  // get getDtInicioFormatada(){
  //   return this._validator.formataData(this.filterForm.get('dtInicio').value);
  // }

  // get getDtFimFormatada(){
  //   return this._validator.formataData(this.filterForm.get('dtFim').value);
  // }


  gerarObjtoPayLoadRequest() {
    let setorCdSelecionados;
    let obj = [];

    // VERIFICO QUANTOS SETOR CD FORAM LECIONADOS
    setorCdSelecionados = this.getSetorCd().length > 0 ? this.getSetorCd() : setorCdSelecionados = setorCdSelecionados;

    // FAÇO CRIAÇÃO DO OBJETO QUE SERÁ ENVIADO NO PAYLOAD DO CADASTRO
    // PARA CADA SETOR CD SELECIONADO MONTO UM NOVO OBJETO
    setorCdSelecionados.map((i) => obj.push({ cdRegional: this.getCdRegional().toString(), cdSetorSeparacao: i }))

    return obj;
  }

  consultaRecomendacao(page?: number) {
    this.queryFilters.updateParam('page', typeof page == 'number' ? page : this.queryFilters.getParam('page'));
    this._service.getParametrizacaoSetor(this.queryFilters)
  }

  habilitarBtoConsultarSetores() {
    if ((this.getCdRegional().length > 0) &&
      (this.getSetorCd().length === 0) ) {
      return false
    } else {
      this.resultaConsult.value.length = 0
      return true;
    }
  }

  getPage = (pageEvent: number) => this.consultaRecomendacao(pageEvent)


  // DROPLIST CD's SELECIONADOS
  todosCentroDistribuicaoSelecionados = (callBack) => this._todosCDSelecionado = callBack;
  getCdRegional = () => (this._utils.isEmpty(this._todosCDSelecionado)) ? [] : this._todosCDSelecionado;

  // DROPLIST SETOR CD SELECIONADOS
  setorCdSelecionados = (callBack) => this._setorCdSelecionado = callBack;
  getSetorCd = () => (this._utils.isEmpty(this._setorCdSelecionado)) ? [] : this._setorCdSelecionado;

  // PREPARA OS PARAMETROS EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS
  gerarFiltros(): HttpParams {
    let params: HttpParams = new HttpParams();

    params = this.getCdRegional().length > 0 ? params.set('cdRegional', this.getCdRegional().toString()) : params = params;
    params = this.getSetorCd().length > 0 ? params.set('cdSetorSeparacao', this.getSetorCd().toString()) : params = params;

    return params;
  }

  exportar() {
    if(this.form.valid) {
      this._service.exportarRelatorio(this.queryFilters).subscribe()
    } else {
      let dtInicioErrors = this.form.errors ? this.form.errors.maxRange : null;

      let messages = [
        {value: 'Selecione um centro de distribuição válido', validator: this.form.get('cdRegional').valid},
        {value: 'Selecione um fornecedor válido', validator: this.form.get('cdFornecedor').valid},
        {value: (!!dtInicioErrors ? dtInicioErrors.value : 'Selecione uma data válida'), validator: !dtInicioErrors}
      ]

      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: messages.find(i => !i.validator).value
      })
    }
  }

  // LIMPAR DADOS PRÉ-SELECIONADOS
  limparCampos() {
    this._cdService.limpar();
    this._todosGruposSelecionados = [];
    this._todosCDSelecionado = [];
    this._setorCdSelecionado = [];
    // DISPLAY NONE GRID
    this.resultaConsult.value.length = 0
  }

  get resultaConsult() { return this._service.$dataSource }

  get paging() { return this._service.$paging }

  getFormField(field: string): FormControl { return this.form.get(field) as FormControl; }

  get componentLoading() { return this._loader.getStatus() }

}
