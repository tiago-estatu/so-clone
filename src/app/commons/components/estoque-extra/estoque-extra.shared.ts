import Swal, { SweetAlertIcon } from "sweetalert2";
import { UtilsHelper, ValidatorHelper } from "../../helpers";
import { HeaderService, IEstoqueExtraSharedService, ResponseUpload } from "../../services";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { BackendPaging, QueryFilters } from "../../models/query-param.model";
import { RequestParamModel } from "../../models/request-param.model";
import { Observable } from "rxjs";



export interface IEstoqueExtraSharedHeaderService {
    setTitle(title: string): void;
}

export class EstoqueExtraShared implements BackendPaging {
    _todosProdutosSelecioandos = [];
    _todasFilialSelecionadas = [];
    _todosTipoEstoqueSelecionados = [];
    _todosMotivosSelecionados = [];
    dataSource = [];
    estoqueExtraRequest;

    totalItems: number = 0;
    pag;

    toArrayString = (val) => (val || []).join(',');
    produtoToCodArray = (val) => val.map(e => e.cdProduto).join(',');
    _validator = new ValidatorHelper();
    filtroBack = new QueryFilters([
        new RequestParamModel('size', 20),
        new RequestParamModel('page', '0'),
        new RequestParamModel('dtInicioVigencia', new Date(), 'inicio', this._validator.formataData),
        new RequestParamModel('dtFimVigencia', new Date(), 'fim', this._validator.formataData),
        new RequestParamModel('cdTipo', '', null, this.toArrayString),
        new RequestParamModel('cdMotivo', '', null, this.toArrayString),
        new RequestParamModel('cdProduto', '', null, this.produtoToCodArray),
        new RequestParamModel('cdFilial', '', null, this.toArrayString)
    ]);


    //flags
    expandir: Boolean = true;
    componentLoading = false;

    filterForm: FormGroup;
    importForm: FormGroup;

    constructor(
        protected estoqueExtraService?: IEstoqueExtraSharedService,
        protected _utils?: UtilsHelper,
        protected headerService?: IEstoqueExtraSharedHeaderService,
        protected formBuilder?: FormBuilder,
        protected router?: Router
    ) {
    }


    createForms() {
        this.filterForm = this.formBuilder.group({
            dataInicial: [new Date()],
            dataFinal: [new Date()],
            produtos: [''],
            filiais: ['']
        });

        this.importForm = this.formBuilder.group({
            file: ['', Validators.required],
            cdOperador: [localStorage.getItem('cdOperador')]
        });
    }

    setTitle(title: string): void {
        this.headerService.setTitle(title);
    }

    // CONFIGURAÇÕES DO MODAL
    showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
        let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
        Swal.fire({ ...options, ...message })
    }

    /**
     * Exporta somente o modelo csv para a importação
     */
    exportarModeloCSV(): Promise<boolean> {
        this.componentLoading = true;
        return this.estoqueExtraService.exportarModeloCSV().then((resolve) => {
            this.componentLoading = false;
            const options = { confirmButtonText: 'Ok, obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
            let msg: { title: string, text: string, icon: SweetAlertIcon } = resolve ?
                {
                    title: 'Download Concluído com sucesso!',
                    text: 'Por favor, verifique seus downloads para abrir o modelo.',
                    icon: 'success'
                } :
                {
                    title: 'Ops!',
                    text: 'Desculpe, mas não conseguimos baixar o modelo de importação, pro favor, tente novamente mais tarde.',
                    icon: 'warning'
                };

            Swal.fire({ ...options, ...msg });
            return resolve
        }).then((resolve) => resolve);
    }


    static showWarning(title?: string, content?: string): void {
        Swal.fire({
            title: title || 'Ops!',
            html: content || 'Não foi possível realizar a ação',
            icon: "warning",
            showCancelButton: false,
            confirmButtonText: "Ok, obrigado.",
            customClass: { confirmButton: 'setBackgroundColor' },
        });
    }

    downloadResponse(response: ResponseUpload): void {
        this.estoqueExtraService.exportarComFalha(response);
    }

    static mensagemUpload(response: ResponseUpload, showErrors: Boolean = false): string {
        let processed: any | any[] = [
            { prefix: 'Foram realizados', value: response.qtTotalRegistrosNovos, suffix: 'novos cadastros' },
            { prefix: 'Foram alterados', value: response.qtTotalRegistrosAlterados, suffix: '' },
            { prefix: `${response.qtTotalRegistros == response.qtTotalRegistroComErro ? 'Não' : 'E não'} conseguimos realizar`, value: response.qtTotalRegistroComErro, suffix: '' }
        ];

        processed = processed
            .filter((row, idx) => showErrors ? true : (idx + 1 !== processed.length))
            .map(row => {
                return row.value > 0
                    ?
                    `<tr><td> ${row.prefix} <strong>${row.value}</strong> ${row.suffix || 'cadastros'}.</td></tr>`
                    :
                    '';
            })
            .reduce((prev, current) => {
                return prev + current
            }, '');

        return `
                  <table>
                  <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</tr></td>
                  ${processed}
                  ${showErrors ? '<tr><td>Deseja realizar o download dos erros?</td></tr>' : ''}
                  </table>
                `;
    }


    msgImportacao(response?: ResponseUpload) {
        if (!response) {
            Swal.fire({
                title: 'Ops!',
                html: 'Por favor, <strong>valide</strong> o modelo de excel para importar.',
                icon: 'error',
                confirmButtonText: 'Ok, obrigado',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        } else if (response.qtTotalRegistroComErro > 0) {
            Swal.fire({
                title: 'Importação concluída! Mas...',
                html: EstoqueExtraShared.mensagemUpload(response, true),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Realizar download!',
                customClass: { confirmButton: 'setBackgroundColor' },
                cancelButtonText: 'Não'
            }).then(resultado => {
                if (resultado.value === true) {
                    this.downloadResponse(response);
                }
            });

        } else {
            Swal.fire({
                title: 'Sucesso!',
                html: response.mensagem,
                icon: 'success',
                confirmButtonText: 'Ok, obrigado',
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        }
    }

    importarExcel(event): void {

        // VERIFICAR TAMANHO DO ARQUIVO EXCEL
        if(!this._utils.tamanhoMaxUpload(event.target.files.item(0))) {
            this.componentLoading = false;
            return
        }

        this.importForm.get('file').setValue(event.target.files.item(0));

        let raw: FormData = new FormData();
        raw.append("file", this.importForm.get('file').value);

        raw.append("cdOperador", this.importForm.get('cdOperador').value);

        this.componentLoading = true;

        const importar = this.estoqueExtraService
            .uploadExcel(raw)
            .subscribe(
                (response: ResponseUpload) => {
                    this.msgImportacao(response);
                    this.componentLoading = false;
                },
                ex => {
                    this.handleError(ex)
                    this.componentLoading = false;
                },
                () => {
                    this.componentLoading = false;
                }
            );

        this.importForm.get('file').setValue(null);
        event.target.value = null;

    }

    preencherFiliaisSelecionadas(callBack) {
        this._todasFilialSelecionadas = callBack;
    }

    preencherProdutosSelecionados(callBack) {
        this._todosProdutosSelecioandos = callBack;
    }


    updateFilters(additionalItems?: { name: string, value: any }[]) {
        let formValues = this.filterForm.getRawValue();
        additionalItems = additionalItems || [];
        this.filtroBack.updateParams(
            [
                { name: 'fim', value: formValues.dataFinal },
                { name: 'inicio', value: formValues.dataInicial },
                { name: 'cdProduto', value: this._todosProdutosSelecioandos },
                { name: 'cdFilial', value: this._todasFilialSelecionadas },
                ...additionalItems
            ]
        )
    }

    consultar(fromStart: Boolean = true) {
        if (fromStart) {
            this.filtroBack.updateParam('page', '1');
            this.updateFilters();
        }

        if (this.validarDataInserida()) {
            this.pesquisar();
        }
    }

    validacoesCadastrarModal() {
        const options = { confirmButtonText: 'Ok, obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
        let msg: { title: string, html: string, icon: SweetAlertIcon }
        if (this._todosTipoEstoqueSelecionados.length > 1) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione </br> apenas um <strong>tipo estoque</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        if (this._todosProdutosSelecioandos.length > 1) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione apenas um <strong>produto</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        if (this._todosMotivosSelecionados.length > 1) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione apenas um <strong>motivo</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        if (this._todasFilialSelecionadas.length > 1) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione apenas uma <strong>filial</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        if (this._utils.isEmpty(this._todosMotivosSelecionados)) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione um <strong>motivo</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        if (this._utils.isEmpty(this._todasFilialSelecionadas)) {
            msg = {
                title: 'Atenção!',
                html: 'Por favor, para cadastrar selecione uma <strong>filial</strong>',
                icon: 'warning'
            }
            Swal.fire({ ...options, ...msg });
            return false
        }
        return true
    }


    validarDataInserida(): boolean {
        const btOkObrigado = 'Ok, Obrigado';
        let formValues = this.filterForm.getRawValue();
        let validations = [
            {
                title: 'Atenção, é necessário selecionar as datas.',
                content: 'Por favor, preencher a vigência.',
                show: [this.filtroBack.getParam('inicio', false), this.filtroBack.getParam('fim', false)]
                    .reduce((prev, current) => prev || this._utils.isEmpty(current), false)
            },
            {
                title: 'Atenção, data fora de vigência!',
                content: 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.',
                show: this._validator.formataDataComBarra(formValues.dataInicial) > this._validator.formataDataComBarra(formValues.dataFinal)
            },
            {
                title: 'Atenção, data fora de vigência!',
                content: 'A pesquisa máxima é de 365 dias.',
                show: this._utils.rangeMaximoEmDias(formValues.dataInicial, formValues.dataFinal, 365) === true
            }
        ];

        let error = validations.find(error => error.show === true);
        let hasError = !!error;
        if (hasError) {
            Swal.fire({
                title: error.title,
                html: error.content,
                icon: 'warning',
                confirmButtonText: btOkObrigado,
                customClass: { confirmButton: 'setBackgroundColor' }
            });
        }

        return !hasError

    }


    pesquisar() {
        const btOkObrigado = 'Ok, Obrigado';
        this.componentLoading = true;
        if (this.estoqueExtraRequest) {
            this.estoqueExtraRequest.unsubscribe();
        }

        this.estoqueExtraRequest = this.estoqueExtraService.getEstoquePorFiltros(this.filtroBack.criarFiltro())
            .subscribe((response: any) => {
                this.componentLoading = false;
                if (response.content.length === 0) {
                    Swal.fire({
                        title: 'Ops!',
                        html: 'Dado não encontrado!',
                        icon: 'warning',
                        confirmButtonText: btOkObrigado,
                        customClass: { confirmButton: 'setBackgroundColor' }
                    });
                    this.dataSource = [];
                    this.totalItems = 0;
                    this.componentLoading = false;
                } else {
                    this.dataSource = response.content;
                    this.totalItems = response.totalElements;

                    this.componentLoading = false;
                }

            }, ex => {
                Swal.fire({
                    title: 'Ops!',
                    html: ex.error.mensagem,
                    icon: 'warning',
                    confirmButtonText: btOkObrigado,
                    customClass: { confirmButton: 'setBackgroundColor' }
                });
                this.dataSource = [];
                this.totalItems = 0;
                this.componentLoading = false;

                return
            });

    }

    // TRATAMENTO DE ERROS
    handleError(error: any) {
        this.componentLoading = false
        if (typeof (error) == 'string') error = JSON.parse(error)
        if (error.status === 404) {
            this.showModalConfig('Atenção', error.error.mensagem ? error.error.mensagem : ' Não encontramos nenhum registro!','warning');
        } else if (error.status === 0 || error.status === 400 ||  error.status === 403 || error.status === 500) {
             this.showModalConfig('Atenção', error.error.mensagem ? error.error.mensagem : 'Erro não esperado, Por favor entre em contato com a equipe técnica', 'warning');
        } else {
            this.showModalConfig('Atenção', error.error.mensagem ? error.error.mensagem : 'Erro não esperado, Por favor entre em contato com a equipe técnica', 'warning');
        }
    }


    getPage(pageNumber) {
        this.filtroBack.updateParam('page', pageNumber);
        this.consultar(false);
    }
}
