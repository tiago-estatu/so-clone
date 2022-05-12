import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HeaderService, fadeInOut, UtilsHelper, SistemaFaturamentoModel, ServicePath, CdService, FornecedorService } from 'src/app/commons';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UploadHelper } from 'src/app/commons/helpers/upload.helper';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FabricanteService } from 'src/app/commons/services/fabricante/fabricante.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { CentroDistribuicaoComboConfig } from 'src/app/commons/components/combos';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';

@Component({
  selector: 'rd-sistema-atual-compra-cd',
  templateUrl: './sistema-atual-compra-cd.component.html',
  styleUrls: ['./sistema-atual-compra-cd.component.scss'],
  animations: [fadeInOut]

})
export class SistemaAtualCompraCdComponent implements OnInit {

  dataSource: SistemaFaturamentoModel[];
  componentLoading = false;

  expandir = true;
  totalDeItems = 0;
  pageNumber: number = 0;
  itemsPorPagina:number = 10;
  filterForm: FormGroup;
  queryFilters: QueryFilters;
  comboConfig = new CentroDistribuicaoComboConfig(false);

  private _subs = [];
  private _subscription: Subscription;
  constructor(
    private _fb: FormBuilder,
    private _header: HeaderService,
    private _cdService: CdService,
    private _fornecedorService: FornecedorService,
    private _fabricanteService: FabricanteService,
    private _http: HttpClient
  ) { }

  uploadHelper:UploadHelper  = new UploadHelper({fileName: 'relatorio-sistema-atual-faturamento-CD', columns: [], format: 'csv'});

  ngOnInit() {

    this._header.setTitle('Relatório Sistema Atual de Compra CD')

    this.initForm();
    this.initQuery();
  }

  initQuery(){
    this.queryFilters = new QueryFilters([
        new RequestParamModel('cdRegional', [], 'cdRegional'),
        new RequestParamModel('cdFornecedor', [], 'cdFornecedor'),
        new RequestParamModel('cdFabricante', [], 'cdFabricante')
    ], this.filterForm);
}

  // VERIFICAÇÃO SE ALGUMA SELECÃO DE FILTRO FOI FEITA
  contemAlgumFiltro(): boolean {
    if (this._cdService.$cdSelecionado.value.length > 0) {
      return true;
    } else {
      Swal.fire({
        title: 'Atenção, filtro incompleto!',
        html: 'Por favor, selecione algum <strong>Centro de Distribuição</strong>.',
        icon: 'warning',
        confirmButtonText: 'Ok, obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
      return false;
    }
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this._cdService.limpar();
    this._fabricanteService.limpar();
    this._fornecedorService.limpar();
  }

  initForm() {
    this.filterForm = this._fb.group({
        cdRegional: ['', Validators.required],
        cdFornecedor: [''],
        cdFabricante: [''],
    })
  }

  selectField(data: {field: string, data: any}) {
    let dict = {'fc': 'cdFornecedor', 'fb': 'cdFabricante', 'cd': 'cdRegional'};
    let valueForPatch = {};
    valueForPatch[dict[data.field]] = data.data;
    this.filterForm.patchValue(valueForPatch);
  }


  getFormStatus(name: string) {
    return this.filterForm.get(name).disabled
  }

  /************************************ MÉTODOS PARA FLUXO PRINCIPAL **********************************/
  /****************************************************************************************************/
  // MÉTODO DE EXPORTAÇÃO
  exportarDadosConsultados() {
    this.componentLoading = true;

    // VERIFICAR QUAL O PREENCHIMENTO DOS FILTROS
    if (this.contemAlgumFiltro()) {
      // CHAMADA PARA O SERVIÇO DE EXPORTAÇÃO
      this.exportarRelatorioSistemaAtualFaturamento(this.queryFilters);
    } else {
      this.componentLoading = false;
    }
  }

  // FAÇO A CHAMADA DA API PARA EXPORTAÇÃO DOS DADOS
  exportarRelatorioSistemaAtualFaturamento(filtroPesquisa: QueryFilters) {
    // NOMEANDO O ARQUIVO EXCEL
    const nomeDoArquivoExcel = 'relatorio-sistema-atual-faturamento-CD';
    this.componentLoading = true;
    const URL = ServicePath.HTTP_EXPORT_RELATORIO_SISTEMA_ATUAL_FATURAMENTO_CD;
    const FILE_DOWNLOAD_OPTIONS =  {
      headers: new HttpHeaders({
          'Accept': 'text/plain, */*',
          'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
      };
      this._http.get<string>(URL + filtroPesquisa.criarFiltro(), FILE_DOWNLOAD_OPTIONS).subscribe((res) => {
        this.uploadHelper.downloadFile(res, nomeDoArquivoExcel);
        this.swallAlertMsgDownloadSucesso();

        this.componentLoading = false;
      }, error => {
          this.componentLoading = false;
           // CHAMO METÓDO DE TRATAMENTO DE ERROS
           this.handleError(error);
      });
  }
  swallAlertMsgDownloadSucesso(){
    Swal.fire({
      title: 'Download concluído com sucesso!',
      text: 'Por favor, verifique seus downloads para abrir a exportação.',
      icon: 'success',
      confirmButtonText: 'Ok, obrigado',
      customClass: { confirmButton: 'setBackgroundColor' }
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
        title: 'Atenção! Erro desconhecido por favor entre em contato com a equipe técnica.',
        html: `Log error: ${error.error.mensagem}`,
        icon: 'warning',
        confirmButtonText: 'Ok Fechar',
        customClass: { confirmButton: 'setBackgroundColor' }
      });
    }
  }



}
