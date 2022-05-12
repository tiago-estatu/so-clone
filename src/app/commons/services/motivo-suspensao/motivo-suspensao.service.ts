import { Injectable } from '@angular/core';
import { Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { ServicePath } from '../../const';
import { HttpClient } from '@angular/common/http';
import { MotivoSuspensaoFaturamentoModel } from './MotivoSuspensaoFaturamento.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { tap } from 'rxjs/internal/operators/tap';
import { LoadingService } from '../loading/loading.service';
@Injectable()
export class MotivoSuspensaoService {
  
  motivos: BehaviorSubject<any> = new BehaviorSubject([]);
  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);

    constructor(private _http: HttpClient, private _loadService: LoadingService) { }

    // BUSCAR LISTA DOS MOTIVOS DE FATURAMENTO SUSPENSO
    getListaMotivoFaturamentoSupenso(tipoMotivo): Observable<MotivoSuspensaoFaturamentoModel[]> {
        return this._http.get<MotivoSuspensaoFaturamentoModel[]>(ServicePath.HTTP_URL_MOTIVOS_SUSPENSAO_DE_FATURAMENTO + '/'+tipoMotivo).pipe(
          tap(response => {
            this.motivos.next(response);
            this._loadService.parar();
        }, (error) => {
          this._loadService.parar();
        }));
    }
  
    reset() {
      this.$selecionados.next([])
      this.motivos.next([]);
    }
  
    get selecionados(){
      return this.$selecionados.value;
    }
}
