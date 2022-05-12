import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper} from 'src/app/commons';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Http } from '@angular/http';
import { ServicePath } from '../../commons/const/ServicePath';

import { CdService } from './../../commons/services/center-distribution/cd.service';
import { FabricanteService } from './../../commons/services/fabricante/fabricante.service';
import { FornecedorService } from './../../commons/services/fornecedor/fornecedor.service';

@Component({
  selector: 'rd-relatorio-pedidos-emitidos',
  templateUrl: './relatorio-pedidos-emitidos.component.html',
  styleUrls: ['./relatorio-pedidos-emitidos.component.scss'],
  animations: [fadeInOut]
})
export class RelatorioPedidosEmitidosComponent implements OnInit {
    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private _headerService: HeaderService,
        private _validator: ValidatorHelper,
        private _utils: UtilsHelper,
        private _http: Http,
        private _cdService: CdService,
        private _fabricanteService: FabricanteService,
        private _forncedorService: FornecedorService
      ) {
      }

    // DADOS RECEBIDOS DO ELEMENTO HTML(VIEW)
    @ViewChild('elementCD') elementCD: ElementRef;
    @ViewChild('elementFornecedor') elementFornecedor: ElementRef;
    @ViewChild('elementFabricante') elementFabricante: ElementRef;

    // EXPANDIR ACORDEON (CONTEINER DOS FILTROS)
    expandir: Boolean = true;

    // LOADING (INTERAÇÃO COM O USER)
    componentLoading: Boolean = false;

    // INFOS SOBRE CREDENCIAS DE USUÁRIO (LOGIN)
    cdOperador = localStorage.getItem('cdOperador');

    // VARIAVEIS DE MANIPULAÇÃO DOS DADOS NO FILTRO DE CONSULTA
    _dataInicialConsulta: any;
    _dataFinalConsulta: any;
    _dataInicial = new Date();
    _dataFinal = new Date();
    _todosCDSelecionado = [];
    _todosMotivosSelecionados = [];
    _todosFabricantesSelecionados = [];
    _todosFornecedoresSelecionados = [];
    _todosDiasSemanaSelecionados = [];
    _todosProdutosSelecioandos = [];

    ngOnInit() {
        // TÍTULO DA PÁGINA
        this._headerService.setTitle('Relatório Pedidos Emitidos');
    }


    /**************** MÉTODOS AUXILIARES (VALIDAÇÕES E AGRUPAMENTO DE PARAMETROS) **********************/
    /***************************************************************************************************/

    stringIt(json) {
        return JSON.stringify(json)
      }
      campoSelecionado($event) {
        const dict = {
          cd: 'todosCentroDistribuicaoSelecionados',
          fc: 'preencherTodosFornecedoresSelecionados',
          fb: 'preencherTodosFabricantesSelecionados'
        };
        this[dict[$event.field]]($event.data);
      }

    // CONTROLA OS DADOS SELECIONADOS NOS FILTROS DE CONSULTA
    // CD's SELECIONADOS
    todosCentroDistribuicaoSelecionados(callBack) {
        this._todosCDSelecionado = callBack;
    }
    getCentroDistribuicoes(): number[] {
        if (this._utils.isEmpty(this._todosCDSelecionado)) {
            return [];
        }
        return this._todosCDSelecionado;
    }

    // FORNECEDORES SELECIONADOS
    preencherTodosFornecedoresSelecionados(callBack) {
    this._todosFornecedoresSelecionados = callBack;
    }
    getFornecedores(): number[] {
        if (this._utils.isEmpty(this._todosFornecedoresSelecionados)) {
            return [];
        }
        return this._todosFornecedoresSelecionados;
    }

    // FABRICANTES SELECIONADOS
    preencherTodosFabricantesSelecionados(callBack) {
        this._todosFabricantesSelecionados = callBack;
    }
    getFabricantes(): number[] {
        if (this._utils.isEmpty(this._todosFabricantesSelecionados)) {
            return [];
        }
        return this._todosFabricantesSelecionados;
    }

    // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
    contemAlgumFiltro(): boolean {
    if (this._todosCDSelecionado.length > 0 ||
        this._todosFornecedoresSelecionados.length > 0 ||
        this._todosFabricantesSelecionados.length > 0) {
        return true;
    } else {
        Swal.fire({
            title: 'Atenção, Filtro incompleto!',
            // tslint:disable-next-line: max-line-length
            html: 'Por favor, selecione algum <strong>CD</strong>, <strong>Fornecedor</strong> ou <strong>Fabricante</strong> para prosseguir.',
            icon: 'warning',
            confirmButtonText: 'Ok, obrigado',
            customClass: {confirmButton: 'setBackgroundColor'}
        });
        return false;
        }
    }

    // FAÇO A VALIDAÇÃO DO PERÍODO MÁXIMO DE PESQUISA (HOJE + 6 DIAS)
    // RECEBO (3) PARAMS (DATA INICIO, DATA FIM + VALOR MÁXIMO DE DIAS)
    rangeMaximoSeteDias(primeiroDia: any, ultimoDia: any,  qtdMaxDias: number) {

        // RECEBO PARAMETRO DA QUANTIDADE MAX DE DIAS NO RANGE DE BUSCA
        const limitandoQtdDiasDePesquisa = new Date();
        limitandoQtdDiasDePesquisa.setDate(limitandoQtdDiasDePesquisa.getDate() + qtdMaxDias);

        // RECEBO DATA INICIO DA PESQUISA
        const primeiroDiaDoRange = primeiroDia;
        primeiroDiaDoRange.setDate(primeiroDiaDoRange.getDate());

        // RECEBO DATA FINAL DA PESQUISA
        const ultimoDiaDoRange = ultimoDia;
        ultimoDiaDoRange.setDate(ultimoDiaDoRange.getDate());

        // 6 DIAS REPRESENTADOS EM MILISEGUNDOS === '518400000'
        const diferencaEmMilisegundos = (ultimoDiaDoRange.getTime() - primeiroDiaDoRange.getTime());

        return (diferencaEmMilisegundos > 518400000 ? true : false);
    }


    // VALIDAR AS DATA INSERIDAS
    validarDataInserida(): boolean {
        // VARIAVEIS PARA CONFIGURAÇÕES (CUSTOMIZADAS) PARA OS SWEETALERT (MODAIS)
        let titulo: string;
        let texto: string;
        let icone: SweetAlertIcon; // SweetAlertIcon:string ('success' | 'error' | 'warning' | 'info' | 'question')
        const btOkObrigado = 'Ok, Obrigado';
        /*******************************************************************/

        let retornoValidacaoDatas = true;
        // DATAS NãO FORAM PREENCHIDAS
        if (this._utils.isEmpty(this._dataInicial) || this._utils.isEmpty(this._dataFinal)) {
            icone = 'warning';
            titulo = 'Atenção, é necessário selecionar as datas.';
            texto = 'Por favor, preencher a vigência.';
            retornoValidacaoDatas = false;

        // DATA INICIAL (MAIOR) QUE DATA FINAL
        } else if (this._dataInicial > this._dataFinal) {
            icone = 'warning';
            titulo = 'Atenção, data fora de vigência!';
            texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
            retornoValidacaoDatas = false;

        // PESQUISA (MAIOR) QUE O MÁXIMO DE DIAS PERMITIDOS
        } else if (this.rangeMaximoSeteDias(this._dataInicial, this._dataFinal, 6) === true) {
            icone = 'warning';
            titulo = 'Atenção, data fora de vigência!';
            texto = 'A pesquisa máxima é de 7 dias.';
            retornoValidacaoDatas = false;
        }

        // DISPARO O MODAL DE ALERTA (CUSTOMIZADA)
        if (!retornoValidacaoDatas) {
            Swal.fire({
                title: titulo,
                html: texto,
                icon: icone,
                confirmButtonText: btOkObrigado,
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        } else {
            this._dataInicialConsulta = this._dataInicial;
            this._dataFinalConsulta = this._dataFinal;
        }

        return retornoValidacaoDatas;
    }

    // PREPARA OS PARAMETROS SELECIONADOS PARA SEREM ENVIADOS NA REQUISIÇÃO
    gerarFiltroParaConsulta(): HttpParams {

        let params: HttpParams = new HttpParams()
        .set('dtInicial', this._validator.formataData(this._dataInicialConsulta))
        .set('dtFinal', this._validator.formataData(this._dataFinalConsulta));

        // BUSCAR LISTA DOS CENTRO DE DISTRIBUIÇÃO SELECIONADOS
        const centroDistribuicao = this.getCentroDistribuicoes();
        if (centroDistribuicao.length > 0) {
            params = params.set('cdRegional', centroDistribuicao.toString());
        }
        // BUSCAR LISTA FORNECEDORES SELECIONADOS
        const fornecedores = this.getFornecedores();
        if (fornecedores.length > 0) {
            params = params.set('cdFornecedor', fornecedores.toString());
        }

        // BUSCAR LISTA FABRICANTES SELECIONADOS
        const fabricantes = this.getFabricantes();
        if (fabricantes.length > 0) {
            params = params.set('cdFabricante', fabricantes.toString());
        }
        return params;
    }

    // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
    limparCampos() {
        this._dataInicialConsulta = '';
        this._dataFinalConsulta = '';
        this._dataInicial = new Date();
        this._dataFinal = new Date();

        /*
        this.elementCD['cdSelecionadoLista'] = [];
        this._todosCDSelecionado = [];
        this.elementFornecedor['fornecedorSelecionado'] = [];
        this._todosFornecedoresSelecionados = [];
        this.elementFabricante['fabricanteSelecionado'] = [];
        this._todosFabricantesSelecionados = [];
        */

        // LIMPO OS DROLISTS
        this._cdService.limpar();
        this._fabricanteService.limpar();
        this._forncedorService.limpar();

    }

    /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
    /****************************************************************************************************/
    // MÉTODO DE EXPORTAÇÃO
    exportarDadosConsultados() {
        this.componentLoading = true;

        // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
        if (this.validarDataInserida()) {
            // if (this.contemAlgumFiltro()) {
                // console.log('Filtros antes do GET', this.gerarFiltroParaConsulta().toString());

                    // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
                    this.exportarRelatorioPedidosEmitidos(this.gerarFiltroParaConsulta().toString()).then(() => {
                        this.componentLoading = false;
                    });

                /*} else {
                    this.componentLoading = false;
                }*/
            } else {
                this.componentLoading = false;
        }
    }

    // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
    exportarRelatorioPedidosEmitidos(filtroPesquisa: string): Promise<Boolean> {
        // NOMEANDO O ARQUIVO EXCEL
        const nomeDoArquivoExcel = 'relatorio_pedidos_emitidos';

        return new Promise((resolve) => {
            this._http.get(ServicePath.HTTP_EXPORT_RELATORIO_PEDIDOS_EMITIDOS + '?' + filtroPesquisa)
                .toPromise()
                .then((res: any) => {

                if (res && res['_body']) {

                    // FAÇO O DOWNLOAD DO EXCEL
                    this.downloadFile(res['_body'], nomeDoArquivoExcel);

                    Swal.fire({
                        title: 'Download Concluído com sucesso!',
                        text: 'Por favor, verifique seus downloads para abrir a exportação.',
                        icon: 'success',
                        confirmButtonText: 'Ok, obrigado',
                        customClass: {confirmButton: 'setBackgroundColor'}
                      });
                    resolve(true);
                }
              })
            .catch((error) => {
                resolve(false);
                // CHAMO METÓDO DE TRATAMENTO DE ERROS
                this.handleError(error);
            });
        });
    }

    // DOWNLOADER DO EXCEL DE DADOS
    downloadFile(data: any, nomeDoArquivoExcel: string) {
        const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
        const EXCEL_EXTENSION = '.csv';
        const blob = new Blob(['\ufeff' + data], { type: EXCEL_TYPE });
        const dwldLink = document.createElement('a');
        const url = URL.createObjectURL(blob);

        // if Safari open in new window to save file with random filename.
        const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
        if (isSafariBrowser) {
          dwldLink.setAttribute('target', 'blank');
        }

        dwldLink.setAttribute('href', url);
        dwldLink.setAttribute('download', nomeDoArquivoExcel + EXCEL_EXTENSION);
        dwldLink.style.visibility = 'hidden';
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        if (error.status === 404) {
            Swal.fire({
                title: 'Não encontramos nenhum registro!',
                html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        } else if (error.status === 0) {
            Swal.fire({
                title: 'Serviço de consulta está fora!',
                html: 'Por favor entre em contato com a equipe técnica.',
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        } else {
            Swal.fire({
                title: 'Atenção! Erro desconhecido por favor entre em contato com a equipe técnica.',
                html: `Log error: ${error.error.mensagem}`,
                icon: 'warning',
                confirmButtonText: 'Ok Fechar',
                customClass: {confirmButton: 'setBackgroundColor'}
            });
        }
      }
}
