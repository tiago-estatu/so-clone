import { LoadingService } from './../loading/loading.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject , of } from 'rxjs';
import { tap } from 'rxjs/operators';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.csv';
import { ServicePath } from '../../const';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Headers, Http } from '@angular/http';
import { ResponseUpload, ResponseRegistrosInvalidos, MinimoMaximoModel, MinimoMaximoPageableModel } from '../classes';
import { SalvarMinimoMaximoModel } from '../classes/minimo-maximo/SalvarMinimoMaximo.model';
import { UtilsHelper } from '../../helpers';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class MinimoMaximoService {
  // api = environment.api_itim;
  constructor(
    private _httpClient: HttpClient,
    private _http : Http,
    private _utils: UtilsHelper,
    private loadService: LoadingService
    ) { }
  excelFileName = '';

  exportarRelatorio(params: HttpParams): Observable<any> {
    return this._httpClient.get<any>(ServicePath.HTTP_URL_MINIMO_MAXIMO_RELATORIO, {params: params});
  }
  gravarMinimoMaximo(raw: SalvarMinimoMaximoModel): Observable<SalvarMinimoMaximoModel>{
    return this._httpClient.post<SalvarMinimoMaximoModel>(ServicePath.HTTP_ADICIONA_ESTOQUE_MINIMO_MAXIMO, raw);
  }

  atualizarMinimoMaximo(raw: SalvarMinimoMaximoModel): Observable<SalvarMinimoMaximoModel>{
    return this._httpClient.put<SalvarMinimoMaximoModel>(ServicePath.HTTP_ATUALIZA_ESTOQUE_MINIMO_MAXIMO, raw);
  }

  buscarTodos(filtro: HttpParams): Observable<MinimoMaximoPageableModel> {
    return this._httpClient.get<MinimoMaximoPageableModel>(ServicePath.HTTP_URL_ESTOQUE_MINIMO_MAXIMO, {params: filtro});
  }

  exportarPlanilhaCSV(filtro?: string){
    this.excelFileName = 'Estoque_minimo_maximo_template';
    let headers = new Headers({
      'Accept': 'application/csv'
  });
  return this._http.get(ServicePath.HTTP_EXPORT_ESTOQUE_MINIMO_MAXIMO_TEMPLATE, { headers: headers})
      .toPromise()
      .then(res => {
          if(res && res["_body"]){
              this.downloadFile(res["_body"], this.excelFileName);
          }
      })
      .catch(this.handleError);
}


handleError(error){
  this.loadService.parar()

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
    dwldLink.setAttribute("download", excelFileName+".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
}

  exportarGrid(parametros: HttpParams){
    this.loadService.carregar()
    return this._httpClient.get<any>(ServicePath.HTTP_EXPORT_ESTOQUE_MINIMO_MAXIMO_GRID + '?'+parametros.toString()).subscribe(data =>{
      this.showSwal(data.type, data.mensagem , 'success');
      this.loadService.parar()
    }, err => {
      this.loadService.parar()
      this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível prosseguir com a solicitação. Verifique a sua conexão e tente novamente.', 'error')
    })
}

  uploadExcel(file: FormData): Observable<any> {
    const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
    return this._httpClient.post<any>(ServicePath.HTTP_URL_MINIMO_MAXIMO_UPLOAD, file, { headers : httpHeader});
  }

  exportarComFalha(response: ResponseUpload){
    //Create workbook and worksheet
    this.excelFileName = 'Estoque_minimo_maximo';
     const Excel = require('./../../../../../node_modules/exceljs');
     let workbook = new Excel.Workbook();
     let worksheet = workbook.addWorksheet('conteudo');
     //Add Header Row
     const headerFalha = ["linha","Cód. Filial", "Cód. Produto","Qt. Minima"," Qt. Maximo", "Erros:"];

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
     this.excelFileName += '_ERROS';
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
       FileSaver.saveAs(blob, this.excelFileName + EXCEL_EXTENSION);
     });
   }

  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);
  
  limpar() {
    this.$selecionados.next([]);
  }

  getMotivoMinimoMaximo() {
    this.loadService.carregar()
    return this._httpClient.get<any[]>(ServicePath.HTTP_URL_ESTOQUE_MINIMO_MAXIMO_MOTIVOS).pipe(
        tap(
            data => this.loadService.parar(),
            err => {
                // this.showSwal('Ops!', err.error && err.error.message ? err.error.message : 'Não foi possível obter os motivos das travas de estoque. Verifique a sua conexão e tente novamente.', 'error')
                this.loadService.parar()
            }
        )
    )
  }

 get selecionados(){
    return this.$selecionados.value;
  }
 // MODAL PARA MENSAGENS
 showSwal(title: string, text: any, icone: any) {
  Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
}



}
