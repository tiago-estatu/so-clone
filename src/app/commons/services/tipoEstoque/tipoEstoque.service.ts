import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServicePath } from '../../const';

@Injectable({
  providedIn: 'root'
})
export class TipoEstoqueService {
  constructor( private http: HttpClient) { }

  getAllTipo(){
    return this.http.get(ServicePath.HTTP_URL_ESTOQUE_EXTRA + '/tipoEstoqueExtra');
  }

  getTipoById(id) {
    return this.http.get(ServicePath.HTTP_URL_ESTOQUE_EXTRA  + 'tipoEstoqueExtra/id/' + id);
  }
  
}
