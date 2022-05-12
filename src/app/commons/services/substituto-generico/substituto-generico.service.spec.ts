import {TestBed} from '@angular/core/testing';

import {SubstitutoGenericoService} from './substituto-generico.service';
import {HttpClientModule, HttpErrorResponse} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {RequestModel} from "./substituto-generico.mock";
import {SubstitutoGenericoModel} from "./substituto-generico.model";

const CD_OPERADOR = '441144';
const ERROR400 = {status: 400, error: {mensagem: 'teste'}};
const PRODUTO = {cdProduto: 1, prioridade: 1};
const PRODUTO_FULL: SubstitutoGenericoModel = {
    cdProduto: 123,
    dsProduto: 'teste 123',
    prioridade: 1,
    nmFantasiaFornecedor: 'teste',
    cdFornecedor: 1,
    cdCategoriaMaster: 1,
    dsCategoriaMaster: 'master',
    cdPrincipioAtivoComposto: 123,
    dsPrincipioAtivoComposto: '123',
    clCurvaFis: 'F',
    cdGrupoSubstituto: 1,
    strip: () => ({cdProduto: this.cdProduto, prioridade: this.prioridade, cdGrupoSubstituto: this.cdGrupoSubstituto, flDeletado: this.flDeletado === 1 ? 1 : 0})
};

describe('SubstitutoGenericoService', () => {
    let service: SubstitutoGenericoService;

    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpClientModule]});
        service = TestBed.get(SubstitutoGenericoService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('File import', () => {
        it('deve crear o request com form data com o arquivo informado', () => {
            localStorage.setItem('cdOperador', CD_OPERADOR);
            let file = '123;123';
            spyOn(service['mocker'], 'importFile').and.returnValue(of(true));
            let formData = new FormData();
            formData.append('file', file);
            formData.append('cdOperador', CD_OPERADOR);
            let request: RequestModel = {
                endpoint: service.endpoints.importar,
                body: formData
            };

            service.importFile(file).subscribe(data => {
                expect(data).toEqual(true)
            });
            expect(service['mocker'].importFile).toHaveBeenCalledTimes(1);
            expect(service['mocker'].importFile).toHaveBeenCalledWith(request);
        });

        it('deve informar dos erros do servidor', () => {
            localStorage.setItem('cdOperador', CD_OPERADOR);
            let file = '123;123';
            let error = {status: 500, error: true};
            spyOn(service['mocker'], 'importFile').and.returnValue(throwError(error));
            spyOn(service['uploader'], 'importError');
            let formData = new FormData();
            formData.append('file', file);
            formData.append('cdOperador', CD_OPERADOR);
            let request: RequestModel = {
                endpoint: service.endpoints.importar,
                body: formData
            };

            service.importFile(file).subscribe(data => {
                expect(data).toEqual(true)
            }, err => {expect(err.status).toEqual(500)});
            expect(service['uploader'].importError).toHaveBeenCalledTimes(1);
            expect(service['uploader'].importError).toHaveBeenCalledWith(error);
        })

    });

    describe('Consultar lista de produtos', () => {
        it('deve consultar baseado no codigo do produto e adicionar o valor ao subject', () => {
            expect(service.productsSubject.getValue()).toHaveLength(0);
            spyOn(service['mocker'], 'getSubstitutesList').and.returnValue(of([1, 2, 3, 4, 5]));
            service.getCurrentSubstituteList('123');
            expect(service['mocker'].getSubstitutesList).toHaveBeenCalledTimes(1);
            expect(service.productsSubject.getValue()).toHaveLength(5)
        });

        it('deve informar dos erros do servidor', () => {
            expect(service.productsSubject.getValue()).toHaveLength(0);
            let err = throwError(ERROR400);
            spyOn(service['mocker'], 'getSubstitutesList').and.returnValue(err);
            spyOn(service, 'showError');
            service.getCurrentSubstituteList('123');
            expect(service['mocker'].getSubstitutesList).toHaveBeenCalledTimes(1);
            expect(service.showError).toHaveBeenCalledTimes(1);

            let extendedError = {
                ...ERROR400, error: {
                    ...ERROR400.error, title: {
                        404: 'Não encontramos nenhum substituto',
                        400: 'Código informado invalido',
                        500: 'Não foi possível realizar a pesquisa'
                    }
                }
            };
            expect(service.showError).toHaveBeenCalledWith(extendedError)
        })
    });


    describe('Insertar produto', () => {
        it('deve insertar o produto informado com a prioridade informada e retorna a requisição', () => {
            let prod = {...PRODUTO, cdGrupoSubstituto: 1};
            localStorage.setItem('cdOperador', '123');
            spyOn(service['mocker'], 'insertSubstitute').and.returnValue(of(prod));
            service.create(prod).subscribe(data => {
                expect(data).toEqual(prod)
            });

            expect(service['mocker'].insertSubstitute).toHaveBeenCalledTimes(1);

        })
    });


    describe('Atualizar produtos', () => {
        it('deve alterar os produtos informados', () => {

            let newProducts = service['mocker'].baseMock.map((item, idx) => {
               return { ...item,
                dsProduto: item.prioridade + 'produto',
               flDeletado: 0
            }});
            service.productsSubject.next(newProducts);
            spyOn(service['mocker'], 'updateSubstitutes').and.returnValue(of(newProducts));

            service.update(false).subscribe(data => {
                expect(data).toEqual(newProducts)
            });
            expect(service['mocker'].updateSubstitutes).toHaveBeenCalledTimes(1);

        });


        describe('Remover produto', () => {
            it('deve remover o produto informado', () => {
                service.productsSubject.next([PRODUTO_FULL]);
                spyOn(service['mocker'], 'removeProduct').and.returnValue(of({deleted: [123]}));
                service.update(true, [PRODUTO, PRODUTO]);
                expect(service['mocker'].removeProduct).toHaveBeenCalledTimes(1);
            })
        })
    });


    describe('Exportar modelo', () => {
        it('deve chamar a função de download', () => {
            spyOn(service['mocker'], 'exportModel');
            let request = {endpoint: service.endpoints.modeloCSV};
            service.exportModel();
            expect(service['mocker'].exportModel).toHaveBeenCalledTimes(1);
            expect(service['mocker'].exportModel).toHaveBeenCalledWith(request);
        })
    });


    describe('Validar produto substituto selecionado', () => {
       it('deve validar o produto e retornar um observable de produto', () => {
           spyOn(service['mocker'], 'validateProduct');
           let request = {endpoint: service.endpoints.validar, params: [PRODUTO.cdProduto.toString()]};
           service.validate(PRODUTO.cdProduto);
           expect(service['mocker'].validateProduct).toHaveBeenCalledTimes(1);
           expect(service['mocker'].validateProduct).toHaveBeenCalledWith(request);
       })
    });


    describe('Mostrar erro', () => {
        it('deve receber um config e chamar a função de abrir dialog', () => {
            spyOn(service.utils, 'showError');
            let config = new HttpErrorResponse({status: 400, error: {mensagem: 'Erro', title: {400: 'Oops!'}}});
            service.showError(config);
            expect(service.utils.showError).toHaveBeenCalledTimes(1);
            expect(service.utils.showError).toHaveBeenCalledWith(config);
        })
    });
});


