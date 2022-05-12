import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';
import { PedidosComponent } from './pedidos.component';
import { ConsultaPedidoComponent } from './consulta-pedido';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ConsultaPedidoDetalheComponent } from './consulta-pedido/consulta-pedido-detalhe/consulta-pedido-detalhe.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    PedidosComponent,
    ConsultaPedidoComponent,
    ConsultaPedidoDetalheComponent,
  ],
  imports: [
    CommonModule,
    NgxMatSelectSearchModule,
    MatButtonToggleModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    CommonsModule,
    BrowserAnimationsModule,
    BrowserModule,
    RouterModule,
    MatPaginatorModule,
    NgxPaginationModule
  ]
})
export class PedidosModule { }
