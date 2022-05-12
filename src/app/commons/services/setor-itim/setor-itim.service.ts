import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoadingService } from '../loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class SetorItimService {

  $selecionados: BehaviorSubject<any[]> = new BehaviorSubject([]);
  constructor(private loadService: LoadingService) { }


  limpar() {
    this.$selecionados.next([]);
  }
  getGrupoPrioridadeDeLoja(): Observable<any[]> {
    this.loadService.carregar();
    const dropListGrupoHardCode = [] =
      [
        {
          'cdGrupo': 1,
          'dsGrupo': '1 - MEDICAMENTO'
        },
        {
          'cdGrupo': 2,
          'dsGrupo': '2 - PERFUMARIA'
        },
        {
          'cdGrupo': 3,
          'dsGrupo': '3 - MEZANINO'
        },
        {
          'cdGrupo': 4,
          'dsGrupo': '4 - VOLUMOSO'
        }
      ]
      this.loadService.parar();

      return of(dropListGrupoHardCode);
  }
 get selecionados(){
    return this.$selecionados.value;
  }
}