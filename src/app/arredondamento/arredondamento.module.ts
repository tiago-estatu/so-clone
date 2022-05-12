import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../commons/commons.module';
import { RouterModule } from '@angular/router';
import { ArredondamentoComponent } from './arredondamento.component';
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
import { ConsultaArredondamentoComponent } from './consulta';
import { CadastroArredondamentoComponent} from './cadastro';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule, MatDialogModule, MatDividerModule, MatStepperModule, MatTabsModule } from '@angular/material';

//import { ExcelService } from '../commons/services/excel.service';
import {TableModule} from 'primeng/table';
import { CadastroArredondamentoDialog } from './consulta/cadastro-arredondamento.dialog';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  providers: 
  [], //ExcelService
  declarations: [
    ArredondamentoComponent,
    ConsultaArredondamentoComponent,
    CadastroArredondamentoComponent,
    CadastroArredondamentoDialog
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
    MatDialogModule,
    MatStepperModule,
    MatTabsModule,
    MatDividerModule,
    NgxPaginationModule
  ],
  entryComponents: [
    ArredondamentoComponent,
    CadastroArredondamentoDialog
  ]
})
export class ArredondamentoModule { }
