import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AgendaService } from '../../../commons/services/agenda/agenda-service';
import { Injectable } from '@angular/core';
import { ConfiguracaoCD } from '../ConfiguracaoCD';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AgendaConsultaDetalheResolver implements Resolve<Observable<ConfiguracaoCD[]>> {

    constructor(private agendaService: AgendaService) {

    }

    // tslint:disable-next-line: max-line-length
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ConfiguracaoCD[]> | Observable<Observable<ConfiguracaoCD[]>> | Promise<Observable<ConfiguracaoCD[]>> {

        const cdRegionais = route.params.cdRegionais;
        const cdFornecedores = route.params.cdFornecedores;
        const cdFabricantes = route.params.cdFabricantes;
        const diaCompra = route.params.diaCompra;
        const frequencia = route.params.frequencia;

        // tslint:disable-next-line: prefer-const
        let parametrocd: ConfiguracaoCD;
        // parametrocd = {
        // cdRegionais: cdRegionais,
        // cdFabricantes: cdFornecedores,
        // cdFornecedores: cdFabricantes,
        // diaCompra: diaCompra,
        // frequencia: frequencia,
        // };

        return this.agendaService.getConsultaListaCD(parametrocd);
    }
}
