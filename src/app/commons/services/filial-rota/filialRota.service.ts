import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { throwError, concat, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FilialRotaModel } from './filialRota.model';
import { tap } from 'rxjs/operators';
import { LoadingService } from '..';

@Injectable({
  providedIn: 'root'
})
export class FilialRotaService {
  dataSource: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);
  constructor(private _httpClient: HttpClient, private loadService: LoadingService ) { }
 
  reset(){
    this.$selecionados.next([]);
    this.dataSource.next([]);

  }

  getFilialRota(params: HttpParams): Observable<FilialRotaModel[]> {
    return this._httpClient.get<FilialRotaModel[]>(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/filialRota', {params: params}).pipe(
      tap(response => {
        this.dataSource.next(response);
        this.loadService.parar();
    }, (error) => {
      this.reset();
      this.loadService.parar();
    }));
  }

  getAllRotasByCD(cd: string) {
    return this._httpClient.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/rota/' + cd).pipe(
      tap(response => {
        this.dataSource.next(response);
        this.loadService.parar();
    }, (error) => {
      this.reset();
      this.loadService.parar();
    }));
  }

}
