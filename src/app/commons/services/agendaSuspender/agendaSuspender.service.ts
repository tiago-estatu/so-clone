import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AgendaSuspensa, 
  AgendaSuspensaDetalhe, 
  MotivoSuspensao, 
  ResponseSuspenderAgendaUpload, 
  ResponseRegistrosInvalidos, 
  ResponseUpload} from '../classes';
import { ServicePath } from '../../const';
import { AgendaFaturamentoModel } from '../agendaFaturamento';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { responseSuspenderAgendaCD } from './responseSuspenderAgendaCD.model';
import { responseErroSuspender } from './responseErroSuspender.model';
import { QueryFilters } from '../../models/query-param.model';
import { LoadingService } from '../loading/loading.service';
import { map } from 'rxjs/internal/operators/map';
import { UtilsHelper } from '../../helpers/utils.helper';
import { ValidatorHelper } from '../../helpers/validator.helper';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';


export class AgendaStore {
  data: AgendaSuspensa[];
  status: 'LOAD' | 'ERROR' | 'READY'
}

@Injectable()
export class AgendaSuspenderService {
  private _utils: UtilsHelper = new UtilsHelper();
  private _formatador: ValidatorHelper = new ValidatorHelper();
  excelFileName: string = 'Agenda_Suspensa_cd';
  dataSource: BehaviorSubject<AgendaStore> = new BehaviorSubject({data: [], status: 'LOAD'});

   // URL'S PARA REQUISIÇÕES
   _servicePath =  ServicePath.HTTP_URL_AGENDA_ABASTECIMENTO + 'agendaSuspensaCd';
   _urlTodosServicos = {

       // RETORNA OS DADOS SOBRE OS FILTROS SELECIONADOS (GET)
       consultar: this._servicePath,

       // EXPORTAÇÃO FILTROS PRÉ-SELECIONADOS (GET)
       exportarFiltrosPreSelecionados: this._servicePath + '/export',

       // EXPORTAÇÃO MODELO EM BANCO (GET)
       exportarModeloCsvBranco: this._servicePath + '/export/template',

       // EXPORTAÇÃO MODELO EM BANCO (POST)
       importar: this._servicePath + '/upload',

   };

    constructor(
      private _http: HttpClient, 
      private _loader: LoadingService,
      private _validator: ValidatorHelper) { }

  buscarAgendasPorFiltro(queryFilters: QueryFilters) : Observable<AgendaSuspensa[]>{
    return this._http.get<AgendaSuspensa[]>(  this._urlTodosServicos.consultar + queryFilters.criarFiltro())
  }

  getAgendas(queryFilters: QueryFilters){
    this._loader.carregar();
    this._http.get<any | any[]>( this._urlTodosServicos.consultar + queryFilters.criarFiltro())
      .pipe(
        map(response => {
        return response.content.map(agenda => {
         let agendas = new AgendaSuspensa(response)
          agendas.setDataVigencia(queryFilters.getParam('dtInicio'), queryFilters.getParam('dtFim'));
          return agendas;
        })
      }))
      .subscribe(
        data => {this.dataSource.next({data: data, status: 'READY'})},
        error => (this.dataSource.next({data: error, status: 'ERROR'})),
        ).add(() => {
            this._loader.parar()
        })
  }

  exportarAgendaSuspensa(queryFilters: QueryFilters){
    let excelName = 'agenda_suspensa_cd';
    this.exportRequest(this._urlTodosServicos.exportarFiltrosPreSelecionados,
      excelName).toPromise().then(() => this._loader.parar());
  }
   


 /* buscarAgendasEstiloFaturamentoPorFiltro(filtro:HttpParams): Observable<AgendaFaturamentoModel[]>{
    return this.httpClient.get<AgendaFaturamentoModel[]>(ServicePath.HTTP_URL_AGENDA + '/v1/agendaSuspensaCd/consultar', {params: filtro});
   
  }
  buscarAgendasDetalhePorAgenda(id: number,filtro:string) : Observable<AgendaSuspensaDetalhe[]>{
 return this.httpClient.get<AgendaSuspensaDetalhe[]>(ServicePath.HTTP_URL_AGENDA + '/v1/cd/' + id + filtro);

  }*/

  suspenderAgenda(raw: any): Observable<responseSuspenderAgendaCD>{

    return this._http.post<responseSuspenderAgendaCD>(ServicePath.HTTP_SUSPENDER_AGENDA_CD , raw);
  }
  
  uploadExcel(file: FormData): Observable<ResponseUpload>{
      const httpHeader: HttpHeaders = new HttpHeaders()
                  .set('Accept', 'application/json');

      return this._http.post<ResponseUpload>(this._urlTodosServicos.importar, file, { headers : httpHeader});
  }

  // REQUISIÇÕES DE EXPORTAÇÃO (CSV)
  // PARAMS: URL + (query(se existir)) + nome do arquivo
    exportRequest(urlTobeFech: string, nomeDoArquivoExcel: string): Observable<boolean> {
    this._http.get(urlTobeFech, {observe: 'response', responseType: 'text'})
          .subscribe(
              (data) => {
                  this.downloadFile(data.body, nomeDoArquivoExcel);
                  this.swallAlertMsgDownloadSucesso();
              },
              ex => {
                  if (typeof(ex.error) == 'string') ex.error = JSON.parse(ex.error);
                  this.handleError(ex)
              });
      return of(true);
  }

 // DOWNLOAD CONCLUIDO COM SUCESSO
 swallAlertMsgDownloadSucesso() {
  Swal.fire({
      title: 'Download concluído com sucesso!',
      text: 'Por favor, verifique seus downloads para abrir o excel.',
      icon: 'success',
      confirmButtonText: 'Ok, obrigado',
      customClass: { confirmButton: 'setBackgroundColor' }
  });
}
// DOWNLOADER DE EXCEL DE DADOS
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
  this.swallAlertMsgDownloadSucesso();
}

handleError(error){
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
          title: 'Erro desconhecido!',
          html: `Log: ${error.error.mensagem}`,
          icon: 'warning',
          confirmButtonText: 'Ok Fechar',
          customClass: {confirmButton: 'setBackgroundColor'}
      });
  }
}


    downloadExcelErroSuspender(response: responseSuspenderAgendaCD, cdMotivo, dtInicial,dtFinal){
      let excelName = this.excelFileName + '_ERRO_SUSPENDER';
       //Create workbook and worksheet
        const Excel = require('./../../../../../node_modules/exceljs');
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('conteudo');
        //Add Header Row
        const headerFalha = ["Cód. Regional", "Cód. Fornecedor","Cód. Fabricante","Cód. Produto","Cód. Motivo","Data Vig. Inicial", "Data Vig. Fim", "Erros:"];     
    //    let headerRow = worksheet.addRow(header);
        // Cell Style : Fill and Border
        let headerRow;
        headerRow = worksheet.addRow(headerFalha);
  
        headerRow.eachCell((cell, number) => {
  
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' },
            bgColor: { argb: 'FF0000FF' }
          }
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        })
        // Add Data and Conditional Formatting
        let jsonFail: responseErroSuspender[] = response.erros;
        
      
       jsonFail.forEach((element) =>{
          let eachRow = [];
       //["Cód. Regional", "Cód. Fornecedor","Cód. Fabricante","Cód. Produto","Cód. Motivo","Data Vig. Inicial", "Data Vig. Fim", "Erros:"];   
          eachRow.push( this._utils.isEmpty(element.cdRegional) ? ' ': (element.cdRegional));
          eachRow.push( this._utils.isEmpty(element.cdFornecedor) ? ' ': (element.cdFornecedor));
          eachRow.push( this._utils.isEmpty(element.cdFabricante) ? ' ': (element.cdFabricante));
          eachRow.push( this._utils.isEmpty(element.cdProduto) ? ' ': (element.cdProduto));
          eachRow.push( this._utils.isEmpty(cdMotivo) ? ' ': (cdMotivo));
          eachRow.push( this._utils.isEmpty(dtInicial) ? ' ': (this._formatador.formataData(dtInicial)));
          eachRow.push( this._utils.isEmpty(dtFinal) ? ' ': (this._formatador.formataData(dtFinal)));
          this.msgErroSuspender(element).forEach(vio => {
          
            eachRow.push(vio);
          });
  
          worksheet.addRow(eachRow);
        });

        worksheet.getColumn(3).width = 15;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 15;
        worksheet.getColumn(7).width = 15;
        worksheet.getColumn(8).width = 15;
        worksheet.addRow([]);
        //Generate Excel File with given name
        workbook.xlsx.writeBuffer().then((data) => {
          let blob = new Blob([data], { type: EXCEL_TYPE });
          FileSaver.saveAs(blob, excelName + EXCEL_EXTENSION);
        });
      }

      msgErroSuspender(data: responseErroSuspender): string[]{
       
        let sb = [];

        if (data.produtosInexistentes > 0) {
          sb.push("Produto nao existe;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados > 0 && data.produtosInativos == 0 && data.produtosNaoVendaveis == 0) {
          sb.push("Produto deletado;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados == 0 && data.produtosInativos > 0 && data.produtosNaoVendaveis == 0) {
          sb.push("Produto inativo;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados == 0 && data.produtosInativos == 0 && data.produtosNaoVendaveis > 0) {
          sb.push("Produto nao e vendavel;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados > 0 && data.produtosInativos > 0 && data.produtosNaoVendaveis == 0) {
          sb.push("Produto deletado/inativo;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados > 0 && data.produtosInativos == 0 && data.produtosNaoVendaveis > 0) {
          sb.push("Produto deletado/nao e vendavel;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados == 0 && data.produtosInativos > 0 && data.produtosNaoVendaveis > 0) {
          sb.push("Produto inativo/nao e vendavel;");
        }
        if (data.produtosInexistentes == 0 && data.produtosDeletados > 0 && data.produtosInativos > 0 && data.produtosNaoVendaveis > 0) {
          sb.push("Produto deletado/inativo/nao e vendavel;");
        }
        if (data.produtoNaoPertenceAoFornecedor > 0) {
          sb.push("Produto não pertence ao Fornecedor;");
        }
        if (data.produtoNaoPertenceAoFabricante > 0) {
          sb.push("Produto não pertence ao Fabricante;");
        }
     
        return sb;
      }

      exportarAgendasComFalha(response: ResponseSuspenderAgendaUpload){
        let excelName = this.excelFileName + '_ERROS';
         //Create workbook and worksheet
          const Excel = require('./../../../../../node_modules/exceljs');
          let workbook = new Excel.Workbook();
          let worksheet = workbook.addWorksheet('conteudo');
          //Add Header Row
          const headerFalha = ["linha","Cód. Regional", "Cód. Fornecedor","Cód. Fabricante","Cód. Produto","Cód. Motivo","Data Vig. Inicial", "Data Vig. Fim", "Erros:"];     
      //    let headerRow = worksheet.addRow(header);
          // Cell Style : Fill and Border
          let headerRow;
          headerRow = worksheet.addRow(headerFalha);
    
          headerRow.eachCell((cell, number) => {
    
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFF00' },
              bgColor: { argb: 'FF0000FF' }
            }
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
          })
          // Add Data and Conditional Formatting
          let jsonFail: ResponseRegistrosInvalidos[] = response.registrosInvalidos;
          jsonFail.sort(x => x.nrLinha);
          jsonFail.forEach((element) =>{
            let eachRow = [];
            const linha: string[] = element.linha.split(';');
            eachRow.push(element.nrLinha);
            eachRow.push(linha[0]);
            eachRow.push(linha[1]);
            eachRow.push(linha[2]);
            eachRow.push(linha[3]);
            eachRow.push(linha[4]);
            eachRow.push(linha[5]);
            eachRow.push(linha[6]);
            //eachRow.push(linha[7]);
            element.violations.forEach(vio => {
              eachRow.push(vio.fieldName + ':' + vio.message);
            });
    
            worksheet.addRow(eachRow);
          });
            
          worksheet.getColumn(3).width = 15;
          worksheet.getColumn(4).width = 15;
          worksheet.getColumn(5).width = 15;
          worksheet.getColumn(6).width = 15;
          worksheet.getColumn(7).width = 15;
          worksheet.getColumn(8).width = 15;
          worksheet.addRow([]);
          //Generate Excel File with given name
          workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelName + EXCEL_EXTENSION);
          });
        }
    
}