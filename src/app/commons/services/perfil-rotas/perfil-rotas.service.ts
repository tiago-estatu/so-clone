import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoadingService } from '../loading';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2';

/**
 * Node for to-do item
 */
 export class TodoItemNode {
  menuItens?: TodoItemNode[];
  dsMenu?: string;
  cdMenu?: number;
  cdItem?: number;
  dsItem?: string;
  fgAtivo?: boolean;
}
''
/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  dsItem?: string;
  cdItem?: number;
  dsMenu: string;
  cdMenu: number;
  level: number;
  expandable: boolean;
  fgAtivo?: boolean;
  menuItens?: TodoItemNode[];
}

export class MenuModel{
  cdItem: number;
  dsItem: string;
  fgAtivo: boolean;
}

@Injectable({providedIn: 'root'})
export class PerfilRotasService {
  endpoints = {
    buscarPerfilRota: ServicePath.HTTP_URL_LISTAR_PERFIL_ROTAS,
    buscarPerfilRotaPorId: ServicePath.HTTP_URL_LISTAR_PERFIL_ACESSO + '/',
    salvar: ServicePath.HTTP_URL_LISTAR_PERFIL_ACESSO,
};
  constructor(private _http: HttpClient, private _loadService: LoadingService) { }
  dataSource: BehaviorSubject<TodoItemNode[]> = new BehaviorSubject([]);
  $selecionado: BehaviorSubject<number[]> = new BehaviorSubject([]);

  getAllRotasPerfil(): Observable<TodoItemNode[]> {
    this._loadService.carregar();
    return this._http.get<TodoItemNode[]>(this.endpoints.buscarPerfilRota).pipe(
      tap(response => {
        this._loadService.parar()
        this.dataSource.next(response);
    }, (error) => {
      this.reset();
      this._loadService.parar()
    }));
  }

  /* Buscar todas as rotas e menus por id do perfil de acesso*/
  getAllRotasPerfilPorId(idPerfilAcesso: number): Observable<TodoItemNode[]> {
    this._loadService.carregar();
    return this._http.get<TodoItemNode[]>( this.endpoints.buscarPerfilRotaPorId + idPerfilAcesso).pipe(
      tap(response => {
        this._loadService.parar()
        this.dataSource.next(response);
    }, (error) => {
      this.reset();
      this._loadService.parar()
    }));
  }

/**
     * Cadastrar novo perfil
     * @param substituto
     */
 create(novoPerfilRota: {}, nomeNovoPerfil: string): Observable<any> {
  let params: HttpParams = new HttpParams();
  params = params.set('dsPerfil', nomeNovoPerfil);
  params = params.set('cdOperador', localStorage.getItem('cdOperador'));

  return this._http.post(this.endpoints.salvar, novoPerfilRota, {params: params})
}
  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }
  reset(){
    this.$selecionado.next([]);
  }
  
  get selecionados(){
    return this.$selecionado.value;
  }
}
