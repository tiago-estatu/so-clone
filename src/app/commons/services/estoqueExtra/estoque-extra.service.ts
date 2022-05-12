import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEstoqueExtra } from '../classes/IEstoqueExtra';
import { ParametroEstoqueExtra } from 'src/app/estoqueExtra/consulta/parametroEstoqueExtra';
import { ResponseDTO } from '../classes/ResponseDTO';
import * as FileSaver from 'file-saver';
import { ServicePath } from '../../const';
import Swal from 'sweetalert2';
import { Http } from '@angular/http';
import { UtilsHelper, ValidatorHelper } from '../../helpers';
import { ResponseUpload } from '../classes/ResponseUpload';
import { ResponseRegistrosInvalidos } from '../classes/AgendaSuspensa/ResponseRegistrosInvalidos';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';

export interface IEstoqueExtraSharedService {
    exportarModeloCSV(): Promise<boolean>;
    exportarComFalha(response: ResponseUpload): void;
    uploadExcel(raw: FormData): Observable<ResponseUpload>;
    getEstoquePorFiltros(filtro: string): Observable<any>;
}


@Injectable({
  providedIn: 'root'
})
export class EstoqueExtraService {

  excelFileName: string = 'Gestao_estoque_extra';
  component: string = 'estoqueExtra';
  private _subPath = "estoqueExtra";
  estoqueExtraHeaders = [
        "linha","DATA INICIO VIG.*",
    "DATA FIM VIG.*",
    "COD FILIAL*",
    "COD DO PRODUTO*",
    "QUANTIDADE*",
    "% 1 VIGENCIA",
    "% 2 VIGENCIA",
    "% 3 VIGENCIA",
    "% 4 VIGENCIA",
    "COD TIPO*",
    "COD MOTIVO*",
    "Erros:"];
    estoqueLmpmHeaders = [
        "linha","DATA INICIO VIG.*",
        "DATA FIM VIG.*",
        "COD DO PRODUTO*",
        "QUANTIDADE*",
        "% 1 VIGENCIA",
        "% 2 VIGENCIA",
        "% 3 VIGENCIA",
        "% 4 VIGENCIA",
        "COD TIPO*",
        "COD MOTIVO*",
        "Erros:"];
  constructor( private httpClient: HttpClient, private _http: Http,  private _utils: UtilsHelper, private _formatador: ValidatorHelper,) { }

    /**
     * Sets the sub path to comunicate to
     * @example
     *
     * // this will hit the estoqueExtra/wathever api
     * estoqueExtraService.subPath = "estoqueExtra"
     *...
     * // this will hit the estoqueExtra/lmpm/wathever api
     * estoqueExtraService.subPath = "estoqueExtra/lmpm"
     */
    set subPath(value: string) {
        if(this._utils.isEmpty(value)) throw Error('Subpath value cannot be empty');
        if(value.startsWith('/') || value.endsWith('/')) throw Error('Subpath value cannot start or end with /');
        this._subPath = value;
        this.excelFileName = this._subPath !== 'estoqueExtra' ? 'Estoque_extra_lmpm' : this.excelFileName;
    }

    get subPath(): string {
        return this._subPath;
    }

    setCurrentPath(path: string) {
        this.component = path ;
    }

  getEstoquePorFiltros(filters) : Observable<IEstoqueExtra[]>{
    return this.httpClient.get<IEstoqueExtra[]>(`${ServicePath.HTTP_URL_ESTOQUE_EXTRA }/${this._subPath}${filters}`);
  }

  getEstoquePorId(id: number):Observable<IEstoqueExtra[]>{
    return this.httpClient.get<IEstoqueExtra[]>(`${ServicePath.HTTP_URL_ESTOQUE_EXTRA }/${this._subPath}/detalhe/${id}`);
  }

  atualizar(raw: IEstoqueExtra, id){
    return this.httpClient.put( `${ServicePath.HTTP_URL_ESTOQUE_EXTRA}/${this._subPath}/${id}`, raw);
  }

  uploadExcel(file: FormData): Observable<ResponseUpload>{
    const httpHeader: HttpHeaders = new HttpHeaders()
                .set('Accept', 'application/json');
    return this.httpClient.post<ResponseUpload>(`${ServicePath.HTTP_URL_ESTOQUE_EXTRA }/${this._subPath}/upload`, file, { headers : httpHeader});
}

  cadastrarVigencias(raw: ParametroEstoqueExtra): Observable<ResponseDTO>{
    return this.httpClient.post<ResponseDTO>(`${ServicePath.HTTP_URL_ESTOQUE_EXTRA}/${this._subPath}/montar`, raw);
  }
  cadastrarViaModal(raw): Observable<ResponseDTO>{
    return this.httpClient.post<ResponseDTO>(`${ServicePath.HTTP_URL_ESTOQUE_EXTRA}/${this._subPath}/salvar`, raw);
  }



  exportarComFalha(response: ResponseUpload){
    //Create workbook and worksheet
     const Excel = require('./../../../../../node_modules/exceljs');
     let workbook = new Excel.Workbook();
     let worksheet = workbook.addWorksheet('conteudo');

     // TODO VALIDAR SE OS MESMOS CAMPOS APLICAM
     const headerFalha = this.subPath === 'estoqueExtra' ? this.estoqueExtraHeaders : this.estoqueLmpmHeaders;

     let headerRow;
     headerRow = worksheet.addRow(headerFalha);

     headerRow.eachCell((cell, number) => {

       cell.fill = {
         type: 'pattern',
         pattern: 'solid',
         fgColor: { argb: 'FFFFFF00' },
         bgColor: { argb: 'FF0000FF' }
       };
       cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
     });

     let nomeExcel = this.excelFileName + '_ERROS';
     let jsonFail: ResponseRegistrosInvalidos[] = response.registrosInvalidos;
     jsonFail.sort(x => x.nrLinha);
     jsonFail.forEach((element) =>{
       let eachRow = [];
       const linha: string[] = element.linha.split(';').slice(0, this._subPath == 'estoqueExtra' ? 11 : 10);
       eachRow.push(element.nrLinha);
       eachRow = linha.reduce((prev, curr, idx) => {prev.push(curr || ''); return prev}, eachRow);
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
       FileSaver.saveAs(blob, nomeExcel + '.xlsx');
     });
   }

  exportarModeloCSV(): Promise<boolean>{
    let excelName = this.excelFileName + ' _template';
    let headersName = new Headers({
        'Accept': 'application/csv'
    });
    return new Promise( (resolve) => {
        return this._http.get(this.subPath === 'estoqueExtra' ? ServicePath.HTTP_EXPORT_ESTOQUE_EXTRA_TEMPLATE : ServicePath.HTTP_EXPORT_ESTOQUE_EXTRA_LMPM_TEMPLATE)
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
}
