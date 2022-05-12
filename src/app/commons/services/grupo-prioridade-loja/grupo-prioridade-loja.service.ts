import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { throwError, concat, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PrioridadeLojaModel } from './grupoPrioridadeLoja.model';



@Injectable({
  providedIn: 'root'
})
export class GrupoPrioridadeLojaService {
  constructor(
              private _httpClient: HttpClient
              ) { }


  getGrupoPrioridadeDeLoja(): Observable<PrioridadeLojaModel[]> {
        const dropListGruposHardCode = [] = [
            {
                'cdGrupo': 0,
                'dsGrupo' : 'Sem Grupo'
            },
            {
                'cdGrupo': 1,
                'dsGrupo' : 'Grupo 1'
            },
            {
                'cdGrupo': 2,
                'dsGrupo' : 'Grupo 2'
            },
            {
                'cdGrupo': 3,
                'dsGrupo' : 'Grupo 3'
            },
            {
                'cdGrupo': 4,
                'dsGrupo' : 'Grupo 4'
            },
            {
                'cdGrupo': 5,
                'dsGrupo' : 'Grupo 5'
            },
            {
                'cdGrupo': 6,
                'dsGrupo' : 'Grupo 6'
            }
        ];

        return of(dropListGruposHardCode);
    }

}
