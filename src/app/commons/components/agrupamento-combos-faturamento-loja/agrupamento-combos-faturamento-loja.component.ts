import { fadeInOut } from './../../const/animation';
import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {CdService} from '../../services/center-distribution';
import {FabricanteService} from '../../services/fabricante/fabricante.service';
import {FornecedorService} from '../../services/fornecedor';
import {HttpParams} from '@angular/common/http';
import { debounceTime, tap } from 'rxjs/operators';
import { FilialRotaService } from '../../services/filial-rota';
import { FilialService } from '../../services/filial';

@Component({
  selector: 'rd-combos-faturamento-loja',
  templateUrl: './agrupamento-combos-faturamento-loja.component.html',
  styleUrls: ['./agrupamento-combos-faturamento-loja.component.scss'],
  animations: [fadeInOut],

})
export class AgrupamentoCombosFaturamentoLojaComponent implements OnInit, OnDestroy {

  @Output('selecionados')
  selecionados: EventEmitter<{field: string, data: any[]}> = new EventEmitter()

  subs = [];
  firstPassed = false;
  componentLoading: Boolean = false;

  constructor(
      private _cdService: CdService,
      private _rotaFilialService: FilialRotaService,
      private _filialService: FilialService,
      private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.componentLoading = true;

    this.getCds();
    this.subscribeToSelecteds();
  }


  subscribeToSelecteds() {
    this.subs = [
      this.subToFilialRota(),
      this.subToFilial(),
      this.subToCd()
    ]
  }

  get cdSelecionados() {
    return this._cdService.$cdSelecionado.value;
  }

  get operador(){
    return localStorage.getItem('cdOperador');
  }

  subToCd() {
    return this._cdService.$cdSelecionado.pipe(
      debounceTime(700),
      tap(cdsSelecionados=> {
        if(this.firstPassed) {
          cdsSelecionados.length > 0 ? this.getFilialRota(cdsSelecionados) : this._rotaFilialService.reset();
          this.selecionados.emit({field: 'cd', data: cdsSelecionados});
          this._cdr.detectChanges();
        }
      })
    )
    .subscribe(cdsSelecionados => {
        this.firstPassed = true;
    })
    }

  subToFilialRota() {
    return this._rotaFilialService.$selecionados
    .pipe(debounceTime(700))
    .subscribe(selecionados => {
      if(this.firstPassed) {
        selecionados.length > 0 ? this.getFilial(this.cdSelecionados, selecionados) : this._filialService.reset();
        this.selecionados.emit({field: 'fr', data: selecionados});
        this._cdr.detectChanges();
      }
    })
  }


  subToFilial() {
    return this._filialService.$selecionados
    .subscribe(selecionados => {
      this.selecionados.emit({field: 'ff', data: selecionados});
    })
  }

  getCds() {
    this._cdService.getListCD().subscribe(d => {}).add(()=> {
      this.componentLoading = false
    });;
  }

  getFilialRota(cdRegional: number[]) {
    this._rotaFilialService.reset()
    let params = new HttpParams();
    params = params.set('cdRegional', cdRegional.toString());
    params = params.set('cdOperador', this.operador.toString())
    this._rotaFilialService.getFilialRota(params).subscribe(d => {});
  }

  getFilial(cdRegional, cdRota) {
    this._filialService.reset()
    let params = new HttpParams();
    params = params.set('cdRegional', cdRegional.toString());
    params = params.set('cdFilialRota', cdRota.toString());
    params = params.set('cdOperador', this.operador.toString());
    //params = this.fgCompraCd === false ? params.set('fgCompraCd', 'false') : params.set('fgCompraCd', 'true');

    this._filialService.getAllFilialByCdRegiao(params).subscribe(d => {});
  }


  ngOnDestroy() {
    this.subs.forEach(sub => {
      if(!!sub && !!sub.unsubscribe) sub.unsubscribe()
    })
  }

}
