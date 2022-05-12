import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CadastroNovoOperadorComponent } from './cadastro-novo-operador/cadastro-novo-operador.component';
import { ConsultaOperadorAtivoComponent } from './consulta-operador-ativo/consulta-operador-ativo.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule, MatPaginatorModule, MatTableModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonsModule } from '../commons/commons.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CadastroOperadorDialog } from './consulta-operador-ativo/cadastro-operador-dialog/cadastro-operador.dialog';
import { CriarNovoPerfilComponent } from './criar-novo-perfil/criar-novo-perfil.component';

@NgModule({
  declarations: [
    ConsultaOperadorAtivoComponent,
    CadastroNovoOperadorComponent,
    CadastroOperadorDialog,
    CriarNovoPerfilComponent,
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
    NgxPaginationModule,
  ],entryComponents: [
    CadastroOperadorDialog,
  ]
})
export class OperadoresAcessoModule { }
