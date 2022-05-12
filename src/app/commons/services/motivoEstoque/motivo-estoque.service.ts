import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicePath } from '../../const';

@Injectable({
  providedIn: 'root'
})
export class MotivoEstoqueService {

  constructor( private http: HttpClient) { }

  getAllMotivo(path: string = 'motivoEstoqueExtra'){
    return this.http.get(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/' + path);
  }

  getMotivoById(id) {
    return this.http.get(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/motivoEstoqueExtra/id/' + id);
  }

}
