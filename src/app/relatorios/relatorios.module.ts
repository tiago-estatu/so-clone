import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatorioMinimoMaximoComponent } from './relatorio-minimo-maximo/relatorio-minimo-maximo.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {MatExpansionModule} from '@angular/material/expansion';
import { CommonsModule } from '../commons/commons.module';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatButtonModule} from '@angular/material/button';
import { RelatorioPedidosEmitidosComponent } from './relatorio-pedidos-emitidos/relatorio-pedidos-emitidos.component';
import { RelatorioEstoqueExtraComponent } from './relatorio-estoque-extra/relatorio-estoque-extra.component';
import { EstornoSuspensaoLojaComponent } from './estorno-suspensao-loja/estorno-suspensao-loja.component';
import { SistemaAtualFaturamentoLojaComponent } from './sistema-atual-faturamento-loja/sistema-atual-faturamento-loja.component';
import { ProdutoEspelhoComponent } from './produto-espelho/produto-espelho.component';
import { RelatorioLojaEspelhoComponent } from './relatorio-loja-espelho/relatorio-loja-espelho.component';
import { RelatorioSubstitutoGenericoComponent } from './relatorio-substituto-generico/relatorio-substituto-generico.component';
import {SubstitutoGenericoService} from "../commons/services/substituto-generico/substituto-generico.service";
import { SistemaAtualCompraCdComponent } from './sistema-atual-compra-cd/sistema-atual-compra-cd.component';
import { CadastroVigenteComponent } from './cadastro-vigente/cadastro-vigente.component';
import { RelatorioArredondamentoCdComponent } from './relatorio-arredondamento-cd/relatorio-arredondamento-cd.component';
import { RelatorioTravaEstoqueComponent } from './relatorio-trava-estoque/relatorio-trava-estoque.component';
import { RelatorioInformacoesRecomendacaoComponent } from './relatorio-informacoes-recomendacao/relatorio-informacoes-recomendacao.component';
import { RelatorioPrioridadeLojaComponent } from './relatorio-prioridade-loja/relatorio-prioridade-loja.component';
import { RelatorioParametrizacaoSetoresComponent } from './relatorio-parametrizacao-setores/relatorio-parametrizacao-setores.component';
import { RelatorioGestaoPerfisComponent } from './relatorio-gestao-perfis/relatorio-gestao-perfis.component';

@NgModule({
  declarations: [
    RelatorioMinimoMaximoComponent,
    RelatorioPedidosEmitidosComponent,
    RelatorioEstoqueExtraComponent,
    EstornoSuspensaoLojaComponent,
    SistemaAtualFaturamentoLojaComponent,
    ProdutoEspelhoComponent,
    RelatorioLojaEspelhoComponent,
    RelatorioSubstitutoGenericoComponent,
    SistemaAtualCompraCdComponent,
    CadastroVigenteComponent,
    RelatorioArredondamentoCdComponent,
    RelatorioTravaEstoqueComponent,
    RelatorioInformacoesRecomendacaoComponent,
    RelatorioPrioridadeLojaComponent,
    RelatorioParametrizacaoSetoresComponent,
    RelatorioGestaoPerfisComponent,
  ],
  imports: [
    CommonModule,
    CommonsModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    MatExpansionModule,
    NgxPaginationModule,
    MatButtonModule,
    ReactiveFormsModule
    
  ],
  providers: [SubstitutoGenericoService]
})
export class RelatoriosModule { }
