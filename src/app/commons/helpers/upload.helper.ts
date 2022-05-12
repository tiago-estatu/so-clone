import {ResponseRegistrosInvalidos, ResponseUpload} from "../services/classes";
import Swal, {SweetAlertIcon, SweetAlertOptions} from "sweetalert2";
import * as FileSaver from "file-saver";
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';

export class UploadHelper {

    static DEFAULT_MESSAGE = 'Não foi possível subir o arquivo, por favor, verifique sua conexão e tente novamente mais tarde.';

    fileConfig: {fileName: string, format: string, columns: string[], errorFirst?: boolean};

    swalBaseOptions = {
        confirmButtonText: 'Ok, obrigado',
        customClass: {confirmButton: 'setBackgroundColor'},
        icon: 'warning'
    };

    /**
     * @param (fileConfig: {fileName: string, format: string, columns: string[], errorFirst?:boolean}
     */
    constructor(fileConfig: {fileName: string, format: string, columns: string[], errorFirst?:boolean}) {
        this.fileConfig = fileConfig
    }

    /**
     * @param err
     */
    importError(err: any) {

        let options: SweetAlertOptions = {...this.swalBaseOptions, title: 'Oops!', text: err.error.mensagem || UploadHelper.DEFAULT_MESSAGE, icon: 'warning'};

        Swal.fire(options);
    }
    /**
     * @param  {ResponseUpload} response
     */
    importFileHandler(response: ResponseUpload) {

        let messages: { title: string, compare: boolean, icon: SweetAlertIcon }[] = [
            {title: 'Oops!', compare: !response, icon: 'error'},
            {
                title: 'Importação concluída! Mas...',
                compare: response.qtTotalRegistroComErro > 0,
                icon: 'warning'
            },
            {title: 'Cadastradas com Sucesso!', compare: response.qtTotalRegistroComErro == 0, icon: 'success'},
        ];

        let downloadConfig = response.qtTotalRegistroComErro > 0 ? {
            showCancelButton: true,
            confirmButtonText: 'Realizar download!',
            cancelButtonText: 'Não'} : {};
        let {compare, ...extraOptions} = {...messages.find(m => m.compare === true)};
        let body = {html: this.importAlertContent(response, !!downloadConfig.showCancelButton)};
        let options = {...this.swalBaseOptions, ...extraOptions, ...body, ...downloadConfig};
        Swal.fire(options).then((val) => {
            if(downloadConfig.showCancelButton == true && val.value === true) {
                this.exportarComFalha(response);
            }
        });
    }

    /**
     * @param  {ResponseUpload} response
     * @param  {boolean=false} showErrors
     * @returns string
     */
    importAlertContent(response: ResponseUpload, showErrors: boolean = false): string {
        if (!response) return 'Por favor, <strong>valide</strong> o modelo de excel para importar.';

        let processed: any | any[] = [
            {prefix: 'Foram realizados', value: response.qtTotalRegistrosNovos, suffix: 'novos cadastros'},
            {prefix: 'Foram alterados', value: response.qtTotalRegistrosAlterados, suffix: ''},
            {
                prefix: `${response.qtTotalRegistros == response.qtTotalRegistroComErro ? 'Não' : 'E não'} conseguimos realizar`,
                value: response.qtTotalRegistroComErro,
                suffix: ''
            }
        ];

        processed = processed
            .filter((row, idx) => showErrors ? true : (idx + 1 !== processed.length))
            .map(row => {
                return row.value > 0
                    ?
                    `<tr><td> ${row.prefix} <strong>${row.value}</strong> ${row.suffix || 'cadastros'}.</td></tr>`
                    :
                    '';
            })
            .reduce((prev, current) => {
                return prev + current
            }, '');

        return `
                  <table>
                  <tr><td> De <strong>${response.qtTotalRegistros}</strong> registros.</tr></td>
                  ${processed}
                  ${showErrors ? '<tr><td>Deseja realizar o download dos erros?</td></tr>' : ''}
                  </table>
                `;
    }

    exportarComFalha(response: ResponseUpload){
        //Create workbook and worksheet
        const Excel = require('./../../../../node_modules/exceljs');
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('conteudo');
        //Add Header Row

        let headerRow;
        let columns = this.fileConfig.errorFirst ? ['Erros', 'Linha', ...this.fileConfig.columns] : ['Linha', ...this.fileConfig.columns, 'Erros'];
        headerRow = worksheet.addRow(columns);
        headerRow.eachCell((cell, number) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF00' },
                bgColor: { argb: 'FF0000FF' }
            };
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        });
        // Add Data and Conditional Formatting
        let excelFileName = `${this.fileConfig.fileName}_ERROS`;
        let jsonFail: ResponseRegistrosInvalidos[] = response.registrosInvalidos;
        jsonFail.sort(x => x.nrLinha);
        jsonFail.forEach((element) =>{
            let eachRow = [];
            const linha: string[] = element.linha.split(';').slice(0, columns.length);
            // linha.unshift(element.nrLinha.toString());
            eachRow = linha.filter(item => !!item || item !== '');
            eachRow[this.fileConfig.errorFirst ? 'unshift':'push'](element.violations.reduce((p,c) => p + '\n' + `${c.fieldName} : ${c.message}`, ''));

            /*element.violations.forEach(vio => {
                if (vio != null) {
                    eachRow[this.fileConfig.errorFirst ? 'unshift' : 'push'](vio.fieldName + ':' + vio.message);
                }
            });*/

            worksheet.addRow(eachRow);
        });
        this.fileConfig.columns.map((item, idx) => {
            let maxWidth = worksheet.getColumn(idx+1).values.reduce((prev,curr) => prev.length > curr.length ? prev : curr, '');
            let columnSize = maxWidth.length > item.length ? maxWidth.length : item.length;
            columnSize *= 1.20;
            columnSize = columnSize > 5 ? columnSize : 5;
            columnSize = columnSize > 100 ? 100 : columnSize;
            worksheet.getColumn(idx+1) ? worksheet.getColumn(idx+1).width = columnSize : null;
            return item
        });

        worksheet.addRow([]);
        //Generate Excel File with given name
        workbook.xlsx.writeBuffer().then((data) => {
            let blob = new Blob([data], { type: EXCEL_TYPE });
            FileSaver.saveAs(blob, excelFileName + '.' + this.fileConfig.format);
        });
    }

    /**
     * @param  {} data
     * @param  {} excelFileName
     */
    downloadFile(data, excelFileName){
        let blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
        let dwldLink = document.createElement("a");
        let url = URL.createObjectURL(blob);
        let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
        if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
            dwldLink.setAttribute("target", "_blank");
        }
        dwldLink.setAttribute("href", url);
        dwldLink.setAttribute("download", excelFileName+'.csv');
        dwldLink.style.visibility = "hidden";
        document.body.appendChild(dwldLink);
        dwldLink.click();
        document.body.removeChild(dwldLink);
    }
  /**
     * @param  {} data
     * @param  {} excelFileName
     * @param  String dtInicio
     * @param  String dtFim
     */
   downloadFileWithDates(data, excelFileName, dtInicio, dtFim){
    let blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", excelFileName+dtInicio+'-'+dtFim +'.csv');
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
}
}
