import {fakeAsync, TestBed, tick} from '@angular/core/testing';


import {ProdutoEspelhoService} from './produto-espelho.service';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import { of, throwError} from "rxjs";
import {ServicePath} from "../../const";
import { ResponseUpload} from "../classes";
import {TestHelper} from "../../helpers/test.helper";
import { ProdutoEspelhoModel } from '../../models/produto-espelho.model';

const PRODUTO_TESTE = {cdProduto: 123, dsProduto: 'teste unitario'};
const PRODUTO_ESPELHO_TESTE_RAW = {cdProdutoEspelho: 321, dsProdutoEspelho: 'teste espelho unitario'};
const PRODUTO_ESPELHO_TESTE = {cdProduto: 321, dsProduto: 'teste espelho unitario'};
const SERVER_TRASH = {createdAt: new Date(), __v: 0, flDeletado: false};
const RESPONSE_UPLOAD: ResponseUpload = {
    qtTotalRegistros: 10,
    qtTotalRegistrosNovos: 10,
    qtTotalRegistrosAlterados: 0,
    qtTotalRegistroComErro: 0
};


describe('ProdutoEspelhoService', () => {
    let service: ProdutoEspelhoService;
    let http: HttpClient;
    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpClientModule]});
        service = TestBed.get(ProdutoEspelhoService);
        http = TestBed.get(HttpClient);
    });
    it('should be created', () => {
        const service: ProdutoEspelhoService = TestBed.get(ProdutoEspelhoService);
        expect(service).toBeTruthy();
    });


    describe('Validar produto espelho', () => {

        it('deve retornar um observable com o modelo Produto', fakeAsync(() => {
            let response = of({...PRODUTO_TESTE, ...SERVER_TRASH});
            let endpoint = ServicePath.HTTP_URL_PRODUTO_ESPELHO + '/' + PRODUTO_TESTE.cdProduto;
            let result;

            spyOn(http, 'get').and.returnValues(response);
            service.validateMirror(PRODUTO_TESTE.cdProduto).subscribe(data => {
                result = data
            });
            tick(1);
            expect(http.get).toHaveBeenCalledTimes(1);
            expect(http.get).toHaveBeenCalledWith(endpoint);
            expect(result).toEqual(PRODUTO_TESTE)
        }));

        it('deve converter a resposta em erro caso o servidor responda com um modelo invalido', fakeAsync(() => {

            let response = of({invalido: true, valor: 10});
            let result;
            let error;
            let msg = 'Não foi possível realizar a pesquisa do produto. Tente novamente mais tarde.';

            spyOn(http, 'get').and.returnValues(response);
            service.validateMirror(PRODUTO_TESTE.cdProduto).subscribe(data => {
                result = data
            }, err => {
                error = err.error
            });
            tick(1);
            expect(http.get).toHaveBeenCalledTimes(1);
            expect(result).toBeUndefined();
            expect(error.mensagem).toEqual(msg);
        }))
    });


    describe('Obter produto espelho pelo id do produto sem demanda', () => {
        it('deve retornar um obsevable do modelo produto', fakeAsync(() => {
            let validateResponse = of({...PRODUTO_TESTE, ...SERVER_TRASH});
            let getMirrorResponse = of({...PRODUTO_ESPELHO_TESTE_RAW, ...SERVER_TRASH});
            let result;
            let endpoint = ServicePath.HTTP_URL_PRODUTO_ESPELHO + '/busca/' + PRODUTO_TESTE.cdProduto;

            // http retorna produto teste sem demanda validado, apos retorna espelho teste
            spyOn(http, 'get').and.returnValues(validateResponse, getMirrorResponse);
            spyOn(service, 'validateMirror').and.callThrough();

            service.getMirrorByLinkedId(PRODUTO_TESTE.cdProduto).subscribe(data => {
                result = data
            });
            tick(1);

            expect(http.get).toHaveBeenCalledTimes(2);
            expect(service.validateMirror).toHaveBeenCalledTimes(1);
            expect(http.get).toHaveBeenCalledWith(endpoint);
            expect(result).toEqual(PRODUTO_ESPELHO_TESTE);
        }));
        it('deve retornar nulo caso não exista resposta', fakeAsync(() => {
            let validateResponse = of({...PRODUTO_TESTE, ...SERVER_TRASH});
            let getMirrorResponse = of(null);
            let result;

            // http retorna produto teste sem demanda validado, apos retorna espelho teste
            spyOn(http, 'get').and.returnValues(validateResponse, getMirrorResponse);
            spyOn(service, 'validateMirror').and.callThrough();

            service.getMirrorByLinkedId(PRODUTO_TESTE.cdProduto).subscribe(data => {
                result = data
            });
            tick(1);

            expect(http.get).toHaveBeenCalledTimes(2);
            expect(result).toEqual(null);
        }))
    });


    describe('Atualizar produto', () => {
        it('Deve retornar uma resposta do servidor caso esteja certo', fakeAsync(() => {
            localStorage.setItem('cdOperador', '123');
            let produtoEspelhoRequest = new ProdutoEspelhoModel({
                semDemanda: PRODUTO_TESTE.cdProduto,
                espelhoCadastrado: {...PRODUTO_ESPELHO_TESTE, cdProduto: 333},
                novoEspelho: PRODUTO_ESPELHO_TESTE.cdProduto
            });
            let endpoint = ServicePath.HTTP_URL_PRODUTO_ESPELHO;
            let response = of({success: true});
            spyOn(http, 'post').and.returnValue(response);
            service.updateProduct(produtoEspelhoRequest);
            tick();
            expect(http.post).toHaveBeenCalledTimes(1);
            expect(http.post).toHaveBeenCalledWith(endpoint, produtoEspelhoRequest.request(123));
        }));
        it('Deve retornar erro caso não tenha cdOperador no localstorage', fakeAsync(() => {
            localStorage.removeItem('cdOperador');
            let produtoEspelhoRequest = new ProdutoEspelhoModel({
                semDemanda: PRODUTO_TESTE.cdProduto,
                espelhoCadastrado: {...PRODUTO_ESPELHO_TESTE, cdProduto: 333},
                novoEspelho: PRODUTO_ESPELHO_TESTE.cdProduto
            });
            let errMsg = 'Operador não definido';
            let err;
            spyOn(http, 'post');
            service.updateProduct(produtoEspelhoRequest).subscribe(data => {}, error => {err=error});
            tick();
            expect(http.post).toHaveBeenCalledTimes(0);
            expect(err.error.mensagem).toEqual('Operador não definido');
        }));
    });

    describe('Importar produto', () => {
       it('Deve realizar uma requisição para o upload e mostrar a mensagem de successo ou sucesso parcial correto', fakeAsync(() => {
           localStorage.setItem('cdOperador', '123');
           let file: string = '12345';
           let formData: FormData = new FormData();
           formData.append('file', file);
           formData.append('cdOperador', '123');
            let serverResponse;
           spyOn(http, 'post').and.returnValue(of(RESPONSE_UPLOAD));
           spyOn(service.upload, 'importFileHandler');

           service.importProduct(file).subscribe(data => {serverResponse = data});
           tick(1);
           expect(http.post).toHaveBeenCalledTimes(1);
           expect(service.upload.importFileHandler).toHaveBeenCalledTimes(1);
           expect(service.upload.importFileHandler).toHaveBeenCalledWith(RESPONSE_UPLOAD);
           expect(serverResponse).toEqual(RESPONSE_UPLOAD)
       }));

        it('Deve realizar uma requisição para o upload e mostrar a mensagem de erro', fakeAsync(() => {
            let error;
            let errResponse = {status: 400, error: {mensagem: 'internal server error'}};
            spyOn(http, 'post').and.returnValue(
                throwError(errResponse)
            );
            spyOn(service.upload, 'importError');
            service.importProduct(null).subscribe(data => {}, err => {error = err});
            tick(1);
            expect(http.post).toHaveBeenCalledTimes(1);
            expect(service.upload.importError).toHaveBeenCalledTimes(1);
            expect(service.upload.importError).toHaveBeenCalledWith(400);
            expect(error).toEqual(errResponse);
        }))
    });

    describe('Exportar Modelo CSV', () => {
        it('Deve realizar um request para obter o csv e chamar a função de download se o api não retornar erro', async () => {
            let httpResponse = {success: true};
            let downloadResponse = {downloaded: true};
            let filename = service.upload.fileConfig.fileName + 'template';
            spyOn(service.upload, 'downloadFile').and.returnValue({downloaded: true});
            spyOn(http, 'get').and.returnValue(of({success: true}));

            await service.exportarModeloCSV();

            expect(http.get).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledWith(httpResponse, filename);

        });

        it('Não deve intentar realizar download se a resposta do servidor for invalida, e deve informar do erro', async () => {
            spyOn(service.upload, 'downloadFile');
            spyOn(http, 'get').and.returnValue(of(null));

            await service.exportarModeloCSV();

            expect(http.get).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledTimes(0);

            expect({
                title: 'Oops',
                content: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
                icon: 'warning'
            }).dialogToExist();
        });

        it('Não deve intentar realizar download se o servidor retornar algum erro, e deve informar do erro', async () => {
            spyOn(service.upload, 'downloadFile');
            spyOn(http, 'get').and.returnValue(throwError({status: 500, error: {mensagem: 'internal error'}}));

            await service.exportarModeloCSV();

            expect(http.get).toHaveBeenCalledTimes(1);
            expect(service.upload.downloadFile).toHaveBeenCalledTimes(0);
            expect({
                title: 'Oops',
                content: 'Não foi possivel realizar o download do template. Tente novamente mais tarde.',
                icon: 'warning'
            }).dialogToExist();

        })
    })

});
