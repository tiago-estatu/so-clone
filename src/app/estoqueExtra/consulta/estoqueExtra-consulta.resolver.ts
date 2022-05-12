import { Resolve, ActivatedRouteSnapshot,RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEstoqueExtra, EstoqueExtraService } from 'src/app/commons';


@Injectable({ providedIn: 'root' })
export class EstoqueExtraResolver implements Resolve<Observable<IEstoqueExtra[]>> {
   
    constructor(private estoqueService: EstoqueExtraService){

    }

    resolve(route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot): Observable<IEstoqueExtra[]>
        | Observable<Observable<IEstoqueExtra[]>> |
        Promise<Observable<IEstoqueExtra[]>> {

        const id = route.params.id;
        this.estoqueService.subPath = 'estoqueExtra';
        return this.estoqueService.getEstoquePorId(id);
    }
}