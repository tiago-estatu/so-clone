import { PedidoAuth } from './guards/pedido-auth/pedido.auth';
import { EstoqueExtra } from './guards/estoque-extra-auth/estoque.extra.auth';
import { AuthAdm } from './guards/auth-adm/auth.adm';
import { NgModule, LOCALE_ID } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HttpClientModule } from "@angular/common/http";
import { HttpModule } from "@angular/http";
import { LoginComponent } from "./login";
import { Interceptor } from "./app-interceptor.module";
import { MainModule } from "./main/main.module";
import { CommonsModule } from "./commons/commons.module";
import { ErrorPageComponent } from "./error-page/index";
import { ExecucaoModule } from "./execucao/execucao.module";
import { ArredondamentoModule } from "./arredondamento/arredondamento.module";
import { registerLocaleData } from "@angular/common";
import localePt from "@angular/common/locales/pt";
import { ptBrLocale } from "ngx-bootstrap/locale";
import { defineLocale } from "ngx-bootstrap/chronos";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { PedidosModule } from "./pedidos/pedidos.module";
import { EstoqueExtraModule } from "./estoqueExtra/estoqueExtra.module";
import { EstoqueExtraLmpmModule } from './estoque-extra-lmpm/estoque-extra-lmpm.module';
import { FaturamentosModule } from "./faturamentos/faturamentos.module";
import { LoadingBarModule } from "@ngx-loading-bar/core";
import { ExcelService } from "./commons/services/excel";
import {
  MAT_CHIPS_DEFAULT_OPTIONS,
  MatChipsModule
} from "@angular/material/chips";
import { ENTER, COMMA } from "@angular/cdk/keycodes";
import { CarregamentoComponent } from "./carregamento";
import { CdkTableModule } from "@angular/cdk/table";
import { MinimoMaximoModule } from './minimo-maximo/minimo-maximo.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { FaturamentoSuspensoModule } from './faturamento-suspenso/faturamento-suspenso.module';
import { GestaoProdutoEspelhoComponent } from './gestao-produto-espelho/gestao-produto-espelho.component';
import { CadastrosModule } from './cadastros/cadastros.module';
import { EstornoModule } from './estorno/estorno.module';
import { StudModalComponent } from './commons/helpers/studs.mock';
import { DefineFaturamentoLojaModule } from './define-faturamento/define-faturamento-loja.module';
import { OperadoresAcessoModule } from "./gestao-acessos/gestao-acessos.module";
import { EstoqueExtraLmpmDetalhe } from './guards/estoque-extra-lmpm-detalhe-auth/estoque.extra.lmpm.detalhe.auth';
import { GestaoMotivosComponent } from './gestao-motivos/gestao-motivos.component';

defineLocale("pt-br", ptBrLocale);
registerLocaleData(localePt, "pt-BR");

declare var require: any;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ErrorPageComponent,
    CarregamentoComponent,
    GestaoProdutoEspelhoComponent,
    GestaoMotivosComponent,
    StudModalComponent
  ],
  imports: [
    MainModule,
    Interceptor,
    AppRoutingModule,
    HttpClientModule,
    HttpModule,
    CommonsModule,
    ExecucaoModule,
    NgxMatSelectSearchModule,
    ArredondamentoModule,
    MatDatepickerModule,
    PedidosModule,
    MinimoMaximoModule,
    EstoqueExtraModule,
    EstoqueExtraLmpmModule,
    FaturamentosModule,
    LoadingBarModule,
    MatChipsModule,
    CdkTableModule,
    RelatoriosModule,
    FaturamentoSuspensoModule,
    CadastrosModule,
    DefineFaturamentoLojaModule,
    EstornoModule,
    OperadoresAcessoModule
  ],

  providers: [
    {
      provide: MAT_CHIPS_DEFAULT_OPTIONS,
      useValue: {
        separatorKeyCodes: [ENTER, COMMA]
      }
    },
    ExcelService,
    {
      provide: LOCALE_ID,
      useValue: "pt-BR"
    },
    AuthAdm, EstoqueExtra, EstoqueExtraLmpmDetalhe, PedidoAuth

  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
