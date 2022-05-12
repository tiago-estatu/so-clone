import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';

import { HeaderService } from '../../../commons/services/header.service';
import { PedidoService } from '../../../commons/services/pedido/pedido.service';
import { NewModalComponent, fadeInOut, ParametroRecomendacao, ParametroRecomendacaoItem } from 'src/app/commons';
import { Recomendacao } from '../recomendacao';
import { ValidatorHelper } from './../../../commons/helpers/validator.helper';




@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rd-consulta-pedido-detalhe',
  templateUrl: './consulta-pedido-detalhe.component.html',
  styleUrls: ['./consulta-pedido-detalhe.component.scss'],
  animations: [fadeInOut]
})
export class ConsultaPedidoDetalheComponent implements OnInit {

  rotaVoltar = '/pedido/consulta';
  tituloPagina = 'Detalhe Pedido';
  displayedColumns: string[] = ['selecionar', 'skuId', 'nameSku', 'woqQty', 'vlUnitario', 'vlTotal'];
  dataSource: MatTableDataSource<Recomendacao>;
  pedidoForm: FormGroup;
  parametroRecomendacao: ParametroRecomendacao;
  listaEmissaoPedidoItem: ParametroRecomendacaoItem[] = [];

  btnVoltarConfirmar;
  selecionarTodos: Boolean = false;
  nenhumItemSelecionado: Boolean = true;
  componentLoading = false;

  cdOperador = localStorage.getItem('cdOperador');

  // PARAMETROS PARA CARREGAMENTO DO MODAL
  mensagemModal;
  tituloModal;
  imagemModal;
  conteudoModal;
  listaPedidosEfetivados: any = [];


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  constructor(
    private formBuilder: FormBuilder,
    private headerService: HeaderService ,
    private activatedRoute: ActivatedRoute,
    private pedidoService: PedidoService,
    private _ValidatorHelper: ValidatorHelper

    ) {}

  ngOnInit() {

     this.headerService.setTitle('Emissão de Pedidos');
     this.parametroRecomendacao = JSON.parse(localStorage.getItem('parametroRecomendacao'));

     const r: Recomendacao[] = this.activatedRoute.snapshot.data.recomendacoes;
     this.dataSource = new MatTableDataSource( r);
     this.dataSource.paginator = this.paginator;

    this.pedidoForm = this.formBuilder.group({
      skuId: [this.parametroRecomendacao.skuId],
      centroDistribuicao: [this.parametroRecomendacao.cdRegional + '-' + this.parametroRecomendacao.nmCdRegional],
      totalSkus: [this.parametroRecomendacao.qtProduto],
      totalPedido: [this.parametroRecomendacao.qtPedida],
      fornecedor: [this.parametroRecomendacao.cdFornecedor] + '-' + this.parametroRecomendacao.nmFornecedor,
      fabricante: [this.parametroRecomendacao.cdFabricante] + '-' + this.parametroRecomendacao.nmFabricante,
      selecionado: [''],
      selecionarTodos: [''],
      vlTotalPedido: [this.parametroRecomendacao.vlTotal],
    });

  }

  aplicarFiltroProduto(valorFiltro: string) {
    this.dataSource.filter = valorFiltro.trim().toLowerCase();

    if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
    }
  }

  itemSelecionado() {
    this.nenhumItemSelecionado =   (this.dataSource.data.filter(element => element.selecionado).length === 0);
  }

  selecionarTodosItens(event) {

    this.dataSource.data.forEach(element => {
      element.selecionado = event.checked;
    });

    this.selecionarTodos = event.checked;

    this.itemSelecionado();
  }


  efetivarItens() {
    this.listaPedidosEfetivados = [];
    const parametroRecomendacaoItem: ParametroRecomendacaoItem = new ParametroRecomendacaoItem();

    parametroRecomendacaoItem.dtPedido = this._ValidatorHelper.formataDataComBarraPadraoBr(this.parametroRecomendacao.dtPedido);
    parametroRecomendacaoItem.cdRegional = this.parametroRecomendacao.cdRegional;
    parametroRecomendacaoItem.cdFornecedor = this.parametroRecomendacao.cdFornecedor;
    parametroRecomendacaoItem.cdFabricante = this.parametroRecomendacao.cdFabricante;
    parametroRecomendacaoItem.cdProdutos =  this.dataSource.data
            .filter(recomendacao => recomendacao.selecionado )
            .map(recomendacao => {
                return recomendacao.cdProduto;
            });

        // POST NO PEDIDO SERVICE
        this.componentLoading = true;
        this.pedidoService.emitirPedido(parametroRecomendacaoItem, this.cdOperador.toString())
            .subscribe(
            (val) => {
                    // POPULANDO ARRAY COM TODOS OS NÚMEROS DE PEDIDOS EFETIVADOS
                    this.listaPedidosEfetivados.push(val);
                    this.dataSource = new MatTableDataSource(this.dataSource.data
                        .filter(recomendacao => !recomendacao.selecionado ));
            },
            response => {
                if (response.status === 400) {
                    this.mensagemModal = 'Esse pedido já foi emitido!';
                    this.imagemModal = 'warning';
                    this.tituloModal = 'Error';
                    this.modalChild.openModal = true;

                } else {

                  this.mensagemModal = 'Item pedido não pode ser emitido, por favor entre em contato com a equipe técnica.';
                  this.imagemModal = 'warning';
                  this.tituloModal = 'Error';
                  this.modalChild.openModal = true;
                }
                this.componentLoading = false;
            },
            () => {
                // MOSTRO A MODAL DE SUCESSO CARREGANDO OS DADOS DOS EFETIVIADOS NO CORPO DA MODAL
                this.imagemModal = 'check';
                this.mensagemModal = '';
                this.tituloModal = 'Pedido emitido com sucesso!';
                this.modalChild.conteudoModal = true;
                this.modalChild.openModal = true;
                this.btnVoltarConfirmar = true;
                this.componentLoading = false;
                this.listaEmissaoPedidoItem = [];
                this.componentLoading = false;
                return false;
        });

  }
}
