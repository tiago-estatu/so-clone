import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { throwError, concat, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ClusterModel } from './cluster.model';



@Injectable({
  providedIn: 'root'
})
export class ClusterService {
  constructor(
              private _httpClient: HttpClient
              ) { }


  getAllCluster(): Observable<ClusterModel[]> {
    let clusters: ClusterModel[] = [{
      cd: 1, descricao: 'Cluster 1'
    },
    { cd: 2, descricao: 'Cluster 2'}];
    return of(clusters);
  }

}
