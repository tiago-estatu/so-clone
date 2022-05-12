import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadResponseAgenda } from '../classes/UploadResponseAgenda';
import { UploadResponseAgendaLoja } from '../classes/UploadResponseAgendaLoja';
import * as FileSaver from 'file-saver';
import { Observable } from 'rxjs';
import { IAgenda } from '../classes/IAgenda';
import { IAgendaLoja } from '../classes/IAgendaLoja';
import { ConfiguracaoCD } from 'src/app/execucao/agenda/ConfiguracaoCD';
import { Frequencia } from 'src/app/execucao/agenda/Frequencia';
import { AgendaLojaFalha } from '../classes/AgendaLojaFalha';
import { ResponseSuspenderAgendaUpload, ResponseRegistrosInvalidos } from '../classes';
import { AgendaCD } from 'src/app/execucao/agenda/AgendaCD';
import { ServicePath } from '../../const';

const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';


@Injectable({
  providedIn: 'root'
})
export class AgendaService {
  constructor(private http: HttpClient) { }
  // tslint:disable-next-line: max-line-length
  getConsultaListaCD(parametros) {
  // tslint:disable-next-line: max-line-length
    return this.http.get<ConfiguracaoCD[]>( ServicePath.HTTP_URL_AGENDA_CD, { params: parametros});
  }

  getConsultaListaLOJA(filtroBack): Observable<any> {
    return this.http.get<IAgendaLoja[]>(ServicePath.HTTP_URL_AGENDA_LOJA + filtroBack);
  }
  // tslint:disable-next-line: member-ordering
  excelFileName = 'Agenda_Abastecimento';



  escolherHeader(tipoExcel: number){
    if(tipoExcel === 1){
      return this.headerCD();
    }else{
      return this.headerLoja();
    }
  }

  headerCD(){
      return ['Cód. Regional *', 'Cód. Fornecedor', 'Cód. Fabricante *', 'Frequencia *', 'Dia de Compra *' ];
  }

  headerLoja(){
    return ["Cod Regional*", "Padrao Abastecimento"];
  }

  escolherNomeArquivo(tipoExcel: number){
    this.excelFileName = 'Agenda_Abastecimento';
    if(tipoExcel === 1){
      this.excelFileName += "_CD";
    }else{
      this.excelFileName += "_LOJA";
    }
  }


  exportarModeloCsv(tipoExcel: number): Promise<Boolean>{
    this.escolherNomeArquivo(tipoExcel);
    const Excel = require('./../../../../../node_modules/exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('conteudo');
    // Add Header Row
    return new Promise((resolve) => {
      const headerRow = worksheet.addRow(this.escolherHeader(tipoExcel));
      this.excelFileName += '_EM_BRANCO';


      headerRow.eachCell((cell, number) => {

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 15;
      worksheet.getColumn(4).width = 17;
      worksheet.getColumn(5).width = 20;
      worksheet.addRow([]);

      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);

        resolve(true);
      });
    });

  }


  exportarGrid(dataSource: any[], tipoExcel: number) {
    this.excelFileName = 'Agenda_Abastecimento';
    const Excel = require('./../../../../../node_modules/exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('conteudo');
    // Add Header Row
  
    const headerRow = worksheet.addRow(this.escolherHeader(tipoExcel));

      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      let allRows = [];
      allRows = this.adicionarLinhas(tipoExcel, dataSource);
      worksheet.addRow(allRows);

      worksheet.getColumn(1).width = 15;
      worksheet.getColumn(2).width = 15;
      worksheet.getColumn(3).width = 15;
      worksheet.getColumn(4).width = 15;
      worksheet.getColumn(5).width = 15;
      worksheet.addRow([]);

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);
    });
  }

  adicionarLinhas(tipoExcel: number, elements: any[]){
    if(tipoExcel === 1){
     return this.adicionarLinhasCD(elements);
    }else{
      return this.adicionarLinhasLoja(elements);
    }
  }

  adicionarLinhasCD(elements: IAgenda[]){
    let eachRow = [];
    elements.forEach((element: IAgenda) => {
      eachRow = [];
      eachRow.push(element.cdRegional);
      eachRow.push(element.cdFabricante);
      eachRow.push(element.cdFornecedor);
      eachRow.push(element.qtDiasIntervalo);
      eachRow.push(element.diaSemana);
    });

    return eachRow;
  }

  adicionarLinhasLoja(elements: IAgendaLoja[]){
    let eachRow = [];

    elements.forEach((element: IAgendaLoja) => {
      eachRow = [];
      eachRow.push(element.cdFilial);
      eachRow.push(element.cdPadraoAbastecimento);
    });

    return eachRow;
  }

  exportarGridLoja(dataSource: IAgendaLoja[], onlyHeader: boolean, tipoExcel: number) {

    // Create workbook and worksheet
    const Excel = require('./../../../../../node_modules/exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('conteudo');
    // Add Header Row
    let headerCRU = [];
    const headerElement = [];
    let headerGrid = [];
    if (tipoExcel === 1) { // CD
      headerCRU = ['COD Filial *', 'COD Padrao Abastecimento *'];
      headerGrid = ['COD Filial *', 'COD Padrao Abastecimento *'];
    } else { // LOJA
      headerCRU = ['COD Filial *', 'COD Padrao Abastecimento *'];
      headerGrid = ['COD Filial *', 'COD Padrao Abastecimento *'];
    }

    let headerRow;
    if (onlyHeader) {
      this.excelFileName = 'AGENDA_LOJA_EM_BRANCO';
      headerRow = worksheet.addRow(headerCRU);

      headerRow.eachCell((cell, number) => {

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.addRow([]);

    } else {
      this.excelFileName = 'Agenda Loja';
      headerRow = worksheet.addRow(headerGrid);

      headerRow.eachCell((cell, number) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });

      let eachRow = [];
      dataSource.forEach((element: IAgendaLoja) => {
        eachRow = [];
        eachRow.push(element.cdFilial);
        eachRow.push(element.cdPadraoAbastecimento);

        worksheet.addRow(eachRow);

      });
      worksheet.getColumn(1).width = 20;
      worksheet.getColumn(2).width = 20;
      worksheet.addRow([]);
    }

    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);
    });

  }

  uploadExcel(file: any): Observable<UploadResponseAgenda> {
    return this.http.post<UploadResponseAgenda>(ServicePath.HTTP_URL_AGENDA_UPLOAD_CD, file);
  }

  uploadExcelNew(file: FormData): Observable<ResponseSuspenderAgendaUpload> {
    return this.http.post<ResponseSuspenderAgendaUpload>('http://10.1.13.19:7012/v1/cd/upload', file);
  }

  uploadExcelLoja(file: any): Observable<UploadResponseAgendaLoja> {
    return this.http.post<UploadResponseAgendaLoja>(ServicePath.HTTP_URL_AGENDA_UPLOAD_LOJA, file);
  }

  exportarAgendasComFalha(response: ResponseSuspenderAgendaUpload) {

    // Create workbook and worksheet
    const Excel = require('./../../../../../node_modules/exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('conteudo');
    // Add Header Row
    const headerFalha = ['linha', 'Cód. Regional', 'Cód. Fornecedor', 'Cód. Fabricante', 'Frequencia *', 'Dia de Compra *', '', 'Erros:'];

      let headerRow;
      headerRow = worksheet.addRow(headerFalha);

      headerRow.eachCell((cell, number) => {

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF00' },
          bgColor: { argb: 'FF0000FF' }
        };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      // Add Data and Conditional Formatting
      this.excelFileName += '_ERROS';
      const jsonFail: ResponseRegistrosInvalidos[] = response.registrosInvalidos;
      jsonFail.sort(x => x.nrLinha);

      jsonFail.forEach((element) => {
        const eachRow = [];
        const linha: string[] = element.linha.split(';');
        eachRow.push(element.nrLinha);
        eachRow.push(linha[0]);
        eachRow.push(linha[1]);
        eachRow.push(linha[2]);
        eachRow.push(linha[3]);
        eachRow.push(linha[4]);
        eachRow.push(linha[5]);

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
      // Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data) => {
        const blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);
      });

  }

  exportarResponseLoja(responseFalhas: AgendaLojaFalha[], tipoExcel: number) {

    this.excelFileName = 'Agenda_Loja_Erros';
    // Create workbook and worksheet
    const Excel = require('./../../../../../node_modules/exceljs');
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('conteudo');
    // Add Header Row
    let headerFalha = [];
    if (tipoExcel === 1) { // CD
      headerFalha = ['Linha', 'COD Filial *', 'COD Padrao Abastecimento *', 'Erros'];
    } else { // LOJA
      headerFalha = ['Linha', 'COD Filial *', 'COD Padrao Abastecimento *', 'Erros'];
    }

    let headerRow;
    headerRow = worksheet.addRow(headerFalha);
    headerRow.eachCell((cell, number) => {

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    let eachRow = [];
    responseFalhas.forEach((element: AgendaLojaFalha) => {
      eachRow = [];
      eachRow.push(this.validarColuna(element.line));
      eachRow.push(this.validarColuna(element.dados.cdFilial));
      eachRow.push(this.validarColuna(element.dados.cdPadraoAbastecimento));

      element.erros.forEach((erro) => {
        eachRow.push(erro);
      });

      worksheet.addRow(eachRow);
    });

    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.addRow([]);
    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: EXCEL_TYPE });
      FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);
    });

  }

  private validarColuna(value: any): string {
    if (value === null || value === undefined) {
      return '';
    } else {
      return value;
    }
  }

  getSalvarAgendaCD(configuracaoCD) {
      return this.http.post(ServicePath.HTTP_URL_AGENDA_UPLOAD_CD, configuracaoCD );
  }

  getSalvarAgendaLoja(configuracaoLoja: IAgendaLoja[]) {
    return this.http.post(ServicePath.HTTP_URL_AGENDA_UPLOAD_LOJA, configuracaoLoja);
  }

  getAtualizaFrequenciaAgenda(frequencia: Frequencia[]) {
    return this.http.put(ServicePath.HTTP_ATUALIZA_FREQUENCIA_AGENDA, frequencia);
  }

}
