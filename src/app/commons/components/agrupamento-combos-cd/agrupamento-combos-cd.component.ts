import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewRef } from '@angular/core';
import { CdService } from '../../services/center-distribution';
import { FabricanteService } from '../../services/fabricante/fabricante.service';
import { FornecedorService } from '../../services/fornecedor';
import { HttpParams } from '@angular/common/http';
import { debounceTime, tap } from 'rxjs/operators';

@Component({
  selector: 'rd-agrupamento-combos-cd',
  templateUrl: './agrupamento-combos-cd.component.html',
  styleUrls: ['./agrupamento-combos-cd.component.scss']
})
export class AgrupamentoCombosCdComponent implements OnInit, OnDestroy {

  @Input('cdOperador')
  cdOperador?: number | string;

  @Output('selecionados')
  selecionados: EventEmitter<{ field: string, data: any[] }> = new EventEmitter()

  // FLAG PARA TELAS AONDE É NECESSÁRIO REQUEST DE TODOS FABRICANTES E FORNECEDORES
  @Input('flagCompraCd')
  fgCompraCd?: boolean = false;

  subs = [];
  firstPassed = false;

  constructor(
    private _cdService: CdService,
    private _fabricanteService: FabricanteService,
    private _forncedorService: FornecedorService,
    private _cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.getCds();
    this.subscribeToSelecteds();
  }


  subscribeToSelecteds() {
    this.subs = [
      this.subToFabricante(),
      this.subToFornecedor(),
      this.subToCd()
    ]
  }

  get cdSelecionados() {
    return this._cdService.$cdSelecionado.value;
  }

  get operador() {
    return localStorage.getItem('cdOperador');
  }

  subToCd() {
    return this._cdService.$cdSelecionado.pipe(
      debounceTime(700),
      tap(cdsSelecionados => {
        this._fabricanteService.reset();
        this._fabricanteService.limpar();
        if (this.firstPassed) {
          cdsSelecionados.length > 0 ? this.getFabricantes(cdsSelecionados): this._fabricanteService.reset();
          this.selecionados.emit({ field: 'cd', data: cdsSelecionados });
          if (!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
        }
      })
    )

      .subscribe(cdsSelecionados => {
        this.firstPassed = true;
      })
  }

  subToFabricante() {
    return this._fabricanteService.$fabricantesSelecionado
      .pipe(debounceTime(700))
      .subscribe(fabricantesSelecionados => {
        this._forncedorService.reset();
        this._forncedorService.limpar();
        if (this.firstPassed) {
          fabricantesSelecionados.length > 0 ? this.getFornecedores(this.cdSelecionados, fabricantesSelecionados) : this._forncedorService.reset();
          this.selecionados.emit({ field: 'fb', data: fabricantesSelecionados });
          if (!(this._cdr as ViewRef).destroyed) this._cdr.detectChanges();
        }
      })
  }


  subToFornecedor() {
    return this._forncedorService.$fornecedorSelecionado
      .subscribe(forncedoresSelecionados => {
        this.selecionados.emit({ field: 'fc', data: forncedoresSelecionados });
      })
  }

  getCds() {
    this._cdService.getListCD().subscribe(d => { });
  }

  getFabricantes(cdRegional: number[]) {
    let params = new HttpParams();
    params = params.set('cdRegional', cdRegional.toString());
    params = params.set('cdOperador', this.operador.toString())
    params = this.fgCompraCd === false ? params.set('fgCompraCd', 'false') : params.set('fgCompraCd', 'true');
    this._fabricanteService.buscarTodosFabricantes(params).subscribe(d => { });
  }

  getFornecedores(cdRegional, cdFabricante) {
    let params = new HttpParams();
    params = params.set('cdRegional', cdRegional.toString());
    params = params.set('cdFabricante', cdFabricante.toString());
    params = params.set('cdOperador', this.operador.toString());
    params = this.fgCompraCd === false ? params.set('fgCompraCd', 'false') : params.set('fgCompraCd', 'true');

    this._forncedorService.buscarTodosFornecedoresPorCds(params).subscribe(d => { });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      if (!!sub && !!sub.unsubscribe) sub.unsubscribe()
    })
  }

}
