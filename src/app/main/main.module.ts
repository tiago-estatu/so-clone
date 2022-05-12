import { NgModule, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '../commons/commons.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { MainComponent, InicioComponent } from './';
import { ClientesModule } from './clientes/clientes.module';
import { AlertaDePedidoModule } from './alerta-de-pedido/alerta-de-pedido.module';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import localePt from '@angular/common/locales/pt';
defineLocale('pt-br', ptBrLocale);
registerLocaleData(localePt);


@NgModule({
    declarations: [
        MainComponent,
        InicioComponent
    ],
    imports: [
        CommonsModule,
        ClientesModule,
        AlertaDePedidoModule,
        BrowserAnimationsModule,
        RouterModule,
        CommonModule,
        SimpleNotificationsModule.forRoot(),
    ],
    exports: [
        CommonModule,
        SimpleNotificationsModule
    ],
    providers: [
        {
            provide: LOCALE_ID,
            useValue: 'pt-BR'
        },
    ],
})
export class MainModule { }
