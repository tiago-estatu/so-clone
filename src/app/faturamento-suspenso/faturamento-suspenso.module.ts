import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommonsModule } from "../commons/commons.module";
import { RouterModule } from "@angular/router";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import {  MatExpansionModule } from "@angular/material";
import { NgxPaginationModule } from 'ngx-pagination';
import { FaturamentoSuspensoComponent } from './faturamento-suspenso.component';
import { GridFaturamentoSuspensoComponent } from './grid-faturamento-suspenso/grid-faturamento-suspenso.component';
import { SuspenderFaturamentoDetalheComponent } from './grid-faturamento-suspenso/suspender-faturamento-detalhe/suspender-faturamento-detalhe.component';

import {
    MAT_DIALOG_DATA,
    MatDialogRef
  } from "@angular/material";

@NgModule({
  declarations: [
    FaturamentoSuspensoComponent,
    GridFaturamentoSuspensoComponent,
    SuspenderFaturamentoDetalheComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    BrowserModule,
    MatExpansionModule,
    NgxPaginationModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonToggleModule,
    NgxMatSelectSearchModule,
    MatToolbarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatInputModule,
    CommonsModule,
  ],
  entryComponents: [SuspenderFaturamentoDetalheComponent],
  providers: [
    {
      provide: MAT_DIALOG_DATA, useValue: {}
    },
    {
      provide: MatDialogRef, useValue: {}
    }
  ]
})
export class FaturamentoSuspensoModule { }
