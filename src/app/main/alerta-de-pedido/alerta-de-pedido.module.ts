import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../../commons/commons.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxMaskModule } from 'ngx-mask';
import {
  AlertaPedidoConsultaComponent,
  AlertaPedidoCadastroComponent,
  AlertaDePedidoComponent
} from './';

@NgModule({
  declarations: [
    AlertaPedidoCadastroComponent,
    AlertaPedidoConsultaComponent,
    AlertaDePedidoComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CommonsModule,
    TextMaskModule,
    NgxMaskModule.forRoot()
  ]
})
export class AlertaDePedidoModule { }
