import { Component, OnInit, ViewChild } from '@angular/core';
import {
  HeaderService,
  NewModalComponent, UtilsHelper, fadeInOut, fadeIn, MinimoMaximoService, ValidatorHelper
} from 'src/app/commons';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpParams, HttpErrorResponse } from '@angular/common/http';
import { saveAs } from 'file-saver/src/FileSaver';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';

@Component({
  selector: 'rd-relatorio-minimo-maximo',
  templateUrl: './relatorio-minimo-maximo.component.html',
  styleUrls: ['./relatorio-minimo-maximo.component.scss'],
  animations: [fadeInOut, fadeIn]
})
export class RelatorioMinimoMaximoComponent implements OnInit {
  relatorioForm = new FormGroup({
    dataInicial: new FormControl(new Date()),
    dataFinal: new FormControl(new Date()),
    filiaisConsulta: new FormControl(''),
    produtosConsulta: new FormControl('')
  });

  mensagemModal;
  imagemModal;
  tituloModal;
  componentLoading: Boolean = false;
  parametroRelatorio: HttpParams;
  cdOperador = localStorage.getItem('cdOperador');

  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  _todosCDSelecionados = [];
  _todasCategoriaSelecionada = [];
  _motivoSelecionado = [];
  expandir = true;
  dataMaxima;

  constructor(
    private headerService: HeaderService,
    private _utils: UtilsHelper,
    private _service: MinimoMaximoService,
    private _validator: ValidatorHelper,
  ) {

  }

  ngOnInit() {
    this.headerService.setTitle('Relatório Mínimo e Máximo');
  }

  limparFiltros(clearCD, clearCAT, clearMotivos) {
    clearCD.cdSelecionadoLista = [];
    clearCAT.categoriaProdutoSelecionadoLista = [];
    clearMotivos.motivoSelecionadoLista = [];
    this.relatorioForm.setValue({dataInicial: new Date(), dataFinal: new Date(), filiaisConsulta: '', produtosConsulta: ''});
  }
  setCentroSelecionados(callBack) {
    this._todosCDSelecionados = callBack;
  }
  setCategoriaSelecionados(callBack) {
    this._todasCategoriaSelecionada = callBack;
  }
  setMotivosSelecionados(callBack) {
    this._motivoSelecionado = callBack
  }
  getProdutos(): number[] {
    let produtos = this.relatorioForm.get('produtosConsulta').value;
    if (!this._utils.isEmpty(produtos)) {
      produtos = produtos.split(',');
      produtos = produtos.filter(prod => prod !== '');
    }
    return produtos;
  }

  getFiliais(): number[] {
    let filiais = this.relatorioForm.get('filiaisConsulta').value;
    if (!this._utils.isEmpty(filiais)) {
      filiais = filiais.split(',');
      filiais = filiais.filter(filial => filial !== '');
    }
    return filiais;
  }

  criarParametros(): boolean {
    if (this.podeExportar()) {
      this.parametroRelatorio = new HttpParams()
        .set('dtInicio', this._validator.formataData(this.relatorioForm.get('dataInicial').value))
        .set('dtFim', this._validator.formataData(this.relatorioForm.get('dataFinal').value));

      if (!this._utils.isEmpty(this._todasCategoriaSelecionada)) {
        this.parametroRelatorio = this.parametroRelatorio.set('categorias', this._todasCategoriaSelecionada.toString());
      }
      if (!this._utils.isEmpty(this._todosCDSelecionados)) {
        this.parametroRelatorio = this.parametroRelatorio.set('cds', this._todosCDSelecionados.toString());
      }
      if (!this._utils.isEmpty(this._motivoSelecionado)) {
        this.parametroRelatorio = this.parametroRelatorio.set('cdMotivoEstoqueMinMax', this._motivoSelecionado.toString());
      }
      if (!this._utils.isEmpty(this.getFiliais())) {
        this.parametroRelatorio = this.parametroRelatorio.set('lojas', this.getFiliais().toString());
      }
      if (!this._utils.isEmpty(this.getProdutos())) {
        this.parametroRelatorio = this.parametroRelatorio.set('produtos', this.getProdutos().toString());
      }
      this.parametroRelatorio = this.parametroRelatorio.set('cdOperador', this.cdOperador.toString());

      return true;
    } else {
      Swal.fire({
        icon: "warning",
        title: 'Oops, selecione filtro!',
        text: 'Por favor, selecione outro filtro para prosseguir!',
        confirmButtonText: "Ok",
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      this.componentLoading = false
      return false;
    }
  }

  downloadFile(data: any) {
    let blob = new Blob([data], { type: 'text/csv' });

    saveAs(blob, "data.csv");
  }

  exportarRelatorio() {
    this.componentLoading = true;

    if (this.criarParametros()) {

      this._service.exportarRelatorio(this.parametroRelatorio).subscribe(data => {

        // let parsedResponse = data.body;
        // this.downloadFile(parsedResponse);
        Swal.fire({
          title: `${data.type}`,
          html: `${data.mensagem}`,
          icon: 'success',
          confirmButtonText: 'Ok, obrigado',
          customClass: { confirmButton: 'setBackgroundColor' }
        });

        this.componentLoading = false;
      }, ex => {
        this._service.handleError(ex);
        this.componentLoading = false;



        /*if (ex.status !== 0) {
        this.parseErrorBlob(ex).subscribe({
            error(err) {
                Swal.fire({
                icon: "warning",
                title: "Opss!",
                text: err.mensagem,
                confirmButtonText: "Ok, obrigado.",
                customClass: {confirmButton: 'setBackgroundColor'}
                  });
            }
          });
        }*/
      });
    }
  }

  parseErrorBlob(err: HttpErrorResponse): Observable<any> {
    const reader: FileReader = new FileReader();

    const obs = Observable.create((observer: any) => {
      reader.onloadend = (e) => {
        observer.error(JSON.parse(reader.result as string));
        observer.complete();
      }
    });
    reader.readAsText(err.error);
    return obs;
  }

  finalizandoProcesso() {
    this.componentLoading = false;
  }
  podeExportar(): boolean {

    if ((this._utils.isEmpty(this.relatorioForm.get('dataInicial').value) ||
      (this._utils.isEmpty(this.relatorioForm.get('dataFinal').value)))) {
      this.componentLoading = false;
      Swal.fire({
        icon: "warning",
        title: 'Datas inválidas!',
        text: 'Por favor, as duas datas precisam estar preenchidas!',
        confirmButtonText: "Ok",
        customClass: { confirmButton: 'setBackgroundColor' }
      }).then((result) => {
        if (result) {
          return false;
        }
      });
    }

    let podeExportar = false;

    if (!this._utils.isEmpty(this.relatorioForm.get('filiaisConsulta').value)) {
      podeExportar = true;
    }

    if (!this._utils.isEmpty(this.relatorioForm.get('produtosConsulta').value)) {
      podeExportar = true;
    }

    if (!this._utils.isEmpty(this._todosCDSelecionados)) {
      podeExportar = true;
    }

    if(!this._utils.isEmpty(this.setMotivosSelecionados)){
      podeExportar = true;
    }
    if (!this._utils.isEmpty(this._todasCategoriaSelecionada)) {
      podeExportar = true;
    }

    return podeExportar;
  }


}
