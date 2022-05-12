import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})

export class FabricanteService {
  fabricantes: BehaviorSubject<any> = new BehaviorSubject([]);
  $fabricantesSelecionado: BehaviorSubject<any[]> = new BehaviorSubject([]);

  constructor(private _httpClient: HttpClient, private loadService: LoadingService) { }

  buscarTodosFabricantes(params: HttpParams) {
    this.loadService.carregar()
    this.limpar();
    return this._httpClient.get<any[]>(ServicePath.base_url + 'rd-interface-itim/v1/fabricantes', {params: params})
    .pipe(
        map(data => {
            return data.map(fabricante => {
                return {...fabricante, cd_fornecedor: fabricante.cd_fornecedor ,nome: `${fabricante.cdFornecedor} -  ${fabricante.nomeRazaoSocial}`}}) }) ,
        tap(response => {
        this.fabricantes.next(response);
        this.loadService.parar();
    }, (error) => {
      this.loadService.parar();
    }));
  }

  limpar(){
    this.$fabricantesSelecionado.next([]);
  }

  reset() {
    this.fabricantes.next([])
  }

  get selecionados(){
    return this.$fabricantesSelecionado.value;
  }

}
