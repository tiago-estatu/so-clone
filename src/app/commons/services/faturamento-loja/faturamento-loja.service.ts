import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { QueryFilters } from '../../models/query-param.model';
import { Injectable } from '@angular/core';
import { LoadingService } from '../loading/loading.service';
import Swal from 'sweetalert2';
import { UtilsHelper } from '../../helpers';

export class FaturamentoLojaModel {
  cdRegional: number;
  nmRegional: string;
  nrOrdem: number;
  cdFilial: number;
  nmFantasiaFilial: string;
  cdFornecedor: number;
  faturamento: 'SO' | 'ABF';
  faturamentoOriginal: 'SO' | 'ABF';

  get cd() {
      return `${this.cdRegional} - ${this.nmRegional}`
  }
  get filial() {
      return `${this.cdFilial} - ${this.nmFantasiaFilial}`
  }

  changeFaturamento() {
      this.faturamento = this.faturamento == 'SO' ? 'ABF' : 'SO';
      return this;
  }

  constructor(_) {
    this.cdRegional = _.cdRegional;
    this.nmRegional= _.nmRegional;
    this.nrOrdem= _.nrOrdem;
    this.cdFilial= _.cdFilial;
    this.nmFantasiaFilial= _.nmFantasiaFilial;
    this.cdFornecedor = _.cdFornecedor;
    this.faturamento= _.faturamento;
    this.faturamentoOriginal = _.faturamento;
  }
}

export class LojaStore {
  data: FaturamentoLojaModel[];
  status: 'LOAD' | 'ERROR' | 'READY';
}
@Injectable()
export class FaturamentoLojaService {

  dataSource: BehaviorSubject<LojaStore> = new BehaviorSubject({data: [], status: 'LOAD'});

  baseUrl = ServicePath.HTTP_URL_AGENDA_ABASTECIMENTO + 'definicaoSistemaFaturamento';
  endpoints = {
      fetch: '',
      save: ''
  }
  
  // api = environment.api_itim;
  constructor(private _httpClient: HttpClient, private _loading: LoadingService ) { }
  updateFaturamento() {
    let query = '?cdOperador=' + localStorage.getItem('cdOperador');
    let lojas = this.dataSource.value.data.map(item => ({
      cdFornecedor: item.cdFornecedor,
      cdOperador:  localStorage.getItem('cdOperador'),
      cdFilial: item.cdFilial,
      fgAbastecimentoSo: item.faturamento === 'SO' ? true : false
    }))

    this._httpClient.put(this.baseUrl + this.endpoints.save  + query, lojas)
    .subscribe(
        data => {
            this.showSuccess('Faturamento atualizado', 'O faturamento foi atualizado com os valores informados');
        },
        error => {
            error.error.title = 'Não foi possível salvar';
            this.showError(error);
        }
    )
}

  getDefinicaoSistema(queryFilters: QueryFilters){
    this._loading.carregar();
    return this._httpClient.get<any | any[]>(this.baseUrl + this.endpoints.fetch + queryFilters.criarFiltro())
    .pipe(map(response => {
      return response.content.map(loja => new FaturamentoLojaModel(loja));
    })).subscribe(
      data => { 
        this.dataSource.next({data: data, status: 'READY'})
      },
      error =>  {
        let err = UtilsHelper.handleError(error)
        this.showModal({title: 'Oops!', body: err, type:'error'})
        this.dataSource.next({data: error, status: 'ERROR'})
    
    }
    ).add(this._loading.parar())
  }
  showSuccess(title, body) {
    this.showModal({title: title, body: body, type:'success'})
}

showError(err) {
    let title = err.error.title;
    if(typeof err.error.title == 'object') {
        title = err.error.title[err.status] || err.error.title[500]
    }
    this.showModal({title: title, body: UtilsHelper.handleError(err), type:'error'})
}

showModal(config) {
    let options = {
        confirmButtonText: 'Ok, Obrigado',
        customClass: { confirmButton: 'setBackgroundColor' }
    };
    Swal.fire({
        ...options,
        title: config.title,
        text: config.body,
        icon: config.type,
    })
}

}
