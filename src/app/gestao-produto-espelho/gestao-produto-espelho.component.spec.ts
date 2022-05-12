import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {GestaoProdutoEspelhoComponent} from './gestao-produto-espelho.component';
import {Injectable, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HeaderService} from '../commons/services/header.service';
import {ReactiveFormsModule} from '@angular/forms';
import {ProdutoEspelhoService, IProdutoEspelhoService} from '../commons';
import {Observable, of, throwError} from 'rxjs';
import {MatFormFieldModule, MatInputModule, MatChipsModule} from '@angular/material';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {delay} from 'rxjs/operators/delay';
import { TestHelper } from '../commons/helpers/test.helper';
import { SweetAlertIcon } from 'sweetalert2/*/sweetalert2.js';
import { Produto } from '../commons/services/produtos/produto';
import {ProdutoEspelhoModel} from "../commons/models/produto-espelho.model";


const PRODUTO_TESTE_SEMDEMANDA = { cdProduto: 1, dsProduto: 'Sem demanda'} ;
const PRODUTO_TESTE_ESPELHO_NOVO = { cdProduto: 2, dsProduto: 'Espelho Novo'} ;
const PRODUTO_TESTE_ESPELHO_CADASTRADO = { cdProduto: 3, dsProduto: 'Espelho cadastrado'} ;
@Injectable()
class StudHeaderService {
    title = 'Title';

    setTitle(title) {
        this.title = title
    }
}

@Injectable()
class StudProdutoEspelhoService implements IProdutoEspelhoService {
    validateMirror(productId: number) {
        return of(PRODUTO_TESTE_ESPELHO_NOVO);
    }
    getProductById(productId: string | number): Observable<Produto> {
        throw new Error("Method not implemented.");
    }
    exportarModeloCSV() {
        throw new Error("Method not implemented.");
    }
    getEndpoint() {
        throw new Error("Method not implemented.");
    }

    getMirrorByLinkedId(productId: number): Observable<any> {
        let product: Observable<any> = (productId == 123 ? of({
            content: {
                produto: PRODUTO_TESTE_ESPELHO_CADASTRADO
            }
        }) : of({content: {produto: PRODUTO_TESTE_ESPELHO_CADASTRADO}}));
        return product.pipe(delay(10))
    }

    updateProduct(product: ProdutoEspelhoModel): Observable<any> {
        throw new Error("Method not implemented.");
    }

    importProduct(file: File) {
        throw new Error("Method not implemented.");
    }

    createProduct(product: ProdutoEspelhoModel): Observable<any> {
        throw new Error("Method not implemented.");
    }
}

describe('GestaoProdutoEspelhoComponent', () => {
    let component: GestaoProdutoEspelhoComponent;
    let fixture: ComponentFixture<GestaoProdutoEspelhoComponent>;
    let produtoEspelhoService: ProdutoEspelhoService;
    let headerService: HeaderService;
    let utils: TestHelper = new TestHelper(expect);
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [GestaoProdutoEspelhoComponent],
            providers: [{provide: HeaderService, useClass: StudHeaderService}, {
                provide: ProdutoEspelhoService,
                useClass: StudProdutoEspelhoService
            }],
            imports: [ReactiveFormsModule, MatFormFieldModule, MatChipsModule, MatInputModule, HttpClientModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        headerService = TestBed.get(HeaderService);
        produtoEspelhoService = TestBed.get(ProdutoEspelhoService);
        fixture = TestBed.createComponent(GestaoProdutoEspelhoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Funcao limpar espelho cadastrado baseado em Produto sem demanda.', () => {
        it('deve limpar campo espelho quando produto sem demanda for removido', () => {
            component.produtoEspelhoForm.setValue({
                semDemanda: ['123'],
                espelhoCadastrado: ['4032'],
                novoEspelho: ['']
            });

            let formValues = {...component.produtoEspelhoForm.getRawValue()}

            expect(formValues.semDemanda.length).toBeGreaterThan(0);
            expect(formValues.espelhoCadastrado.length).toBeGreaterThan(0);

            component.produtoEspelhoForm.patchValue({
                semDemanda: [],
            });
            formValues = {...component.produtoEspelhoForm.getRawValue()}
            expect(formValues.semDemanda.length).toEqual(0);
            expect(formValues.espelhoCadastrado.length).toEqual(0);
        })

    });

    describe('funcao de toggle loading ', () => {
        it('deve setar estado da variavel componentLoading para true, quando recebe o valor true', () => {
            component.componentLoading = false;
            component.toggleLoading(true);
            expect(component.componentLoading).toEqual(true);
        });

        it('deve setar estado da variavel componentLoading para false, quando invocarmos com o valor falsy', () => {

            component.componentLoading = false;
            component.toggleLoading();
            expect(component.componentLoading).toEqual(false);

            component.componentLoading = true;
            component.toggleLoading();
            expect(component.componentLoading).toEqual(false);
        });
    });

    describe('selecionar produtos sem demanda', ( ) => {

        afterEach(() => {
            utils.closeDialog();
        });
        it('deve setar o produto espelho cadastrado, caso produto selecionado tenha um produto espelho cadastrado', fakeAsync(() => {
            //prep
            component.produtoEspelhoForm.reset();
            expect(component.componentLoading).toEqual(false);

            // TODO add delayed response
            let resposta = of(PRODUTO_TESTE_ESPELHO_CADASTRADO).pipe(delay(10));
            spyOn(produtoEspelhoService, 'getMirrorByLinkedId').and.returnValue(resposta);
            component.selectProduct([PRODUTO_TESTE_SEMDEMANDA]);
            expect(component.componentLoading).toEqual(true);
            tick(11);

            // assertions
            expect(produtoEspelhoService.getMirrorByLinkedId).toHaveBeenCalledTimes(1);
            let espelhoCadastrado = component.produtoEspelhoForm.getRawValue().espelhoCadastrado;
            expect(espelhoCadastrado).toEqual([PRODUTO_TESTE_ESPELHO_CADASTRADO]);  
            expect(component.componentLoading).toEqual(false);
        }));

        it('não deve alterar o campo produto espelho, caso produto sem demanda não tenha espelho cadastrado', () => {
            //prep
            component.produtoEspelhoForm.reset();

            // TODO add delayed response
            let resposta = of(null);
            spyOn(produtoEspelhoService, 'getMirrorByLinkedId').and.returnValue(resposta);
            component.selectProduct([PRODUTO_TESTE_SEMDEMANDA]);
           
            // assertions
            expect(produtoEspelhoService.getMirrorByLinkedId).toHaveBeenCalledTimes(1);
            let espelhoCadastrado = component.produtoEspelhoForm.getRawValue().espelhoCadastrado;
            expect(espelhoCadastrado).toEqual(null);  

        });

        it('deve exibir uma modal Produto inválido caso o produto sem demanda SELECIONADA contenha alguma anormalidade pelo servidor(deletado, desativado)', () =>{
            const MESSAGE = 'Produto inválido';
            let response = throwError({ status: 400, error: {mensagem: MESSAGE}});

            spyOn(produtoEspelhoService, 'getMirrorByLinkedId').and.returnValue(response);
            spyOn(component, 'showModalProductError');
            
            component.selectProduct([PRODUTO_TESTE_SEMDEMANDA]);
            expect(produtoEspelhoService.getMirrorByLinkedId).toHaveBeenCalledTimes(1);

            expect(component.showModalProductError).toHaveBeenCalledTimes(1);
            
        });
        
    });

    describe('função showModalProductError' , ()=>{
        const TITLE = 'Produto inválido';
        const TYPE: SweetAlertIcon = "warning";
        const STATUS_ERROR = 400;
        const INTERNAL_ERROR = 500;

        it('deve exibir modal caso erro 400', ()=>{
            const MESSAGE = 'Erro customizado para realizacao do teste';
            component.showModalProductError({status: STATUS_ERROR, error: {mensagem: MESSAGE}});
            expect({
                title: TITLE,
                content: MESSAGE,
                icon: TYPE
            }).dialogToExist();
        });

        it('deve exibir modal caso erro genérico', () => {
            const MESSAGE = null;
            const EXPECTED_TITLE = 'Oops!'
            const EXPECTED_MESSAGE = 'Tente novamente mais tarde';
            component.showModalProductError({status: INTERNAL_ERROR, error: {mensagem: MESSAGE}});
            expect({
                title: EXPECTED_TITLE,
                content: EXPECTED_MESSAGE,
                icon: TYPE
            }).dialogToExist();
        });
    })
    
    describe('selecionar produto espelho', ()=>{
        it('deve setar para null o campo produto espelho, caso dê qualquer erro do servidor', ()=>{
            let response = throwError({ status: 400, error: {mensagem: 'Mensagem customizada'}});
            component.produtoEspelhoForm.patchValue({
                semDemanda: [PRODUTO_TESTE_SEMDEMANDA],
                espelhoCadastrado: [PRODUTO_TESTE_ESPELHO_CADASTRADO],
                novoEspelho: [PRODUTO_TESTE_ESPELHO_NOVO]
            })
            spyOn(produtoEspelhoService, 'validateMirror').and.returnValue(response);
            expect(component.produtoEspelhoForm.get('novoEspelho').value).toBeTruthy();

            component.selectMirror([PRODUTO_TESTE_ESPELHO_NOVO]);

            expect(component.produtoEspelhoForm.get('novoEspelho').value).toBeFalsy();

        });
    })


    describe('Layout', () => {
        it('deve setar o titulo da pagina de "Gestão produto espelho"', () => {
            spyOn(headerService, 'setTitle');
            component.ngOnInit();
            expect(headerService.setTitle).toHaveBeenCalledTimes(1);
            expect(headerService.setTitle).toHaveBeenLastCalledWith('Produto espelho');
        })

    });

    describe('Formulario', () => {

        beforeEach(() => {
            component.produtoEspelhoForm.reset();
        });

        it('deveria validar o produto sem demanda obrigatório', () => {
            component.produtoEspelhoForm.get('novoEspelho').setValue([PRODUTO_TESTE_ESPELHO_NOVO]);
            expect(component.produtoEspelhoForm.get('novoEspelho').valid).toStrictEqual(true);
            expect(component.produtoEspelhoForm.valid).toStrictEqual(false);

        });

        it('deveria validar o produto novo espelho obrigatório', () => {
            component.produtoEspelhoForm.get('semDemanda').setValue([PRODUTO_TESTE_SEMDEMANDA]);
            expect(component.produtoEspelhoForm.get('semDemanda').valid).toStrictEqual(true);
            expect(component.produtoEspelhoForm.valid).toStrictEqual(false);
        });

        it('deveria validar se todos os campos obrigatórios estão ok', () => {
            component.produtoEspelhoForm.get('novoEspelho').setValue([PRODUTO_TESTE_ESPELHO_NOVO]);
            component.produtoEspelhoForm.get('semDemanda').setValue([PRODUTO_TESTE_SEMDEMANDA]);
            expect(component.produtoEspelhoForm.valid).toStrictEqual(true);
        });

        it('deveria conter descricao do produto ao seleciona-lo.', () => {
            component.produtoEspelhoForm.setValue({
                semDemanda: [PRODUTO_TESTE_SEMDEMANDA],
                espelhoCadastrado: [PRODUTO_TESTE_ESPELHO_CADASTRADO],
                novoEspelho: [PRODUTO_TESTE_ESPELHO_NOVO],
            });

            // Assertion
            let formValues = component.produtoEspelhoForm.getRawValue();
            expect(formValues.semDemanda[0].dsProduto.length).toBeGreaterThan(0);
            expect(formValues.espelhoCadastrado[0].dsProduto.length).toBeGreaterThan(0);
        });

        describe('Salvar formulário', () => {
           
            beforeEach(()=> {
                component.produtoEspelhoForm.setValue({
                    semDemanda: [PRODUTO_TESTE_SEMDEMANDA],
                    espelhoCadastrado: [],
                    novoEspelho: [PRODUTO_TESTE_ESPELHO_NOVO],
                });
            });

            it('deve mostrar o modal de salvo e limpar o form', () => {
                let formValues =  component.produtoEspelhoForm.getRawValue();
                let produtoModel: ProdutoEspelhoModel = new ProdutoEspelhoModel(
                    {
                        semDemanda: formValues.semDemanda[0],
                        espelhoCadastrado: formValues.espelhoCadastrado,
                        novoEspelho: formValues.novoEspelho[0]
                    });

                let response = of(true);

                spyOn(produtoEspelhoService, 'updateProduct').and.returnValue(response);

                spyOn(component, 'showModal');

                component.salvarFormulario();

                expect(produtoEspelhoService.updateProduct).toHaveBeenCalledTimes(1);
                expect(produtoEspelhoService.updateProduct).toHaveBeenCalledWith(produtoModel)
                expect(component.showModal).toHaveBeenCalledTimes(1);

                expect(component.produtoEspelhoForm.pristine).toEqual(true);
                
            });
            it('deve mostrar modal de erro, caso de algum problema ao salvar', () =>{
                let response = throwError({status: 404, error: { mensagem: 'erro customizado para exibir a modal'}});

                spyOn(produtoEspelhoService, 'updateProduct').and.returnValue(response);

                spyOn(component,'showModal');

                component.salvarFormulario();

                expect(produtoEspelhoService.updateProduct).toHaveBeenCalledTimes(1);
                expect(component.showModal).toHaveBeenCalledTimes(1);

            });
            describe('msg para modal de salvar ou alterar produto espelho', () =>{
                it('deve informar mensagem salvo com sucesso caso nao contenha espelho cadastrado', () =>{
                    let msgModel = {
                        titulo: 'Salvo',
                        msg: 'Produto salvo com sucesso', 
                        type: 'success'
                    }
                    let form = {
                        espelhoCadastrado: [],
                    }
                 
                    spyOn(component,'ehEspelhoSalvo').and.callThrough();
                    const retornoMensagem = component.msg(form);
                    expect(retornoMensagem).toEqual(msgModel);
                    expect(component.ehEspelhoSalvo).toHaveBeenCalledTimes(1);
                })

                it('deve informar mensagem alterado com sucesso caso contenha espelho cadastrado', () => {
                    let msgModel = {
                        titulo: 'Alterado',
                        msg: 'Produto Alterado com sucesso', 
                        type: 'success'
                    }
                    let form = {
                        espelhoCadastrado: [PRODUTO_TESTE_ESPELHO_CADASTRADO],
                    }

                    spyOn(component,'ehEspelhoAlterado').and.callThrough();
                    const retornoMensagem = component.msg(form);
                    expect(retornoMensagem).toEqual(msgModel);
                    expect(component.ehEspelhoAlterado).toHaveBeenCalledTimes(1);

                    
                })

            })
        })
    });


    describe('importar modelo csv para cadastro de produto espelho', () =>{
      it('deveria se comunicar com o serviço e enviar o arquivo selecionado', ()=>{
        //Preparação
          let arquivo = '1234567';
          let event = {target: {files: {item: (n) => arquivo}}};
          let resposta = of({success: true});

          // Assertion
          spyOn(produtoEspelhoService, 'importProduct').and.returnValue(resposta);
          component.importFile(event);
          expect(produtoEspelhoService.importProduct).toHaveBeenCalledWith(event.target.files.item(0));
          expect(produtoEspelhoService.importProduct).toHaveBeenCalledTimes(1);
          expect(component.fileControl.value).toEqual('');

      });

    })

    describe('exportar modelo csv', () =>{
        let msgSuccess = {
            title: 'Download Concluído com sucesso!',
            content: 'Por favor, verifique seus downloads para abrir o modelo.',
            icon: 'success'
        };
        let msgError = {
            title: 'Oops!',
            content: 'Desculpe, mas não conseguimos baixar o modelo de importação, por favor, tente novamente mais tarde.',
            icon: 'warning'
        };
        it('deve exibir uma modal com a mensagem de download de sucesso', async ()=>{
            let response = new Promise((resolve, reject) => {
                resolve(true);
            });

            spyOn(produtoEspelhoService, 'exportarModeloCSV').and.returnValue(response);

            await component.exportarModeloCSV();

            expect(produtoEspelhoService.exportarModeloCSV).toHaveBeenCalledTimes(1);
            expect({title: msgSuccess.title, content: msgSuccess.content, icon: msgSuccess.icon}).dialogToExist();
        });


        it('deve exibir uma modal de erro sem o download', async() => {
            let response= new Promise((resolve, reject) => {
                resolve(false);
            })
            spyOn(produtoEspelhoService, 'exportarModeloCSV').and.returnValue(response);

            await component.exportarModeloCSV();

            expect(produtoEspelhoService.exportarModeloCSV).toHaveBeenCalledTimes(1);
            expect({title: msgError.title, content: msgError.content, icon: msgError.icon}).dialogToExist();

        });
    });

});
