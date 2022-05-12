import { NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { TextMaskModule } from 'angular2-text-mask';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { BrMaskerModule } from 'br-mask';
import { MatSortModule, MatPaginatorModule, MatTableModule, MatChipsModule, MatExpansionPanelHeader, MatExpansionModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { EstoqueExtraConsultaComponent } from  './consulta/estoqueExtra-consulta.component';
import { EstoqueExtraCadastroComponent } from  './cadastro/estoqueExtra-cadastro.component';
import { EstoqueExtraModalCadastroComponent } from  './modal-cadastro/estoque-extra-modal-cadastro.component';
import { EstoqueExtraComponent } from  './estoqueExtra.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OverlayContainer } from '@angular/cdk/overlay';
import {AutoCompleteModule} from 'primeng/primeng';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    declarations: [
        EstoqueExtraConsultaComponent,
        EstoqueExtraCadastroComponent,
        EstoqueExtraModalCadastroComponent,
        EstoqueExtraComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        CommonsModule,
        TextMaskModule,
        AmazingTimePickerModule,
        BrMaskerModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgxMatSelectSearchModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatIconModule,
        AutoCompleteModule,
        NgxPaginationModule,
        MatExpansionModule
    ],
    entryComponents: [
        EstoqueExtraConsultaComponent,
        EstoqueExtraCadastroComponent,
        EstoqueExtraModalCadastroComponent
    ]
  })
  export class EstoqueExtraModule {
    constructor(overlayContainer: OverlayContainer) {
        overlayContainer.getContainerElement().classList.add('solution-dark-theme');
      }
  }

