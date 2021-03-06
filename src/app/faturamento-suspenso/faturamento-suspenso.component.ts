import { Component, OnInit, ViewChild, ElementRef, Output } from '@angular/core';
// tslint:disable-next-line: max-line-length
import { NewModalComponent, fadeInOut, fadeIn, UtilsHelper, HeaderService, ValidatorHelper, AgendaFaturamentoService, ResponseUpload, AgendaFaturamentoModel, agendaFaturamentoResponseSuspender, AgendaSuspensaoPost } from '../commons';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import Swal, { SweetAlertIcon, SweetAlertCustomClass } from 'sweetalert2';
import { setDay } from 'ngx-bootstrap/chronos/utils/date-setters';
import { ServicePath } from './../commons/const/ServicePath';
import { Http } from '@angular/http';


@Component({
  selector: 'rd-faturamento-suspenso',
  templateUrl: './faturamento-suspenso.component.html',
  styleUrls: ['./faturamento-suspenso.component.scss'],
  animations: [fadeInOut, fadeIn]
})
export class FaturamentoSuspensoComponent implements OnInit {

  constructor(
    private _utils: UtilsHelper,
    private _validator: ValidatorHelper,
    public dialog: MatDialog,
    private _header: HeaderService,
    private _service: AgendaFaturamentoService,
    private _http: Http
  ) {
    this._header.setTitle('Faturamento Suspenso Loja');
  }

  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  cdOperador = localStorage.getItem("cdOperador");

  @ViewChild('elementCD') elementCD: ElementRef;
  @ViewChild('elementFilial') elementFilial: ElementRef;
  @ViewChild('elementCategoria') elementCategoria: ElementRef;
  @ViewChild('elementMotivo') elementMotivo: ElementRef;
  @ViewChild('importarRef') importarRef: ElementRef;

  contemFilialSelecionado: boolean;

  _todosCDSelecionado = [];
  _todosFLSelecionado = [];
  //_todasCategoriasSelecionadas = [];
  _todosMotivosSelecionados = [];
  _todosProdutosDigitados;
  componentLoading: Boolean = false;
  expandir = true;
  _fileToUpload: File = null;
  _dataInicial = new Date();
  _dataFinal = new Date();

  _dataInicialSuspender = new Date();
  _dataFinalSuspender = new Date();

  nenhumItemSelecionado = true;
  todosFaturamentosSelecionados: AgendaFaturamentoModel[] = [];
  qtdAgendasSelecionadas = 0;

  // NECESSARIO CHAMAR O SERVI??O PASSANDO 2 COMO PARAMETRO INICIAL
  // PARA QUE O DROPDOWN CARREGA SOMENTE OS MOTIVOS SUSPENS??O LOJA
  tipoMotivoSuspensao = 2;


  parametrosParaEnviadosGrid: HttpParams;

  // INFORMA????O VISUAL PARA O USU??RIO NO CAMPO ABERTO DE PRODUTOS
  _msgParaHabilitarProdutos = 'Selecione filial para habilitar digita????o de produtos';


  ngOnInit() {
    // PARAMETRO INICIAL PARA QUE O DROPDOWN CARREGUE SOMENTE OS MOTIVOS SUSPENS??O LOJA
    this.tipoMotivoSuspensao = 2;
  }

  todosCentroDistribuicaoSelecionado(callBack) {
    this._todosCDSelecionado = callBack;
  }

  getCentroDistribuicao(): number[] {
    if (this._utils.isEmpty(this._todosCDSelecionado)) {
      return [];
    }
    return this._todosCDSelecionado;
  }


  todosFilialSelecionado(callBack) {
    if (this._utils.isEmpty(callBack)) {
      // INFORMA????O VISUAL PARA O USU??RIO NO CAMPO "ABERTO" PARA DIGITA????O DE PRODUTOS"
      this._msgParaHabilitarProdutos = 'Selecione filial para habilitar digita????o de produtos';
      this.contemFilialSelecionado = false;

    } else {
      // LIMPO O CAMPO "ABERTO" PARA DIGITA????O DE PRODUTOS"
      this._msgParaHabilitarProdutos = '';
      this.contemFilialSelecionado = true;
    }
    this._todosFLSelecionado = callBack;
  }


  getFilial(): number[] {
    if (this._utils.isEmpty(this._todosFLSelecionado)) {
      return [];
    }
    return this._todosFLSelecionado;
  }

  preencherTodosMotivosSelecionados(callback) {
    this._todosMotivosSelecionados = callback;
  }

  getMotivos(): number[] {
    if (this._utils.isEmpty(this._todosMotivosSelecionados)) {
      return [];
    }
    return this._todosMotivosSelecionados;
  }


  getProdutos(): number[] {
    let produtos = this._todosProdutosDigitados;
    if (this._utils.isEmpty(produtos)) {
      return [];
    }

    produtos = produtos.split(',');
    produtos = produtos.filter(prod => prod !== '');

    return produtos;
  }

  // CONFIGURA????ES DO MODAL
  showModalConfig(title?: string, msgContent?: string, typeIcon?: any) {
    let options = { confirmButtonText: 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
    let message = { title: title || 'Oops!', html: msgContent || 'N??o foi poss??vel realizar a a????o, tente mais tarde', icon: typeIcon || 'warning', };
    Swal.fire({ ...options, ...message })
  }

  limparCampos() {
    this.qtdAgendasSelecionadas = 0;
    this.nenhumItemSelecionado = true;
    this.contemFilialSelecionado = false;
    this.elementCD['cdSelecionadoLista'] = [];
    this._todosCDSelecionado = [];
    this.elementFilial['filialSelecionadoLista'] = [];
    this._todosFLSelecionado = [];
    //this.elementCategoria['categoriaProdutoSelecionadoLista'] = [];
    //this._todasCategoriasSelecionadas = [];
    this.elementMotivo['motivoSelecionadoLista'] = [];
    this._todosMotivosSelecionados = [];
    this._todosProdutosDigitados = '';
    this._dataInicial = new Date();
    this._dataFinal = new Date();
    this.parametrosParaEnviadosGrid = undefined;
    this._msgParaHabilitarProdutos = 'Selecione filial para habilitar digita????o de produtos';
  }


  // REALIZAR CHAMADA API PARA CARREGAMENTO DA GRID
  consultar() {
    this.nenhumItemSelecionado = true;
    if (this.validarDataVigencia()) {
      this._dataInicialSuspender = this._dataInicial;
      this._dataFinalSuspender = this._dataFinal;
      if (this.contemAlgumFiltro()) {
        // FA??O O ENVIO @Input query [] para o grid component
        this.parametrosParaEnviadosGrid = this.gerarParametroParaConsulta();
      }
    }
  }

  suspenderAgendasFataturamentoSelecionados(event) {

    this.componentLoading = true;
    this.escolherMotivo().then((cdMotivo) => {

      if (cdMotivo !== undefined) {
        this.montarJSON(cdMotivo).then((result) => {

          this.suspenderAgendaDeFaturamentos(result);

        });
      } else {

        this.componentLoading = false;
      }
    });
  }

  // FA??O A CHAMADA DA API PARA REALIZAR A SUSPENS??O DE AGENDAS DE FATURAMENTO
  suspenderAgendaDeFaturamentos(dadosParaSuspender: any): Promise<Boolean> {
    return new Promise((resolve) => {
      this._http.post(ServicePath.HTTP_SUSPENDER_AGENDA_FATURAMENTO, dadosParaSuspender)
        .toPromise()
        .then((res: any) => {
          // SE FOR DIFERENTE DE NULL VAI SER .CSV
          if (res.headers.getAll('Content-Disposition') !== null) {
            Swal.fire({
              title: 'Aten????o datas em conflito!',
              icon: 'warning',
              // tslint:disable-next-line: max-line-length
              text: 'Obs: Existem suspens??es ativas para o per??odo selecionado, ser?? necess??rio realizar o estorno das suspens??es ativas ou selecionar outra data',
              showCancelButton: true,
              confirmButtonText: 'Download dos registros?',
              customClass: { confirmButton: 'setBackgroundColor' },
              cancelButtonText: 'N??o'
            }).then(resultado => {
              if (resultado.value === true) {
                // FA??O O DOWNLOAD DO EXCEL
                // PARAMETROS (RESPOSTA DA API + NOME DO ARQUIVO PARA O SALVAR O EXCEL)
                this.downloadFile(res['_body'], 'datas_suspensoes_ativas');
              }
              this.consultar();
            });

            resolve(true);

          } else {
            const respostaParseda = res.json();

            const msg = this.mensagemDeAgendasSuspensaComAlerta(respostaParseda);

            Swal.fire({
              title: 'Agendas suspendidas com sucesso!',
              icon: 'success',
              html: `${msg}`,
              confirmButtonText: 'Ok, obrigado',
              customClass: { confirmButton: 'setBackgroundColor' }
            }).then(resultado => {
              this.consultar();
              this.componentLoading = false;
            });


          }

        }).catch((error) => {
          resolve(false);
          const msgLogErro = error.json();
          let resErros = '';

          msgLogErro.forEach(e => resErros = e.message);

          Swal.fire({
            title: 'Oops',
            html: `${resErros}`,
            icon: 'warning',
            confirmButtonText: 'Ok Fechar',
            customClass: { confirmButton: 'setBackgroundColor' }
          });

          this.componentLoading = false;
        });
    })
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


  // SEPARA OS PARAMETROS QUE DEVEM SER ENVIADOS PARA SUSPENDER AGENDAS
  async montarJSON(motivo: number): Promise<any> {
    let suspender: AgendaSuspensaoPost;
    const listaFiliais: number[] = [];

    this.todosFaturamentosSelecionados.forEach(agendaCd => {
      const id: number = agendaCd.cdFilial;
      listaFiliais.push(id);
    });

    suspender = {
      dataInicio: this._validator.formataData(this._dataInicialSuspender),
      dataFim: this._validator.formataData(this._dataFinalSuspender),
      cdOperador: this.cdOperador,
      cdMotivo: motivo,
      listaFiliais: listaFiliais
    };

    return new Promise((resolve) => {
      resolve(suspender);
    });

  }


  // MODAL PARA ESCOLHER O MOTIVO PARA SUSPENDER AGENDAS
  async escolherMotivo(): Promise<number> {
    const todosMotivos = this.elementMotivo['dropdownMotivoSuspensao'];
    const opcoesMotivo = {};
    todosMotivos.forEach(o => {
      opcoesMotivo[o.item_id] = o.item_text;
    });



    const agendasSelecionadas = this.qtdAgendasSelecionadas;

    const selected = await Swal.fire({
      title: 'Suspender loja inteira',
      input: 'select',
      html: 'Estamos suspendendo cerca de <strong>' + agendasSelecionadas + '</strong> agendas ' +
        'de <strong>' + this._validator.formataData(this._dataInicialSuspender) +
        '</strong> at?? <strong>' + this._validator.formataData(this._dataFinalSuspender) + '</strong>.' +
        '</br>Deseja suspende-los por inteiro?',

      inputPlaceholder: 'Selecione um motivo...',
      inputOptions: opcoesMotivo,
      confirmButtonText: 'Suspender',
      customClass: { confirmButton: 'setBackgroundColor' },
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value !== '') {
            resolve();
          } else {
            resolve('Por favor, selecione outro motivo :)')
          }
        });
      }
    });

    return new Promise((resolve) => {
      resolve(selected.value);
    });
  }

  gerarParametroParaConsulta(): HttpParams {
    let params: HttpParams = new HttpParams()
      .set('dtInicial', this._validator.formataData(this._dataInicialSuspender)) // OK
      .set('dtFinal', this._validator.formataData(this._dataFinalSuspender)); // OK

    const centroDistribuicao = this.getCentroDistribuicao();
    if (centroDistribuicao.length > 0) {
      params = params.set('cdRegional', centroDistribuicao.toString()); // OK
    }

    const filial = this.getFilial();
    if (filial.length > 0) {
      params = params.set('cdFilial', filial.toString()); // OK
    }

    const motivo = this.getMotivos();
    if (motivo.length > 0) {
      params = params.set('cdMotivo', motivo.toString()); // NOK
    }

    const produto = this.getProdutos();
    if (produto.length > 0) {
      params = params.set('cdProduto', produto.toString()); // OK
    }
    return params;
  }


  // EXPORTA????O DE AGENDAS SUSPENSAS
  exportarAgendaFaturamentoSuspenso() {
    this.componentLoading = true;

    // VERIFICAR PREENCHIMENTO DOS FILTROS
    if (this.validarDataVigencia()) {
      if (this.contemAlgumFiltro()) {

        // CHAMADA PARA O SERVI??O DE EXPORTA????O
        this._service.exportarGrid(this.gerarParametroParaConsulta().toString()).then((value) => {
          this.componentLoading = false;
        });
      }
    }
  }


  // EXPORTA S?? O MODELO EXCEL PARDR??O PARA IMPORTACAO
  exportarModeloCSV(): void {
    this.componentLoading = true;
    this._service.exportarPlanilhaCSV().then((resolve) => {
      this.componentLoading = false;
      if (resolve) {
        Swal.fire({
          title: 'Download Conclu??do com sucesso!',
          text: 'Por favor, verifique seus downloads para abrir o modelo.',
          icon: 'success',
          confirmButtonText: 'Ok, obrigado',
          customClass: { confirmButton: 'setBackgroundColor' }
        });
      } else {
        Swal.fire({
          title: 'Oops!',
          text: 'Desculpe, mas n??o conseguimos baixar o modelo de importa????o, por favor, tente novamente mais tarde.',
          icon: 'warning',
          confirmButtonText: 'Ok, obrigado',
          customClass: { confirmButton: 'setBackgroundColor' }
        });
      }
    });
  }

  contemAlgumFiltro(): Boolean {
    if (this._todosCDSelecionado.length > 0 ||
      this._todosFLSelecionado.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Oops, Filtro incompleto!',
        html: 'Por favor, selecione algum <strong>CD</strong> ou <strong>Filial</strong> para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      this.componentLoading = false;
      return false;
    }
  }

  validarDataVigencia(): Boolean {
    let dtMaxima = new Date(this._dataInicial);
    dtMaxima.setMonth(this._dataInicial.getMonth() + 2);

    let titulo = '';
    let texto = '';
    let icone: SweetAlertIcon = "warning";
    let confirmButtonText = 'Ok, obrigado';
    let retorno: Boolean = true;
    if (this._utils.isEmpty(this._dataInicial) ||
      this._utils.isEmpty(this._dataFinal)
    ) {
      titulo = 'Oops, Selecione todas as datas.';
      texto = 'Por favor, preencha a vig??ncia.';
      retorno = false;
    }
    if (!retorno) {
      Swal.fire({
        title: titulo,
        html: texto,
        icon: icone,
        confirmButtonText: confirmButtonText,
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      this.componentLoading = false;
    }
    return retorno;
  }

  importarExcel(event): void {
    this._fileToUpload = event.target.files.item(0);

    const raw: FormData = new FormData();
    if (this._fileToUpload != null) {

        // VERIFICAR TAMANHO DO ARQUIVO EXCEL
        if(!this._utils.tamanhoMaxUpload(this._fileToUpload)) {
          this.componentLoading = false;
          return
        }

        raw.append('file', this._fileToUpload);
    }
    raw.append('cdOperador', this.cdOperador);

    this.componentLoading = true;

    const importar = this._service
      .uploadExcel(raw)
      .subscribe(
        // (response: ResponseUpload) => {
        (response) => {
          this.showModalConfig(`${response.type}`, `${response.mensagem}`, 'success');
          this.componentLoading = false;
        },
        ex => {
          this.handleError(ex)
        }).add(() => {
          this.componentLoading = false;
          importar.unsubscribe();
        });

    this.importarRef.nativeElement.value = '';
  }

  // ARMAZENO QUANTAS AGENDAS FORAM SELECIONADAS PARA SUSPENS??O (NA COLUNA DE CHECKBOX)
  faturamentosSelecionados(event) {
    this.qtdAgendasSelecionadas = 0;

    this.todosFaturamentosSelecionados = event;
    this.todosFaturamentosSelecionados.forEach(faturamento => {
      this.qtdAgendasSelecionadas += faturamento.detalhe.length;
    });
  }

  contemFaturamentoSelecionado(event) {
    this.nenhumItemSelecionado = !event;
  }


  // TRATAMENTO DO FLUXO DE IMPORTA????O (ERRO E SUCESSO)
  msgImportacao(response: ResponseUpload) {

    if (response.qtTotalRegistroComErro > 0) {
      Swal.fire({
        title: 'Importa????o conclu??da! Mas...',
        html: this.mensagemComErroUpload(response),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Realizar download!',
        customClass: { confirmButton: 'setBackgroundColor' },
        cancelButtonText: 'N??o'
      }).then(resultado => {
        if (resultado.value === true) {
          this.downloadResponse(response);
        }
      });
    } else if (response === null) {
      Swal.fire({
        title: 'Oops!',
        html: 'Por favor, <strong>valide</strong> o modelo de excel para importar.',
        icon: 'error',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });

    } else {
      Swal.fire({
        title: 'Suspensas com Sucesso!',
        html: this.mensagemSucessoUpload(response),
        icon: 'success',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }


  downloadResponse(response: ResponseUpload): void {
    this._service.exportarComFalha(response);
  }

  mensagemComErroUpload(response: ResponseUpload): string {
    return (`
		<table>
			<tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</td></tr>
			<tr><td>Foram Suspensas <strong>${response.qtTotalRegistrosAlterados}</strong> agendas.</td></tr>
			<tr><td>N??o conseguimos suspender <strong>${response.qtTotalRegistroComErro}</strong> agendas.</td></tr>
			<tr><td>Deseja realizar o Download dos erros?</td></tr>
		</table>
	`);
  }

  mensagemSucessoUpload(response: ResponseUpload): string {

    // MENSAGEM PARA DATAS COM PRODUTOS SUSPENSOS DENTRO DO PER??ODO SELECIONADO
    const msgSucessoComDatasJaSuspensas = `
            <table>
                <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</td></tr>
                <tr><td>Foram Suspensas <strong>${response.qtTotalRegistrosAlterados}</strong> agendas.</td></tr>
                <tr><td>Quantidade de produtos j?? suspensos <strong>${response.qtdDatasComProdutosJaSuspensos}</strong></td></tr>
            </table>`;

    const msgSucessoSemDatasJaSuspensas = `
            <table>
                <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</td></tr>
                <tr><td>Foram Suspensas <strong>${response.qtTotalRegistrosAlterados}</strong> agendas.</td></tr>
            </table>`;

    // QUANDO NA IMPORTA????O J?? EXISTEM DATAS COM PRODUTOS SUSPENSOS DENTRO DO PER??ODO SELECIONADO
    if (response.qtdDatasComProdutosJaSuspensos < 1) {
      return msgSucessoSemDatasJaSuspensas;
    } else {
      return msgSucessoComDatasJaSuspensas;
    }
  }


  // MONTO UMA TABELA AGRUPANDO TODAS AS DATAS SELECIONADAS E QUE FORAM SUSPENDIDAS
  mensagemDeAgendasSuspensaComAlerta(response) {
    let msgHtml = `
            <table class="table" style="max-width: 300px!important;display: inline-block;">
                <thead style="position: sticky;box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.4);">
                    <tr>
                        <th scope="col">Filial</th>
                        <th scope="col">Regional</th>
                        <th scope="col">Datas selecionadas</th>
                    </tr>
                </thead>
                <tbody class="tbodyTeste" style="overflow-y: auto; max-height: 450px!important; width: 100%; display: inline-grid;">
            `;

    response.forEach(agenda => {
      agenda.datasSuspensas.forEach(ForamSuspensas => {
        const data = this._validator.formataDataComBarra(ForamSuspensas);
        msgHtml += `
                            <tr>
                                <td style="width:78px">${agenda.cdFilial} </td>
                                <td style="width:65px">${agenda.cdRegional} </td>
                                <td>${data} </td>
                            </tr>
                            `;
      });
    });

    msgHtml += `
        </tbody>
        </table>
        `;

    // RETORNO DA TABELA MONTADA PARA O M??TODO PRINCIPAL
    return msgHtml;
  }

  // TRATAMENTO DE ERROS
  handleError(error: any) {
    this.componentLoading = false
    if (typeof (error) == 'string') error = JSON.parse(error)
    if (error.status === 404) {
      this.showModalConfig('Oops', 'N??o encontramos nenhum registro!' || error.error.mensagem, 'warning');
    } else if (error.status === 0 || error.status === 400 || error.status === 403 || error.status === 500) {
      this.showModalConfig('??\\_(???)_/??', `Erro n??o esperado, Por favor entre em contato com a equipe t??cnica, Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    } else {
      this.showModalConfig('Oops', `Erro: ${error.mensagem || 'sem log de erro'}`, 'warning');
    }
  }
}
