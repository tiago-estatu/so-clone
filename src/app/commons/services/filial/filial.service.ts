import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServicePath } from '../../const';
import { FilialRegiaoModel } from './FilialRegiaoModel.model';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Filial } from '../classes/Filial';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class FilialService {
  constructor( private http: HttpClient, private loadService: LoadingService) { }

  filiais: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);
  
  reset(){
    this.$selecionados.next([]);
    this.filiais.next([]);
  }
  getAllFilialByCD(cd: string) {
    return this.http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/cd/' + cd + '/filial');
  }

  getAllFilial() {
    return this.http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/filial');
  }

  getAllFilialByRota(rotas: string) {
    return this.http.get(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/filial/rota/' + rotas);
  }

  getAllFilialByCdRegiao(params?: HttpParams): Observable<FilialRegiaoModel[]>{
    // this.loadService.carregar();
    return this.http.get<FilialRegiaoModel[]>(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/listarFiliais', {params: params}).pipe(
      tap(response => {
        response = response.map((item) => ({...item, labelFilial: item.cd_filial + "-" + item.nm_fantasia + (!item.flFaturamento ?  + 'S/F': '' )}))
        this.filiais.next(response);
        this.loadService.parar();
    }, (error) => {
      this.reset();
      this.loadService.parar();
    }));
  }

  getAllFilialByName(nome: string): Observable<Filial[]>{
    return this.http.get<Filial[]>(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/filial/nome/contem/' + nome);
  }

  getFilialByListCode(cdFiliais: string): Observable<Filial[]>{
    return this.http.get<Filial[]>(ServicePath.HTTP_URL_INTERFACE_ITIM + 'v1/filial/ids/' + cdFiliais);
  }

}