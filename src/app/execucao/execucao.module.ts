import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { TextMaskModule } from 'angular2-text-mask';
import { ExecucaoComponent } from './execucao.component';
import { ConsultaExecucaoComponent } from './consulta/execucao-consulta.component';
import { ExecucaoCadastroComponent } from './cadastro/execucao-cadastro.component';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { BrMaskerModule } from 'br-mask';
import { MatSortModule, MatPaginatorModule, MatTableModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ParametrosCadastroComponent } from './parametros';
import { AgendaCadastroComponent } from './agenda';
import { AgendaConsultaDetalheComponent } from './agenda/consulta-detalhe';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
    declarations: [
        ExecucaoComponent,
        ConsultaExecucaoComponent,
        ExecucaoCadastroComponent,
        ParametrosCadastroComponent,
        AgendaCadastroComponent,
        AgendaConsultaDetalheComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        CommonsModule,
        TextMaskModule,
        AmazingTimePickerModule,
        BrMaskerModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        BrowserModule,
        BrowserAnimationsModule,
        BrowserModule,
        BrowserAnimationsModule,
        NgxMatSelectSearchModule,
        MatButtonToggleModule,
        MatButtonModule
    ],
    exports: [
        ExecucaoComponent
    ],
})
export class ExecucaoModule { }
