import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material';

//import { ExcelService } from '../commons/services/excel.service';
import {TableModule} from 'primeng/table';
import {NgxPaginationModule} from 'ngx-pagination';
import { DefineFaturamentoLojaComponent } from './define-faturamento-loja/define-faturamento-loja.component';
import { DefineFaturamentoFornecedorComponent } from './define-faturamento-fornecedor/define-faturamento-fornecedor.component';
import { DefineFaturamentoFornecedorService } from './define-faturamento-fornecedor/define-faturamento-fornecedor.service';
import { CdService } from '../commons';

@NgModule({
  providers: [DefineFaturamentoFornecedorService, CdService], //ExcelService
  declarations: [
    DefineFaturamentoLojaComponent,
    DefineFaturamentoFornecedorComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    // Material Modules
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatToolbarModule,
    MatPaginatorModule,
    CommonsModule,
    NgxMatSelectSearchModule,
    MatButtonToggleModule,
    TableModule,
    MatChipsModule,
    NgxPaginationModule
  ],
  entryComponents: [
    DefineFaturamentoLojaComponent
  ]
})
export class DefineFaturamentoLojaModule { }
