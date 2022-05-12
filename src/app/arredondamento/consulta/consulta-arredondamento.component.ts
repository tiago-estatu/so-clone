import { Http } from '@angular/http';
import { ServicePath } from './../../commons/const/ServicePath';
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from "sweetalert2";





import { Router } from '@angular/router';
import {
  fadeInOut,
  fadeIn,
  PaginacaoComponent,
  HeaderService,
  CdService,
  FornecedorService,
  ProdutoService,
  IArredondamento,
  uploadResponseArredondamento,
  LoadingService,
} from 'src/app/commons';

import { DataSource } from '@angular/cdk/collections';
import { ArredondamentoService } from 'src/app/commons/services/arredondamento';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatDialog, MatTableDataSource } from '@angular/material';
// import FileSaver = require('file-saver');
import * as FileSaver from 'file-saver';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { CadastroArredondamentoDialog } from './cadastro-arredondamento.dialog';
import { UploadHelper } from 'src/app/commons/helpers/upload.helper';
import { UtilsHelper } from 'src/app/commons';

const FORM_ERROR = {
  title: 'CD e Fornecedor obrigatorio!',
  html: 'Por favor, selecione os filtros!',
  type: 'warning',
  confirmButtonText: 'Ok, Obrigado',
  customClass: { confirmButton: 'setBackgroundColor' }
}

const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';


export const minLengthArrayValidator = (min: number) => {
  return (control: AbstractControl) => {
    if (control.value.length >= min) return null;
    return { MinLengthArray: true};
  }
}

@Component({
  selector: 'rd-consulta-arredondamento',
  templateUrl: './consulta-arredondamento.component.html',
  styleUrls: ['./consulta-arredondamento.component.scss'],
  animations: [fadeInOut, fadeIn]
})

export class ConsultaArredondamentoComponent implements OnInit, OnDestroy {

  @ViewChild(PaginacaoComponent) paginationChild: PaginacaoComponent;
  @ViewChild('importarRef') importarRef: ElementRef;
  uploadHelper = new UploadHelper({
    fileName: 'ARREDONDAMENTO_CD',
    format: 'xlsx',
    columns: ['COD REGIONAL*', 'COD PRODUTO*', 'COD FORNECEDOR*', 'QT CX EMBARQUE',	'% 1 CX EMBARQUE',	'% 2 CX EMBARQUE',	'QT CAMADA PALLET',	'% CAMADA PALLET',	'QT PALLET',	'% PALLET'  ],
    errorFirst: false
  })
  excelFileName: string = 'Arredondamento_CD';
  cdOperador = localStorage.getItem('cdOperador');
  dialogRef;
  /*
  * FILTRO DE PRODUTO
  *
  */
  public produtoControl: FormControl;
  fileToUpload: File = null;
  disabled = false;
  dataSource: any[] = [];

  //VARIAVEIS
  formArredondamento: FormGroup;
  selectedService = 'pedido';
  loaded = true;
  //Pesquisa Combo CD Regional

  displayedColumnPedido: string[] = ['cdRegional', 'fornecedor', 'produto', 'qtCxEmbarque', 'pc1cxEmbarque', 'pcCxEmbarque', 'qtCmdPallet', 'pcCmdPallet', 'qtPallet', 'pcPallet'];
  displayedColumnFaturamento: string[] = ['cdRegional', 'cdProduto', 'dsProduto', 'qtCxDisplay', 'qtCxEmbarque', 'pc1cxDisplay', 'pcCxDisplay', 'pc1cxEmbarque', 'pcCxEmbarque'];
  queryParams: QueryFilters;
  itemsInSearch = 0;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private headerService: HeaderService,
    private arredondamentoService: ArredondamentoService,
    private _http: Http,
    private _fb: FormBuilder,
    private _loader: LoadingService,
    private _dialog: MatDialog,
    private _produtoService: ProdutoService,
    private _cdService: CdService,
    private _fornecedorService: FornecedorService,
    private _utils: UtilsHelper
  ) {
  }

  ngOnInit() {
    this.produtoControl = this.formBuilder.control([]);
    this.headerService.setTitle('Arredondamento CD');
    this.initForm();
  }


  initForm() {
    this.formArredondamento = this._fb.group({
      cdProduto: [''],
      cdRegional: ['', Validators.required],
      cdFornecedor: ['', Validators.required]
    });

    this.queryParams = new QueryFilters([
      new RequestParamModel('cdProduto', [], null, (v) => (v||[]).map(i => i.cdProduto).join(',')),
      new RequestParamModel('cdRegional', []),
      new RequestParamModel('cdFornecedor', []),
      new RequestParamModel('page', 1),
      new RequestParamModel('size', 10)
    ], this.formArredondamento)

  }



  limparCampos() {
    [this._cdService, this._produtoService].forEach(service => {
      service.limpar()
    })
    this.formArredondamento.reset();
    this.dataSource = []
  }


  editRow(item: IArredondamento) {
    let ref = this._dialog.open(CadastroArredondamentoDialog, {
      data: item,
      panelClass: ['col-12', 'col-xl-7', 'col-lg-9', 'col-md-10', 'col-sm-10', 'col-xs-11'],
      closeOnNavigation: true
    })
    ref.afterClosed().subscribe(v => {
      if(v) this.consultar()
    })
  }

  setCacheInputs() {
    let cd = {val: this._cdService.$cdSelecionado.value, list: this._cdService.centroDisbuicoes.value};
    let fornecedor = {val: this._fornecedorService.$fornecedorSelecionado.value, list: this._fornecedorService.fornecedores.value};
    let produto = {val: this._produtoService.$selecionados.value, list: this._produtoService.produtos.value};

    localStorage.setItem("formArredondamento", JSON.stringify({
      'cdRegional': cd,
      'cdFornecedor': fornecedor,
      'cdProduto': produto
    }));

  }


  zerarVariaveisDeBusca() {
    this.paginationChild.limparPaginacao();
  }

  genericSwalWarn(conf: {title?: string, text: string}) {
    Swal.fire({
      title: conf.title || 'Oops!',
      text: conf.text,
      icon: 'warning'
    })
  }

  genericSwalErr(conf: {title?: string, text: string}) {
    Swal.fire({
      title: conf.title || 'Oops!',
      text: conf.text,
      icon: 'error'
    })
  }

  getPage(page) {
    this.consultar(page > 0 ? page : 0);
  }

  consultar(page: Number = 1) {
    if (this.validarPorCD()) {
      this._loader.carregar();
      this.queryParams.updateParam('page', page);
      this.arredondamentoService.getAllArredondamento(this.queryParams.criarFiltro())
        .subscribe((response: any) => {
          this._loader.parar();
          if (response.content.length === 0) this.genericSwalWarn({text: 'Nenhuma informação encontrada!'})
          this.dataSource = response.content;
          this.itemsInSearch = response.totalElements || response.pageable.totalElements
        }, ex => {
          this._loader.parar();
          this.dataSource = [];
          let conf = {
            404: {title: 'Nenhum dado encontrado', text: 'Nenhuma informação sobre o arredondamento encontrado!'},
            500: {title: 'Erro!', text: ex.error.mensagem}
          }
          ex.status === 404 ? this.genericSwalWarn(conf[404]) : this.genericSwalErr(conf[500]);
        })
    }
    this.loaded = true;
  }

  validarPorCD() {
    if(!this.formArredondamento.valid) Swal.fire({...FORM_ERROR, icon: 'error'});
    return this.formArredondamento.valid
  }

  getControl(control: string): FormControl {
    return this.formArredondamento.get(control) as FormControl
  }

  // /v1/arredondamento?cdFornecedor=100&cdProduto=200&cdRegional=900&page=0&size=20

  exportarModeloCSV(): Promise<boolean> {
    let excelName = this.excelFileName + '_template';
    this._loader.carregar();
    return new Promise((resolve) => {
      return this._http.get(ServicePath.HTTP_EXPORT_ARREDONDAMENTO_TEMPLATE)
        .toPromise()
        .then(res => {
          this._loader.parar();
          if (res && res["_body"]) {
            this.uploadHelper.downloadFile(res["_body"], excelName);
            resolve(true);
          }
        })
        .catch((ex) => {
          this._loader.parar();
          this.handleError(ex);
          resolve(false);
        });
    });
  }



  importarExcel(event): void {
    this.fileToUpload = event.target.files.item(0);


    // VERIFICAR TAMANHO DO ARQUIVO EXCEL
    this.importarRef.nativeElement.value = '';
    if(!this._utils.tamanhoMaxUpload(this.fileToUpload)) return



    this._loader.carregar();
    const headerFormRaw: FormData = new FormData();
    if (this.fileToUpload != null) {
      headerFormRaw.append('file', this.fileToUpload);
    }
    headerFormRaw.append('cdOperador', this.cdOperador);

    this.arredondamentoService
      .uploadExcel(headerFormRaw, this.cdOperador)
        .subscribe((response: any) => {
          this.uploadHelper.importFileHandler(response)
          this._loader.parar();
      }, ex => {
        if (ex.status === 400) {
          Swal.fire({
            title: `Oops!`,
            html: `Erro desconhecido favor verificar a planilha antes do envio`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ok, obrigado.',
            customClass: {confirmButton: 'setBackgroundColor'},
            cancelButtonText: 'Não'
          });
        } else if (ex.status === 404) {
          Swal.fire({
            title: 'Atenção erro no serviço de importação!',
            html: 'Não foi possível enviar a planilha para o servidor, por favor, tente novamente mais tarde',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ok, obrigado.',
            customClass: {confirmButton: 'setBackgroundColor'},
            cancelButtonText: 'Não'
          });
        }
      })

    this.importarRef.nativeElement.value = '';
}






  handleError(error) {
    if (error.status === 404) {
      Swal.fire({
        title: 'Não encontramos nenhum registro!',
        html: 'Por favor, selecione outra combinação de filtro para prosseguir.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else if (error.status === 0) {
      Swal.fire({
        title: 'Serviço de consulta está fora!',
        html: 'Por favor entre em contato com a equipe técnica.',
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    } else {
      Swal.fire({
        title: 'Erro desconhecido!',
        html: `Log: ${error.error.mensagem}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }

  get componentLoading() {
    return this._loader.getStatus()
  }

  ngOnDestroy() {

  }
}
