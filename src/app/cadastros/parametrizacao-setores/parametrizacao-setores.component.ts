import { map } from 'rxjs/operators';
import { fadeIn, fadeInOut } from './../../commons/const/animation';
import { HeaderService } from './../../commons/services/header.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CdService, LoadingService, ParametrizacaoSetorService, UtilsHelper, ValidatorHelper } from 'src/app/commons';
import Swal from 'sweetalert2';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { MatDialog } from '@angular/material';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { SetorItimService } from 'src/app/commons/services/setor-itim';
import { G } from '@angular/cdk/keycodes';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'rd-parametrizacao-setores',
  templateUrl: './parametrizacao-setores.component.html',
  styleUrls: ['./parametrizacao-setores.component.scss'],
  animations: [fadeIn, fadeInOut]
})
export class ParametrizacaoSetoresComponent implements OnInit {
  form: FormGroup;
  queryFilters: QueryFilters;
  fileControl: FormControl = new FormControl('');
  @ViewChild('elementGrupoPrioridade') elementGrupoPrioridade: ElementRef;


  constructor(
    private _fb: FormBuilder,
    private _service: ParametrizacaoSetorService,
    private _dialog: MatDialog,
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _loader: LoadingService,
    private _cdService: CdService,
    private _setorItimService: SetorItimService,

  ) { }

  // VARIAVEL ULTILIZADA NA SELEÇÃO UNICA DOS FILTROS
  expandir = true;

  _todosCDSelecionado = [];
  _setorCdSelecionado = [];
  _todosGruposSelecionados = [];

  ngOnInit() {
    // TÍTULO DA PÁGINA
    this._headerService.setTitle('Parametrização de Setores');

    this.form = this._fb.group({ cdRegional: [[], Validators.required], cdSetorSeparacao: [[]], itimSetorSeparacao: [[]] })

    this.queryFilters = new QueryFilters([
      new RequestParamModel('cdRegional', []),
      new RequestParamModel('cdSetorSeparacao', []),
      new RequestParamModel('itimSetorSeparacao', []),
      new RequestParamModel('page', 0),
      new RequestParamModel('size', 10),
    ], this.form)
  }


  cadastrarNovoSetor() {
    // this.gerarFiltros() --- VAI ENVIAR OS VALORES PARA SEREM MOSTRADOS NO MODAL DE CONFIRMAÇÃO
    // thia.gerarObjtoPayLoadRequest --- SERÁ O PAYLOAD DA REQUISIÇÃO
    this._service.cadastroNovoSetorFluxoTela(this.gerarFiltros(), this.gerarObjtoPayLoadRequest(), this.queryFilters);
  }

  gerarObjtoPayLoadRequest() {
    let setorCdSelecionados;
    let obj = [];

    // VERIFICO QUANTOS SETOR CD FORAM LECIONADOS
    setorCdSelecionados = this.getSetorCd().length > 0 ? this.getSetorCd() : setorCdSelecionados = setorCdSelecionados;

    // FAÇO CRIAÇÃO DO OBJETO QUE SERÁ ENVIADO NO PAYLOAD DO CADASTRO
    // PARA CADA SETOR CD SELECIONADO MONTO UM NOVO OBJETO
    setorCdSelecionados.map((i) => obj.push({ cdRegional: this.getCdRegional().toString(), cdSetorSeparacao: i, itimSetorSeparacao: this.getGruposItim().toString() }))

    return obj;
  }

  alterarSetor(linhaGridSelecionada) {
    this._service.alterarSetorFluxoTela(linhaGridSelecionada, this.queryFilters)
  }

  habilitarBtoCadastrarSetores() {
    return ((this.getCdRegional().length === 0) || (this.getSetorCd().length === 0) || (this.getGruposItim().length === 0)) ? true : false;
  }

  consultarSetores(page?: number) {
    this.queryFilters.updateParam('page', typeof page == 'number' ? page : this.queryFilters.getParam('page'));
    this._service.getParametrizacaoSetor(this.queryFilters)
  }

  importFile(event) {
    let fileData = event.target.files.item(0);
    if (!fileData) return
    this._service.importFile(fileData);
    this.fileControl.setValue('');
  }

  habilitarBtoConsultarSetores() {
    if ((this.getCdRegional().length > 0) &&
        (this.getSetorCd().length === 0) &&
        (this.getGruposItim().length === 0)) {
      return false
    } else {
      this.resultaConsult.value.length = 0
      return true;
    }
  }

  getPage = (pageEvent: number) => this.consultarSetores(pageEvent)

  // DOWNLOAD EXEL MODELO IMPORTAÇÃO
  downloadCSV = () => this._service.downloadCSV();

  // DROPLIST CD's SELECIONADOS
  todosCentroDistribuicaoSelecionados = (callBack) => this._todosCDSelecionado = callBack;
  getCdRegional = () => (this._utils.isEmpty(this._todosCDSelecionado)) ? [] : this._todosCDSelecionado;

  // DROPLIST SETOR CD SELECIONADOS
  setorCdSelecionados = (callBack) => this._setorCdSelecionado = callBack;
  getSetorCd = () => (this._utils.isEmpty(this._setorCdSelecionado)) ? [] : this._setorCdSelecionado;

  // DROPLIST GRUPOS SELECIONADOS
  GruposItimSelecionados = (callBack) => this._todosGruposSelecionados = callBack;
  getGruposItim = () => (this._utils.isEmpty(this._todosGruposSelecionados)) ? [] : this._todosGruposSelecionados;

  // PREPARA OS PARAMETROS EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS
  gerarFiltros(): HttpParams {
    let params: HttpParams = new HttpParams();

    params = this.getCdRegional().length > 0 ? params.set('cdRegional', this.getCdRegional().toString()) : params = params;
    params = this.getSetorCd().length > 0 ? params.set('cdSetorSeparacao', this.getSetorCd().toString()) : params = params;
    params = this.getGruposItim().length > 0 ? params.set('itimSetorSeparacao', this.getGruposItim().toString()) : params = params;

    return params;
  }

  // LIMPAR DADOS PRÉ-SELECIONADOS
  limparCampos() {
    this._cdService.limpar();
    this.elementGrupoPrioridade['selecionadoLista'] = [];
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
