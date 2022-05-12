import { ParametrizacaoSetoresComponent } from './parametrizacao-setores/parametrizacao-setores.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LojaEspelhoComponent } from './loja-espelho/loja-espelho.component';
import { CommonsModule } from '../commons/commons.module';
import { SubstitutoGenericoComponent } from './substituto-generico/substituto-generico.component';
import {MatDividerModule} from "@angular/material";
import { PrioridadeLojaComponent } from './prioridade-loja/prioridade-loja.component';
import { PrioridadeLojaService } from './../commons/services/prioridade-loja/prioridade-loja.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { AgendaSuspensaCdComponent } from './agenda-suspensa-cd/agenda-suspensa-cd.component';
import { AgendaSuspensaCdModalComponent } from './agenda-suspensa-cd/agenda-suspensa-cd-detalhe/agenda-suspensa-cd-detalhe.component';
import { CadastroTravaEstoqueComponent } from './cadastro-trava-estoque/cadastro-trava-estoque.component';
import { CadastroTravaDialog } from './cadastro-trava-estoque/cadastro-trava-dialog/cadastro-trava.dialog';

@NgModule({
  declarations: [
    LojaEspelhoComponent,
    SubstitutoGenericoComponent,
    PrioridadeLojaComponent,
    AgendaSuspensaCdComponent,
    AgendaSuspensaCdModalComponent,
    CadastroTravaEstoqueComponent,
    CadastroTravaDialog,
    ParametrizacaoSetoresComponent
  ],
  providers: [
      PrioridadeLojaService
  ],
  imports: [
    CommonModule,
    CommonsModule,
    MatDividerModule,
    NgxPaginationModule
  ],
  exports: [
    LojaEspelhoComponent,
    AgendaSuspensaCdComponent,
  ],
  entryComponents: [
    AgendaSuspensaCdModalComponent,
    CadastroTravaDialog
  ]
})
export class CadastrosModule { }
