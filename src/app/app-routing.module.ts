import { PedidoAuth } from './guards/pedido-auth/pedido.auth';
import { EstoqueExtraLmpmDetalhe } from './guards/estoque-extra-lmpm-detalhe-auth/estoque.extra.lmpm.detalhe.auth';
import { EstoqueExtra } from './guards/estoque-extra-auth/estoque.extra.auth';
import { AuthAdm } from './guards/auth-adm/auth.adm';
import { RelatorioParametrizacaoSetoresComponent } from './relatorios/relatorio-parametrizacao-setores/relatorio-parametrizacao-setores.component';
import { RelatorioPrioridadeLojaComponent } from './relatorios/relatorio-prioridade-loja/relatorio-prioridade-loja.component';
import { ParametrizacaoSetoresComponent } from './cadastros/parametrizacao-setores/parametrizacao-setores.component';
import { ProdutoEspelhoComponent } from './relatorios/produto-espelho/produto-espelho.component';
import { EstoqueExtraLmpmComponent } from './estoque-extra-lmpm/estoque-extra-lmpm.component';
import { SistemaAtualFaturamentoLojaComponent } from './relatorios/sistema-atual-faturamento-loja/sistema-atual-faturamento-loja.component';
import { SuspensaoLojaComponent } from './estorno/suspensao-loja/suspensao-loja.component';
import { EstornoComponent } from './estorno/estorno.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, Resolve } from '@angular/router';
import { LoginComponent } from './login';
import {MainComponent, InicioComponent} from './main';
import { ErrorPageComponent } from './error-page/index';
import { ConsultaExecucaoComponent } from './execucao';
import { ParametrosCadastroComponent } from './execucao/parametros';
import { AgendaCadastroComponent } from './execucao/agenda';
import { AgendaConsultaDetalheComponent } from './execucao/agenda/consulta-detalhe';
import { ArredondamentoComponent, ConsultaArredondamentoComponent, CadastroArredondamentoComponent } from './arredondamento';
import { PedidosComponent, ConsultaPedidoComponent, ConsultaPedidoDetalheComponent } from './pedidos';

import { EstoqueExtraConsultaComponent } from './estoqueExtra/consulta/estoqueExtra-consulta.component';
import { EstoqueExtraCadastroComponent } from './estoqueExtra/cadastro/estoqueExtra-cadastro.component';
import { EstoqueExtraComponent } from './estoqueExtra/estoqueExtra.component';

import { FaturamentosComponent, ConsultaFaturamentoDetalheComponent } from './faturamentos';
import { ConsultaFaturamentoComponent } from './faturamentos/consulta-faturamento/consulta-faturamento.component';
import { ConsultaPedidoDetalheResolver } from './pedidos/consulta-pedido/consulta-pedido-detalhe/consulta-pedido-detalhe.resolver';
import { EstoqueExtraResolver } from './estoqueExtra/consulta/estoqueExtra-consulta.resolver';
import { CarregamentoComponent } from './carregamento';
import { AgendaConsultaDetalheResolver } from './execucao/agenda/consulta-detalhe/agenda-consulta-detalhe.resolver';
import { MinimoMaximoComponent, ConsultaMinimoMaximoComponent } from './minimo-maximo';
import { RelatorioMinimoMaximoComponent } from './relatorios/relatorio-minimo-maximo/relatorio-minimo-maximo.component';
import { AuthGuardService } from './commons';
import { FaturamentoSuspensoComponent } from './faturamento-suspenso/faturamento-suspenso.component';
import { RelatorioPedidosEmitidosComponent } from './relatorios/relatorio-pedidos-emitidos';
import { RelatorioEstoqueExtraComponent } from './relatorios/relatorio-estoque-extra/relatorio-estoque-extra.component';
import { EstornoSuspensaoLojaComponent } from './relatorios/estorno-suspensao-loja/estorno-suspensao-loja.component';
import { GestaoProdutoEspelhoComponent } from './gestao-produto-espelho/gestao-produto-espelho.component';
import { LojaEspelhoComponent } from './cadastros/loja-espelho/loja-espelho.component';
import {SubstitutoGenericoComponent} from './cadastros/substituto-generico/substituto-generico.component';
import { PrioridadeLojaComponent } from './cadastros/prioridade-loja/prioridade-loja.component';
import { RelatorioLojaEspelhoComponent } from './relatorios/relatorio-loja-espelho/relatorio-loja-espelho.component';
import {RelatorioSubstitutoGenericoComponent} from "./relatorios/relatorio-substituto-generico/relatorio-substituto-generico.component";
import { DefineFaturamentoFornecedorComponent, DefineFaturamentoLojaComponent, DefineFaturamentoLojaModule } from './define-faturamento';
import { SistemaAtualCompraCdComponent } from './relatorios/sistema-atual-compra-cd/sistema-atual-compra-cd.component';
import { CadastroVigenteComponent } from './relatorios/cadastro-vigente/cadastro-vigente.component';
import { AgendaSuspensaCdComponent } from './cadastros/agenda-suspensa-cd/agenda-suspensa-cd.component';
import { RelatorioArredondamentoCdComponent } from './relatorios/relatorio-arredondamento-cd/relatorio-arredondamento-cd.component';
import { RelatorioTravaEstoqueComponent } from './relatorios/relatorio-trava-estoque/relatorio-trava-estoque.component';
import { CadastroTravaEstoqueComponent } from './cadastros/cadastro-trava-estoque/cadastro-trava-estoque.component';
import { RelatorioInformacoesRecomendacaoComponent } from './relatorios/relatorio-informacoes-recomendacao/relatorio-informacoes-recomendacao.component';
import { ConsultaOperadorAtivoComponent } from './gestao-acessos/consulta-operador-ativo/consulta-operador-ativo.component';
import { CadastroNovoOperadorComponent } from './gestao-acessos/cadastro-novo-operador/cadastro-novo-operador.component';
import { RelatorioGestaoPerfisComponent } from './relatorios/relatorio-gestao-perfis/relatorio-gestao-perfis.component';
import { CriarNovoPerfilComponent } from './gestao-acessos/criar-novo-perfil/criar-novo-perfil.component';
import { GestaoMotivosComponent } from './gestao-motivos/gestao-motivos.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', pathMatch: 'full', component: LoginComponent },
  {
    path: '', component: MainComponent,
    canActivate: [AuthGuardService],
    children: [

      { path: '', component: InicioComponent },
      { path: 'inicio', component: InicioComponent },
      { path: 'carregamento', component: CarregamentoComponent },
      { path: '404', component: ErrorPageComponent },
      {
        path: 'cadastros',
        canActivate: [AuthAdm],
        children: [
          { path: 'estoque-extra-lmpm', component: EstoqueExtraLmpmComponent, pathMatch: 'full' },
          { path: 'estoque-extra-lmpm/detalhe/:id', component: EstoqueExtraCadastroComponent,   resolve: {
              vigencias: EstoqueExtraResolver
            }, canActivateChild: [EstoqueExtraLmpmDetalhe]},
          { path: 'produto-espelho', component: GestaoProdutoEspelhoComponent},
          { path: 'loja-espelho', component: LojaEspelhoComponent},
          { path: 'substituto', component: SubstitutoGenericoComponent},
          { path: 'prioridade-loja', component: PrioridadeLojaComponent},
          { path: 'agenda-suspensa-cd', component: AgendaSuspensaCdComponent},
          { path: 'trava-estoque', component: CadastroTravaEstoqueComponent},
          { path: 'parametrizacao-setores', component: ParametrizacaoSetoresComponent}


        ],
      },
      {
        path: 'cadastro/faturamento-suspenso', component: FaturamentoSuspensoComponent,
        canActivate: [AuthAdm],
        children: [
          //{ path: 'detalhe', component: ParametrosCadastroComponent },
        ]
      },
      {
        path: 'arredondamento', component: ArredondamentoComponent,
        canActivate: [AuthAdm],
        children: [
          { path: '', redirectTo: '/arredondamento/consulta', pathMatch: 'full' },
          { path: 'consulta', component: ConsultaArredondamentoComponent },
          { path: 'cadastro', component: CadastroArredondamentoComponent },
        ]
      },

      {
        path: 'estoqueExtra', component: EstoqueExtraComponent,
        canActivate: [EstoqueExtra],
        children: [
          { path: '', redirectTo: '/estoqueExtra/consulta', pathMatch: 'full' },
          { path: 'consulta', component: EstoqueExtraConsultaComponent },
          { path: 'detalhe/:id', component: EstoqueExtraCadastroComponent,
            resolve: {
              vigencias: EstoqueExtraResolver
            } },
        ]
      },
      {
        path: 'definir-sistema',
        canActivate: [AuthAdm],
        children: [
          {path: 'faturamento-loja', component: DefineFaturamentoLojaComponent},
          {path: 'faturamento-fornecedor', component: DefineFaturamentoFornecedorComponent},
        ]
      },
      {
        path: 'estoque', component: MinimoMaximoComponent,
        canActivate: [AuthAdm],
        children: [
          { path: '', redirectTo: '/estoque/minimo-maximo', pathMatch: 'full' },
          { path: 'minimo-maximo', component: ConsultaMinimoMaximoComponent },
        ]
      },
      {
        path: 'pedido', component: PedidosComponent,
        canActivate: [PedidoAuth],
        children: [
          { path: '', redirectTo: '/pedido/consulta', pathMatch: 'full' },
          { path: 'consulta', component: ConsultaPedidoComponent },
          { path: 'detalhe/:cdRegional/:cdFornecedor/:cdFabricante/:dtPedido/:cdOperador', component: ConsultaPedidoDetalheComponent,
            resolve: {
                  recomendacoes: ConsultaPedidoDetalheResolver
                }
          }
        ]
      },
      {
        path: 'relatorios',
        canActivate: [AuthAdm],
        children: [
          { path: 'minimo-maximo', component: RelatorioMinimoMaximoComponent },
          { path: 'pedidos-emitidos', component: RelatorioPedidosEmitidosComponent },
          { path: 'estoque-extra', component: RelatorioEstoqueExtraComponent },
          { path: 'estorno-suspensao-loja', component: EstornoSuspensaoLojaComponent },
          { path: 'sistema-atual-faturamento-loja', component: SistemaAtualFaturamentoLojaComponent },
          { path: 'produto-espelho', component: ProdutoEspelhoComponent },
          { path: 'loja-espelho', component: RelatorioLojaEspelhoComponent },
          { path: 'substituto', component: RelatorioSubstitutoGenericoComponent },
          { path: 'sistema-atual-compra-cd', component: SistemaAtualCompraCdComponent },
          { path: 'cadastro-vigente', component: CadastroVigenteComponent },
          { path: 'arredondamento-cd', component: RelatorioArredondamentoCdComponent },
          { path: 'trava-estoque', component: RelatorioTravaEstoqueComponent },
          { path: 'recomendacao', component: RelatorioInformacoesRecomendacaoComponent },
          { path: 'prioridade-loja', component: RelatorioPrioridadeLojaComponent },
          { path: 'parametrizacao-setores', component: RelatorioParametrizacaoSetoresComponent }

        ]
      },
      {
        path: 'gestao-acesso',
        canActivate: [AuthAdm],
        children: [
          { path: 'consulta-operadores', component: ConsultaOperadorAtivoComponent },
          { path: 'cadastro-novo-operador', component: CadastroNovoOperadorComponent },
          { path: 'relatorio-gestao-perfis', component: RelatorioGestaoPerfisComponent },
          { path: 'cadastro-novo-perfil', component: CriarNovoPerfilComponent },
        ]
      },
      {
        path: 'faturamento', component: FaturamentosComponent,
        canActivate: [AuthAdm],
        children: [
          { path: '', redirectTo: '/faturamento/consulta', pathMatch: 'full' },
          { path: 'consulta', component: ConsultaFaturamentoComponent },
          { path: 'detalhe', component: ConsultaFaturamentoDetalheComponent },
        ]
      },
      {
        path: 'estorno', component: EstornoComponent,
        canActivate: [AuthAdm],
        children: [
          { path: 'suspensao-loja', component: SuspensaoLojaComponent},
        ]
      },
      {
        path: 'gestao-motivos',
        /*canActivate: [AuthAdm],*/
        children: [
          { path: 'cadastro-motivos', component: GestaoMotivosComponent }
        ]
      },
      /*{
          path: 'execucao', component: AgendaCadastroComponent,
          children: [
            { path: '', redirectTo: 'execucao/agenda', pathMatch: 'full' },
            { path: 'agenda', component: AgendaCadastroComponent },
            // { path: 'consulta', component: AgendaConsultaDetalheComponent },
            { path: 'consulta/:cdRegionais/:cdFornecedores/:cdFabricantes/:diaCompra/:frequencia', component: AgendaConsultaDetalheComponent ,
            resolve: {
                  configuracoes: AgendaConsultaDetalheResolver
                }
          },
          ]
        },
      {
        path: 'execucao', component: ConsultaExecucaoComponent,
        children: [
          { path: '', redirectTo: '/execucao/consulta', pathMatch: 'full' },
          { path: 'consulta', component: ConsultaExecucaoComponent },
        ]
       },
      {
        path: 'execucao', component: ParametrosCadastroComponent,
        children: [
          { path: '', redirectTo: 'execucao/parametros', pathMatch: 'full' },
          { path: 'parametros', component: ParametrosCadastroComponent },
        ]
      },*/
      { path: '**', redirectTo: '404' }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
