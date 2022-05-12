import {HeaderService} from '../commons/services';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EstoqueExtraShared} from "../commons/components/estoque-extra/estoque-extra.shared";
import {EstoqueExtraService} from "../commons/services/estoqueExtra";
import {UtilsHelper, ValidatorHelper} from "../commons/helpers";
import {fadeIn, fadeInOut} from "../commons/const";
import {FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {IEstoqueExtra} from "../commons/services/classes";


export class TestClass {
  test1 = 'there is tests'
}

@Component({
  selector: 'rd-estoque-extra-lmpm',
  templateUrl: './estoque-extra-lmpm.component.html',
  styleUrls: ['../commons/components/estoque-extra/estoque-extra.shared.scss'],
  animations: [fadeInOut, fadeIn]

})
export class EstoqueExtraLmpmComponent extends EstoqueExtraShared implements OnInit {

  @ViewChild('elementProduto') elementProduto: ElementRef;
  @ViewChild('elementFilial') elementFilial: ElementRef;

  constructor(
    protected headerService: HeaderService,
    protected estoqueExtraService: EstoqueExtraService,
    protected _utils: UtilsHelper,
    protected formBuilder: FormBuilder,
    protected router: Router
  ) {

    super();

  }

  ngOnInit() {
    this.setTitle('Gestão de Estoque Extra - LMPM');
    this.estoqueExtraService.subPath = 'estoqueExtra/lmpm';
    this.createForms();
    this.getCacheValueInputs();
    this.estoqueExtraService.setCurrentPath('lmpm');

  }

  setCacheInputs() {
    localStorage.setItem("formEstoqueLmpm", JSON.stringify([{
      'filialSelecionadoLista': this.elementFilial['filialSelecionadoLista'],
      'produtos': this.elementProduto['chipSelectedProdutos'],
      'curPage': this.filtroBack.getParam('page'),
      'dataInicioVigencia': this.filtroBack.getParam('inicio', false),
      'dataFinalVigencia': this.filtroBack.getParam('fim', false)
    }]));

  }


  goTo(event, iestoqueExtra: IEstoqueExtra) {
    this.setCacheInputs();
    event.preventDefault();
    this.router.navigateByUrl("/estoqueExtra/detalhe/" + iestoqueExtra.cdEstoqueIdeal);
  }


  getCacheValueInputs() {

    if (localStorage.getItem('formEstoqueLmpm') != null) {
      const objPopulateInput = JSON.parse(localStorage.getItem('formEstoqueLmpm'))[0];

      this.elementFilial['filialSelecionadoLista'] = objPopulateInput.filialSelecionadoLista;
      this.preencherFiliaisSelecionadas(objPopulateInput.filialSelecionadoLista.map(x => x["item_id"]));
      this.filtroBack.updateParam('cdFilial', this._todasFilialSelecionadas);

      this.elementProduto['chipSelectedProdutos'] = objPopulateInput.produtos;
      this.preencherProdutosSelecionados(objPopulateInput.produtos);
      this.filtroBack.updateParam('cdProduto', this._todosProdutosSelecioandos);

      this.filtroBack.updateParam('page', objPopulateInput.curPage);
      this.filtroBack.updateParam('inicio', new Date(objPopulateInput.dataInicioVigencia));
      this.filtroBack.updateParam('fim', new Date(objPopulateInput.dataFinalVigencia));
      this.filterForm.get('dataInicial').setValue(new Date(objPopulateInput.dataInicioVigencia));
      this.filterForm.get('dataFinal').setValue(new Date(objPopulateInput.dataFinalVigencia));
      this.consultar(false);
    }
  }

  resetarCampos() {

    this.totalItems = 0;
    this._todasFilialSelecionadas = [];
    this._todosProdutosSelecioandos = [];
    this._todosTipoEstoqueSelecionados = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this.elementProduto['produtoSelecionadoLista'] = [];
    this.elementProduto['chipSelectedProdutos'] = [];
    localStorage.removeItem('formEstoqueLmpm');


    this.filtroBack.updateParam('cdProduto','');
    this.filtroBack.updateParam('cdFilial', '');
    this.filtroBack.updateParam('inicio', new Date());
    this.filtroBack.updateParam('fim', new Date());
    this.filterForm.reset();
    this.filterForm.get('dataInicial').setValue(new Date());
    this.filterForm.get('dataFinal').setValue(new Date());
    this.dataSource = [];

  }

}
