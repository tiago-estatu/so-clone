import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import { LojaEspelhoModel, LojaEspelhoPostModel, ValidaLojaModel } from './loja-espelho.model';
import { UploadHelper } from '../../helpers/upload.helper';
import { ServicePath } from '../../const/ServicePath';
import { ResponseUpload } from '../classes/ResponseUpload';
import { tap } from 'rxjs/internal/operators/tap';
import Swal, { SweetAlertOptions } from 'sweetalert2';


export interface ILojaEspelhoService{

  /**
   * @param  {number} storeId
   * @returns Observable
   */
  getMirrorByStoreId(storeId: number): Observable<any>;
  /**
   * @param  {LojaEspelhoPostModel} json
   * @returns Observable
   */
  updateStoreMirror(json: LojaEspelhoPostModel): Observable<any>;
  exportarModeloCSV();

  import(file: any);

  /**
   * @param  {number} storeId
   * @returns Observable
   */
  validateSemDemanda(storeId: number): Observable<ValidaLojaModel>;

  validateNovoEspelho(storeId: number): Observable<ValidaLojaModel>;

}

@Injectable({
  providedIn: 'root'
})

export class LojaEspelhoService implements ILojaEspelhoService{
  urlPaths = {
    cadastro: '',
    validateMirror: '/',
    validateNewMirror: '/espelho/',
    upload: '/upload',
    export: '/export/template',
    findMirror: '/busca/',
  };

  upload: UploadHelper = new UploadHelper({
    fileName: 'LOJA_ESPELHO_',
    format: 'csv',
    columns: ['COD FILIAL', 'COD FILIAL ESPELHO']
  });
  constructor(private _http: HttpClient) {
   
  }
  validateNovoEspelho(storeId: number): Observable<ValidaLojaModel> {
    return this._http.get<ValidaLojaModel>(ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.validateNewMirror + storeId);
  }
  getMirrorByStoreId(storeId: number): Observable<LojaEspelhoModel> {
    return this._http.get<LojaEspelhoModel>(ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.findMirror + storeId);
  }
  updateStoreMirror(json: LojaEspelhoPostModel): Observable<any> {
    return this._http.post(ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.cadastro, json);
  }
  async exportarModeloCSV() {
    let excelName = this.upload.fileConfig.fileName + 'template';
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'text/plain, */*',
        'Content-Type': 'application/json'
      }),
      responseType: 'text' as 'json'
    };
      return this._http.get<string>( ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.export, httpOptions)
          .toPromise()
          .then(res => {
            if (!!res) {
              this.upload.downloadFile(res, excelName);
              return res;
            }else {
              throw new Error('arquivo invalido')
            }
          })
          .catch((ex) => {
            if (typeof(ex.error) == 'string') ex.error = JSON.parse(ex.error)

            let options: SweetAlertOptions = {
              title: 'Oops',
              html: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
              icon: 'warning',
              confirmButtonText: 'Ok Fechar',
              customClass: {confirmButton: 'setBackgroundColor'}
            };
            Swal.fire(options);
            return ex;
          });
  }
  import(file: any) {

    let raw: FormData = new FormData();
    raw.append("file", file || '');
    raw.append('cdOperador', localStorage.getItem('cdOperador'));

    const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
    return this._http.post<ResponseUpload>(
        ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.upload,
        raw,
        {headers: httpHeader}
        ).pipe(tap(data => {this.upload.importFileHandler(data)}, err => {this.upload.importError(err)}))
  }
  
  validateSemDemanda(storeId: number): Observable<ValidaLojaModel> {
    return this._http.get<ValidaLojaModel>(ServicePath.HTTP_LOJA_ESPELHO + this.urlPaths.validateMirror + storeId);
  }
}
