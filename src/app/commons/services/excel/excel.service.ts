import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { IEstoqueExtra } from '../classes';
import { ResponseDTO } from '../classes/ResponseDTO';
import { FailedDTO } from '../classes/FailedDTO';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
  jsonExample;
  constructor() { }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
 
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  public exportAsExcelResponse(json: any[], nomeExcel: string): void {
      const data = json;
      //Create workbook and worksheet
      const Excel = require('./../../../../../node_modules/exceljs');
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet('falhas');
      //Add Header Row
      const headerElement = ["line","cdRegional", "cdFornecedor","cdProduto", "qtCxDisplay", "pc1cxDisplay", "pcCxDisplay", "qtCxEmbarque", "pc1cxEmbarque", "pcCxEmbarque","pcArredondamento", "pcCmdPallet", "pcCmdPallet", "qtPallet", "pcPallet", "pcDescComercial"];
      let headerRow = worksheet.addRow(headerElement);
      // Cell Style : Fill and Border
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
      data.forEach((element) => {
        let eachRow = [];
        headerElement.forEach((headers) => {
          eachRow.push(element.rounding[headers]);
        });
        element.erros.forEach((erros) => {
          eachRow.push(erros);
        });
       
        worksheet.addRow(eachRow);
      })
      worksheet.getColumn(3).width = 15;
      worksheet.getColumn(4).width = 20;
      worksheet.getColumn(5).width = 30;
      worksheet.getColumn(6).width = 30;
      worksheet.getColumn(7).width = 10;
      worksheet.addRow([]);
      //Generate Excel File with given name
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: EXCEL_TYPE });
        FileSaver.saveAs(blob, nomeExcel + EXCEL_EXTENSION);
      });
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
  }

  onFileChange(evt: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(evt.target);
		if (target.files.length !== 1) throw new Error('Cannot use multiple files');
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			/* read workbook */
			const bstr: string = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.jsonExample = XLSX.utils.sheet_to_json(ws, {header: 1});
			/* save data */
			return this.jsonExample;
		};
		reader.readAsBinaryString(target.files[0]);
  }
}