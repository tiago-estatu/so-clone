import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { Produto, ResponseUpload } from "../classes";
import { ServicePath } from "../../const";
import { UploadHelper } from "../../helpers/upload.helper";
import Swal, { SweetAlertIcon, SweetAlertOptions } from "sweetalert2";
import { map, switchMap, tap } from "rxjs/operators";
import { ProdutoEspelhoModel } from "../../models/produto-espelho.model";

class ProdutoEspelhoResponse { cdProduto: number; cdProdutoEspelhoAnterior: number; cdProdutoEspelho?: number }
export interface IProdutoEspelhoService {

  /**
   * @param  {number} productId
   * @returns Observable
   */
  getMirrorByLinkedId(productId: number): Observable<any>;
  /**
   * @param  {ProdutoEspelhoModel} product
   * @returns Observable
   */
  updateProduct(product: ProdutoEspelhoModel): Observable<any>;
  exportarModeloCSV();
  /**
   * @param  {any} file
   */
  importProduct(file: any);

  /**
   * @param  {number} productId
   * @returns Observable
   */
  validateMirror(productId: number): Observable<Produto | null>;

}

@Injectable({
  providedIn: 'root'
})

export class ProdutoEspelhoService implements IProdutoEspelhoService {

  urlPaths = {
    cadastro: '',
    findById: '/',
    upload: '/upload',
    export: '/export/template',
    busca: '/busca/'
  };

  upload: UploadHelper = new UploadHelper({
    fileName: 'PRODUTO_ESPELHO_',
    format: 'csv',
    columns: ['COD PRODUTO SEM DEMANDA', 'COD PRODUTO ESPELHO']
  });

  constructor(private http: HttpClient) {
  }


  // CONFIGURAÇÕES DO MODAL
  showModalConfig(title?: string, msgContent?: string, typeIcon?: any , confirmButtonText?: any) {
    let options = { confirmButtonText: confirmButtonText || 'Ok, Obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
    let message = { title: title || 'Oops!', html: msgContent || 'Não foi possível realizar a ação, tente mais tarde', icon: typeIcon || 'warning', };
    Swal.fire({ ...options, ...message })
  }


  validateMirror(productId: number): Observable<Produto | null> {
    return this.http.get<any>(ServicePath.HTTP_URL_PRODUTO_ESPELHO + this.urlPaths.findById + productId)
      .pipe(
        //map to a produto model or send null
        map(response => {
          let errMessage = 'Não foi possível realizar a pesquisa do produto. Tente novamente mais tarde.';
          let errorConfig = { status: 500, error: { mensagem: errMessage } };
          if (!response || !response.cdProduto) throw new HttpErrorResponse(errorConfig);
          return { cdProduto: response.cdProduto, dsProduto: response.dsProduto }
        })
      );
  }


  getMirrorByLinkedId(productId: number): Observable<any> {
    return this.validateMirror(productId).pipe(
      switchMap(data => {
        return this.http.get<any>(ServicePath.HTTP_URL_PRODUTO_ESPELHO + this.urlPaths.busca + productId)
          .pipe(
            //map to a produto model or send null
            map(response => {
              return (!!response ? { cdProduto: response.cdProdutoEspelho, dsProduto: response.dsProdutoEspelho } : null)
            })
          );
      })
    );
  }


  updateProduct(product: ProdutoEspelhoModel): Observable<any> {
    let operador = Number(localStorage.getItem('cdOperador'));
    if (!operador) return throwError(new HttpErrorResponse({ status: 400, error: { mensagem: 'Operador não definido' } }));
    return this.http.post(ServicePath.HTTP_URL_PRODUTO_ESPELHO + this.urlPaths.cadastro, product.request(operador))
  }

  importProduct(file: any) {
    let raw: FormData = new FormData();
    raw.append("file", file || '');
    raw.append('cdOperador', localStorage.getItem('cdOperador'));

    const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');
    return this.http.post<ResponseUpload>(
      ServicePath.HTTP_URL_PRODUTO_ESPELHO + this.urlPaths.upload,
      raw,
      { headers: httpHeader }
    ).pipe(tap(data => {
      this.showModalConfig(`${data.type}`, `${data.mensagem}`, 'success');

    }, err => {
      this.showModalConfig('Oops!', `Erro: ${err.message || 'sem log de erro'}`, 'warning' , 'Ok, fechar ');
    }))
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
    return this.http.get<string>(ServicePath.HTTP_URL_PRODUTO_ESPELHO + this.urlPaths.export, httpOptions)
      .toPromise()
      .then(res => {
        if (!!res) {
          this.upload.downloadFile(res, excelName);
          return res;
        } else {
          throw new Error('arquivo invalido')
        }
      })
      .catch((ex) => {
        if (typeof (ex.error) == 'string') ex.error = JSON.parse(ex.error);

        let options: SweetAlertOptions = {
          title: 'Oops',
          html: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
          icon: 'warning',
          confirmButtonText: 'Ok Fechar',
          customClass: { confirmButton: 'setBackgroundColor' }
        };
        Swal.fire(options);
        return ex;
      });
  }


}
