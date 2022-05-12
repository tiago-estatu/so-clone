
import { DataSource } from '@angular/cdk/collections';
import { Component, OnInit, Input, EventEmitter, ViewChild, Output, ElementRef } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertCustomClass } from 'sweetalert2';
import { AgendaFaturamentoService } from './../../commons/services/agendaFaturamento/agendaFaturamento.service';
import { MatDialog } from "@angular/material/dialog";
import { SuspenderFaturamentoDetalheComponent } from './suspender-faturamento-detalhe';
import { HttpParams, HttpErrorResponse } from '@angular/common/http';
import { fadeInOut, fadeIn } from './../../commons/const/animation';
import { AgendaFaturamentoModel } from 'src/app/commons/services/agendaFaturamento';
import { UtilsHelper } from 'src/app/commons';

@Component({
  selector: 'rd-grid-faturamento-suspenso',
  templateUrl: './grid-faturamento-suspenso.component.html',
  styleUrls: ['./grid-faturamento-suspenso.component.scss'],
  animations: [fadeInOut, fadeIn]
})
export class GridFaturamentoSuspensoComponent implements OnInit {


    constructor(
        private _agendaFaturamentoService: AgendaFaturamentoService,
        private _dialogRef: MatDialog,
        private _utils: UtilsHelper,

    ) {}

    // RECEBO OS PARAMETROS DOS SELECTS E INPUTS DO FATURAMENTO SUSPENSO COMPONENT
    // PARA FAZER A CONSULTA DA GRID
    @Input() query: HttpParams;
    @Output() selecionadas = new EventEmitter<AgendaFaturamentoModel[]>();
    @Output() contemSelecionado = new EventEmitter<Boolean>();

    selecionarTodos;
    curPage = 1;
    componentLoading = false;
    dataSource = [];
    itensLinhaGrid;
    selecionado;

    nenhumItemSelecionado;
    // FAÇO A DEFINIÇÃO DO TAMANHO DO MODAL
    _widthModal = '600px';
    _heightModal = 'auto';


    ngOnInit() {}

    ngOnChanges() {
        this.validarMudancasEConsultar();
      }

      validarMudancasEConsultar() {
          // REALIZAR CHAMADA API PARA CARREGAMENTO DA GRID
        if (!this._utils.isEmpty(this.query)) {

            this.componentLoading = true;

            // console.log('validarMudancas componentLoading true', this.componentLoading)
            this._agendaFaturamentoService.consultarStatusDeFaturamentos(this.query)
                .subscribe(data => {
                  //  console.log('data recebida no response', data);
                    this.dataSource = data;

                    // console.log( 'dados recebidos', this.dataSource)

                    // SE EXISTIR RESULTADOS MOSTRO A GRID
                    if (this.dataSource.length > 0) {

                        // SE OCORRER UMA NOVA CONSULTA, RETORNO A PAGINAÇÃO PARA A PAGINA (1)
                        this.curPage = 1;
                        (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'block';
                    }
                    this.componentLoading = false;

                }, ex => {
                    this.limparGrid();
                    if (ex.status === 404) {
                        Swal.fire({
                            title: 'Não encontramos nenhum registro!',
                            html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
                            icon: 'warning',
                            confirmButtonText: 'Ok Fechar',
                            customClass: {confirmButton: 'setBackgroundColor'}
                        });
                    } else if (ex.status === 0) {
                        Swal.fire({
                            title: 'Serviço de consulta está fora!',
                            html: 'Por favor entre em contato com a equipe técnica.',
                            icon: 'warning',
                            confirmButtonText: 'Ok Fechar',
                            customClass: {confirmButton: 'setBackgroundColor'}
                        });
                    } else {
                        let msg = '';
                        const erros = ex.error;
                        erros.forEach(element => {
                            msg += `<p> ${element.message} </p>`;
                        });
                        Swal.fire({
                            title: 'Oopps!',
                            html: ` <strong>${msg}</strong>`,
                            icon: 'warning',
                            confirmButtonText: 'Ok Fechar',
                            customClass: {confirmButton: 'setBackgroundColor'}
                        });
                    }
                });
            } else {
                (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'none';
            }
      }


    // EXIBIR A MODAL SUSPENDER FATURAMENTO DETALHE
    exibirModalFaturamentoSuspensoDetalhe(itensLinhaGrid) {
        this._dialogRef.open(SuspenderFaturamentoDetalheComponent, {
            width: this._widthModal,
            height: this._heightModal,
            data: itensLinhaGrid
        });
    }

    limparGrid(){
        this.nenhumItemSelecionado = true;
        this.dataSource = [];
        this.componentLoading = false;
        this.query = undefined;
        (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'none';
    }

    // VERIFICO SE EXISTE ALGUM ITEN
    itemSelecionado() {
        this.nenhumItemSelecionado = (this.dataSource.filter(el => el.selecionado).length === 0);
        if (!this.nenhumItemSelecionado) {
            this.mandarSelecionados();
        }
        this.contemSelecionado.emit(!this.nenhumItemSelecionado);
    }

    // SELECIONAR (TODOS) OS CHECKBOX NA GRID DE RESULTADOS
    selecionarTodosItens(event) {
        let contemSuspenso = false;
        this.dataSource.forEach(el => {
            if (el.fgFilialSuspensa !== 2) {
                el.selecionado = event.checked;
                contemSuspenso = true;
            }
        });
        this.nenhumItemSelecionado = contemSuspenso;
        this.itemSelecionado();

    }


    mandarSelecionados(){
        this.selecionadas.emit(this.dataSource.filter(faturamento => faturamento.selecionado));
    }

}



