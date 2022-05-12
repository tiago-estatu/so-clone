import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import Swal from 'sweetalert2';
import { AgendaService } from 'src/app/commons/services/agenda/agenda-service';
import { IAgenda } from 'src/app/commons/services/classes/IAgenda';
import { IAgendaLoja } from 'src/app/commons/services/classes/IAgendaLoja';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CdService,
  FornecedorService,
  FilialService,
  fadeInOut,
  NewModalComponent,
  ValidatorHelper,
  HeaderService,
  UtilsHelper,
  ResponseSuspenderAgendaUpload,
  CentroDistribuicaoModel
} from 'src/app/commons';
import { UploadResponseAgenda } from 'src/app/commons/services/classes/UploadResponseAgenda';
import { UploadResponseAgendaLoja } from 'src/app/commons/services/classes/UploadResponseAgendaLoja';
import { ConfiguracaoCD } from './ConfiguracaoCD';
import { AgendaConsultaDetalheComponent } from './consulta-detalhe';
import { HttpParams } from '@angular/common/http';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'agenda-cadastro.component',
  templateUrl: './agenda-cadastro.component.html',
  styleUrls: ['./agenda-cadastro.component.scss'],
  animations: [fadeInOut]
})

export class AgendaCadastroComponent implements OnInit {

  selectionDataSource = new SelectionModel<ConfiguracaoCD>(true, []);
  jsonAgendaOriginal: ConfiguracaoCD[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  @ViewChild('elementCD') elementCD: ElementRef;
  _todosCDSelecionado = [];
  @ViewChild('elementDiaDaSemana') elementDiaDaSemana: ElementRef;
  _todosDiasSemanaSelecionados = [];
  @ViewChild('elementFornecedor') elementFornecedor: ElementRef;
  _todosFornecedoresSelecionados = [];
  @ViewChild('elementFabricante') elementFabricante: ElementRef;
  _todosFabricantesSelecionados = [];
  @ViewChild('elementFilial') elementFilial: ElementRef;
  _todasFiliaisSelecionados = [];
  
  parametrosParaEnviadosGrid: HttpParams;
  
  cdOperador = localStorage.getItem('cdOperador');
  fl_compra       = '0';
  qtDiasIntervalo = '180';
  centroDistribuicao;
  fornecedor;
  filtroBack: String ;
  fileToUpload: File = null;

  // CD
  dropdownSettings: any = {};
  dropdownSettingsOne: any = {};
  dropdownTipoPedidoLista = [];
  dropdownFrequenciaLista = [];

  diaCompraSelecionadoLista = [];
  frequenciaSelecionadoLista = [];

  dropdownRotaLista = [];
  dropdownPadraoAbastecimentoLista = [];
  rotaSelecionadoLista = [];
  padraoAbastecimentoSelecionadoLista = [];

  nenhumItemSelecionado: Boolean = true;
  selecionarTodos: boolean;
  componentLoading = false;
  imagemModal: string;
  mensagemModal;
  tituloModal = '';

  typeService: string = 'pedido';
  expandir = true;
  isPedido = true;

  formBuilder: FormBuilder;
  // 'tipoPedido',
  displayedColumns: string[] = ['cdRegional', 'cdFornecedor', 'cdFabricante', 'diaSemana', 'qtDiasIntervalo', 'acoes'];
  displayedLojaColumns: string[] = ['filial', 'padrao'];
  dataSource = [];

  configuracao: IAgenda[] = [];
  configuracaoCD: ConfiguracaoCD[] = [];
  configuracaoLoja: IAgendaLoja[] = [];

  constructor(
    private headerService: HeaderService,
    private fornecedorService: FornecedorService,
    private validator: ValidatorHelper,
    private agendaService: AgendaService,
    private utils: UtilsHelper,
    private router: Router,
    public dialog: MatDialog

  ) { }

  ngOnInit() {
    this.headerService.setTitle('Gestao de Calendário de Emissão de Pedidos');

    // this.dataSource.paginator = this.paginator;

    // DROPLIST SETTINGS
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Selecionar Todos',
      unSelectAllText: 'Remover Todos',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };

    this.dropdownSettingsOne = {
      singleSelection: true,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 1,
      allowSearchFilter: true
    };

    this.dropdownFrequenciaLista = [
      // { item_id: 1, item_text: 'Diario' },
      { item_id: 7, item_text: 'Semanal' },
      { item_id: 15, item_text: 'Quinzenal' },
      { item_id: 30, item_text: 'Mensal' },
    ];

    this.loadingApi();

  }

  loadingApi() {

    this.componentLoading = false;
    this.carregaPadraoAbastecimento();
  }

  goTo(event: { preventDefault: () => void; }, configuracaoCD: ConfiguracaoCD) {

    // this.setCacheInputs();
    event.preventDefault();
    localStorage.setItem('configuracaoCD', JSON.stringify(configuracaoCD));
    this.router.navigateByUrl('consulta/' + configuracaoCD.cdRegionais + '/' +
                              configuracaoCD.cdFornecedores + '/' + configuracaoCD.cdFabricantes
                              + '/' + configuracaoCD.diaCompra + '/' + configuracaoCD.frequencia);
  }

  exibirAlterarAgenda(elemento: ConfiguracaoCD) {
    const dialogRef = this.dialog.open(AgendaConsultaDetalheComponent, {
      width: '500px',
      height: '600px',
      data: elemento || []
    });
    const sub = dialogRef.componentInstance.EnviarDados.subscribe((result) => {
      if (this.contemAgendaSelecionada(elemento)) {
        this.selectionDataSource.select(elemento);
      } else {
        this.selectionDataSource.deselect(elemento);
      }
 
    });

  }

  desselecionarTodasAgendas(elemento: ConfiguracaoCD): void {
    
  }

  contemAgendaSelecionada(elemento: ConfiguracaoCD): Boolean {
    
    return false;
  }

  checkService(val: string) {
    this.typeService = val;
    if (val === 'pedido') {
      this.isPedido = true;
      
    } else if (val === 'faturamento') {
      this.isPedido = false;
    }

  }

  carregaPadraoAbastecimento() {

    this.fornecedorService.getPadraoAbastecimento().subscribe((res: any) => {
      const tmp = []; 
      for (let i = 0; i < res.length; i++) {
        tmp.push({ item_id: res[i].cdPadraoAbastecimento, item_text: res[i].dsPadraoAbastecimento });
      }
      this.dropdownPadraoAbastecimentoLista = tmp;
    }, ex => {
      if (ex.status === 404) {
        this.mensagemModal = ex.error.mensagem;
        this.imagemModal = 'warning';
        this.tituloModal = 'Nenhum dado encontrado5';
        this.modalChild.openModal = true;
      } else if (ex.status === 0 || ex.status === 403) {
        this.imagemModal = 'times-circle';
        this.mensagemModal = 'Serviço de Padrao Abastecimento está fora, por favor entre em contato com a equipe técnica.';
        this.tituloModal = 'Serviço fora!';
        this.modalChild.openModal = true;
      } else {
        this.imagemModal = 'times-circle';
        this.mensagemModal = ex.error.mensagem;
        this.tituloModal = 'Erro!';
        this.modalChild.openModal = true;
      }
      this.modalChild.somErro = true;
    }).add(() => {
      this.componentLoading = false;
    });
  }

  PreencheRotaPorCDSelecionado(cd) {
    this.fornecedorService.getAllRotasByCD(cd).subscribe((res: any) => {
      const body = res._body;
      const json = JSON.parse(body);
      const tmp = [];
      for (let i = 0; i < json.length; i++) {
        tmp.push({ item_id: json[i].cdFilialRota, item_text: json[i].dsFilialRota});
      }
      this.dropdownRotaLista = tmp;
    }, ex => {
      if (ex.status === 404 || ex.status === 403) {
        this.mensagemModal = ex.error.mensagem;
        this.imagemModal = 'warning';
        this.tituloModal = 'Nenhum dado encontrado7';
        this.modalChild.openModal = true;
      } else if (ex.status === 0) {
        this.imagemModal = 'times-circle';
        this.mensagemModal = 'Micro serviço de Rota está fora, por favor entre em contato com a equipe técnica.';
        this.tituloModal = 'Serviço fora!';
        this.modalChild.openModal = true;
      } else {
        this.imagemModal = 'times-circle';
        this.mensagemModal = ex.error.mensagem;
        this.tituloModal = 'Erro!';
        this.modalChild.openModal = true;
      }
      this.modalChild.somErro = true;
    }).add(() => {
      this.componentLoading = false;
    });
  }

  consultar(){
  this.componentLoading = true;
   this.agendaService.getConsultaListaCD(this.criarParametros())
    .subscribe((res: ConfiguracaoCD[]) => {
      this.configuracaoCD = res;
      if(res.length === 0 )
      Swal.fire({
        title: "Oops!",
        text: 'Nenhum dado encontrado',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'}
      });

      this.componentLoading = false;
  }, ex => {
    this.componentLoading = false;
    if (ex.status === 404) {
      Swal.fire({
        title: "Oops!",
        text: 'Nenhum dado encontrado',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'}
      });

      this.mensagemModal = ex.error.mensagem;
      this.imagemModal = 'warning';
      this.tituloModal = 'Nenhum dado encontrado';
      this.modalChild.openModal = true;
    } else {
      Swal.fire({
        title: "Oops!",
        text: ex.error.mensagem,
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'}
      });
    }
  });
  }

  criarParametros() : HttpParams{
    let params: HttpParams = new HttpParams();

    if(this.typeService === 'pedido'){
      const cdSelecionados = this.getCentroDistibuicao();
      if(cdSelecionados.length > 0){
        params = params.set('cdRegionais',cdSelecionados.toString());
      }
    } else{
      const lojas = this._todasFiliaisSelecionados;
      if (lojas.length > 0) {
        params = params.set('cdRegionais', lojas.toString());
      }
    }

    const fornecedores = this.getFornecedores();
    if(fornecedores.length > 0){
      params = params.set('cdFornecedores',fornecedores.toString());
    }
    
    const fabricantes = this.getFabricantes();

    if(fabricantes.length > 0){
      params = params.set('cdFabricantes', fabricantes.toString());
    }
    
    const diasSelecionados = this.getDiasSemana();
    if(diasSelecionados.length > 0){
      params = params.set('diaCompra', diasSelecionados.toString());
    }

    const frequencias = this.getFrequencias();
    if (frequencias.length > 0) {
      params = params.set('frequencia', frequencias.toString());
    }

    const rotas = this.getRotas();
    if(rotas.length > 0){
      //params = params.set('rotas', rotas.toString());
    }
    return params;
   
  }


  getCacheValueInputs() {

    const objPopulateInput = JSON.parse(localStorage.getItem('data_form'))[0];
  
  }

  setCacheInputs() {
    localStorage.setItem('data_form', JSON.stringify([{
     
    }]));
  }

  retirarUltimoString(texto: string): string {
    const novoTexto = texto.substring(0, texto.length - 1);
    return novoTexto;
  }

  reset() {
    // CD
  
    this.diaCompraSelecionadoLista = [];
    this.frequenciaSelecionadoLista = [];

    // LOJA
    this.rotaSelecionadoLista = [];

    this.padraoAbastecimentoSelecionadoLista = [];
  }

  getFrequencias(): number[] {
    let selecionados: number[] = [];
    if (this.frequenciaSelecionadoLista !== undefined) {
      for (let i = 0; i < this.frequenciaSelecionadoLista.length; i++ ) {
        selecionados.push(this.frequenciaSelecionadoLista[i]['item_id']);
      }
    }
    return selecionados;
  }

  ///////////////////////// LOJA ///////////////////////////////
  cdSelecionado() {
    this.PreencheRotaPorCDSelecionado(this._todosCDSelecionado);
  }

  rotasSelecionadas(rotas) {
    // tslint:disable-next-line: no-unused-expression    
    this.rotaSelecionadoLista = rotas;
  }

  getRotas(): number[]{
    return this.rotaSelecionadoLista;
  }


  limparCampos() {

      this.diaCompraSelecionadoLista  = undefined;
      this.frequenciaSelecionadoLista = undefined;   
      this.rotaSelecionadoLista                 = undefined;
      this.padraoAbastecimentoSelecionadoLista  = undefined;

  }

  exportarModeloCsv(){
    let typeService = (this.isPedido === true) ? 1 : 0;
    this.agendaService.exportarModeloCsv(typeService).then(() => {
      Swal.fire({
        title: "Download Concluído com sucesso!",
        text: 'Por favor, verifique seus downloads para abrir a exportação.',
        icon: 'success',
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'}
      });
    });
  }

  exportAsXLSX(): void {
    this.componentLoading = true;
    // tslint:disable-next-line: prefer-const
    let typeService = (this.isPedido === true) ? 1 : 0;

     const parametros: IAgenda[] = this.configuracao;
      for (let i = 0; i < this.dataSource['length']; i++) {
          parametros.push(this.dataSource[i]);
      }
     
    this.componentLoading = false;
  }

  importarExcel(files: FileList): void {
    const formData: FormData = new FormData();
    this.fileToUpload = files.item(0);
    if (this.fileToUpload != null) {
      formData.append('file', this.fileToUpload);
    }
    formData.append('cdOperador', this.cdOperador);

    this.componentLoading = true;

    if (this.isPedido === true) {
      this.agendaService.uploadExcelNew(formData).subscribe((response: ResponseSuspenderAgendaUpload) => {

        this.validarResponseUpload(response);
        this.componentLoading = false;
    }, ex => {
      if (ex.status === 404) {
        this.mensagemModal = 'Não foi possível enviar a planilha para o servidor, por favor, tente novamente.';
        this.imagemModal = 'warning';
        this.tituloModal = 'Problemas com o serviço de importar!';
        this.modalChild.openModal = true;
      } else {
        this.imagemModal = 'times-circle';
        this.mensagemModal = 'Erro interno, por favor entrar em contato com o time de suporte.';
        this.tituloModal = 'Erro!';
        this.modalChild.openModal = true;
      }
      this.modalChild.somErro = true;
    }).add(() => {
      this.componentLoading = false;
    });
  }
  }
  validarResponseUpload(response: ResponseSuspenderAgendaUpload): void {
    if (response.qtTotalRegistroComErro > 0) {
      const mensagem = 'Falha ao importar.';
      Swal.fire({
        title: mensagem,
        text: 'Não conseguimos cadastrar ' + response.qtTotalRegistroComErro + ' agendas. Deseja realizar o download destas falhas?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        customClass: {confirmButton: 'setBackgroundColor'}
      }).then((resultado) => {
        if (resultado.value === true) {
          this.downloadResponse(response);
        }
      });
    }
  }

  downloadResponse(response: ResponseSuspenderAgendaUpload): void {
    this.agendaService.exportarAgendasComFalha(response);
  }

  downloadResponseLoja(data: any): void {
    const typeService: number = (this.isPedido === false) ? 0 : 1;
    this.agendaService.exportarResponseLoja(data.failureList, typeService);
  }

  itemSelecionado() {
    this.nenhumItemSelecionado =   (this.configuracao.filter(element => element.selecionado).length === 0);
  }

  selecionarAll(event) {
    this.configuracao.forEach(element => {
      element.selecionado = event.checked;
    });

    this.selecionarTodos = event.checked;
    this.itemSelecionado();
  }
  
  salvar() {

    this.componentLoading = true;
    if (this.isPedido === true) {
     
        this.agendaService.getSalvarAgendaCD(this.configuracaoCD)
            .subscribe(
              (val) => {
                  this.mensagemModal = 'Agenda gerada com sucesso';
                 this.imagemModal = 'check';
                 this.tituloModal = 'Sucesso';
                 this.componentLoading = false;
            }, ex => {

                this.mensagemModal = ex.error.mensagem;
                this.imagemModal = 'warning';
                this.tituloModal = 'Erro';
                this.modalChild.openModal = true;
              this.componentLoading = false;
      });
    } else {
     

      this.agendaService.getSalvarAgendaLoja(this.configuracaoLoja); {
        this.mensagemModal = 'Agenda loja salva com sucesso';
        this.imagemModal = 'check';
        this.tituloModal = 'Sucesso';
      }

    }
    this.componentLoading = false;
  } 

  montarParametros(){

  }

  todosCentroDistribuicaoSelecionados(cdSelecionados){
    this._todosCDSelecionado = cdSelecionados;
  }

  getCentroDistibuicao(){
    return this._todosCDSelecionado;
  }

  preencherTodosFornecedoresSelecionados(callback){
    this._todosFornecedoresSelecionados = callback;
  }

  getFornecedores(){
    return this._todosFornecedoresSelecionados;
  }

  preencherTodosDiasSelecionados(callback){
    this._todosDiasSemanaSelecionados = callback;
  }

  getDiasSemana(){
    return this._todosDiasSemanaSelecionados;
  }

  preencherTodosFabricantesSelecionados(callback){
    this._todosFabricantesSelecionados = callback;
  }

  getFabricantes(){
    return this._todosFabricantesSelecionados;
  }

  preencherTodasFiliaisSelecionadas(callback){
    this._todasFiliaisSelecionados = callback;
  }

  getFilial(){
    return this._todasFiliaisSelecionados;
  }


}
