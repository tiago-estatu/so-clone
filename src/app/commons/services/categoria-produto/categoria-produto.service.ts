import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { CategoriaProdutoModel } from './categoria-produto.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CategoriaProdutoService {
  // api = environment.api_itim;
  constructor(private _http: HttpClient) { }

  buscarTodasCategoriasProduto(): Observable<CategoriaProdutoModel[]> {
    const _headers: HttpHeaders = new HttpHeaders()
                                  .set('Accept', 'application/json')
                                  .set('Content-type', 'application/json;charset=UTF-8');
    return this._http.get<CategoriaProdutoModel[]>(ServicePath.HTTP_URL_CATEGORIA_PRODUTO, {
      headers: _headers
    });
  }

}
