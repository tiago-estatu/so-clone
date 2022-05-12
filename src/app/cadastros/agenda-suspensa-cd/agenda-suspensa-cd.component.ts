import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { BehaviorSubject, Subscription } from 'rxjs';
import { fadeInOut } from 'src/app/commons/const/animation';
import { UtilsHelper } from 'src/app/commons/helpers/utils.helper';
import { ValidatorHelper } from 'src/app/commons/helpers/validator.helper';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { AgendaSuspensaoPost } from 'src/app/commons/services/agendaFaturamento/AgendaSuspensaoPost.model';
import { CampoSuspenderCD } from 'src/app/commons/services/agendaFaturamento/CampoSuspenderCD.model';
import { AgendaSuspenderService } from 'src/app/commons/services/agendaSuspender/agendaSuspender.service';
import { responseSuspenderAgendaCD } from 'src/app/commons/services/agendaSuspender/responseSuspenderAgendaCD.model';
import { CdService } from 'src/app/commons/services/center-distribution/cd.service';
import { ResponseSuspenderAgendaUpload } from 'src/app/commons/services/classes/AgendaSuspensa/ResponseSuspenderAgendaUpload';
import { Produto } from 'src/app/commons/services/classes/Produto';
import { ResponseUpload } from 'src/app/commons/services/classes/ResponseUpload';
import { FabricanteService } from 'src/app/commons/services/fabricante/fabricante.service';
import { FornecedorService } from 'src/app/commons/services/fornecedor/fornecedor.service';
import { HeaderService } from 'src/app/commons/services/header.service';
import { LoadingService } from 'src/app/commons/services/loading/loading.service';
import { MotivoSuspensaoService } from 'src/app/commons/services/motivo-suspensao/motivo-suspensao.service';
import Swal, { SweetAlertIcon } from 'sweetalert2';
import { AgendaSuspensaCdModalComponent } from './agenda-suspensa-cd-detalhe/agenda-suspensa-cd-detalhe.component';

@Component({
  selector: 'rd-agenda-suspensa-cd',
  templateUrl: './agenda-suspensa-cd.component.html',
  styleUrls: ['./agenda-suspensa-cd.component.scss'],
  animations: [fadeInOut]
})
export class AgendaSuspensaCdComponent implements OnInit {
  filterForm: FormGroup;
  queryFilters: QueryFilters;
  @ViewChild('importarRef') importarRef: ElementRef;
  @ViewChild('elementMotivo') elementMotivo: ElementRef;
  cdOperador = localStorage.getItem("cdOperador");
  totalDeItems = 0;
  pageNumber: number = 0;
  itemsPorPagina:number = 35;

  _motivos = []
  private _subscription: Subscription;
  tipoMotivo: number = 1;
  dataSource = [];
  dtConsulta;
  nenhumItemSelecionado = true;


  productSubject: BehaviorSubject<Produto[]>;
  productSubscription: Subscription;
  imProdutos = [];

  selecionarTodos: boolean = false;
  fileControl: FormControl;

  // DEFINIÇÃO DO TAMANHO DO MODAL
  _widthModal = '500px';
  _heightModal = 'auto!important';


  constructor(
    private _header: HeaderService,
    public dialog: MatDialog,
    private _fb: FormBuilder,
    private _loading: LoadingService,
    private _service: AgendaSuspenderService,
    private _cdService: CdService,
    private _fornecedorService: FornecedorService,
    private _fabricanteService: FabricanteService,
    private _motivoService: MotivoSuspensaoService,
    private _utils: UtilsHelper,
    private _validator: ValidatorHelper,
    private _dialogRef: MatDialog,
  ) { }

  ngOnInit() {
    this._header.setTitle('Agenda de Compra Suspensa');
    this.fileControl = this._fb.control('');
      this.initForm();
      this.initQuery();
  }

  consultar() {
    this._loading.carregar();

    this.setPage(this.pageNumber);

    if(this.contemAlgumFiltro() && this.validarDataInserida() ){
      this.produtoSelecionados();
     this._service.buscarAgendasPorFiltro(this.queryFilters).subscribe(data => {
       this.dtConsulta = { dtInicio: this._validator.formataData(this.getDtInicio), dtFim: this._validator.formataData(this.getDtFim)}
       this.setDataSource(data);
      this._loading.parar();

     }, err => {
    if(err.status === 400){
      Swal.fire({
        title: 'Oops!',
        text: err.error[0].message,
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'}
    });
    }
  })}
}
  setDataSource(data){
    if(data.content.length > 0){
      this.dataSource = data.content
    }else{
      Swal.fire({
        title: 'Não encontramos nenhum registro!',
        html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: {confirmButton: 'setBackgroundColor'}
      });
      this.clearGrid();
    }
  }

  setPage(pageNumber){
    this.queryFilters.updateParam('size', this.itemsPorPagina);
    this.queryFilters.updateParam('page', pageNumber);
  }
  initForm() {
    this.filterForm = this._fb.group({
        cdRegional: ['', Validators.required],
        cdFornecedor: [''],
        cdFabricante: ['', Validators.required],
        cdMotivo: ['', Validators.required],
        cdProdutos: [''],
        dtInicio : [new Date(),Validators.required],
        dtFim: [new Date(), Validators.required]
    })
  }

  initQuery(){
      this.queryFilters = new QueryFilters([
          new RequestParamModel('cdRegional', [], 'cdRegional'),
          new RequestParamModel('cdFornecedor', [], 'cdFornecedor'),
          new RequestParamModel('cdFabricante', [], 'cdFabricante'),
          new RequestParamModel('cdMotivo', [], 'cdMotivo'),
          new RequestParamModel('cdProdutos', [], 'cdProdutos'),
          new RequestParamModel('dtInicio', new Date(), 'dtInicio', this._validator.formataData),
          new RequestParamModel('dtFim', new Date(), 'dtFim',this._validator.formataData),
          new RequestParamModel('cdOperador', this.cdOperador),
          new RequestParamModel('size', 0, this.itemsPorPagina.toString()),
          new RequestParamModel('page', 1, this.pageNumber.toString())
      ], this.filterForm);
  }

  /**
   * Informações selecionadas dos combos fornecedor, fabricante e centro de distribuição
   * @param  {{field:string} data
   * @param  {any}} data
   */
  selectAgrupamento(data: {field: string, data: any}) {
    let dict = {'fc': 'cdFornecedor', 'fb': 'cdFabricante', 'cd': 'cdRegional'};
    let valueForPatch = {};
    valueForPatch[dict[data.field]] = data.data;
    this.filterForm.patchValue(valueForPatch);
    this.clearGrid()
  }
  /**
   * Limpar as informações da tela.
   */
  clearGrid(){
      this.dataSource = [];
      this.itemSelecionado();
  }

  getFormStatus(name: string) {
    return this.filterForm.get(name).disabled
  }
  get getDtInicio(){
    return  this.filterForm.get('dtInicio').value;
  }
  get getDtFim(){
    return  this.filterForm.get('dtFim').value;
  }

  get getDtInicioFormatada(){
    return this._validator.formataData(this.filterForm.get('dtInicio').value);
  }

  get getDtFimFormatada(){
    return this._validator.formataData(this.filterForm.get('dtFim').value);
  }
  preencherTodosMotivosSelecionados(callback){
    this.filterForm.get('cdMotivo').setValue(callback);
  }
  produtoSelecionados(){
    const produtos = this.filterForm.get('cdProdutos').value

    if(!this._utils.isEmpty(produtos)) {
     this.filterForm.get('cdProdutos').setValue(produtos.map(data => data.cdProduto));
    }
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
    const dtInicio = this.getDtInicio;
    const dtFim = this.getDtFim;

    // DATAS NãO FORAM PREENCHIDAS
    if (this._utils.isEmpty(dtInicio) || this._utils.isEmpty(dtFim)) {
        icone = 'warning';
        titulo = 'Atenção, é necessário selecionar as datas.';
        texto = 'Por favor, preencher a vigência.';
        retornoValidacaoDatas = false;

    // DATA INICIAL (MAIOR) QUE DATA FINAL
    } else if (dtInicio > dtFim) {
        icone = 'warning';
        titulo = 'Atenção, data fora de vigência!';
        texto = 'Por favor, <strong>data final</strong> deve ser maior que a <strong>data Inicial</strong>.';
        retornoValidacaoDatas = false;

    // PESQUISA (MAIOR) QUE O MÁXIMO DE DIAS PERMITIDOS
    } else if (this._utils.rangeMaximoEmDias(dtInicio, dtFim, 30) === true) {
        icone = 'warning';
        titulo = 'Atenção, data fora de vigência!';
        texto = 'A pesquisa máxima é de 30 dias.';
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
    }
    this._loading.parar();

    return retornoValidacaoDatas;
}

contemAlgumFiltro(): Boolean {
  this.nenhumItemSelecionado = true;
  if(this._cdService.selecionados.length > 0 ||
       this._fornecedorService.selecionados.length > 0 ||
       this._fabricanteService.selecionados.length > 0){
   return true;
  }else{
    Swal.fire({
      title: "Oops, Filtro incompleto!",
      html: 'Por favor, selecione algum <strong>CD</strong> para prosseguir.',
      icon: 'warning',
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'}
    });
    this._loading.parar();
   return false;
  }

}
get componentLoading(){
  return this._loading.getStatus();
}

getControl(group: FormGroup, control: string) {
  if (!group) return;
  return group.get(control) as FormControl
}

  clearTudo() {
      this._cdService.limpar();
      this._fornecedorService.limpar();
      this._fabricanteService.limpar();
      this._motivoService.reset();
      this.filterForm.reset();
      this.clearGrid();
      this.filterForm.setValue({
        cdRegional: [],
        cdFornecedor: [],
        cdFabricante: [],
        cdMotivo: [],
        cdProdutos: [],
        dtInicio: new Date(),
        dtFim: new Date()
      })
      this.elementMotivo['motivoSelecionadoLista'] = [];
  }


  ngOnDestroy() {
    if(this._subscription) this._subscription.unsubscribe();
  }

  //FUNÇÕES DA GRID

  itemSelecionado() {
    this.nenhumItemSelecionado = (this.dataSource.filter(el => el.selecionado).length === 0);
}

// SELECIONAR (TODOS) OS CHECKBOX NA GRID DE RESULTADOS
  selecionarTodosItens(event) {
    let contemSuspenso = false;
    this.dataSource.forEach(el => {
      if(el.fgStatus !== 2){
        el.selecionado = event.checked;
        contemSuspenso = true;
      }
    });
    this.nenhumItemSelecionado = contemSuspenso;
    this.itemSelecionado();
  }

 clearTodosSelecionados(): void {
  this.dataSource.forEach(agendas => {
    agendas.selecionado = false;
   });
 }


 async modalSuspenderAgendamentos(){

  if(this._motivoService.motivos.value.length == 0){
    this._motivoService.getListaMotivoFaturamentoSupenso(this.tipoMotivo).subscribe();
   }
  const todosMotivos = this._motivoService.motivos.value;
  var opcoesMotivo = {};
  todosMotivos.forEach(o => {
    opcoesMotivo[o.cdMotivoAgendaSuspena] = o.cdMotivoAgendaSuspena + ' - '+ o.dsMotivoAgendaSuspena;
  });

  let agendasSelecionadas = this.somarQtdAgendasSelecionadas();
  Swal.mixin({
    input: 'text',
    confirmButtonText: 'Concluir',
    cancelButtonText: 'Cancelar',
    customClass: {confirmButton: 'setBackgroundColor'},
    showCancelButton: true,
    progressSteps: ['1', '2']
  }).queue([
    {
      title: 'Suspender CD',
      input: 'select',
      html: 'Estamos suspendendo cerca de <strong>' + agendasSelecionadas + '</strong> agendas ' +
       'de <strong>' + this.getDtInicioFormatada +
       '</strong> até <strong>' + this.getDtFimFormatada + '</strong>.',
      inputPlaceholder: 'Selecione um motivo...',
      inputOptions: opcoesMotivo,
      confirmButtonText: "Próximo",
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value !== '') {
            resolve()
          } else {
            resolve('Por favor, selecione outro motivo :)')
          }
        })
      }
    },
    {
      title: 'Para suspensão total clique em concluir!',
      input: "text",
      html: 'Ou digite abaixo os produtos para suspensão parcial, separados por virgula.',
      inputValue: '',
      inputValidator: (produtos) => {
        return new Promise((resolve) => {
          if (this.ehValidoListaDeProdutos(produtos)) {
            resolve();
          }else{
            resolve("Por favor, digite apenas números separados por virgula.");
          }
        })
      }
    },
  ]).then((result) => {
    if (result.value) {
      const motivoSelecionado = result.value[0];
      const produtoSelecionado = result.value[1];

      this.filterForm

      this.criarJSONparaSuspender(motivoSelecionado, produtoSelecionado).then( paraSuspender => {
        this.suspender(paraSuspender, motivoSelecionado);
      });
  }
});
}
//SUSPENDER
suspender(agendas: AgendaSuspensaoPost[], cdMotivo) {

  this._service.suspenderAgenda(agendas)
    .subscribe((data: responseSuspenderAgendaCD) => {
      this._loading.carregar();
      this.totalDeItems = data['totalElements'];
      const dtInicialConsulta = this.getDtInicioFormatada;
      const dtFimConsulta = this.getDtFimFormatada;

      this.possuiErros(data, cdMotivo, dtInicialConsulta, dtFimConsulta);

      this.consultar();
      this._loading.parar();
    },
    ex => {
      this._loading.parar();
      let mensagem = '';

      ex.error.forEach((erro) => {
          mensagem += '<p>' + erro.message + '</p>';
      });

      Swal.fire({
          title: 'Oops!',
          html: mensagem,
          icon: 'warning',
          confirmButtonText: 'Ok, obrigado',
          customClass: {confirmButton: 'setBackgroundColor'},

      });
    }
  );
}

possuiErros(data: responseSuspenderAgendaCD, cdMotivo, dtInicial,dtFinal){
if(data.errosTotais === 0){
  Swal.fire({
    title: 'Agendas suspendidas com sucesso!',
    icon: 'success',
    confirmButtonText: 'Ok, obrigado',
    customClass: {confirmButton: 'setBackgroundColor'}
  });
}else if (data.content.length > 0){
  let mensagem = `<table>`;

  if(data.content[0].datasSuspensas.length > 0){
    mensagem += `<td><tr>Conseguimos suspender <strong>${data.content[0].datasSuspensas.length}</strong> agendas.</td></tr>`;
  }

  if(data.content[0].datasJaSuspensas.length > 0){
    mensagem += `<tr><td>Obs: Existem agendas neste período que já estavam suspensas.</td></tr>`;
  }
  let contemErro: boolean = false;
  if(data.erros.length > 0){
    mensagem += `<tr><td>E obtivemos <strong>${data.erros.length}</strong> erro(s) ao suspende-lo(s).</td></tr>`
    mensagem += `<tr><td>Deseja realizar o Download dos erros?</td></tr>`;
    contemErro = true;
  }

  mensagem += `</table>`;
  if(contemErro){
    Swal.fire({
            title: '',
            html: mensagem,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não"
          }).then(resultado => {
            if (resultado.value === true) {
              this._service.downloadExcelErroSuspender(data, cdMotivo, dtInicial,dtFinal);
            }
          });
  }else{
    Swal.fire({
      title: 'Agendas suspendidas com sucesso!',
      html: mensagem,
      icon: 'warning',
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'}
    });
  }
} else {
  Swal.fire({
    title: '',
    html: (`
    <table>
      <tr><td>Obtivemos <strong>${data.erros.length}</strong> erros ao suspender as agendas.</td></tr>
      <tr><td>Deseja realizar o Download dos erros?</td></tr>
    </table>
  `),
    icon: "error",
    showCancelButton: true,
    confirmButtonText: "Sim",
    cancelButtonText: "Não"
  }).then(resultado => {
    if (resultado.value === true) {
      this._service.downloadExcelErroSuspender(data, cdMotivo, dtInicial,dtFinal);
    }
  });
}
}
//contrato para suspender agendas
async criarJSONparaSuspender(motivoSelecionado: number, produtosSelecionados: string) : Promise<any>{
  let suspender: AgendaSuspensaoPost;
    return new Promise((resolve) => {
      suspender = this.montarPost(this.camposAgendaSelecionada(), this.converterProdutoSelecionadoToList(produtosSelecionados), motivoSelecionado);
      resolve(suspender);
    });
}

montarPost(campos, produtos, motivo): AgendaSuspensaoPost{
    return {
      dataInicio: this.getDtInicioFormatada,
      dataFim: this.getDtFimFormatada,
      cdOperador: this.cdOperador,
      cdMotivo: motivo,
      campos: campos,
      cdProdutos: produtos
    }
}
camposAgendaSelecionada(): CampoSuspenderCD[]{
  let campos: CampoSuspenderCD[] = [];

  this.dataSource.forEach(agendas => {
    if(agendas.selecionado){
      const campo: CampoSuspenderCD =
        {
          cdFornecedor: parseInt(agendas.cdFornecedor),
          cdRegional: agendas.cdRegional,
          idFornecedorAgenda: agendas.idFornecedorAgenda,
          cdFabricante: parseInt(agendas.cdFabricante)
        };

        campos.push(campo);
    }
  });

  return campos;
}
converterProdutoSelecionadoToList(produtos): number[]{
  let selecionados: number[] = [];
  if(!this._utils.isEmpty(produtos)){
    produtos.split(',').forEach(x => {
      selecionados.push(parseInt(x));
    });
  }

  return selecionados;
}

somarQtdAgendasSelecionadas(){
  let qtdAgendas = 0;
    this.dataSource.filter(x => x.selecionado === true).forEach( agenda => {
      agenda.detalhe.forEach(detalheAgenda => {
        if(detalheAgenda.fgSuspensao !== 2){
          qtdAgendas += 1;
        }
      });
    });
    return qtdAgendas;
}
/**
 * Validação se a lista de produtos recebidos por parametro é somente numeros.
 * @param  {string} produtos
 * @returns boolean
 */
ehValidoListaDeProdutos(produtos: string): boolean{
  const lista = produtos.split(',');
  let ehValido:boolean = true;

  lista.forEach(produto => {
    const somenteNumero = produto.replace(/[^0-9,]*/g, '');
    if(somenteNumero.length !== produto.length){
      ehValido = false;
    }
  });

  return ehValido;
}
 // IMPORTAÇÃO
 importarExcel(fileList: FileList) {
  this._loading.carregar();
  const file = fileList;
  let raw: FormData = new FormData();


  if (file != null) {

    // VERIFICAR TAMANHO DO ARQUIVO EXCEL
    if(!this._utils.tamanhoMaxUpload(file.item(0))) {
      this._loading.parar()
      return
    }


    raw.append("file", file.item(0));
  }


  raw.append("cdOperador", this.cdOperador);

  this._service.uploadExcel(raw)
      .subscribe(data => {
        this.msgImportacao(data);
      }, error => {
        this.msgImportacaoErro(error);
      })
      .add(() => {
        this._loading.parar()
          this.fileControl.setValue('');
      });
      this._loading.parar()
}

// TRATAMENTO DO FLUXO DE IMPORTAÇÃO (ERRO E SUCESSO)
msgImportacao(response: ResponseUpload){
  if (response === null) {
      Swal.fire({
          title: 'Oops!',
          html: 'Por favor, <strong>valide</strong> o modelo de excel para importar.',
          icon: 'error',
          confirmButtonText: 'Ok, obrigado',
          customClass: {confirmButton: 'setBackgroundColor'}
      });
  } else if (response.qtTotalRegistroComErro > 0) {
      Swal.fire({
          title: 'Importação concluída! Mas...',
          html: this.mensagemComErroUpload(response),
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Realizar download!',
          customClass: {confirmButton: 'setBackgroundColor'},
          cancelButtonText: 'Não'
      }).then(resultado => {
          if (resultado.value === true) {
              this.downloadResponse(response);
          }
      });

} else  {
  Swal.fire({
    title: response.type,
    html: response.mensagem,
    icon: 'success',
    confirmButtonText: 'Ok, obrigado',
    customClass: {confirmButton: 'setBackgroundColor'}
  });
}
}
downloadResponse(response: ResponseSuspenderAgendaUpload): void {
   this._service.exportarAgendasComFalha(response);
 }

msgImportacaoErro(ex){
  this._loading.parar();
  if(ex.status === 400){
    let msg = '';

    ex.error.forEach(ex => {
      msg += ex.message + ', '
    });
    Swal.fire({
      title: "Oops, problemas ao importar!",
      text: msg,
      icon: 'warning',
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'}
    });
  } else if (ex.status === 404) {
    Swal.fire({
      title: "Oops! Problemas ao importar!",
      text: 'Não foi possível enviar a planilha para o servidor, por favor, tente novamente.',
      icon: 'warning',
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'}
    });
  } else {
    Swal.fire({
      title: "Oops!",
      text: 'Erro interno, por favor entrar em contato com o time de suporte.',
      icon: 'error',
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'}
    });
  }

}

mensagemComErroUpload(response: ResponseUpload): string{
  return (`
  <table>
    <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</td></tr>
    <tr><td>Foram Suspensas <strong>${response.qtTotalRegistrosNovos}</strong> agendas.</td></tr>
    ${this.msgComProduto(response)}
    <tr><td>Não conseguimos suspender <strong>${response.qtTotalRegistroComErro}</strong> agendas.</td></tr>
    <tr><td>Deseja realizar o Download dos erros?</td></tr>
  </table>
`);
}

msgComProduto(res: ResponseUpload): string{
  if(res.qtdDatasComProdutosJaSuspensos > 0){
    return (`
    <tr><td>Quantidade de produtos já suspensos <strong>${res.qtdDatasComProdutosJaSuspensos}</strong>.</td></tr>
    `)
  }else{
    return ``;
  }

}
  mensagemSucessoUpload(response: ResponseUpload): string {
  return (`
    <table>
      <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</td></tr>
      <tr><td>Foram Suspensas <strong>${response.qtTotalRegistrosAlterados}</strong> agendas.</td></tr>
      ${this.msgComProduto(response)}
    </table>
  `);
  }
   //EXPORTA SÓ O MODELO PARA IMPORTACAO
   exportarModeloCSV(): void {
    this._loading.carregar();

    this._service.exportRequest(this._service._urlTodosServicos.exportarModeloCsvBranco,
        'modelo_agenda_suspensa_cd').toPromise().then(() => this._loading.parar());
    }

  // EXPORTAÇÃO DE AGENDAS SUSPENSAS DE CD
  exportarAgendaSuspensa() {
    this._loading.carregar();

    // VERIFICAR PREENCHIMENTO DOS FILTROS
    if (this.validarDataInserida() && this.contemAlgumFiltro()) {
      // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
        this._service.exportRequest(this._service._urlTodosServicos.exportarFiltrosPreSelecionados + this.queryFilters.criarFiltro(), 'agenda_suspensa_cd');
          this._loading.parar();
      }else {
          this._loading.parar();
      }
    }

     // EXIBE AS AGENDAS DE CD
  exibirAgendas(item) {
    const data = {...item, dtInicio : this.getDtInicioFormatada, dtFim: this.getDtFimFormatada}
        this._dialogRef.open(AgendaSuspensaCdModalComponent, {
        width: this._widthModal,
        height: this._heightModal,
        data: data
    });
  }

  getPage(pageNumber){
    this.pageNumber = pageNumber;
    this.consultar();
  }
}
