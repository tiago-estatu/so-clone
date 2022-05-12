import {TestBed} from '@angular/core/testing';
import {CategoriaProdutoService} from "./categoria-produto.service";
import {HttpClientModule, HttpHeaders} from "@angular/common/http";
import {CategoriaProdutoModel} from "./categoria-produto.model";
import {of} from "rxjs";
import {ServicePath} from "../../const";
const CATEGORIA: CategoriaProdutoModel = {cd: 1, descricao: 'Teste'}

describe('CategoriaProdutosService', () => {
    let service: CategoriaProdutoService;


    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpClientModule]});
        service = TestBed.get(CategoriaProdutoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Buscar todas as categorias', () => {
       it('Deve setar os Http Headers e retornar a requisição do servidor', () => {
           let response = of(CATEGORIA);
           spyOn(service['_http'], 'get').and.returnValue(response);
           const headers = {headers: new HttpHeaders()
               .set('Accept', 'application/json')
               .set('Content-type', 'application/json;charset=UTF-8')};
           service.buscarTodasCategoriasProduto().subscribe(data => {
               expect(data).toEqual(CATEGORIA)
           });
           expect(service['_http'].get).toHaveBeenCalledTimes(1);
           expect(service['_http'].get).toHaveBeenCalledWith(ServicePath.HTTP_URL_CATEGORIA_PRODUTO, headers);
       })
    })


});


