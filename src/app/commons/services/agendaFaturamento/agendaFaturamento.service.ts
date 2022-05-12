import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ValidatorHelper } from '../../helpers/validator.helper';
import { ServicePath } from '../../const';
import { Headers, Http } from '@angular/http';
import { Observable, of } from 'rxjs';
import { AgendaFaturamentoModel } from './agendaFaturamento.model';
import { ResponseUpload, ResponseRegistrosInvalidos, agendaFaturamentoResponseSuspender } from '..';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import { AgendaSuspensaoPost } from './AgendaSuspensaoPost.model';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';


@Injectable({
    providedIn: 'root'
})
export class AgendaFaturamentoService {

    constructor(
        private _httpClient: HttpClient,
        private _http : Http,
        private validator: ValidatorHelper) { }

    exportarPlanilhaCSV(filtro?: string): Promise<boolean>{
        let excelName = 'Agenda_Faturamento_template';
        let headersName = new Headers({
            'Accept': 'application/csv'
        });
        return new Promise( (resolve) => {
            return this._http.get(ServicePath.HTTP_EXPORT_AGENDA_FATURAMENTO_TEMPLATE, { headers: headersName })
            .toPromise()
            .then(res => {
                if (res && res["_body"]) {
                    this.downloadFile(res["_body"], excelName);
                    resolve(true);
                }
            })
            .catch((ex) => {
                this.handleError(ex);
                resolve(false);
            });
        });

    }

    exportarGrid(filtroPesquisa: string): Promise<Boolean>{
        let excelName = 'Agenda_Faturamento';
        let headers = new Headers({
          'Content-Type': 'text/csv'
        });
        return new Promise((resolve) => {
            this._http.get(ServicePath.HTTP_EXPORT_AGENDA_FATURAMENTO +"?"+filtroPesquisa, { headers: headers })
                .toPromise()
                .then(res => {
              
                if(res && res["_body"]){
                    this.downloadFile(res["_body"], excelName);

                    Swal.fire({
                        title: "Download Concluído com sucesso!",
                        text: 'Por favor, verifique seus downloads para abrir a exportação.',
                        icon: 'success',
                        confirmButtonText: 'Ok, obrigado',
                        customClass: {confirmButton: 'setBackgroundColor'}
                      });
                    resolve(true);
                }
              })
            .catch((error) => {
                resolve(false);
                this.handleError(error);

                const json = JSON.parse(error['_body']);
           
                let msg = '';
                json.forEach(x => {
                    msg += '<p>'+ x.message +'</p>';
                })
                Swal.fire({
                    title: "Oopps!",
                    html: msg,
                    icon: 'warning',
                    confirmButtonText: 'Ok, obrigado',
                    customClass: {confirmButton: 'setBackgroundColor'}
                  });
            });
        });
    }


    downloadFile(data, excelFileName){
        let blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
          dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", excelFileName+EXCEL_EXTENSION);
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
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

    // CONSULTA API PARA RECEBER SITUAÇÃO DE FATURAMENTOS PARA OS (CD'S || FILIAIS || PRODUTOS)
    consultarStatusDeFaturamentos(parametrosParaConsulta): Observable<AgendaFaturamentoModel[]> {
        // tslint:disable-next-line: max-line-length
        return this._httpClient.get<AgendaFaturamentoModel[]>(ServicePath.HTTP_URL_SUSPENDER_AGENDA_FATURAMENTO_CONSULTAR + parametrosParaConsulta);
    }

     // SUSPENDER FATURAMENTOS PARA OS (CD'S || FILIAIS || PRODUTOS)
     // TEMPORARIAMENTE DESABILITADO DEVIDO AS ALTERAÇÕES EMERGENCIAS EM 22/07/2020
     /*suspenderAgendaDeFaturamentos(raw: AgendaSuspensaoPost): Observable<agendaFaturamentoResponseSuspender[]> {
        // tslint:disable-next-line: max-line-length
        return this._httpClient.post<agendaFaturamentoResponseSuspender[]>(ServicePath.HTTP_SUSPENDER_AGENDA_FATURAMENTO, raw);
    }*/

    uploadExcel(file: FormData): Observable<ResponseUpload>{
        const httpHeader: HttpHeaders = new HttpHeaders()
                    .set('Accept', 'application/json');

         return this._httpClient.post<ResponseUpload>(ServicePath.HTTP_IMPORTAR_AGENDA_FATURAMENTO, file, { headers : httpHeader});
    }

    exportarComFalha(response: ResponseUpload){
        //Create workbook and worksheet
        let excelFileName = 'agenda_faturamento';
         const Excel = require('./../../../../../node_modules/exceljs');
         let workbook = new Excel.Workbook();
         let worksheet = workbook.addWorksheet('conteudo');

         // const headerFalha = ["linha","Cód. Filial", "Cód. Produto","Data Inicial", "Data Final", "Cód. Motivo","Erros:"];
         const headerFalha = ['linha', 'Cód. Filial', 'Data Inicial', 'Data Final', 'Cód. Motivo', 'Erros:'];

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

         excelFileName += '_ERROS';
         let jsonFail: ResponseRegistrosInvalidos[] = response.registrosInvalidos;
         jsonFail.sort(x => x.nrLinha);
         jsonFail.forEach((element) =>{
           let eachRow = [];
           const linha: string[] = element.linha.split(';');
         
           eachRow.push(element.nrLinha);
           eachRow.push(linha[0]);
           eachRow.push(linha[1]);
           eachRow.push(linha[2]===null ? '' : linha[2]);
           eachRow.push(linha[3]===null ? '' : linha[3]);
           element.violations.forEach(vio => {
            if (vio != null) {
                    eachRow.push(vio.fieldName + ':' + vio.message);
                }
           });

           worksheet.addRow(eachRow);
         });
         worksheet.getColumn(3).width = 15;
         worksheet.getColumn(4).width = 15;
         worksheet.getColumn(5).width = 20;
         worksheet.getColumn(6).width = 20;
         worksheet.getColumn(7).width = 20;
         worksheet.addRow([]);
         //Generate Excel File with given name
         workbook.xlsx.writeBuffer().then((data) => {
           let blob = new Blob([data], { type: EXCEL_TYPE });
           FileSaver.saveAs(blob, excelFileName + EXCEL_EXTENSION);
         });
       }
}
