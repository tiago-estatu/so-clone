import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { RouterModule } from "@angular/router";
import { TextMaskModule } from "angular2-text-mask";
import { NgxMaskModule } from "ngx-mask";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { NumberDirective } from "./directives/onlynumber.directive";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { SimpleNotificationsModule } from 'angular2-notifications';
import { minimoMaximoDirective, VirgulaNumeroDirective } from './directives';


// ANGULAR MATERIAL
import {
  MatTableModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatSelectModule,
  MatRadioModule,
  MatProgressBarModule,
  MatCardModule,
  MatMenuModule,
  MatInputModule,
  MatIconModule,
  MatExpansionModule,
  MatCheckboxModule,
  MatAutocompleteModule,
  MatDialogModule,
  MatChipsModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatTreeModule
} from "@angular/material";


// HELPERS E PIPES
import {
  UfHelper,
  NewModalComponent,
  SanitizeHtmlPipe,
  SidebarComponent,
  HeaderComponent,
  FocusDirective,
  LoadingComponent,
  ConteudoTopoComponent,
  PaginacaoComponent,
  InputNumberComponent,
  ValidatorHelper,
  UtilsHelper,
  CurrencyFormatPipe,
  AuthenticationService,
  AuthGuardService,
  HeaderService,
  APIService,
  BasicLoadingComponent,
  SoundComponent,
  ModalComponent,
  ButtonsModalComponent,
  CadastroReceitaComponent,
  ConsultaReceitaComponent,
  CdkDetailRowDirective,
  DropdownMapperPipe,
} from "./";

import {A11yModule} from '@angular/cdk/a11y';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {PortalModule} from '@angular/cdk/portal';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {MatBadgeModule} from '@angular/material/badge';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatStepperModule} from '@angular/material/stepper';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatDividerModule} from '@angular/material/divider';

import {MatGridListModule} from '@angular/material/grid-list';


import {MatListModule} from '@angular/material/list';

import {MatNativeDateModule, MatRippleModule} from '@angular/material/core';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSortModule} from '@angular/material/sort';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {OverlayModule} from '@angular/cdk/overlay';
// COMPONENTES COMBOS (droplist)
import {
    CategoriaProdutoComboComponent,
    RegiaoMacroComboComponent,
    MinimoMaximoModalComponent,
    FornecedorComboComponent,
    MotivoSuspensaoComboComponent,
    DiaSemanaComboComponent,
    FabricanteComboComponent,
    TipoEstoqueComboComponent,
    MotivoEstoqueExtraComboComponent,
    FilialRotaComboComponent,
    CentroDistribuicaoComboComponent,
    FilialComboComponent,
    ProdutoComboComponent,
    GrupoPrioridadeLojaComponent,
    ClusterComboComponent,
    FilialSelectorComponent,
    MotivoTravaEstoqueCombo,
    PerfilAcessoComboComponent,
    
    // SetorCdComboComponent

} from './components/combos';
import { MotivosCadastroMinimoMaximoComponent } from './components/combos/motivos-cadastro-minimo-maximo/motivos-cadastro-minimo-maximo.component';

import { SetorItimComboComponent } from './components/combos/setor-itim/setor-itim-combo.component';

import { SetorCdComboComponent } from './components/combos/setor-cd-combo/setor-cd-combo.component';
import { LocalizacaoCdFilialComboComponent } from './components/combos/localizacao-cd-filial-combo/localizacao-cd-filial-combo.component';
import { AgendaSuspenderService, CdService, FaturamentoLojaService, FilialService, FornecedorService, OperadorAcessoService, PerfilAcessoService, PerfilRotasService, ProdutoService } from './services';
import { FabricanteService } from './services/fabricante/fabricante.service';
import { AgrupamentoCombosCdComponent } from './components/agrupamento-combos-cd/agrupamento-combos-cd.component';
import { FilialRotaService } from './services/filial-rota/filialRota.service';
import { AgrupamentoCombosFaturamentoLojaComponent } from './components/agrupamento-combos-faturamento-loja/agrupamento-combos-faturamento-loja.component';
import { MotivoSuspensaoService } from "./services/motivo-suspensao/motivo-suspensao.service";
import { TravaEstoqueService } from './services/trava-estoque/trava-estoque.service';
import { ParametrizacaoSetorService } from './services/parametrizacao-setor/parametrizacao-setor.service';
// import { LocalizacaoCdFilialService } from './services/Localizacao-cd-filial-service/localizacao-cd-filial-service';
import { LocalizacaoFilialCdService } from './services/localizacao-filial-cd-service/'

import { comboSetorItim } from './components/combos/combo-setor-itim/combo-setor-itim.component';
import { ArvoreSelecaoTreeComponent } from "./components/arvore-selecao-dados/arvore-selecao-dados.component";

@NgModule({
  declarations: [
    NewModalComponent,
    SanitizeHtmlPipe,
    SidebarComponent,
    HeaderComponent,
    FocusDirective,
    LoadingComponent,
    ConteudoTopoComponent,
    PaginacaoComponent,
    InputNumberComponent,
    CurrencyFormatPipe,
    BasicLoadingComponent,
    SoundComponent,
    ModalComponent,
    ButtonsModalComponent,
    CadastroReceitaComponent,
    ConsultaReceitaComponent,
    NumberDirective,
    minimoMaximoDirective,
    VirgulaNumeroDirective,
    CdkDetailRowDirective,
    CentroDistribuicaoComboComponent,
    FilialComboComponent,
    ProdutoComboComponent,
    MinimoMaximoModalComponent,
    CategoriaProdutoComboComponent,
    RegiaoMacroComboComponent,
    FornecedorComboComponent,
    MotivoSuspensaoComboComponent,
    DiaSemanaComboComponent,
    FabricanteComboComponent,
    TipoEstoqueComboComponent,
    MotivoEstoqueExtraComboComponent,
    FilialRotaComboComponent,
    GrupoPrioridadeLojaComponent,
    ClusterComboComponent,
    FilialSelectorComponent,
    DropdownMapperPipe,
    AgrupamentoCombosCdComponent,
    AgrupamentoCombosFaturamentoLojaComponent,
    MotivoTravaEstoqueCombo,
    SetorCdComboComponent,
    SetorItimComboComponent,
    comboSetorItim,
    PerfilAcessoComboComponent,
    ArvoreSelecaoTreeComponent,
    MotivosCadastroMinimoMaximoComponent,
    LocalizacaoCdFilialComboComponent
    
  ],
  imports: [
    FormsModule,
    MatChipsModule,
    ReactiveFormsModule,
    BrowserModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatProgressBarModule,
    BsDatepickerModule.forRoot(),
    RouterModule,
    MatTableModule,
    MatDialogModule,
    TextMaskModule,
    NgxMaskModule,
    NgxMatSelectSearchModule,
    NgMultiSelectDropDownModule.forRoot(),
    SimpleNotificationsModule.forRoot(),
    MatTreeModule,
    A11yModule,
    CdkStepperModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    OverlayModule,
    PortalModule,
    ScrollingModule,
  ],
  providers: [
    UfHelper,
    ValidatorHelper,
    UtilsHelper,
    AuthenticationService,
    AuthGuardService,
    HeaderService,
    APIService,
    FormsModule,
    CdService,
    FornecedorService,
    FabricanteService,
    FilialService,
    FilialRotaService,
    FaturamentoLojaService,
    AgendaSuspenderService,
    ProdutoService,
    MotivoSuspensaoService,
    TravaEstoqueService,
    ParametrizacaoSetorService,
    PerfilAcessoService,
    OperadorAcessoService,
    PerfilRotasService,
    LocalizacaoFilialCdService,
    {
      provide: MAT_DIALOG_DATA,
      useValue: {}
    },
    {
      provide: MatDialogRef,
      useValue: {}
    },

  ],

  entryComponents: [MinimoMaximoModalComponent],

  exports: [
    NewModalComponent,
    LoadingComponent,
    SanitizeHtmlPipe,
    SidebarComponent,
    HeaderComponent,
    FocusDirective,
    MatCheckboxModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatProgressBarModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    ConteudoTopoComponent,
    PaginacaoComponent,
    InputNumberComponent,
    BsDatepickerModule,
    CurrencyFormatPipe,
    ModalComponent,
    ButtonsModalComponent,
    CadastroReceitaComponent,
    ConsultaReceitaComponent,
    NumberDirective,
    minimoMaximoDirective,
    VirgulaNumeroDirective,
    NgMultiSelectDropDownModule,
    CdkDetailRowDirective,
    CentroDistribuicaoComboComponent,
    FilialComboComponent,
    ProdutoComboComponent,
    MinimoMaximoModalComponent,
    CategoriaProdutoComboComponent,
    RegiaoMacroComboComponent,
    FornecedorComboComponent,
    MotivoSuspensaoComboComponent,
    DiaSemanaComboComponent,
    FabricanteComboComponent,
    TipoEstoqueComboComponent,
    MotivoEstoqueExtraComboComponent,
    FilialRotaComboComponent,
    GrupoPrioridadeLojaComponent,
    ClusterComboComponent,
    FilialSelectorComponent,
    DropdownMapperPipe,
    AgrupamentoCombosCdComponent,
    AgrupamentoCombosFaturamentoLojaComponent,
    MotivoTravaEstoqueCombo,
    SetorCdComboComponent,
    SetorItimComboComponent,
    comboSetorItim,
    PerfilAcessoComboComponent,
    ArvoreSelecaoTreeComponent,
    MatTreeModule,
    MotivosCadastroMinimoMaximoComponent,
    LocalizacaoCdFilialComboComponent
  ]
})
export class CommonsModule {}
