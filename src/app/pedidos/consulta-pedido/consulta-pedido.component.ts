import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInOut,
  HeaderService,
  MaskedDate,
  NewModalComponent,
  ValidatorHelper,
  CentroDistribuicaoModel,
  UtilsHelper} from 'src/app/commons';
import { PedidoService, ParametroRecomendacaoPageableModel, exportarRelatorio } from 'src/app/commons/services/pedido';
import { ParametroRecomendacao } from '../../commons/services/pedido/ParametroRecomendacao';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/internal/observable/of';
import Swal from 'sweetalert2';


import { CdService } from './../../commons/services/center-distribution/cd.service';
import { FabricanteService } from './../../commons/services/fabricante/fabricante.service';
import { FornecedorService } from './../../commons/services/fornecedor/fornecedor.service';

export interface jsonRelatorio {
  storeIds: number[],
  supplierIds: number[],
  codigoFabricante: number[],
  dataRecomendacao: string,
}
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rd-consulta-pedido',
  templateUrl: './consulta-pedido.component.html',
  styleUrls: ['./consulta-pedido.component.scss'],
  animations: [fadeInOut]
})
export class ConsultaPedidoComponent implements OnInit, OnDestroy {

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private headerService: HeaderService,
        private pedidoService: PedidoService,
        private _validator: ValidatorHelper,
        private _utils: UtilsHelper,
        private _cdService: CdService,
        private _fabricanteService: FabricanteService,
        private _forncedorService: FornecedorService,
      ) {
      }

  selection = new SelectionModel<any>(true, []);
  dropdownFornecedorLista = [];
  _todosFabricantesSelecionados = [];
  _todasRegioesSelecionadas = [];
  _todosFornecedoresSelecionados = [];
  curPage;

  mensagemModal;
  conteudoModal = true;
  tituloModal;
  createUrl = '';
  imagemModal;
  expandir = true;
  inputDataInicio;
  selecionarTodos: boolean;
  dataFinal = [];
  dropdownSettings: any = {};
  dateMask = MaskedDate;
  maxDate: Date;
  nenhumItemSelecionado: boolean = true;
  dtRecomendacao: Date;
  rotaVoltar = '/pedido/consulta';
  listaPedidosEfetivados: any = [];

  paginaAtual: number = 1;
  itemsPorPagina: number = 25;
  totalDeItems: number = 0;

  cdOperador = localStorage.getItem('cdOperador');

  @ViewChild('elementFabricante') elementFabricante: ElementRef;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  @ViewChild('cdChild') cdChild: ElementRef;
  @ViewChild('fornecedorChild') fornecedorChild: ElementRef;

  formPedido: FormGroup;
  componentLoading = false;

  dataSource: Observable<ParametroRecomendacao[]>= new Observable;

  selecionarTodosItens(event) {
    this.dataSource['value'].forEach(element => {
      element.selecionado = event.checked;
    });

    this.selecionarTodos = event.checked;

    this.contemItemSelecionado();
  }

  selecionarItem(event, element){
    element.selecionado = event.checked;
      const numSelected = this.dataSource['value'].filter(x=> x.selecionado).length;
      const numRows = this.dataSource['value'].length;
       if(numSelected === numRows){
        this.selecionarTodos = true;
      } else {
        this.selecionarTodos = false;
      }
      this.contemItemSelecionado();
  }

  ngOnInit() {
    this.headerService.setTitle('Emissão de Pedidos');

    this.formPedido = this.formBuilder.group({
      inputDataInicio: [this.dtRecomendacao, Validators.required],
    });

  }


  stringIt(json) {
    return JSON.stringify(json)
  }
  campoSelecionado($event) {
    const dict = {
      cd: 'todosCentroDistribuicaoSelecionado',
      fc: 'todosFornecedoresSelecionado',
      fb: 'preencherTodosFabricantesSelecionados'};
    this[dict[$event.field]]($event.data);
  }

  todosCentroDistribuicaoSelecionado(callBack) {
    this._todasRegioesSelecionadas = callBack;
  }

  todosFornecedoresSelecionado(callBack) {
    this._todosFornecedoresSelecionados = callBack;
  }

  getFornecedores(): number[]{
    if(this._utils.isEmpty(this._todosFornecedoresSelecionados)){
      return [];
    }
    return this._todosFornecedoresSelecionados;
  }


  get fields() { return this.formPedido.controls; }

  ngOnDestroy(): void {
  }

  contemItemSelecionado() {
    if (this._utils.isEmpty(this.dataSource['value'])) {
      this.nenhumItemSelecionado = true;
    } else {
    this.nenhumItemSelecionado = (this.dataSource['value'].filter(element => element.selecionado).length === 0);
    }
  }

  // EFETIVAÇÃO DO PEDIDO (SELECIONADO NA GRID)
  efetivar() {
    this.componentLoading = true;
    this.listaPedidosEfetivados = [];
    // PERCORRENDO A LISTA DE OPÇÕES DA GRID
    // VERIFICO QUAIS ESTÃO SELECIONADOS
    this.dataSource['value'].forEach(parametroRecomendacao => {
        // INCLUIR cdOperador ANTES DO ENVIO DO PEDIDO
        parametroRecomendacao.cdOperador = this.cdOperador.toString();

        if (parametroRecomendacao.selecionado === true) {
          this.pedidoService.getEmitirPedido(parametroRecomendacao).subscribe(
             (val) => {
               // POPULANDO ARRAY COM TODOS OS NÚMEROS DE PEDIDOS EFETIVADOS
               this.listaPedidosEfetivados.push(val);
             },
              response => {
                this.handleError(response);
              },
              () => {
                     // MOSTRO A MODAL DE SUCESSO CARREGANDO OS DADOS DOS EFETIVIADOS NO CORPO DA MODAL

                     this.imagemModal = 'check';
                     this.mensagemModal = '';
                     this.tituloModal = 'Pedido(s) emitido(s) com sucesso!';
                     this.modalChild.conteudoModal = true;
                     this.modalChild.openModal = true;
                     this.componentLoading = false;

                     this.consultar(this.paginaAtual);
                     return false;

                });
            }

        });
    }
  handleError(error) {
    if (error.status === 400) {
        this.mensagemModal = 'Esse pedido já foi efetivado!';
        this.imagemModal = 'warning';
        this.tituloModal = 'Oops!';
        this.modalChild.openModal = true;
        this.componentLoading = false;
    } else {
      this.mensagemModal = 'Item pedido não pode ser emitido, por favor entre em contato com a equipe técnica.';
      this.imagemModal = 'warning';
      this.tituloModal = 'Oops!';
      this.modalChild.openModal = true;
      this.componentLoading = false;
    }
  }
    setPage(pageNumber) {
      this.paginaAtual = pageNumber;
    }
    limparDataSource() {
      this.selecionarTodos = false;
      this.nenhumItemSelecionado = true;
      this.totalDeItems = 0;
      this.dataSource = new Observable<[]>();
    }
    // FAÇO A CONSULTA PARA RECARREGAR A GRID COM AS RECOMENDAÇÕES DISPOSNÍVEIS
    consultar(paginaAtual) {
        this.limparDataSource();

        this.setPage(paginaAtual);

        this.componentLoading = true;

        if (this.validarCampos()) {

            this.pedidoService.buscarPedidosPorCDFornecedorData(this.gerarParametros())
                .subscribe((res: ParametroRecomendacaoPageableModel) => {
                    // SEMPRE QUE OCORRER UMA NOVA CONSULTA, RETORNO A PAGINAÇAO PARA A PAGINA (1)

                    this.totalDeItems = res.totalElements;
                    // ATRIBUIÇÃO DO RESULTADO DA CONSULTA
                    this.dataSource = of(res.content);

                    // MOSTRO OS RESULTADOS NA TABELA DA GRID
                    this.displayBlockGridResultados();
                    this.contemItemSelecionado();

            }, ex => {
            if (ex.status === 404 || ex.status === 400) {
              this.componentLoading = false;

                this.esconderGridResultados();
                Swal.fire({
                  title: 'Nenhum dado encontrado',
                  html: ex.error.mensagem,
                  icon: 'warning',
                  confirmButtonText: 'Ok',
                  showCancelButton: false
                });
            }
            this.componentLoading = false;
            }).add(() => {
                this.componentLoading = false;
            });
        } else {
          this.componentLoading = false;
        }
    }

    goTo(event: { preventDefault: () => void; }, parametroRecomendacao: ParametroRecomendacao) {
        event.preventDefault();
        localStorage.setItem('parametroRecomendacao', JSON.stringify(parametroRecomendacao));

        this.router.navigateByUrl('/pedido/detalhe/' +
          parametroRecomendacao.cdRegional + '/' +
          parametroRecomendacao.cdFornecedor + '/' +
          parametroRecomendacao.cdFabricante + '/' +
          parametroRecomendacao.dtPedido + '/' + this.cdOperador);
    }

    gerarParametros(): HttpParams {
      let params: HttpParams = new HttpParams()
      .set('size', `${this.itemsPorPagina}`)
      .set('page', `${this.paginaAtual}`);
      params = params.set('dtPedido', this._validator.formataDataComBarraPadraoBr(this.fields.inputDataInicio.value));

      const pRegiao = this._todasRegioesSelecionadas;
      if (this._todasRegioesSelecionadas.length > 0) {
        params = params.set('cdRegional', pRegiao.toString());
      }

      const fornecedor = this.getFornecedores();
      if (fornecedor.length > 0) {
        params = params.set('cdFornecedor', fornecedor.toString());
      }

      const fabricante = this.getFabricantes();
      if (fabricante.length > 0) {
        params = params.set('cdFabricante', fabricante.toString());
      }

      params = params.set('cdOperador', this.cdOperador.toString());

      return params;
    }

    gerarParametrosParaResumo(): HttpParams {
      let params: HttpParams = new HttpParams()
        .set('dtPedido', this._validator.formataDataComBarraPadraoBr(this.fields.inputDataInicio.value));

      const pRegiao = this._todasRegioesSelecionadas.map(x => x['item_id']);
      if (this._todasRegioesSelecionadas.length > 0) {
        params = params.set('cdRegional', pRegiao.toString());
      }

      const fornecedor = this.getFornecedores();
      if (fornecedor.length > 0) {
        params = params.set('cdFornecedor', fornecedor.toString());
      }

      const fabricante = this.getFabricantes();
      if (fabricante.length > 0) {
        params = params.set('cdFabricante', fornecedor.toString());
      }

      params = params.set('cdOperador', this.cdOperador.toString());

      return params;
    }

  // RECEBO COMO PARAMETRO A MENSAGEM CUSTOMIZADA PARA CADA TIPO DE ERRO 'string'
  mostrarModalDeErro (mensagemModal: string) {
    Swal.fire({
      title: 'Não foi possível prosseguir',
      html: mensagemModal,
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'Ok',
    }).then(() =>{
      return false;
    })
  }

  // VALIDAÇÃO PARA EXECUTAR A CHAMADA DO SERVIÇO
  // REQUERIMENTOS MÍNIMOS: A CONSULTA DEVE CONTER AO MENOS
  // ******* (1)-CD OU (1)-FORNECEDOR SELECIONADO + DATA **********
  validarCampos() {
    if (this._todasRegioesSelecionadas.length !== 0) {
        // ALGUMA DATA FOI SELECIONADA ?
        if (this.fields.inputDataInicio.value !== null) {
            return true;
        } else {
            // DATA VAZIO -> MOSTRO MSG ERRO
            this.mostrarModalDeErro ('Por favor, selecione uma data!');
            return false;
        }

    } else {
        // DROPDOWN CD VAZIO -> MOSTRO MSG ERRO
        this.mostrarModalDeErro ('Por favor, selecione o centro de distribuição e data');
        this.componentLoading = false;
        }
    }

    // MOSTRO O CONTEUDO DA GRID DE RESULTADOS
    displayBlockGridResultados() {
        (<HTMLElement>document.querySelector('.table-consult')).style.display = 'block';
    }

    // ESCONDER O CONTEUDO DA GRID DE RESULTADOS
    esconderGridResultados() {
        (<HTMLElement>document.querySelector('.table-consult')).style.display = 'none';
    }

    // MOSTRO E ESCONDO O LOADING
    toggleLoading(value: boolean = false) {this.componentLoading = value;}

    preencherTodosFabricantesSelecionados(callBack) {
      this._todosFabricantesSelecionados = callBack;
     }

    getFabricantes(): number[]{
      if(this._utils.isEmpty(this._todosFabricantesSelecionados)){
        return [];
      }
      return this._todosFabricantesSelecionados;
     }

     // CHAMO MODAL DE CONFIRMAÇÃO ANTES DE EFETIVAR OS PEDIDOS
     modalEfetivar() {
        Swal.fire({
          title: 'Efetivação de Pedido(s)',
          html: 'Você deseja efetivar o(s) pedido(s) selecionado(s)?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não'
        }).then(resultado => {
          if (resultado.value === true) {
            this.efetivar();
          }
        });
     }

    // CHAMO MODAL DE CONFIRMAÇÃO ANTES DE EXPORTAR DADOS
    modalExportar() {
      Swal.fire({
          title: 'Exportação de Pedido(s)',
          html: 'Você deseja exportar o(s) pedido(s) selecionado(s)?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim',
          cancelButtonText: 'Não'
        }).then(resultado => {
          if (resultado.value === true) {
            this.exportar();
          }
        });
    }

    // VERIFICO SE SELECIONAR TODOS FOI CLICADO
    exportar() {
      this.selecionarTodos ? this.exportarTodoResumo() : this.exportarPedidoSelecionados();
    }

    // EXPORTAÇÃO SOMENTE DOS ÍTENS CHECADOS NA GRID
    exportarPedidoSelecionados() {
      const pedidosSelecionados =  this.dataSource['value'].filter(x => x.selecionado);
      const jsonParaEnviar = this.transformarPedidoJson(pedidosSelecionados);
      this.pedidoService.exportarPorPedidos(jsonParaEnviar).then(() => this.toggleLoading(false));
    }

    // EXPORTAÇÃO DE TODO O RANGE DE FILTROS SELECIONADOS
    exportarTodoResumo() {
      this.pedidoService.exportarTodasRecomendacoes(this.gerarParametrosParaResumo()).subscribe(() => this.toggleLoading(false));
    }

    // FAÇO A SEPARAÇÃO DOS DADOS QUE FORAM SELECIONADOS NA GRID
    transformarPedidoJson(pedidos): exportarRelatorio[] {
      const json: exportarRelatorio[] = [];
      pedidos.forEach(pedido => {
        const montado: exportarRelatorio = {
          centroDistribuicao: pedido.cdRegional,
          codigoFabricante: pedido.cdFabricante,
          codigoFornecedor: pedido.cdFornecedor,
          dataRecomendacao: this._validator.formataDataComBarra(pedido.dtPedido)
        };
        json.push(montado);
       });
       return json;
     }

    limparCampos() {
      this.limparDataSource();
      this._todosFornecedoresSelecionados = [];
      this._todosFabricantesSelecionados = [];

      /*this.elementFabricante['fabricanteSelecionado'] = [];
      this.fornecedorChild['fornecedorSelecionado'] = [];
      this.cdChild['cdSelecionadoLista'] = [];
      this._todasRegioesSelecionadas = [];
      */

      this.formPedido.reset();
      localStorage.removeItem('formConsultaPedido');
      this.esconderGridResultados();

      // LIMPO OS DROLISTS
      this._cdService.limpar();
      this._fabricanteService.limpar();
      this._forncedorService.limpar();
  }

}
