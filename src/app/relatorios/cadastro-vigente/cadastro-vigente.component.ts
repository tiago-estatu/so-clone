import { LocalizacaoFilialCdService } from '../../commons/services/localizacao-filial-cd-service';
import { ProdutoService } from 'src/app/commons';
// import { LocalizacaoCdFilialService } from '../../commons/services/localizacao-cd-filial-service/localizacao-filial-cd-service';
import { QueryFilters } from './../../commons/models/query-param.model';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ServicePath } from './../../commons/const/ServicePath';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper } from 'src/app/commons';
import { Observable, of } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { validateHorizontalPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'rd-cadastro-vigente',
  templateUrl: './cadastro-vigente.component.html',
  styleUrls: ['./cadastro-vigente.component.scss'],
  animations: [fadeInOut]
})
export class CadastroVigenteComponent implements OnInit {

  constructor(
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _httpClient: HttpClient,
    private _fb: FormBuilder,
    private _localizacaoService: LocalizacaoFilialCdService,
    private _produtoService: ProdutoService,

  ) { }

  // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
  expandir: Boolean = true;

  // LOADING (INTERAÇÃO COM O USER)
  componentLoading: Boolean = false;

  cdOperador = localStorage.getItem("cdOperador");

  // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
  queryParams: QueryFilters;
  relatorioForm: FormGroup;
  produtoSelecionado;
  localizacaoSelecionada;


  ngOnInit() {
    // TÍTULO DA PAGÍNA
    this._headerService.setTitle('Relatório Cadastro Produto Vigente');

    this.initForm()

  }

  initForm() {
    this.relatorioForm = this._fb.group({
      cdLocalizacao: ['', Validators.required],
      cdProduto: ['', Validators.required],
    });
    this.queryParams = new QueryFilters([
      new RequestParamModel('cdLocalizacao', [], null, (v) => (v || []).map(i => i.cdLocalizacao).join(',')),
      new RequestParamModel('cdProduto', [], null, (v) => (v || []).map(i => i.cdProduto).join(',')),
      new RequestParamModel('cdOperador', this.cdOperador),
    ], this.relatorioForm)
  }

  getControl(control: string): FormControl {
    return this.relatorioForm.get(control) as FormControl
  }

  // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
  gerarFiltroParaConsulta() {
    return this.queryParams.criarFiltro();
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this.relatorioForm.reset()
  }

  // MOSTRO / ESCONDO LOADING
  toggleLoading(value: boolean = false) { this.componentLoading = value }

  // CONFIGURAÇÕES DO MODAL
  showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
    let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
    let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
    Swal.fire({ ...options, ...message })
  }

  // VALIDAÇÕES DOS FILTROS
  contemAlgumFiltro(): boolean {
    let stringLocalizacao;

    if (this.relatorioForm.get('cdLocalizacao').valid || this.relatorioForm.get('cdProduto').valid) {
    } else {
      this.showModalConfig('Atenção, filtro incompleto!', 'Selecione uma <strong>localização</strong> ou <strong>produto</strong>.')
      return false;
    }
    if (this.relatorioForm.get('cdLocalizacao').valid) {
      stringLocalizacao = this.relatorioForm.get('cdLocalizacao').value[0].nmLocalizacao;
      // VERIFICA SE EXISTE STRING 'CD' NA LOCALIZAÇÃO SELECIONADA
      if (stringLocalizacao.search('CD')) {
        this.relatorioForm.controls['cdProduto'].setValidators['Validators.required'];
        if (this.relatorioForm.get('cdProduto').valid) {
        } else {
          this.showModalConfig('Atenção, filtro incompleto!', 'Ao selecionar uma filial, selecione um <strong>produto</strong>.')
          return false;
        }
      } else {
      }
    }

    return true;
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  exportarCadastroVigente() {
    this.contemAlgumFiltro() ? this.disparoChamadaApi() : ''
  }

  // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
  disparoChamadaApi() {
    this.componentLoading = true;
    this._httpClient.get(ServicePath.HTTP_EXPORT_RELATORIO_CADASTRO_VIGENTE + this.gerarFiltroParaConsulta().toString(), { observe: 'response', responseType: 'text' })
      .subscribe(
        res => {
          let type = JSON.parse(res.body).type
          let mensagem = JSON.parse(res.body).mensagem
          this.componentLoading = false;
          this.showModalConfig(`${type}`, `${mensagem}`, 'success');
        }, ex => this.handleError(ex))
  }

  // TRATAMENTO DE ERROS
  handleError(error: any) {
    this.componentLoading = false
    if (typeof (error) == 'string') error = JSON.parse(error)
    if (error.status === 404) {
      this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
    } else if (error.status === 0 || error.status === 400 || error.status === 500) {
      this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    } else {
      this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    }
  }
}



