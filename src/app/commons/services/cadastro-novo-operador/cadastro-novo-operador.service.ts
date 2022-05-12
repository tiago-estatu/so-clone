import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ResponseUpload } from '..';
import { ServicePath } from '../../const';
import { UploadHelper } from '../../helpers/upload.helper';
import { QueryFilters } from '../../models/query-param.model';
import { LoadingService } from '../loading';
import { ValidatorHelper } from '../../helpers';

@Injectable({
  providedIn: 'root'
})
export class CadastroNovoOperadorService {

  $paging = new BehaviorSubject<{ totalElements: number }>({ totalElements: 0 })

  constructor(
    private _http: HttpClient,
    private _loader: LoadingService,
    private _validator: ValidatorHelper
  ) {

  }

  // BUSCAR FUNCIONARIOS NA BASE UTILIZANDO O NÚMERO DE MATRÍCULA
  buscarPelaMatricula(param: QueryFilters): Observable<any> {
    this._loader.carregar()
    return this._http.get<{ totalElements: number }>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + `/${param.getParam('nrMatricula')}`).pipe(
        tap(
            data => {
                this._loader.parar();
                this.$paging = data.totalElements;
            }, err => {
                this._loader.parar()
                this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível obter resultados. Verifique a sua conexão e tente novamente.', 'error')
            }
        )
    )
  }

  // CADASTRAR UM NOVO OPERADOR NO SISTEMA
  cadastrarNovoOperador(params: QueryFilters): Observable<any> {
    this._loader.carregar()
    let cdOperadorLogado = localStorage.getItem('cdOperador');
    const httpHeader: HttpHeaders = new HttpHeaders().set('Accept', 'application/json');

    let objNovoOperador = {
        cdOperador: params.getParam('cdOperador'),
        dtInicioVigencia: params.getParam('dtInicioVg'),
        dtFimVigencia: this._validator.formataData(params.getParam('dtFimVg')),
        idPerfil: params.getParam('idPerfil').toString(),
        nrMatricula: params.getParam('nrMatricula')
    }

    return this._http.post<any>(ServicePath.HTTP_URL_CONSULTA_OPERADOR + `?cdOperador=${cdOperadorLogado}`, objNovoOperador, { headers: httpHeader })
      .pipe(tap(
        data => {
        this._loader.parar()
        this.showSwal('Sucesso', 'Novo operador cadastrado com sucesso', 'success')
      }, err => {
        this._loader.parar()
        this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível prosseguir com a solicitação. Verifique a sua conexão e tente novamente.', 'error')
      })
      )
  }

  // MODAL PARA MENSAGENS
  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }

}
