import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalizacaoCdFilial } from '../classes/LocalizacaoCdFilial';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { ServicePath } from '../../const';
import { tap, map } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';

@Injectable()
export class LocalizacaoFilialCdService { 

  localizacao: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor( private _http: HttpClient, private _loader: LoadingService) { }

  cdOperador = localStorage.getItem("cdOperador");


  getAllLocalizacaoVenda(): Observable<LocalizacaoCdFilial[]> {
    return this._http.get<LocalizacaoCdFilial[]>(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/produto');
  }

  getLocalizacaoByIdVenda(id): Observable<LocalizacaoCdFilial> {
    const httpHeader: HttpHeaders = new HttpHeaders()
    .append('Authorization', this.cdOperador)
    .append('accept', 'application/json')
    let _id = parseInt(id);
    this._loader.carregar();
    this.$selecionados = id;
      let defaultEndpoint = ServicePath.HTTP_URL_LOCALIZACAO + '/localizacao/';
      return this._http.get<LocalizacaoCdFilial>( defaultEndpoint + _id , { headers: httpHeader}).pipe(
        tap(response => {
        this.localizacao.next(response);
        this._loader.parar();
    }, (error) => {
      this._loader.parar();
   
    }));;
    
  }

  getLocalizacaoContainsNome(nome: string): Observable<LocalizacaoCdFilial[]> {
    this._loader.carregar();
    return this._http.get<LocalizacaoCdFilial[]>(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/produto/nome/' + nome).
      pipe(
        tap(response => {
        this.localizacao.next(response);
        this._loader.parar();
    }, (error) => {
      this._loader.parar();
    }));;
  };

  getAllLocalizacaoByCdFilial(cd, filiais) {
    return this._http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/cd/' + cd + '/filiais/' + filiais);
  }

  getAllLocalizacaoByCdFornecedor(cds, fornecedores) {
    return this._http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/cd/' + cds + '/fornecedor/' + fornecedores);
  }

  reset() {
    this.localizacao.next([])
    this.$selecionados.next([]);
  }

  limpar() {
    this.reset()
  }

  get selecionados(){
    return this.$selecionados;
  }
  get localizacaoSelecionada(){
    return this.localizacao;
  }
}
