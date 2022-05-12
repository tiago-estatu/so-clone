import { EstoqueExtraModalCadastroComponent } from './../modal-cadastro/estoque-extra-modal-cadastro.component';
import { IEstoqueExtraModalSalvarModel } from './../../commons/services/classes/IEstoqueExtraModalSalvarModel';
import { HttpParams } from '@angular/common/http';
import {Component, OnInit, Input , ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
// import Swal from "sweetalert2";
import {Router} from '@angular/router';
import {
    fadeInOut,
    fadeIn,
    NewModalComponent,
    HeaderService,
    ValidatorHelper,
    EstoqueExtraService,
    IEstoqueExtra,
    UtilsHelper,
} from 'src/app/commons';
import {EstoqueExtraShared} from "../../commons/components/estoque-extra/estoque-extra.shared";
import {FormBuilder} from "@angular/forms";
import { Observable, of } from 'rxjs';
import { MatDialog, TooltipPosition } from '@angular/material';
import Swal, {SweetAlertIcon} from "sweetalert2";


@Component({
    selector: '[estoqueExtra-consulta.component]',
    templateUrl: 'estoqueExtra-consulta.component.html',
    styleUrls: ['../../commons/components/estoque-extra/estoque-extra.shared.scss'],
    animations: [fadeInOut, fadeIn]
})

export class EstoqueExtraConsultaComponent extends EstoqueExtraShared implements OnInit {


    // componentLoading: Boolean = false;
    // RECEBO A URL PRONTA PARA FAZER O REQUEST HttpClient
    _dataSource: Observable<IEstoqueExtraModalSalvarModel[]> = new Observable;
    @Input() query: HttpParams;
    @Input() jsonParaCriar: IEstoqueExtraModalSalvarModel;
    pageNumber: number = 1;
    itemsPorPagina: number = 35;
    totalDeItems: number = 0;
    
    cdOperador = localStorage.getItem("cdOperador");
    mensagemModal;
    imagemModal;
    tituloModal;

    @ViewChild(NewModalComponent) modalChild: NewModalComponent;

    @ViewChild('elementProduto') elementProduto: ElementRef;
    @ViewChild('elementFilial') elementFilial: ElementRef;
    @ViewChild('elementMotivo') elementMotivo: ElementRef;
    @ViewChild('elementTipoEstoque') elementTipoEstoque: ElementRef;
    @ViewChild('importarRef') importarRef: ElementRef;

    _todosMotivosSelecionados = [];
    _todosProdutosSelecioandos = [];
    _todasFilialSelecionadas = [];
    _todosTipoEstoqueSelecionados = [];
    _dtInicio;
    totalItems: number = 0;
    expandir = true;
    componentLoading = false;
    dataSource = [];


    constructor(
    public dialog: MatDialog,

        protected headerService: HeaderService,
        protected activatedRoute: ActivatedRoute,
        protected _utils: UtilsHelper,
        public _validator: ValidatorHelper,
        protected estoqueExtraService: EstoqueExtraService,
        protected router: Router,
        protected formBuilder: FormBuilder
    ) {
        super();

    }


    ngOnInit() {
        this.headerService.setTitle("Gestão de Estoque Extra");
        this.estoqueExtraService.subPath = 'estoqueExtra';
        this.createForms();
        this.estoqueExtraService.setCurrentPath('extra');
        this.getCacheValueInputs();
    }

    ngOnChanges() {
        this.validarMudancasEConsultar(this.pageNumber);
      }
    
      validarMudancasEConsultar(page) {
    
        if (this.query !== null && this.query !== undefined) {
    
          this.consultar(page);
          (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'block';
        } else {
          this._dataSource = new Observable<[]>();
          (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'none';
        }
      }



    preencherFiliaisSelecionadas(callBack) {
        this._todasFilialSelecionadas = callBack;
    }

    preencherProdutosSelecionados(callback) {
        this._todosProdutosSelecioandos = callback;
    }

    getProdutos(): number[] {
        if (!this._utils.isEmpty(this._todosProdutosSelecioandos)) {
            return this._todosProdutosSelecioandos.map(
                produto => produto.cdProduto
            );
        } else {
            return [];
        }
    }

    preencherTodosMotivosSelecionados(callback) {
        this._todosMotivosSelecionados = callback;
    }

    getMotivos(): number[] {
        if (this._utils.isEmpty(this._todosMotivosSelecionados)) {
            return [];
        }
        return this._todosMotivosSelecionados;
    }

    preencherTipoEstoqueSelecionados(callback) {
        this._todosTipoEstoqueSelecionados = callback;
    }

    getTipoEstoque() {
        if (this._utils.isEmpty(this._todosTipoEstoqueSelecionados)) {
            return [];
        }
        return this._todosTipoEstoqueSelecionados;
    }

    get getDtInicioFormatada(){
        return this._validator.formataData(this.filterForm.get('dataInicial').value);
      }
    
    get getDtFimFormatada(){
        return this._validator.formataData(this.filterForm.get('dataFinal').value);
      }

    goTo(event, iestoqueExtra: IEstoqueExtra) {
        this.setCacheInputs();
        event.preventDefault();
        this.router.navigateByUrl("/estoqueExtra/detalhe/" + iestoqueExtra.cdEstoqueIdeal);
    }


    consultar(fromStart: boolean = true) {
        if(fromStart) {
            this.filtroBack.updateParam('page', '1');
            this.updateFilters([
                {name: 'cdTipo', value: this._todosTipoEstoqueSelecionados},
                {name: 'cdMotivo', value: this._todosMotivosSelecionados}
            ]);
        }
        if (this.validarDataInserida() && this.validarCamposObrigatorios()) {
            this.filtroBack.criarFiltro();
            this.montarJsonParaCriar();
            this.pesquisar();
        }
    }

      montarJsonParaCriar(){

        this.jsonParaCriar = {
            cdOperador: this.cdOperador,
            cdFilial: this._todasFilialSelecionadas,
            cdProduto: this._todosProdutosSelecioandos,
            tipo: this._todosTipoEstoqueSelecionados,
            dtFimVigencia: this.filterForm.get('dataFinal').value,
            dtInicioVigencia:  this.filterForm.get('dataInicial').value,
            motivo: this._todosMotivosSelecionados,
          }

      }

    pesquisar() {

        const btOkObrigado = 'Ok, Obrigado';
        this.componentLoading = true;
        if (this.estoqueExtraRequest) {
            this.estoqueExtraRequest.unsubscribe();
        }

        this.estoqueExtraRequest = this.estoqueExtraService.getEstoquePorFiltros(this.filtroBack.criarFiltro())
            .subscribe((response: any) => {
                this.componentLoading = false;
                if (response.content.length === 0) {
                    Swal.fire({
                        title: 'Ops!',
                        html: 'Dado não encontrado!',
                        icon: 'warning',
                        confirmButtonText: btOkObrigado,
                        customClass: {confirmButton: 'setBackgroundColor'}
                    });
                    this.dataSource = [];
                    this.totalItems = 0;
                    this.componentLoading = false;
                } else {
                    this.dataSource = response.content;
                    this.totalItems = response.totalElements;

                    this.componentLoading = false;
                }

            }, ex => {

                    Swal.fire({
                      title: "Você deseja cadastra-lo?",
                      text: "Não encontramos nenhum registro com este filtro.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Sim",
                      cancelButtonText: "Não",
                      customClass: {confirmButton: 'setBackgroundColor'}
                    }).then(resultado => {
                      if (resultado.value == true) {
                          if(this.validacoesCadastrarModal()){
                            const dialogRef = this.dialog.open(EstoqueExtraModalCadastroComponent, {
                              width: "auto",
                              height: "auto",
                              data: this.jsonParaCriar
                            });
                            this.componentLoading = false;
                            dialogRef.afterClosed().subscribe(result => {
                                if(result === Status.SALVOU){
                                    this.validarMudancasEConsultar(this.pageNumber);
                                }
                                this.componentLoading = false;
                            });
                          } 
                      }
                    });
                    this.componentLoading = false;
                    return {
                      unsubscribe() {
                        this.componentLoading = false;
                      }
                    };
                this.dataSource = [];
                this.totalItems = 0;
                this.componentLoading = false;
            });

    }

    validarCamposObrigatorios(): Boolean {
        if (this.getTipoEstoque().length === 0) {
            Swal.fire({
                title: 'Tipo estoque extra obrigatorio!',
                html: 'Por favor, escolha um ou mais tipos de estoque para consultar.',
                icon: 'warning',
                confirmButtonText: 'Ok, Obrigado',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
            return false;
        }
        return true;
    }

      //PERMITIR KEY SOMENTE NUMEROS
    keyPress(event) {
        if((event.keyCode < 48) || (event.keyCode > 57)){
        event.preventDefault()
        }
    }

    setCacheInputs() {
        localStorage.setItem("formEstoque", JSON.stringify([{
            'filialSelecionadoLista': this.elementFilial['filialSelecionadoLista'],
            'produtos': this.elementProduto['chipSelectedProdutos'],
            'tipoEstoqueLista': this.elementTipoEstoque['tipoEstoqueLista'],
            'motivoSelecionadoLista': this.elementMotivo['motivoSelecionadoLista'],
            'curPage': this.filtroBack.getParam('page'),
            'dataInicioVigencia': this.filtroBack.getParam('inicio', false),
            'dataFinalVigencia': this.filtroBack.getParam('fim', false)
        }]));
    }

    getCacheValueInputs() {

        if (localStorage.getItem('formEstoque') != null) {
            const objPopulateInput = JSON.parse(localStorage.getItem('formEstoque'))[0];

            this.elementFilial['filialSelecionadoLista'] = objPopulateInput.filialSelecionadoLista;
            this.preencherFiliaisSelecionadas(objPopulateInput.filialSelecionadoLista.map(x => x["item_id"]));
            this.filtroBack.updateParam('cdFilial', this._todasFilialSelecionadas);
            this.elementProduto['chipSelectedProdutos'] = objPopulateInput.produtos;
            this.preencherProdutosSelecionados(objPopulateInput.produtos);
            this.filtroBack.updateParam('cdProduto', this._todosProdutosSelecioandos);

            this.elementMotivo['motivoSelecionadoLista'] = objPopulateInput.motivoSelecionadoLista;
            this.preencherTodosMotivosSelecionados(objPopulateInput.motivoSelecionadoLista.map(x => x["item_id"]));
            this.filtroBack.updateParam('cdMotivo', this._todosMotivosSelecionados);

            this.elementTipoEstoque['tipoEstoqueLista'] = objPopulateInput.tipoEstoqueLista;
            this.preencherTipoEstoqueSelecionados(objPopulateInput.tipoEstoqueLista.map(x => x["item_id"]));
            this.filtroBack.updateParam('cdTipo', this._todosMotivosSelecionados);

            this.filtroBack.updateParam('page', objPopulateInput.curPage);
            this.filtroBack.updateParam('inicio', new Date(objPopulateInput.dataInicioVigencia));
            this.filtroBack.updateParam('fim', new Date(objPopulateInput.dataFinalVigencia));

            this.filterForm.get('dataInicial').setValue(new Date(objPopulateInput.dataInicioVigencia));
            this.filterForm.get('dataFinal').setValue(new Date(objPopulateInput.dataFinalVigencia));
            this.consultar();
        }
    }

    resetarCampos() {

        this.totalItems = 0;
        this._todasFilialSelecionadas = [];
        this._todosMotivosSelecionados = [];
        this._todosProdutosSelecioandos = [];
        this._todosTipoEstoqueSelecionados = [];
        this.elementFilial['filialSelecionadoLista'] = [];
        this.elementMotivo['motivoSelecionadoLista'] = [];
        this.elementProduto['produtoSelecionadoLista'] = [];
        this.elementProduto['chipSelectedProdutos'] = [];
        this.elementTipoEstoque['tipoEstoqueLista'] = [];
        localStorage.removeItem('formEstoque');

        this.filtroBack.updateParam('cdMotivo', '');
        this.filtroBack.updateParam('cdProduto', '');
        this.filtroBack.updateParam('cdTipo', '');
        this.filtroBack.updateParam('cdFilial', '');
        this.filtroBack.updateParam('inicio', new Date());
        this.filtroBack.updateParam('fim', new Date());
        this.filterForm.reset();
        this.filterForm.get('dataInicial').setValue(new Date());
        this.filterForm.get('dataFinal').setValue(new Date());
        this.dataSource = [];

    }

}

enum Status{
    SALVOU = 'SALVOU',
    SAIU = 'SAIU',
  };