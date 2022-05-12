import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FornecedorModel } from './fornecedor.model';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {
  // api = environment.api_itim;

  fornecedores: BehaviorSubject<any> = new BehaviorSubject([]);
  $fornecedorSelecionado: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private _httpClient: HttpClient, private loadService: LoadingService) { }

  getFornecedores() {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/fornecedor/cd');
  }
  /**
   * @param  {number[]} list
   */
  getFornecedoresByCds(params: HttpParams) {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/fornecedores/cd', { params: params });
  }

  getTipoPedidoCompra() {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/pedidoCompra');
  }

  getPadraoAbastecimento() {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/padraoAbastecimento');
  }

  getAllRotasByCD(cd: string) {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/rota/' + cd);
  }

  limpar(){
    this.$fornecedorSelecionado.next([]);
  }

  
  reset(){
    this.fornecedores.next([]);
  }
  
  buscarTodosFornecedoresPorCds(params: HttpParams): Observable<FornecedorModel[]> {
    this.limpar();
    this.loadService.carregar();
    return  this._httpClient.get<FornecedorModel[]>(ServicePath.base_url + 'rd-interface-itim/v1/fornecedores', 
      { params: params }).pipe(
        tap(response => {
          this.fornecedores.next(response);
          this.loadService.parar();
      }, (error) => {
        this.limpar();
        this.loadService.parar();
      }));
  }

  get selecionados(){
    return this.$fornecedorSelecionado.value;
  }

}
