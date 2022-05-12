import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { EstoqueExtraLmpmComponent } from './estoque-extra-lmpm.component';
import { CommonsModule } from '../commons/commons.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [EstoqueExtraLmpmComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    CommonsModule,
    NgxPaginationModule
  ]
})
export class EstoqueExtraLmpmModule { }
