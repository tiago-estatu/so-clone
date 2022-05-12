import { Injectable, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { BehaviorSubject } from 'rxjs';
import { CentroDistribuicaoModel } from './CentroDistribuicao.model';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CdService {
  // api = environment.api_itim;
  constructor(private _http: HttpClient, private _loadService: LoadingService) { }
  centroDisbuicoes: BehaviorSubject<CentroDistribuicaoModel[]> = new BehaviorSubject([]);
  $cdSelecionado: BehaviorSubject<number[]> = new BehaviorSubject([]);

  getListCD(cdOperador?: string | number): Observable<CentroDistribuicaoModel[]> {
    this.limpar();
    let query = !!cdOperador ? `&cdOperador=${cdOperador}` : '';
    const URL = `${ServicePath.HTTP_URL_INTERFACE_ITIM}v1/cd${query}`
    return this._http.get<CentroDistribuicaoModel[]>(URL)
      .pipe(
        tap(data => {
          this.centroDisbuicoes.next(data)
          this._loadService.parar();
        },
        (error) => {
          this._loadService.parar();
          this.centroDisbuicoes.next([{cd_regional: 1, nm_cd_regional: 'teste'}])
        }));
  }

  limpar(){
    this.$cdSelecionado.next([]);
  }

  get selecionados(){
    return this.$cdSelecionado.value;
  }
}
