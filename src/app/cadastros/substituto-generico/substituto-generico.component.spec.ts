import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {SubstitutoGenericoComponent} from './substituto-generico.component';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HeaderService} from "../../commons/services";
import {HttpClientModule, HttpErrorResponse} from "@angular/common/http";
import {Observable, of, Subscription, throwError} from "rxjs";
import {delay} from "rxjs/operators";
import {TestHelper} from "../../commons/helpers/test.helper";
import {SubstitutoGenericoModel} from "../../commons/services/substituto-generico/substituto-generico.model";
import Swal from "sweetalert2";

const PRODUTO = {cdProduto: 1, dsProduto: 'Produto 1'};

const PRODUTOS: SubstitutoGenericoModel[] = [
    new SubstitutoGenericoModel({
        cdProduto: 1,
        dsProduto: 'teste 1',
        prioridade: 1,
        nmFantasiaFornecedor: 'teste 1',
        cdFornecedor: 1,
        cdCategoriaMaster: 1,
        dsCategoriaMaster: 'master',
        cdPrincipioAtivoComposto: 1,
        dsPrincipioAtivoComposto: '1',
        clCurvaFis: 'F',
        cdGrupoSubstituto: 1
    }),
    new SubstitutoGenericoModel({
        cdProduto: 2,
        dsProduto: 'teste 2',
        prioridade: 2,
        nmFantasiaFornecedor: 'teste 2',
        cdFornecedor: 2,
        cdCategoriaMaster: 1,
        dsCategoriaMaster: 'master',
        cdPrincipioAtivoComposto: 2,
        dsPrincipioAtivoComposto: '2',
        clCurvaFis: 'F',
        cdGrupoSubstituto: 1

    })
]

describe('SubstitutoGenericoComponent', () => {
    let component: SubstitutoGenericoComponent;
    let fixture: ComponentFixture<SubstitutoGenericoComponent>;
    let testUtils = new TestHelper(expect);
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, FormsModule, HttpClientModule],
            declarations: [SubstitutoGenericoComponent],
            providers: [HeaderService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SubstitutoGenericoComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        spyOn(component['_headerService'], 'setTitle');
        spyOn(component, 'initFilterForm');
        spyOn(component, 'initSubstituteForm');
        expect(component.productSubject).not.toBeDefined();
        expect(component.productSubscription).not.toBeDefined();

        // init
        component.ngOnInit();
        // validate
        expect(component['_headerService'].setTitle).toHaveBeenCalledWith('Substitutos genéricos');
        expect(component.initFilterForm).toHaveBeenCalledTimes(1);
        expect(component.initSubstituteForm).toHaveBeenCalledTimes(1);


        // loading
        component.componentLoading = true;
        component.productSubject.next(component.productSubject.getValue());
        expect(component.componentLoading).toEqual(false)
    });


    describe('Formularios', () => {

        describe('Filter form, formulario de filtro principal', () => {
            it('deve criar o formulario corretamente', () => {
                expect(component.filterForm).not.toBeDefined();
                component.initFilterForm();
                expect(component.filterForm).toBeDefined();
                let rawValue = component.filterForm.getRawValue();
                expect(rawValue).toEqual({cdProduto: ""})
            });

            it('deve poder ser resetado', () => {
                component.initFilterForm();
                component.filterForm.get('cdProduto').setValue('123');
                expect(component.filterForm.getRawValue().cdProduto).toEqual('123');
                component.resetarCampos();
                expect(component.filterForm.getRawValue().cdProduto).toEqual(null);
            })
        })


        describe('Substituto form, formulario do subsituto a ser cadastrado', () => {
            it('deve criar o formulario corretamente', () => {
                expect(component.substitutoForm).not.toBeDefined();
                component.initSubstituteForm();
                expect(component.substitutoForm).toBeDefined();
                let rawValue = component.substitutoForm.getRawValue();
                expect(rawValue).toEqual({cdProduto: "", prioridade: ""})
            });


            it('deve validar quando o produto for atualizado', () => {
                component.initSubstituteForm();
                let response = of(PRODUTO);
                spyOn(component['_substitutoGenericoService'], 'validate').and.returnValue(response);
                component.substitutoForm.get('cdProduto').setValue([{cdProduto: 1}]);
                expect(component['_substitutoGenericoService'].validate).toHaveBeenCalledTimes(1);
                expect(component['_substitutoGenericoService'].validate).toHaveBeenCalledWith(1);
            });


            it('deve informar de erros quando o produto e inválido', () => {
                component.initSubstituteForm();
                let response = throwError({status: 400, error: {mensagem: 'Teste funcionando'}});
                spyOn(component['_substitutoGenericoService'], 'validate').and.returnValue(response);
                spyOn(component['_substitutoGenericoService'], 'showError');
                component.substitutoForm.get('cdProduto').setValue([{cdProduto: 1}]);


                expect(component['_substitutoGenericoService'].validate).toHaveBeenCalledTimes(1);
                expect(component['_substitutoGenericoService'].validate).toHaveBeenCalledWith(1);

                expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(1);
                expect(component.substitutoForm.getRawValue().cdProduto).toEqual(null);

            });
        });

        describe('Obter controle como FormControl', () => {

            it('deve retornar um controle caso o grupo exista', () => {
                component.initFilterForm();
                component.filterForm.get('cdProduto').setValue(123);
                let control = component.getControl(component.filterForm, 'cdProduto');
                expect(control.value).toEqual(123);
                expect(control).toBeInstanceOf(FormControl);
            });

            it('não deve retornar nada se o grupo não existir', () => {
                let x = null;
                let control = component.getControl((x as FormGroup), 'cdProduto');
                expect(control).not.toBeDefined();
            })
        })

    });

    describe('Consultar produtos', () => {
        it('Deve realizar a consulta no serviço com o cod de produto informado', fakeAsync(() => {
            component.ngOnInit();
            component.filterForm.get('cdProduto').setValue([PRODUTO]);
            let subs = of(true).pipe(delay(10)).subscribe(data => {
            });
            spyOn(component['_substitutoGenericoService'], 'getCurrentSubstituteList').and.returnValue(subs);
            component.consultar();
            expect(component.componentLoading).toEqual(true);
            expect(component['_substitutoGenericoService'].getCurrentSubstituteList).toHaveBeenCalledTimes(1)
            expect(component['_substitutoGenericoService'].getCurrentSubstituteList).toHaveBeenCalledWith(PRODUTO.cdProduto.toString())
            tick(10);
            expect(component.componentLoading).toEqual(false);
        }))
    })


    describe('Modal de confirmação para editar ou deletar', () => {

        it('deve mostrar um modal e retornar um observable de a edição não esta habilitada', () => {
            let config = {title: 'teste unitario', content: 'testes'};
            component.editing = false;
            let result = component.askToWipe(config);
            expect({title: config.title, content: config.content, icon: 'warning'}).dialogToExist();
            expect(result).toBeInstanceOf(Observable);
            testUtils.closeDialog();
        });

        it('deve retornar sempre um observable com value true se a edição ja estiver habilitada', () => {
            let config = {title: 'teste unitario', content: 'testes'};
            component.editing = true;
            let result = component.askToWipe(config);
            expect(result).toBeInstanceOf(Observable);
            result.subscribe(data => {
                expect(data).toEqual({value: true})
            });
        });
    });


    describe('Cancelar edição', () => {
        it('Deve cancelar a edição e dar rollback nos itens', () => {
            component.ngOnInit();
            let mapped = JSON.parse(JSON.stringify(PRODUTOS)).map(item => {
                item.prioridade = null;
                return item
            });
            component.productSubject.next(mapped);
            component.imProdutos = PRODUTOS;
            component.editing = true;

            expect(component.productSubject.getValue()).not.toEqual(PRODUTOS);
            component.cancelEditing();
            expect(component.productSubject.getValue()).toEqual(PRODUTOS);
            expect(component.editing).toEqual(false);
        })
    });

    describe('Importar arquivo', () => {
        it('deve receber um evento de change e chamar o serviço com o arquivo a ser enviado', fakeAsync(() => {
            component.ngOnInit();
            let event = {
                target: {
                    files: {
                        item: () => {
                            return '123;123'
                        }
                    }
                }
            };
            let subs = of(true).pipe(delay(10));
            component.fileControl.setValue('123;123')

            spyOn(component['_substitutoGenericoService'], 'importFile').and.returnValue(subs);

            component.importFile(event);
            expect(component['_substitutoGenericoService'].importFile).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].importFile).toHaveBeenCalledWith('123;123');
            expect(component.componentLoading).toEqual(true);
            tick(10);
            expect(component.componentLoading).toEqual(false);
            expect(component.fileControl.value).toEqual("");
        }))
    });

    describe('Exportar modelo csv', () => {
        it('deve chamar o serviço para o download do modelo csv', fakeAsync(() => {
            component.ngOnInit();
            let subs = of(true).pipe(delay(10)).subscribe(data => {
            });
            spyOn(component['_substitutoGenericoService'], 'exportModel').and.returnValue(subs);
            component.exportarModeloCSV();
            expect(component.componentLoading).toEqual(true);
            expect(component['_substitutoGenericoService'].exportModel).toHaveBeenCalledTimes(1);
            tick(10);
            expect(component.componentLoading).toEqual(false);
        }))
    })

    describe('Adicionar substituto', () => {
        it('deve chamar o serviço para adicionar um produto e incluir o produto no subject', () => {
            component.ngOnInit();
            component.productSubject.next(PRODUTOS);
            component.substitutoForm.setValue({
                cdProduto: [PRODUTO],
                prioridade: 20,
            });
            let response = of({cdGrupoSubstituto: 1, prioridade: 20, cdProduto: 20});
            spyOn(component['_substitutoGenericoService'], 'create').and.returnValue(response);
            spyOn(component, 'consultar').and.returnValue({});

            component.addSubstitute();
            expect(component['_substitutoGenericoService'].create).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].create).toHaveBeenCalledWith({
                cdProduto: PRODUTO.cdProduto,
                prioridade: 20,
                cdGrupoSubstituto: 1,
                flDeletado: 0
            });
            expect(component.substitutoForm.get('cdProduto').value).toEqual(null);
            expect(component.substitutoForm.get('prioridade').value).toEqual(null);

        });


        it('deve mostrar os erros do servidor', () => {
            component.ngOnInit();
            component.productSubject.next(PRODUTOS);

            component.substitutoForm.setValue({
                cdProduto: [PRODUTO],
                prioridade: 20
            });
            let responseBody = {status: 400, error: {mensagem: 'Produto não encontrado',}};
            let err = throwError(responseBody);
            spyOn(component['_substitutoGenericoService'], 'create').and.returnValue(err);
            spyOn(component['_substitutoGenericoService'], 'showError');

            component.addSubstitute();
            expect(component['_substitutoGenericoService'].create).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(1);
            expect(component.substitutoForm.get('cdProduto').value).not.toEqual(null);
            expect(component.substitutoForm.get('prioridade').value).not.toEqual(null);
        })
    })


    describe('Validação de inserção no front', () => {
        it('Deve criar um erro 403 se a tela estiver em edição', () => {
            let err = new HttpErrorResponse({
                status: 403,
                error: {
                    title: {400: 'Quantidade máxima de substitutos', 403: 'Salve as alterações para continuar'},
                    mensagem: 'Por favor, salve as alterações antes de adicionar um novo substituto'
                }
            });

            component.editing = true;
            spyOn(component['_substitutoGenericoService'], 'showError');
            component.showInsertionError();
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledWith(err);

        })

        it('Deve criar um erro 400 se a tela não estiver em eduçao', () => {
            let err = new HttpErrorResponse({
                status: 400,
                error: {
                    title: {400: 'Quantidade máxima de substitutos', 403: 'Salve as alterações para continuar'},
                    mensagem: 'A quantidade máxima de produtos substitutos por grupo e de 20 itens'
                }
            });
            component.editing = false;
            spyOn(component['_substitutoGenericoService'], 'showError');
            component.showInsertionError();
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledWith(err);

        })
    })

    describe('Alterar e excluir prioridades', () => {
        it('deve zerar as prioridades se o usuario aceitar alterar', () => {
            component.ngOnInit();
            component.productSubject.next(PRODUTOS);
            let prods = JSON.parse(JSON.stringify(PRODUTOS));
            expect(component.editing).toEqual(false);
            spyOn(component, 'askToWipe').and.returnValue(of({value: true}));

            component.modifyValues();

            expect(component.editing).toEqual(true);
            expect(component.imProdutos).toEqual(prods);
            expect(component.productSubject.getValue().length).toEqual(PRODUTOS.length);
            expect(component.productSubject.getValue().filter(i => i.prioridade != null)).toHaveLength(0)

        });

        it('não deve zerar as prioridades se o usuario não aceitar alterar', () => {
            component.ngOnInit();
            component.productSubject.next(PRODUTOS);
            let prods = JSON.parse(JSON.stringify(PRODUTOS));
            expect(component.editing).toEqual(false);
            spyOn(component, 'askToWipe').and.returnValue(of({value: false}));

            component.modifyValues();

            expect(component.editing).toEqual(false);
            expect(component.productSubject.getValue().length).toEqual(PRODUTOS.length);
            expect(component.productSubject.getValue().filter(i => i.prioridade != null)).toHaveLength(prods.length)

        });

        it('deve excluir e zerar as prioridades se for enviado um argumento de produto', () => {
            component.ngOnInit();
            component.productSubject.next(PRODUTOS);
            expect(component.editing).toEqual(false);
            spyOn(component, 'askToWipe').and.returnValue(of({value: true}));

            component.modifyValues(PRODUTOS[0]);

            expect(component.editing).toEqual(true);
            expect(component.productSubject.getValue().length).toEqual(PRODUTOS.length - 1);
            expect(component.productSubject.getValue().filter(i => i.prioridade != null)).toHaveLength(0)

        })
    })


    describe('Salvar alterações', () => {
       it('Não deve permitir salvar alterações se alguma prioridade não estiver completa', () => {
           component.ngOnInit();
           let prods = [...PRODUTOS];
           prods[0].prioridade = null;
           let err = new HttpErrorResponse({
               status: 400,
               error: {
                   title: {400: 'Prioridade não informada'},
                   mensagem: 'Todos os campos de prioridade precissam estar completos para salvar.'
               }
           });
           component.productSubject.next(PRODUTOS);
           component.editing =true;
            spyOn(component['_substitutoGenericoService'], 'showError');

            component.saveChanges();
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledWith(err);
            expect(component.editing).toEqual(true);

       })


        it('Deve salvar alterações quando as prioridades estiverem certas', () => {

            component.ngOnInit();
            component.productSubject.next(PRODUTOS.map((i, idx) => ({...i, prioridade: idx})));
            component.editing = true;
            spyOn(component['_substitutoGenericoService'], 'showError');
            spyOn(component['_substitutoGenericoService'], 'update').and.returnValue(of(true));

            component.saveChanges();
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(0);
            expect(component['_substitutoGenericoService'].update).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].update).toHaveBeenCalledWith(false, component.imProdutos)
            expect(component.editing).toEqual(false);

        })

        it('Deve salvar alterações resultantes de uma deleção como delete', () => {

            component.ngOnInit();
            let products = PRODUTOS.map((i, idx) => ({...i, prioridade: idx}));
            component.productSubject.next(products.slice(0, products.length - 1));
            component.imProdutos = products;
            component.editing = true;
            spyOn(component['_substitutoGenericoService'], 'showError');
            spyOn(component['_substitutoGenericoService'], 'update').and.returnValue(of(true));

            component.saveChanges();
            let filtered = products
                .filter(item => !component.productSubject.getValue()
                    .find(prod => (prod.cdProduto == item.cdProduto))
                ).map(i => {i.flDeletado = 1; return i});
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(0);
            expect(component['_substitutoGenericoService'].update).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].update).toHaveBeenCalledWith(true, filtered);
            expect(component.editing).toEqual(false);

        })

        it('Deve mostrar os erros do servidor corretamente', () => {

            component.ngOnInit();
            component.productSubject.next(PRODUTOS.map((i, idx) => ({...i, prioridade: idx})));
            component.editing = true;
            let baseErr = {status: 400, error: {mensagem: 'Erro teste'}};
            spyOn(component['_substitutoGenericoService'], 'showError');
            spyOn(component['_substitutoGenericoService'], 'update').and.returnValue(throwError(baseErr));
            let err =  {
                404: 'Substituto não encontrado',
                400: 'Substitutos não validos',
                500: 'Não foi possível salvar os substitutos'
            };

            component.saveChanges();
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].update).toHaveBeenCalledTimes(1);
            expect(component['_substitutoGenericoService'].showError).toHaveBeenCalledWith(
                {...baseErr, error: {...baseErr.error, title: err}}
            );
            expect(component.editing).toEqual(true);

        })
    });


    describe('Salvar ou deletar', () => {
        it('deve salvar', () => {
            component.ngOnInit();
            component.imProdutos = [1,2,3];
            component.productSubject.next(PRODUTOS);
            spyOn(component, 'saveChanges');
            component.saveOrDelete();

            expect(component.saveChanges).toHaveBeenCalledTimes(1)
        })

        it('deve excluir o grupo', () => {
            component.ngOnInit();
            component.imProdutos = [1,2,3];
            component.productSubject.next([PRODUTOS[0]]);
            spyOn(component, 'shouldRemoveGroup');
            component.saveOrDelete();

            expect(component.shouldRemoveGroup).toHaveBeenCalledTimes(1)
        })

    })


    describe('Modal de exclusão de grupo', () => {
        afterEach(() => {
            testUtils.closeDialog();
        });
        it('Deve mostar o modal de confirmação', () => {
            component.shouldRemoveGroup();
            expect({
                title: 'Deseja excluir a chave de substitutos?',
                icon: 'warning', config: {compareContent: false}}).dialogToExist();
        });

        it('Deve salvar as alterações se confirmado', async () => {
            spyOn(component, 'saveChanges').and.returnValue({});
            component.shouldRemoveGroup();
            await testUtils.confirmDialog();
            expect(component.saveChanges).toHaveBeenCalledTimes(1);

        });

        it('Não deve salvar as alterações se for cancelado', async () => {
            spyOn(component, 'saveChanges').and.returnValue({});
            component.shouldRemoveGroup();
            await testUtils.cancelDialog();
            expect(component.saveChanges).toHaveBeenCalledTimes(0);

        });
    })


});
