import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServicePath } from '../../const';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';


import { LoadingService } from '../loading/loading.service';
import { BehaviorSubject, of } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class SetorCdService {

  setorCD: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private _httpClient: HttpClient, private loadService: LoadingService) { }

  limpar() {
    this.$selecionados.next([]);
  }

  reset() {
    // this.$selecionados.next([]);
    this.setorCD.next([]);
  }

  // getAllSetorByCD(cdRegional: HttpParams) {
  //   return this._httpClient.get(ServicePath.HTTP_CADASTRO_PARAMETRO_INTERFACE + 'setoresCd?' + cdRegional );
  // }

  buscarTodosSetoresPorCds(cdRegional: HttpParams): Observable<any[]> {
    this.limpar();
    this.loadService.carregar();
    return this._httpClient.get<any[]>(ServicePath.HTTP_CADASTRO_PARAMETRO_INTERFACE + 'setoresCd?' + cdRegional).pipe(
        tap(response => {
          this.setorCD.next(response);
          this.loadService.parar();
        }, (error) => {
          this.limpar();
          this.loadService.parar();
        }));
  }

  get selecionados(){
    return this.$selecionados.value;
  }








}
