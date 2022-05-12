import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../../commons/commons.module';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxMaskModule } from 'ngx-mask';

import {
  ClientesComponent,
  ClientesConsultaComponent
} from './';

@NgModule({
  declarations: [
    ClientesComponent,
    ClientesConsultaComponent
  ],
  imports: [
    TextMaskModule,
    CommonModule,
    RouterModule,
    CommonsModule,
    NgxMaskModule
  ]
})
export class ClientesModule { }
