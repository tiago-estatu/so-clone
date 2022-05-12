import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Arredondamento } from 'src/app/arredondamento/cadastro/arredondamento';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import * as FileSaver from 'file-saver';
import { IArredondamento, uploadResponseArredondamento, ArredondamentoFalhaDTO } from '../classes';
import { Observable } from 'rxjs';
import { ServicePath } from '../../const';
import { tap } from 'rxjs/operators';
import { UtilsHelper } from '../../helpers';
import { UploadHelper } from '../../helpers/upload.helper';
import { QueryFilters } from '../../models/query-param.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class ArredondamentoService {
  excelFileName: string = '';

  uploader = new UploadHelper({
    fileName: 'ARREDONDAMENTO_CD_',
    format: '.csv',
    columns: Array(8).fill(0).map((itm, idx) => `${idx + 1}`),
    errorFirst: false
});

  constructor( private http: HttpClient, private utils: UtilsHelper) { }

  getAllArredondamento(filtro:string) : Observable<any>{
    return this.http.get<IArredondamento[]>( ServicePath.HTTP_URL_ARREDONDAMENTO + filtro);
  }

  buscarArredondamentos(filtro:string) : Observable<IArredondamento[]>{
    return this.http.get<IArredondamento[]>( ServicePath.HTTP_URL_ARREDONDAMENTO + '/export' + filtro);
  }

  uploadExcel(file: any, cdOperador: string): Observable<uploadResponseArredondamento>{
    return this.http.post<uploadResponseArredondamento>(ServicePath.HTTP_URL_ARREDONDAMENTO + '/upload?cdOperador=' + cdOperador , file);
  }

  atualizarArredondamento(raw, cdOperador: string): Observable<any>{
    return this.http.put<any>( ServicePath.HTTP_URL_ARREDONDAMENTO + '?cdOperador=' + cdOperador , raw);
  }

  // EXPORTAR PANILHA DE ERROS
  exportarPlanilhaDeErros(response){
    let excelName = 'Arredondamento_ERROS';

      //Create workbook and worksheet
      const Excel = require('./../../../../../node_modules/exceljs');
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('conteudo');
      //Add Header Row
      const headerFalha = ["Linha","Cod Regional*", "Cod Produto*", "Cod Fornecedor*", "QT Cx Embarque", "% 1º CX Embarque", "% 2º Cx Embarque", "QT Camada Pallet" , "% Camada Pallet", "QT Pallet", "% Pallet", "Erros"];
  
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
      let jsonFail = response.registrosInvalidos;
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
        eachRow.push(linha[7]);
        eachRow.push(linha[8]);
        eachRow.push(linha[9]);
        // eachRow.push(linha[10]);
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
      
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, excelName + EXCEL_EXTENSION);
      });
    }


    exportarRelatorio(query: QueryFilters) {
        let operador = `&cdOperador=${localStorage.getItem('cdOperador')}`
        return this.http.get<any>(ServicePath.HTTP_RELATORIO_ARREDONDAMENTO_CD + query.criarFiltro() + operador).pipe(tap(data => {
            Swal.fire({
              title: data.detail,
              text: data.mensagem,
              icon: 'success'
            })
        }, err => {
            if(err.error == null) err.error = {message: 'Verifique os filtros ou tente novamente mais tarde.'};
            if (typeof(err.error) == 'string') err.error = JSON.parse(err.error)
            err.error.title = {
                404: 'Nenhum registro encontado',
                500: 'Não foi possível gerar o relatório'
            };
            this.utils.showError(err);
        }));
    }
    

}