import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FaturamentosComponent } from './faturamentos.component';
import { ConsultaFaturamentoComponent } from './consulta-faturamento/consulta-faturamento.component';
import { ConsultaFaturamentoDetalheComponent } from './consulta-faturamento';
@NgModule({
  declarations: [
    FaturamentosComponent,
    ConsultaFaturamentoComponent,
    ConsultaFaturamentoDetalheComponent,
    
  ],
  imports: [
    CommonModule,
    NgxMatSelectSearchModule,
    MatButtonToggleModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule,
  ]
})
export class FaturamentosModule { }
