import { Resolve, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { PedidoService } from '../../../commons/services/pedido/pedido.service';
import { Injectable } from '@angular/core';
import { Recomendacao } from '../recomendacao';
import { Observable } from 'rxjs';
import { ValidatorHelper } from './../../../commons/helpers/validator.helper';

@Injectable({ providedIn: 'root' })
export class ConsultaPedidoDetalheResolver implements Resolve<Observable<Recomendacao[]>> {

    constructor(
        private pedidoService: PedidoService,
        private _validatorHelper: ValidatorHelper
        ) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Recomendacao[]> | Observable<Observable<Recomendacao[]>> | Promise<Observable<Recomendacao[]>> {
        const cdRegional = route.params.cdRegional;
        const cdFornecedor = route.params.cdFornecedor;
        const cdFabricante = route.params.cdFabricante;
        const dtPedido = this._validatorHelper.formataDataComBarraPadraoBr(route.params.dtPedido);
        const cdOperador = route.params.cdOperador;

        // FAÇO A CHAMADA DO SERVIÇO QUE RETORNA O DETALHE DO PEDIDO
        return this.pedidoService.getDetalhePedido(cdRegional, cdFornecedor, cdFabricante, dtPedido, cdOperador);
    }







}