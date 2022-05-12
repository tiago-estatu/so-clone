import { Injectable, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../loading';
import { map, tap } from 'rxjs/operators';
import { QueryFilters } from '../../models/query-param.model';
import Swal from 'sweetalert2';
import { ValidatorHelper } from '../../helpers';
import * as moment from 'moment';

export class OperadorAcessoModel{
  cdOperador?: number;
  nmOperador: string;
  idPerfil?: number;
  dsPerfil: string;
  matricula: number | string;
  dtInicioVigencia?: Date;
  dtFimVigencia?: Date;

  constructor(config: OperadorAcessoModel){
    this.nmOperador = config.nmOperador;
    this.dsPerfil = config.dsPerfil;
    this.matricula = config.matricula;
    this.dtInicioVigencia =  moment(config.dtInicioVigencia).toDate();
    this.dtFimVigencia = moment(config.dtFimVigencia).toDate();
    this.cdOperador = config.cdOperador;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OperadorAcessoService {
  // api = environment.api_itim;
  constructor(
    private _http: HttpClient, 
    private _loader: LoadingService,
    private _validator: ValidatorHelper) { 
    }

  dataSource: BehaviorSubject<OperadorAcessoModel[]> = new BehaviorSubject([]);
  $selecionado: BehaviorSubject<number[]> = new BehaviorSubject([]);

  buscarOperadorAcesso(parametrers: QueryFilters): Observable<OperadorAcessoModel[]> {
    this._loader.carregar();
    return this._http.get<OperadorAcessoModel[]>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + parametrers.criarFiltro()).pipe(
      tap(response => {
        this.dataSource.next(response);
        this._loader.parar();
    }, (err) => {
      this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível encontrar o operador. Verifique a sua conexão e tente novamente.', 'error')
      this._loader.parar();
    }));
  }

  encerrarVigencia(operador: OperadorAcessoModel): Observable<OperadorAcessoModel> {
    this._loader.carregar()
    let objReserve = { cdOperador: operador.cdOperador}; 
    let cdOperador = localStorage.getItem('cdOperador');
    return this._http.put<OperadorAcessoModel>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + `?cdOperador=${cdOperador}`, objReserve).pipe(
        tap(data => {this._loader.parar()}, err => {this._loader.parar()})
    )
}

atualizarVigencia(operador: OperadorAcessoModel): Observable<OperadorAcessoModel> {
  this._loader.carregar();

  let novoOperador = { 
    cdOperador: operador.cdOperador, 
    nrMatricula: operador.matricula,
    idPerfil: operador.idPerfil[0].toString(),
    dtInicioVigencia: this._validator.formataData(operador.dtInicioVigencia),
    dtFimVigencia: this._validator.formataData(operador.dtFimVigencia),
  }; 
  let cdOperador = localStorage.getItem('cdOperador');

  return this._http.put<OperadorAcessoModel>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + `?cdOperador=${cdOperador}`, novoOperador).pipe(
      tap(data => {
          this._loader.parar()
          this.showSwal('Sucesso', 'Perfil alterado com sucesso', 'success')
      }, err => { 
          this._loader.parar()
          this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível alterar este perfil. Verifique a sua conexão e tente novamente.', 'error')
      })
  )
}

  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }

  reset(){
    this.$selecionado.next([]);
    this.dataSource.next([]);

  }

  get selecionados(){
    return this.$selecionado.value;
  }
}
