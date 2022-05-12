import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ValidatorHelper } from '../../helpers/validator.helper';
import { Observable } from 'rxjs';
import { ServicePath } from '../../const';
import { ResultDataRegiaoMacro } from '.';

@Injectable({
  providedIn: 'root'
})
export class RegiaoMacroService {

  constructor( private http: HttpClient,
               private validator: ValidatorHelper ) { }

  buscarRegioes(params: HttpParams): Observable<ResultDataRegiaoMacro> {
    if(params.has('cdRegional')){
      return this.http.get<ResultDataRegiaoMacro>(ServicePath.HTTP_URL_REGIAO_MACRO, { params: params});
    }else{
      return this.http.get<ResultDataRegiaoMacro>(ServicePath.HTTP_URL_REGIAO_MACRO);
    }
   
  }

}
