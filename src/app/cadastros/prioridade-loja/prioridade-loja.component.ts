import { async } from '@angular/core/testing';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ServicePath } from './../../commons/const/ServicePath';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper } from 'src/app/commons';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PrioridadeLojaService } from './../../commons/services/prioridade-loja/prioridade-loja.service';
import { error } from 'protractor';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
    selector: 'rd-prioridade-loja',
    templateUrl: './prioridade-loja.component.html',
    styleUrls: ['./prioridade-loja.component.scss'],
    animations: [fadeInOut]
})
export class PrioridadeLojaComponent implements OnInit {

    constructor(
        private _utils: UtilsHelper,
        private _headerService: HeaderService,
        private _prioridadeLojaService: PrioridadeLojaService,
        private _fb: FormBuilder,
    ) { }


    // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
    @ViewChild('elementCD') elementCD: ElementRef;
    @ViewChild('elementFilial') elementFilial: ElementRef;
    @ViewChild('elementGrupoPrioridade') elementGrupoPrioridade: ElementRef;

    // SELEÇÃO DOS CHECKBOX NA GRID
    nenhumItemSelecionado: Boolean = true;
    selecionarTodos: Boolean;

    // LOADING (INTERAÇÃO COM O USER)
    componentLoading: Boolean = false;

    // VARIAVEL ULTILIZADA NA SELEÇÃO UNICA DOS FILTROS
    selecaoUnicaGruposPrioridade = true;
    expandir = true;

    // VARIAVEL CONFIGURAÇÃO DE PAGINAÇÃO
    totalDeItems;
    pageNumber = 0;
    itemsPorPagina = 20;

    // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
    _todosCDSelecionado = [];
    _todasFiliaisSelecionadas = [];
    _todosGruposSelecionados = [];
    cdOperador = localStorage.getItem('cdOperador');
    dadosParaGrid = [];
    fileControl: FormControl;

    ngOnInit() {
        // TÍTULO DA PÁGINA
        this._headerService.setTitle('Prioridade de Loja');
        this.gridVisibleControl(false);
        this.fileControl = this._fb.control('');
    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }

    /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
    /***************************************************************************************************/
    getPage(pageNumber) {
        this.pageNumber = pageNumber;

        this.selecionarTodos = false;
        this.nenhumItemSelecionado = true;

        this.consultarButton();
    }

    // VERIFICO SE EXISTE ALGUM ITEM
    itemSelecionado() {
        this.nenhumItemSelecionado = (this.dadosParaGrid.filter(el => el.selecionado).length === 0);
    }

    // SELECIONAR (TODOS) OS CHECKBOX NA GRID DE RESULTADOS
    selecionarTodosItens(event) {
        this.dadosParaGrid.forEach(el => {
            if (el.nrGrupoPrioridade !== null) {
                el.selecionado = event.checked;
            }
        });
        this.itemSelecionado();
    }

    // CONTROLE PARA O LOADING
    toggleLoading(value: boolean = false) { this.componentLoading = value; }

    // DROPLIST CD's SELECIONADOS
    todosCentroDistribuicaoSelecionados(callBack) {
        this._todosCDSelecionado = callBack;
    }
    getCentroDistribuicoes(): number[] {
        if (this._utils.isEmpty(this._todosCDSelecionado)) {
            return [];
        }
        return this._todosCDSelecionado;
    }

    // DROPLIST FILIAIS SELECIONADAS
    preencherFiliaisSelecionadas(callBack) {
        this._todasFiliaisSelecionadas = callBack;
    }
    getFiliais(): number[] {
        if (this._utils.isEmpty(this._todasFiliaisSelecionadas)) {
            return [];
        }
        return this._todasFiliaisSelecionadas;
    }

    // DROPLIST GRUPOS SELECIONADOS
    preencherGruposSelecionados(callBack) {
        // SE OCORRER ALTERAÇÃO NO DROPLIST DE GRUPOS FAÇO O RESET DA PAGINAÇÃO
        this.pageNumber = this._todosGruposSelecionados[0] !== callBack[0] ? 0 : this.pageNumber;

        this._todosGruposSelecionados = callBack;
    }
    getGrupos(): number[] {

        if (this._utils.isEmpty(this._todosGruposSelecionados)) {
            return [];
        }
        return this._todosGruposSelecionados;
    }

    // VERIFICAÇÃO SE A LÓGICA DE SELECÃO DE FILTRO FOI FEITA
    contemAlgumFiltro(): boolean {
        if (this._todosCDSelecionado.length > 0) {
            if (this._todasFiliaisSelecionadas.length === 0 && this._todosGruposSelecionados.length === 0) {
                this.msgObrigatorio();
                return false;
            }
            return true;
        } else {
            Swal.fire({
                title: 'Atenção, filtro incompleto!',
                html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong>',
                icon: 'warning',
                confirmButtonText: 'Ok, obrigado',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
            return false;
        }
    }
    msgObrigatorio() {
        Swal.fire({
            title: 'Atenção, filtro incompleto!',
            html: 'Por favor, selecione algum <strong>filial</strong> ou <strong>grupo de prioridade</strong>.',
            icon: 'warning',
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' }
        });
    }
    // PREPARA OS PARAMETROS EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS
    gerarConsultaExportarFiltros(): HttpParams {

        let params: HttpParams = new HttpParams();

        // BUSCAR LISTA DOS CENTRO DE DISTRIBUIÇÃO SELECIONADOS
        const centroDistribuicao = this.getCentroDistribuicoes();
        if (centroDistribuicao.length > 0) {
            params = params.set('cdRegional', centroDistribuicao.toString());
        }

        // BUSCAR LISTA DE FILIAIS SELECIONADAS
        const filiais = this.getFiliais();
        if (filiais.length > 0) {
            params = params.set('cdFilial', filiais.toString());
        }

        // BUSCAR LISTA DE GRUPO DE PRIORIDADE SELECIONADAS
        const grupoPrioridade = this.getGrupos();
        if (grupoPrioridade.length > 0) {
            params = params.set('cdGrupo', grupoPrioridade.toString());
        }
        return params;
    }

    // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
    gerarFiltroParaConsulta(): HttpParams {

        let params: HttpParams = new HttpParams();

        // BUSCAR LISTA DOS CENTRO DE DISTRIBUIÇÃO SELECIONADOS
        const centroDistribuicao = this.getCentroDistribuicoes();
        if (centroDistribuicao.length > 0) {
            params = params.set('cdRegional', centroDistribuicao.toString());
        }

        // BUSCAR LISTA DE FILIAIS SELECIONADAS
        const filiais = this.getFiliais();
        if (filiais.length > 0) {
            params = params.set('cdFilial', filiais.toString());
        }

        // BUSCAR LISTA DE GRUPO DE PRIORIDADE SELECIONADAS
        const grupoPrioridade = this.getGrupos();
        if (grupoPrioridade.length > 0) {
            params = params.set('cdGrupo', grupoPrioridade.toString());
        }

        params = params.set('page', this.pageNumber.toString());
        params = params.set('size', this.itemsPorPagina.toString());

        return params;
    }


    // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
    limparCampos() {
        this.gridVisibleControl(false);

        // RESETS
        this.elementCD['cdSelecionadoLista'] = [];
        this._todosCDSelecionado = [];

        this.elementFilial['filialSelecionadoLista'] = [];
        this._todasFiliaisSelecionadas = [];

        this.elementGrupoPrioridade['selecionadoLista'] = [];
        this._todosGruposSelecionados = [];

        this.selecionarTodos = false;
        this.nenhumItemSelecionado = true;
        this.pageNumber = 0;

    }

    // GRID VISÍVEL OU NÃO
    gridVisibleControl(value: boolean = false) {
        if (!value) {
            (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'none';
        } else {
            (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'block';
        }
    }

    // RETORNO A QUANTIDADE DE LOJAS SELECIONADAS PARA A MODAL DE ALTERAR PRIORIDADE
    verificarQtdItensSelecionadosGrid() {
        const selecionadosLength = [];
        this.dadosParaGrid.forEach(item => {
            if (item.selecionado === true) {
                selecionadosLength.push(item);
            }
        });
        return selecionadosLength.length;
    }

    // EXPORTAR MODELO DE EXCEL
    exportarModeloCsvButton() {
        this._prioridadeLojaService.exportRequest(
            this._prioridadeLojaService._urlTodosServicos.exportarModeloCsvBranco,
            'Prioridade_Loja_Template').toPromise().then(() => this.toggleLoading(false));
    }

    // DISPARO AÇÃO EXPORTAR FILTROS
    exportarFiltrosButton() {
        this.toggleLoading(true);
        (this.contemAlgumFiltro()) ? this.exportarFiltrosPreSelecionados() : this.toggleLoading(false);
    }

    // EXPORTO FILTROS PRÉ-SELECIONADOS
    exportarFiltrosPreSelecionados() {
        const queryFiltro = this.gerarConsultaExportarFiltros().toString();
        this._prioridadeLojaService.exportRequest(
            this._prioridadeLojaService._urlTodosServicos.exportarFiltrosPreSelecionados + queryFiltro,
            'Prioridade_loja_Filtros_Selecionados').toPromise().then(() => this.toggleLoading(false));
    }

    // IMPORTAÇÃO
    importFile(event) {
        this.toggleLoading(true);
        const file = event.target.files.item(0);
        this._prioridadeLojaService.importFile(file)
            .subscribe(data => {
                this.showModalConfig(`${data.type}`, `${data.mensagem}`, 'success');

            }, err => {
                this.handleError(err)
            })
            .add(() => {
                this.toggleLoading();
                this.fileControl.setValue('');
            });
    }


    // DISPARO AÇÃO DE CONSULTA
    consultarButton() {
        this.gridVisibleControl(false);
        this.toggleLoading(true);
        (this.contemAlgumFiltro()) ? this.consultarService() : this.toggleLoading(false);
    }

    // DISPARO O SERVIÇO DE CONSULTA DA GRID
    consultarService() {
        this._prioridadeLojaService.getAllLojas(this.gerarFiltroParaConsulta().toString())
            .subscribe(
                data => this.carregarResultadosGrid(data),
                ex => this._prioridadeLojaService.handleError(ex))
            .add(() => this.toggleLoading(false));
    }

    // CARREGO DADOS DA COSULTA NA GRID DE RESULTADOS
    carregarResultadosGrid(resposta: any) {
        // CONFIGURAÇÃO DE PÁGINAÇÃO (TOTAL DE ELEMENTOS NO ARRAY DE PAGINAÇÃO)
        this.totalDeItems = resposta.totalElements;
        if (resposta.content.length > 0) {
            this.dadosParaGrid = resposta.content;
            this.gridVisibleControl(true);
        } else {
            this.gridVisibleControl(false);

        }

    }

    // DISPARO O SERVIÇO DE RETIRAR PRIORIDADE DE LOJA
    async retiroPrioridadeLoja(event) {
        this.toggleLoading(true);

        const parametros = await this.agrupamentoParametrosDeleteLoja(event);

        if (parametros !== false) {
            this._prioridadeLojaService.deletePrioridadeLoja(parametros).subscribe(
                data => this._prioridadeLojaService.swallAlertMsgAlteradoSucesso('As lojas foram removidas com sucesso!'),
                ex => this._prioridadeLojaService.handleError(ex))
                .add(() => {
                    this.toggleLoading(false);
                    this.limparCampos();
                });
        } else {
            this.toggleLoading(false);
            return;
        }

    }

    // MODAL ALERTA PARA RETIRADA DE LOJAS DOS GRUPOS
    async agrupamentoParametrosDeleteLoja(event) {
        // FAÇO O AGRUPAMENTO DO OBJETO QUE SERÁ ENVIADO NA REQUISIÇÃO DE DELETE
        let objetoParaDeleteLoja: any = this.retornoLinhaSelecionadosNaGrid(this.dadosParaGrid);

        await Swal.fire({
            title: 'Atenção',
            icon: 'warning',
            html: `Estamos retirando as
                 <strong>(${this.verificarQtdItensSelecionadosGrid()})</strong> loja(s) selecionadas de todos os grupos de prioridade.`,
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true
        }).then((result) => {
            if (result.dismiss) {
                objetoParaDeleteLoja = false;
            }
        });

        return objetoParaDeleteLoja;
    }

    // SEPARO As LINHAS SELECIONADAS NA GRID E RETORNO UM (OBJETO)
    retornoLinhaSelecionadosNaGrid(arraysContendoLinhasGrid) {
        const retornoLinhaCompletaObj = [];
        arraysContendoLinhasGrid.forEach(item => {
            if (item.selecionado === true) {
                retornoLinhaCompletaObj.push({
                    cdOperador: this.cdOperador,
                    cdGrupo: item.nrGrupoPrioridade,
                    cdFilial: item.cdFilial
                });
            }
        });
        return retornoLinhaCompletaObj;
    }

    // DISPARO O SERVIÇO DE ALTERAR PRIORIDADE DE LOJA
    async alterarPrioridadeLojaButton(event) {
        this.toggleLoading(true);

        const parametros = await this.agrupamentoParametrosPrioridadeLoja(event);
        if (parametros !== false) {
            this._prioridadeLojaService.alteroPrioridadeLoja(parametros).subscribe(
                data => this._prioridadeLojaService.swallAlertMsgAlteradoSucesso('Prioridade alterada com sucesso!'),
                ex => this._prioridadeLojaService.handleError(ex))
                .add(() => {
                    this.limparCampos();
                    this.toggleLoading(false);
                });
        } else {
            this.toggleLoading(false);
            return;
        }
    }

    // RECEBO INFOS SOBRE OS DADOS SELECIONADOS NA GRID
    async agrupamentoParametrosPrioridadeLoja(event) {
        // AGUARDANDO A SELEÇÃO DO NOVO GRUPO DE PRIORIDADE
        const novoGrupoSelecionado = await this.escolherNovoGrupo();

        let objectAlterarPrioridade: any = [];
        if (novoGrupoSelecionado !== false) {
            // FAÇO O AGRUPAMENTO DO OBJETO QUE SERÁ ENVIADO NA REQUISIÇÃO DE ALTERAÇÃO

            this.retornoCdFilialSelecionadosNaGrid(this.dadosParaGrid).forEach((cdFilial) => {
                objectAlterarPrioridade.push(
                    {
                        cdOperador: this.cdOperador,
                        cdGrupo: novoGrupoSelecionado,
                        cdFilial: cdFilial
                    }
                );
            });
            return objectAlterarPrioridade;
        } else {
            return objectAlterarPrioridade = false;
        }
    }

    // SEPARO AS FILIAIS SELECIONADAS NA GRID (RETORNO O CÓDIGO DA FILIAL)
    retornoCdFilialSelecionadosNaGrid(arraysContendoLinhasGrid) {
        const retornoSomenteCdFilial = [];
        arraysContendoLinhasGrid.forEach(item => {
            if (item.selecionado === true) {
                retornoSomenteCdFilial.push(item.cdFilial);
            }
        });
        return retornoSomenteCdFilial;
    }

    // MODAL PARA ESCOLHER NOVO GRUPO DE PRIORIDADE
    async escolherNovoGrupo(): Promise<any> {
        const opcoesDeGrupos = [
            {
                'cdGrupo': 1,
                'dsGrupo': 'Grupo 1'
            },
            {
                'cdGrupo': 2,
                'dsGrupo': 'Grupo 2'
            },
            {
                'cdGrupo': 3,
                'dsGrupo': 'Grupo 3'
            },
            {
                'cdGrupo': 4,
                'dsGrupo': 'Grupo 4'
            },
            {
                'cdGrupo': 5,
                'dsGrupo': 'Grupo 5'
            },
            {
                'cdGrupo': 6,
                'dsGrupo': 'Grupo 6'
            }
        ];
        const gruposSelecionados = {};

        opcoesDeGrupos.forEach(o => {
            gruposSelecionados[o.cdGrupo] = o.dsGrupo;
        });

        const selected = await Swal.fire({
            title: 'Selecionar novo grupo',
            input: 'select',
            html: `Estamos alterando o grupo de prioridade para
                    <strong>(${this.verificarQtdItensSelecionadosGrid()})</strong> loja(s) selecionadas`,
            inputPlaceholder: 'Selecione a prioridade',
            inputOptions: gruposSelecionados,
            confirmButtonText: 'Alterar',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value !== '') {
                        resolve();
                    } else {
                        resolve('Por favor, selecione o grupo desejado ¯\\_(ツ)_/¯');
                    }
                });
            }
        });

        // SE CLICAR NO CANCEL BUTTON RETORNO FALSE PARA MAIN FUNCTION
        if (!selected.dismiss) {
            return new Promise((resolve) => {
                resolve(selected.value);
            });
        } else {
            return new Promise((resolve) => {
                resolve(false);
            });
        }
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        this.componentLoading = false

        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Oops', 'Não encontramos nenhum registro!' || error.error.mensagem, 'warning');
        } else if (error.status === 0 || error.status === 400 || error.status === 500) {
            this.showModalConfig('¯\\_(ツ)_/¯', `Erro não esperado, Por favor entre em contato com a equipe técnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        } else {
            this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
        }
    } 

}











