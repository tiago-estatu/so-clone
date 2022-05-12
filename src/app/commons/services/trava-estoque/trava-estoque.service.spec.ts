import {fakeAsync, TestBed, tick} from '@angular/core/testing';

import {HttpClient, HttpClientModule, HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import { TravaEstoqueService } from './trava-estoque.service';
import { QueryFilters } from '../../models/query-param.model';
import { RequestParamModel } from '../../models/request-param.model';
import { ServicePath } from '../../const';
import { TestHelper } from '../../helpers/test.helper';
import { ResponseUpload } from '..';

const ROW_EXAMPLE = {
    cdProduto: 1001,
    dsProduto: `Produto 300mg`,
    cdRegional: 900,
    nmRegional: 'Parana',
    qtReserva: 10,
    dtInicioReserva: new Date(),
    dtFimReserva: new Date(),
    cdMotivo: 'Ecommerce'
  }
  
const PAGEABLE_ROWS = {
    pageable: {page: 1, totalItems: 50},
    content: [{...ROW_EXAMPLE}, {...ROW_EXAMPLE, id: 2}, {...ROW_EXAMPLE, id: 3}]
}

let allFields: ResponseUpload = {
    qtTotalRegistros: 10,
    qtTotalRegistroComErro: 1,
    qtTotalRegistrosAlterados: 1,
    qtTotalRegistrosNovos: 8,
}
let onlyErrors: ResponseUpload = {
    qtTotalRegistros: 10,
    qtTotalRegistroComErro: 10,
    qtTotalRegistrosAlterados: 0,
    qtTotalRegistrosNovos: 0,
}

let onlySuccess: ResponseUpload = {
    qtTotalRegistros: 10,
    qtTotalRegistroComErro: 0,
    qtTotalRegistrosAlterados: 0,
    qtTotalRegistrosNovos: 10,
}
const IMPORT_ERRORS = {
    onlyErrors: onlyErrors,
    allFields: allFields,
    onlySuccess: onlySuccess,
}

const REPORT_PATH = '/relatorio'

describe('Trava Estoque Service', () => {
    let service: TravaEstoqueService;
    let http: HttpClient;
    const testUtils = new TestHelper(expect);
    let urlPath = ServicePath.HTTP_TRAVA_ESTOQUE;
    let queryFilters = new QueryFilters([
        new RequestParamModel('cdOperador', 22520),
        new RequestParamModel('cdRegional', 905),
        new RequestParamModel('cdProduto', 888),
        new RequestParamModel('dtInicial', new Date(), null, (v) => `${v.getFullYear()}${v.getDate()}${v.getMonth()}`),
        new RequestParamModel('dtFim', new Date(), null, (v) => `${v.getFullYear()}${v.getDate()}${v.getMonth()}`),
      ]);
    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpClientModule]});
        service = TestBed.get(TravaEstoqueService);
        http = TestBed.get(HttpClient);

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.$reserves.value).toEqual([])
    });

    describe('Get reserves', () => {

        it('Should make a http request and emit the result', () => {
            expect(service.$reserves.value).toHaveLength(0);
            spyOn(http, 'get').and.returnValue(of(PAGEABLE_ROWS));
            let queryFilters = new QueryFilters([
                new RequestParamModel('cdRegional', 900),
                new RequestParamModel('date', new Date()),
                new RequestParamModel('page', 1),
                new RequestParamModel('size', 10),
                
            ])
            service.getReserves(queryFilters)
            expect(http.get).toHaveBeenCalledTimes(1);
            expect(http.get).toHaveBeenCalledWith(ServicePath.HTTP_TRAVA_ESTOQUE + queryFilters.criarFiltro())
            expect(service.$reserves.value).toHaveLength(3);
        })  

        it('Should show and error if the server responded with error', () => {
            expect(service.$reserves.value).toHaveLength(0);
            spyOn(http, 'get').and.returnValue(throwError({status: 500, message: 'Internal Server Error'}));
            let queryFilters = new QueryFilters([
                new RequestParamModel('cdRegional', 10),
                new RequestParamModel('date', new Date()),
            ])
            service.getReserves(queryFilters)
            expect(http.get).toHaveBeenCalledTimes(1);
            expect(http.get).toHaveBeenCalledWith(ServicePath.HTTP_TRAVA_ESTOQUE + queryFilters.criarFiltro())
            expect(service.$reserves.value).toHaveLength(0);
            testUtils.expectDialog('Ops!','Não foi possível obter as travas de estoque. Verifique a sua conexão e tente novamente.','error');

        })

    })

    describe('Update reserve', () => {
        it('Should make a http request and return an observable', () => {
            spyOn(http, 'put').and.returnValue(of({}))
            service.updateReserve(ROW_EXAMPLE).subscribe()
            expect(http.put).toHaveBeenCalledTimes(1);
            expect(http.put).toHaveBeenLastCalledWith(ServicePath.HTTP_TRAVA_ESTOQUE, ROW_EXAMPLE);
            testUtils.expectDialog('Sucesso','Trava de estoque alterada com sucesso','success');
        })

        it('Should handle http errors', () => {
            spyOn(http, 'put').and.returnValue(throwError({status: 500, error: {message: 'Produto deletado'}}))
            service.updateReserve(ROW_EXAMPLE).subscribe()
            expect(http.put).toHaveBeenCalledTimes(1);
            expect(http.put).toHaveBeenLastCalledWith(ServicePath.HTTP_TRAVA_ESTOQUE, ROW_EXAMPLE);
            testUtils.expectDialog('Ops!','Produto deletado','error');
        })
    })


    describe('Download CSV', () => {
        it('Should download the csv file', () => {
            let httpResponse = {success: true};
            let filename = service.upload.fileConfig.fileName + 'template';
            spyOn(service.upload, 'downloadFile').and.returnValue({downloaded: true});
            spyOn(http, 'get').and.returnValue(of({success: true}));
            service.downloadCSV();
            expect(http.get).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledWith(httpResponse, filename);
        })
    })


    describe('Import file', () => {

        it('Should handle when the api responds with all succeses', fakeAsync(() => {
            let response = IMPORT_ERRORS.onlySuccess;
            spyOn(http, 'post').and.returnValue(of(response));
            spyOn(service.upload, 'importError');
            let fileData = '123;123'
            service.importFile(fileData).subscribe();
            tick(1);
            expect(http.post).toHaveBeenCalledTimes(1);
            testUtils.expectDialog('Cadastradas com Sucesso!', '', 'success', {compareContent: false})
        }));
        it('Should handle when the api responds with a mix of erros and succeses', fakeAsync(() => {
            let response = IMPORT_ERRORS.allFields;
            spyOn(http, 'post').and.returnValue(of(response));
            spyOn(service.upload, 'importError');
            service.importFile('123;123').subscribe();
            tick(1);
            expect(http.post).toHaveBeenCalledTimes(1);
            testUtils.expectDialog('Importação concluída! Mas...', '', 'warning', {compareContent: false})
        }));
    })


    describe('Consultar relatório', () => {

        it('Deve realizar um Http Resquest para API correto', () => {
          let response = { message: 'Relatorio está sendo gerado e será enviado via email' }
    
          spyOn(http, 'get').and.returnValue(of(response))
          service.exportarRelatorio(queryFilters)
          expect(http.get).toHaveBeenCalledTimes(1)
          expect(http.get).toHaveBeenCalledWith(urlPath + REPORT_PATH + queryFilters.criarFiltro())
          testUtils.expectDialog('Sucesso', response.message, 'success')
    
        });
    
        it('Deve fazer handler dos erros do servidor', () => {
          let response = {status: 500, error: {message: 'Servidor não disponivel'}}
    
          spyOn(http, 'get').and.returnValue(throwError(response))
          service.exportarRelatorio(queryFilters)
          expect(http.get).toHaveBeenCalledTimes(1)
          expect(http.get).toHaveBeenCalledWith(urlPath + REPORT_PATH + queryFilters.criarFiltro())
          testUtils.expectDialog('Ops!', response.error.message, 'error')
    
        });
    
      })

});


