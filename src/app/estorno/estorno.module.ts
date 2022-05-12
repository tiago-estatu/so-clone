
import { EstornoComponent } from './estorno.component';


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { TextMaskModule } from 'angular2-text-mask';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { BrMaskerModule } from 'br-mask';
import { MatSortModule, MatPaginatorModule, MatTableModule, MatChipsModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { OverlayContainer } from '@angular/cdk/overlay';
import {AutoCompleteModule} from 'primeng/primeng';
import { NgxPaginationModule } from 'ngx-pagination';
import { SuspensaoLojaComponent } from './suspensao-loja/suspensao-loja.component';
import { EstornoFaturamentoDetalheComponent } from './suspensao-loja/suspender-faturamento-detalhe';

@NgModule({
  declarations: [
    EstornoComponent,
    SuspensaoLojaComponent,
    EstornoFaturamentoDetalheComponent
  ],
  imports: [
    RouterModule,
    CommonModule,
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
    NgxPaginationModule
  ],
  entryComponents: [
    EstornoComponent,
    EstornoFaturamentoDetalheComponent
]
})
export class EstornoModule {
  constructor(overlayContainer: OverlayContainer) {
      overlayContainer.getContainerElement().classList.add('solution-dark-theme');
    }
}
