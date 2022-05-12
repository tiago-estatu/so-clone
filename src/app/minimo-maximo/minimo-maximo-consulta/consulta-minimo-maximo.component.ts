import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import Swal from "sweetalert2";

import { Router } from "@angular/router";
import {
  fadeInOut,
  fadeIn,
  UtilsHelper,
  HeaderService,
  MinimoMaximoService,
  SalvarMinimoMaximoModel,
  NewModalComponent,
  ResponseUpload,
  ParametroMinimoMaximoModel,
  MinimoMaximoModel
} from "src/app/commons";

import { MatDialog } from "@angular/material/dialog";
import { HttpParams } from '@angular/common/http';

@Component({
  selector: "rd-minimo-maximo-arredondamento",
  templateUrl: "./consulta-minimo-maximo.component.html",
  styleUrls: ["./consulta-minimo-maximo.component.scss"],
  animations: [fadeInOut, fadeIn]
})
export class ConsultaMinimoMaximoComponent implements OnInit {
  expandir = true;
  mensagemModal;
  imagemModal;
  tituloModal;
  consultou: boolean = false;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  @ViewChild('inputFile') myInputVariable: ElementRef;
  @ViewChild('elementCD') elementCD: ElementRef;
  @ViewChild('elementFilial') elementFilial: ElementRef;
  @ViewChild('elementProduto') elementProduto: ElementRef;
  @ViewChild('elementCategoria') elementCategoria: ElementRef;
  @ViewChild('elementRegiaoMacro') elementRegiaoMacro: ElementRef;
  @ViewChild('elementMotivo') elementMotivo: ElementRef;

  FiltroParaPesquisa: HttpParams;

  titlesColumns = [
    "cdFilial",
    "cdProduto",
    "qtEstoqueMax",
    "qtEstoqueMin",
    "acoes"
  ];
  jsonParaCriar: SalvarMinimoMaximoModel;
  componentLoading: Boolean = false;
  _todosCDSelecionado = [];
  _todosFLSelecionado = [];
  _todasCategoriasSelecionadas = [];
  _motivoSelecionado = [];
  _todosProdutosSelecionados = [];
  _todasRegioesSelecionadas = [];
  fileToUpload: File = null;
  cdOperador = localStorage.getItem("cdOperador");

  constructor(

    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    public dialog: MatDialog,
    public _service: MinimoMaximoService
  ) {
  }

  ngOnInit() { }

  todasRegiaoSelecionada(callBack) {
    this._todasRegioesSelecionadas = callBack;
  }

  todosCentroDistribuicaoSelecionado(callBack) {
    this._todosCDSelecionado = callBack;
  }

  todosFilialSelecionado(callBack) {
    this._todosFLSelecionado = callBack;
  }

  preencherTodasCategoriasSelecionada(callback) {
    this._todasCategoriasSelecionadas = callback;
  }

  setMotivosSelecionados(callback) {
    this._motivoSelecionado = callback
  }

  todosProdutosSelecionados(callback) {
    this._todosProdutosSelecionados = callback;
  }

  gerarParametroFiltro(): HttpParams {
    let params: HttpParams = new HttpParams;
    if (!this._utils.isEmpty(this._todosCDSelecionado)) {
      params = params.set('centroDistribuicao', this._todosCDSelecionado.toString());
    }

    if (!this._utils.isEmpty(this._todasCategoriasSelecionadas)) {
      params = params.set('codigoCategoria', this._todasCategoriasSelecionadas.toString());
    }

    if (!this._utils.isEmpty(this._motivoSelecionado)) {
      params = params.set('cdMotivoEstoqueMinMax', this._motivoSelecionado.toString())
    }

    if (!this._utils.isEmpty(this._todosFLSelecionado)) {
      params = params.set('codigoFilial', this._todosFLSelecionado.toString());
    }

    if (!this._utils.isEmpty(this._todosProdutosSelecionados)) {
      const produtosSelecionados = this._todosProdutosSelecionados.map(
        produto => produto.cdProduto
      );

      params = params.set('codigoProduto', produtosSelecionados.toString());
    }

    if (!this._utils.isEmpty(this._todasRegioesSelecionadas)) {
      params = params.set('codigoRegiao', this._todasRegioesSelecionadas.toString());
    }
    params = params.set('cdOperador', this.cdOperador);
   // params = params.set('consultar', `consultar`)

    return params;
  }

  montarJsonParaCriar(clearFL, clearPROD){

    if(!this._utils.isEmpty(clearFL['filialSelecionadoLista']) &&
        !this._utils.isEmpty(this._todosProdutosSelecionados[0])){
    this.jsonParaCriar = {
        cadastro: true,
        id:{
          cdFilial: this._todosFLSelecionado[0],
          cdProduto: this._todosProdutosSelecionados[0]['cdProduto'],
          // cdMotivoEstoqueMinMax: this._motivoSelecionado[0],
          inputFilial: clearFL.filialSelecionadoLista.map(filial => filial.item_text),
          inputProduto: this._todosProdutosSelecionados[0]['cdProduto'] + ' - ' + clearPROD['chipSelectedProdutos'][0]['dsProduto']
        },
        qtEstoqueMax: '',
        qtEstoqueMin: '',
        cdOperadorCadastro: this.cdOperador
      }

    }
  }

  limparCampos() {
    this.elementRegiaoMacro['regiaoSelecionadoLista'] = [];
    this.elementCD['cdSelecionadoLista'] = [];
    this.elementFilial['filialSelecionadoLista']   = [];
    this.elementCategoria['categoriaProdutoSelecionadoLista'] = [];
    this.elementProduto['chipSelectedProdutos'] = [];
    this.elementMotivo['motivoSelecionadoLista'] = [];
    this._todasCategoriasSelecionadas = [];
    this._todasRegioesSelecionadas = [];
    this._todosCDSelecionado = [];
    this._todosFLSelecionado = [];
    this._todosProdutosSelecionados = [];
    this._motivoSelecionado = [];
    this.FiltroParaPesquisa = undefined;

  }

  consultar() {
    if (this.podeConsultar()) {
      this.montarJsonParaCriar(this.elementFilial, this.elementProduto);
      this.FiltroParaPesquisa = this.gerarParametroFiltro();
    }
  }

  exportarModeloCSV(): void {
    this.componentLoading = true;
    this._service.exportarPlanilhaCSV().finally(() => {
      this.componentLoading = false;

      Swal.fire({
        title: 'Download Concluído com sucesso!',
        text: 'Por favor, verifique seus downloads para abrir o modelo.',
        icon: 'success',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' },
      });
    });
  }

  exportarGridPorParametros() {
    if (this.podeConsultar()){
      this._service.exportarGrid(this.gerarParametroFiltro());
    }

  }

  /*
  mensagemSucessoUpload(response: ResponseUpload): string {
    return (
      "De " +
      response.qtTotalRegistros +
      " registros. " +
      "Incluimos " +
      response.qtTotalRegistrosNovos +
      " e alteramos " +
      response.qtTotalRegistrosAlterados +
      "."
    );
  }*/

  /*
  mensagemErroUpload(
    qtTotalRegistrosNovos: number,
    qtTotalRegistrosAlterados: number,
    qtTotalRegistroComErro: number,
    qtTotalRegistros: number
  ): string {
    return (
      "Tentamos incluir cerca de " +
      qtTotalRegistros +
      " registros. " +
      " Novo: " +
      qtTotalRegistrosNovos +
      ", Alterado: " +
      qtTotalRegistrosAlterados +
      " Erro: " +
      qtTotalRegistroComErro +
      ". Deseja realizar o download com os erros?"
    );
  }
  */


  importarExcel(event): void {
    this.componentLoading = true;

    files: FileList;
    this.fileToUpload = event.target.files.item(0);

    const formData1: FormData = new FormData();
    if (this.fileToUpload != null) {

        // VERIFICAR TAMANHO DO ARQUIVO EXCEL
        if(!this._utils.tamanhoMaxUpload(this.fileToUpload)) {
          this.componentLoading = false;
          return
        }


        formData1.append('file', this.fileToUpload);
    }

    formData1.append('cdOperador', this.cdOperador);

    const servicoteste = this._service.uploadExcel(formData1).subscribe((response) => {
        Swal.fire({
            title: 'Estoque Mínimo e Máximo',
            html: `${response.mensagem}`,
            icon: 'success',
            confirmButtonText: 'Ok, obrigado',
            customClass: { confirmButton: 'setBackgroundColor' },
        });

        this.componentLoading = false;
        }, ex => {
          if (ex.status === 404) {
            this.mensagemModal = 'Não foi possível enviar a planilha para o servidor, por favor, tente novamente.';
            this.imagemModal = 'warning';
            this.tituloModal = 'Problemas com o serviço de importar!';
            this.modalChild.openModal = true;

          } else if (ex.status === 400) {
              const msgModal = ex.error.mensagem;
              this.imagemModal = 'times-circle';
              this.mensagemModal = msgModal;
              this.tituloModal = 'Erro!';
              this.modalChild.openModal = true;
          }
          this.modalChild.somErro = true;
        }
      )
      .add(() => {
        this.componentLoading = false;
        servicoteste.unsubscribe();
      });

      this.myInputVariable.nativeElement.value = "";
      this.componentLoading = false;
  }

  refresh(): void {
    window.location.reload();
  }
  downloadResponse(response): void {
    this._service.exportarComFalha(response);
  }

  podeConsultar(): Boolean {
    let somaCombosSelecionados: number = 0;

    if (!this._utils.isEmpty(this._todasRegioesSelecionadas)) {

      somaCombosSelecionados++;
    }

    if (!this._utils.isEmpty(this._todosCDSelecionado)) {
      somaCombosSelecionados++;
    }

    if (!this._utils.isEmpty(this._todosFLSelecionado)) {
      somaCombosSelecionados++;
    }

    if (!this._utils.isEmpty(this._todosCDSelecionado)) {
      somaCombosSelecionados++;
    }
    if (!this._utils.isEmpty(this._motivoSelecionado)) {
      somaCombosSelecionados++;
    }

    if (!this._utils.isEmpty(this._todasCategoriasSelecionadas)) {
      somaCombosSelecionados++;
    }

    if (!this._utils.isEmpty(this._todosProdutosSelecionados)) {
      somaCombosSelecionados++;
    }
    if (somaCombosSelecionados > 0) {
      return true;
    } else {
      Swal.fire({
        title: "Oops, Filtro incompleto!",
        html: 'Por favor, selecione algum <strong>Filtro</strong> para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' },
      });
    }
    return false;
  }
}
