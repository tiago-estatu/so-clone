import { Injectable } from '@angular/core';
import { ServicePath } from '../../const';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { tap } from 'rxjs/operators';

import { QueryFilters } from '../../models/query-param.model';

import { UtilsHelper } from '../../helpers';

import { BehaviorSubject } from 'rxjs';

import { LoadingService } from '../loading/loading.service';

export interface RecomendacaoModel {
  cdRegional: number;
  cdSetorSeparacao?: string;
  itimSetorSeparacao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecomendacaoService {
  $dataSource = new BehaviorSubject<RecomendacaoModel[]>([]);
  $paging = new BehaviorSubject<{ page: number, numberOfItems: number }>({ page: 1, numberOfItems: 0 })


  constructor(
    private _http: HttpClient,
    private utils: UtilsHelper,
    private _loader: LoadingService,
  ) { }

  // FAÇO A CONSULTA DOS CADASTROS ATUAIS
  getParametrizacaoSetor(queryParam: any) {

    this._loader.carregar()

    let params: HttpParams = new HttpParams();
    let cdSelecionado = queryParam.getParam('cdRegional');

    params = params.set('cdRegional', cdSelecionado)

    this._http.get<{ content: RecomendacaoModel[], pageable: { page: number, numberOfItems: number } }>(ServicePath.HTTP_PARAMETRIZACAO_SETOR + '?' + params).subscribe(data => {
      this.$dataSource.next(data.content.map(e => ({ ...e, cdRegional: e.cdRegional, cdSetorSeparacao: e.cdSetorSeparacao, itimSetorSeparacao: e.itimSetorSeparacao })));
      this.$paging.next(data.pageable);
      this._loader.parar();
    }, err => {
      this.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível obter as recomendações. Verifique a sua conexão e tente novamente.', 'error')
      this._loader.parar()
    })
  }

  exportarRelatorio(query: QueryFilters) {
    let operador = `&cdOperador=${localStorage.getItem('cdOperador')}`
    return this._http.get<any>(ServicePath.HTTP_RELATORIO_ARREDONDAMENTO_CD + query.criarFiltro() + operador).pipe(tap(data => {
        Swal.fire({
          title: data.detail,
          text: data.mensagem,
          icon: 'success'
        })
    }, err => {
        if(err.error == null) err.error = {message: 'Verifique os filtros ou tente novamente mais tarde.'};
        if (typeof(err.error) == 'string') err.error = JSON.parse(err.error)
        err.error.title = {
            404: 'Nenhum registro encontado',
            500: 'Não foi possível gerar o relatório'
        };
        this.utils.showError(err);
    }));
}

  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, html: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
}

ngOnDestroy(){

}
}
