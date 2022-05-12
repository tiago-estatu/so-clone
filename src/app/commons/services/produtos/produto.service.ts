import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Produto } from '../classes/Produto';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ServicePath } from '../../const';
import { tap, map } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';

@Injectable()
export class ProdutoService {

  produtos: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);
  $selecionadosProduto: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor( private _http: HttpClient, private _loader: LoadingService) { }

  getAllProdutosVenda(): Observable<Produto[]> {
    return this._http.get<Produto[]>(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/produto');
  }

  getProdutoByIdVenda(id): Observable<Produto> {
    this.$selecionadosProduto = id
    this._loader.carregar();
      let defaultEndpoint = ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/produto/';
      return this._http.get<Produto>( defaultEndpoint + id).pipe(
        tap(response => {
        this.produtos.next(response);
        this._loader.parar();
    }, (error) => {
      this._loader.parar();
    }));;
  }

  getProdutoContainsNome(nome: string): Observable<Produto[]> {
    this._loader.carregar();
    return this._http.get<Produto[]>(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/produto/nome/' + nome).
      pipe(
        tap(response => {
        this.produtos.next(response);
        this._loader.parar();
    }, (error) => {
      this._loader.parar();
    }));;
  };

  getAllProdutosByCdFilial(cd, filiais) {
    return this._http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/cd/' + cd + '/filiais/' + filiais);
  }

  getAllProdutosByCdFornecedor(cds, fornecedores) {
    return this._http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/cd/' + cds + '/fornecedor/' + fornecedores);
  }

  reset() {
    this.produtos.next([])
    this.$selecionados.next([]);
  }

  limpar() {
    this.reset()
  }

  get selecionados(){
    return this.$selecionados.value;
  }

  get selecionadosProduto() {
    return this.$selecionadosProduto
  }
}
