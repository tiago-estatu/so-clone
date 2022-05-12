import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {ProdutoComboComponent} from "./produtos-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MatAutocompleteModule, MatChipsModule} from "@angular/material";
import {HttpClientModule} from "@angular/common/http";
import {SimpleNotificationsModule} from "angular2-notifications";
import {of, throwError} from "rxjs";
import {Produto} from "../../../services/classes";
const PRODUTO: Produto = {
    cdProduto: 1,
    dsProduto: 'teste 1'
};
const PRODUTOS_SERVER = [
    {cdProduto: 1, dsProduto: 'teste 1'},
    {cdProduto: 2, dsProduto: 'teste 2'},
    {cdProduto: 3, dsProduto: 'teste 3'},
];

const NOTIFICATION_CONFIG = {
    timeOut: 3000,
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: false
};

describe('Produtos Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: ProdutoComboComponent;
    let fixture: ComponentFixture<ProdutoComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule,
                FormsModule, CommonModule, MatAutocompleteModule, MatChipsModule, HttpClientModule, SimpleNotificationsModule.forRoot()],
            declarations: [ProdutoComboComponent],
            providers: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ProdutoComboComponent);
        component = fixture.componentInstance;
    }));

    it('Should create component', () => {
        expect(component).toBeTruthy();
    });


    describe('Mensagem Tooltip', () => {
        it('Deve retornar o nome do produto', () => {
            let result = component.mensagemTooltip(PRODUTO);
            expect(result).toEqual(PRODUTO.dsProduto);
        })
    });

    describe('Check number', () => {
        it('Deve retornar um booleano dependendo do keycode do eveto de press se o config for so pra numbers', () => {
            component.config.onlyNumber = true;
            let shouldBeTrue = component.checkNumbers({keyCode: 12});
            let shouldBeFalse = component.checkNumbers({keyCode: 69});
            expect(shouldBeTrue).toEqual(true);
            expect(shouldBeFalse).toEqual(false)
        });
        it('Deve retornar sempre true se o config não for exclusivo pra numbers', () => {
            component.config.onlyNumber = false;
            let shouldBeTrue = component.checkNumbers({keyCode: 12});
            let shouldBeAlsoTrue = component.checkNumbers({keyCode: 69});
            expect(shouldBeTrue).toEqual(true);
            expect(shouldBeAlsoTrue).toEqual(true)
        });
    });



    describe('Search Produto', () => {
        describe('Search by name', () => {
            it('Deve salvar a resposta do servidor e chamar recuperarProdutosFiltrados', () => {
                let response = of(PRODUTOS_SERVER);
                let name = "teste_nome";
                spyOn(component['produtoService'], 'getProdutoContainsNome').and.returnValue(response);
                spyOn(component, "recuperarProdutosFiltrados");
                expect(component.todosProdutos.length).not.toEqual(PRODUTOS_SERVER.length);

                component.searchByName(name);
                expect(component["produtoService"].getProdutoContainsNome).toHaveBeenCalledTimes(1);
                expect(component["produtoService"].getProdutoContainsNome).toHaveBeenCalledWith(name);
                expect(component.recuperarProdutosFiltrados).toHaveBeenCalledTimes(1);
                expect(component.todosProdutos.length).toEqual(PRODUTOS_SERVER.length);
            });

            it('Deve parar o loading se o servidor retornar erro', () => {
                let response = throwError({status: 500, error: {}});
                spyOn(component['produtoService'], 'getProdutoContainsNome').and.returnValue(response);
                component.searchByName('teste');
                expect(component.componentLoading).toEqual(false)
            })
        });

        describe('Search by code', () => {
            it('Deve salvar a resposta do servidor e chamar recuperarProdutosFiltrados', () => {
                let response = of(PRODUTOS_SERVER[0]);
                let name = "123";
                spyOn(component['produtoService'], 'getProdutoByIdVenda').and.returnValue(response);
                spyOn(component, "recuperarProdutosFiltrados");
                expect(component.todosProdutos.length).not.toEqual(PRODUTOS_SERVER.length);

                component.searchByCode(name);
                expect(component["produtoService"].getProdutoByIdVenda).toHaveBeenCalledTimes(1);
                expect(component["produtoService"].getProdutoByIdVenda).toHaveBeenCalledWith('123');
                expect(component.recuperarProdutosFiltrados).toHaveBeenCalledTimes(1);
                expect(component.todosProdutos.length).toEqual(1);
            });

            it('Deve parar o loading se o servidor retornar erro', () => {
                let response = throwError({status: 500, error: {}});
                spyOn(component['produtoService'], 'getProdutoByIdVenda').and.returnValue(response);
                component.searchByCode('123');
                expect(component.componentLoading).toEqual(false)
            });

            it('Deve informar do erro se o servidor retornar erro 404', () => {
                let response = throwError({status: 404, error: {}});
                spyOn(component, "notificarProdutoNaoEncontrado");
                spyOn(component['produtoService'], 'getProdutoByIdVenda').and.returnValue(response);
                component.searchByCode('123');
                expect(component.componentLoading).toEqual(false);
                expect(component.notificarProdutoNaoEncontrado).toHaveBeenCalledTimes(1);
                expect(component.notificarProdutoNaoEncontrado).toHaveBeenCalledWith(component.produtoControl.value);
            })
        })
    });


    describe('Notificações', () => {

        describe('Notificar Não Encontrado', () => {
            it('Deve notificar que o cod do produto informado não foi encontado', () => {
                spyOn(component['_notifications'], 'error');
                component.notificarProdutoNaoEncontrado(PRODUTO.cdProduto);
                expect(component['_notifications'].error).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].error).toHaveBeenCalledWith('Oops!', `Não encontramos o produto ${PRODUTO.cdProduto}.`, NOTIFICATION_CONFIG);
            })
        });

        describe('Notificar Exclusão selecionado', () => {
            it('Deve notificar foi excluido um produto', () => {
                spyOn(component['_notifications'], 'info');
                component.notificarExclusaoProdutoSelecionado(PRODUTO);
                expect(component['_notifications'].info).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].info).toHaveBeenCalledWith(`Removido!`, PRODUTO.cdProduto + '-' + PRODUTO.dsProduto, NOTIFICATION_CONFIG);
            });

            it('Deve notificar foi excluido um produto com um label customizado', () => {
                spyOn(component['_notifications'], 'info');
                let customLabel = 'LABEL';
                component.config.label = customLabel;
                component.notificarExclusaoProdutoSelecionado(PRODUTO);
                expect(component['_notifications'].info).toHaveBeenCalledTimes(1);
                expect(component['_notifications'].info).toHaveBeenCalledWith(`Removido ${customLabel}!`, PRODUTO.cdProduto + '-' + PRODUTO.dsProduto, NOTIFICATION_CONFIG);
            })
        })

    });

    describe('Obter descrição do produto', () => {
        it('Deve retornar uma descrição formatada do produto informado, sem a descrição se o config for multi', () => {
            component.config.multi = true;
            let expectedString = `${PRODUTO.cdProduto} `;
            expect(component.getDescriptionProduct(PRODUTO)).toEqual(expectedString);
        });

        it('Deve retornar uma descrição formatada do produto, com a descrição se o config não for multi', () => {
            component.config.multi = false;
            let expectedString = `${PRODUTO.cdProduto} - ${PRODUTO.dsProduto}`;
            expect(component.getDescriptionProduct(PRODUTO)).toEqual(expectedString);

        })
    });


    describe('Recuperar filtros', () => {
        it('Deve mapear o valor do formControl produto e mapear com o filterOnValueChange', async () => {
            spyOn((<any>component), 'filterOnValueChange').and.returnValue([PRODUTO]);
            expect(component.filteredProdutos ).toBeUndefined();
            await component.recuperarProdutosFiltrados();
            await component.produtoControl.setValue([[1]]);
            fixture.detectChanges();
            expect(component['filterOnValueChange']).toHaveBeenCalledTimes(1);
        })
    });

    describe('Filter on value', () => {
        it('Deve filtrar os produtos ja selecionados e entregar o resultado se receber o valor um argumento nulo', () => {
            component.todosProdutos = PRODUTOS_SERVER;
            spyOn((<any>component), 'filterProduto').and.returnValue([]);
            component.chipSelectedProdutos = PRODUTOS_SERVER.slice(0,2);
            let result = component['filterOnValueChange'](PRODUTOS_SERVER[PRODUTOS_SERVER.length]);
            expect(result).toEqual(PRODUTOS_SERVER.slice(2,5));
            expect(component['filterProduto']).toHaveBeenCalledTimes(0);
        });

        it('Deve filtrar os produtos ja selecionados e retornar o resultado de filterProduto', () => {
            component.todosProdutos = PRODUTOS_SERVER;
            spyOn((<any>component), 'filterProduto').and.returnValue([]);
            component.chipSelectedProdutos = PRODUTOS_SERVER.slice(0,2);
            let result = component['filterOnValueChange'](PRODUTOS_SERVER[PRODUTOS_SERVER.length - 1]);
            expect(result).toEqual([]);
            expect(component['filterProduto']).toHaveBeenCalledTimes(1);
        })


    });


    describe('Selecionar Produto', () => {
        it('Deve salvar no formControl e emitir o produto recebido e setar o form como enabled si o resultado não estiver vazio', () => {
            expect(component.control.value).toBeNull();
            component.chipSelectedProdutos = [PRODUTO];
            spyOn(component.selecionados, 'emit');
            component.selectProducts([PRODUTO]);
            testUtils.selecionadoFormItem(component, [PRODUTO], [PRODUTO], 'control');
            fixture.detectChanges();
            expect(component.produtoControl.disabled).toEqual(true);

        });

        it('Deve salvar no formControl e emitir o produto recebido e setar o form como disabled si o resultado estiver vazio', () => {
            expect(component.control.value).toBeNull();
            component.chipSelectedProdutos = [];
            spyOn(component.selecionados, 'emit');
            component.selectProducts([]);
            testUtils.selecionadoFormItem(component, [], [], 'control');
            expect(component.produtoControl.disabled).toEqual(false);
        })
    })

});
