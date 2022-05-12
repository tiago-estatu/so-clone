import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {FornecedorComboComponent} from "./fornecedor-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpModule} from "@angular/http";
import {HttpClientModule} from "@angular/common/http";
import {FornecedorModel} from "../../../services/fornecedor";
import {of, throwError} from "rxjs";
const FORNECEDORES_SERVER: FornecedorModel[] = [
    {cd_fornecedor: 1, nome: 'teste 1', cd_regional: 1},
    {cd_fornecedor: 2, nome: 'teste 2', cd_regional: 1},
    {cd_fornecedor: 3, nome: 'teste 3', cd_regional: 1},
];

const FORNECEDORES_LOCAL = [
    {item_id: 1, item_text: 'teste 1'},
    {item_id: 2, item_text: 'teste 2'}
];

describe('Fornecedor Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: FornecedorComboComponent;
    let fixture: ComponentFixture<FornecedorComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpModule, HttpClientModule],
            declarations: [FornecedorComboComponent],
            providers: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(FornecedorComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheFornecedor');
        component.ngOnInit();
        expect(component.preencheFornecedor).toHaveBeenCalledTimes(1);
    })


    describe('Limpar selecionado', () => {
        it('Deve limpar todos os campos selecionado e emitir o valor vazio para o parent', () => {

            component.fornecedorSelecionado = [1, 2, 3];
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'fornecedorSelecionado');

        })
    })


    describe('Selecionar fornecedor', () => {
        it('Deve selecionar o fornecedor e emitir o resultado mapeado para o parent', () => {
            component.fornecedorSelecionado  = [];
            spyOn(component.selecionados, 'emit');
            let processed = FORNECEDORES_LOCAL.map(itm => itm.item_id);
            expect(component.fornecedorSelecionado).toHaveLength(0);
            component.selecionado(FORNECEDORES_LOCAL);
            testUtils.selecionadoItem(component, FORNECEDORES_LOCAL, processed, 'fornecedorSelecionado');
        })

        it('Deve utlizar os fornecedores salvos e emitir o resultado mapeado para o parent se receber um array vazio', () => {
            component.fornecedorSelecionado  = FORNECEDORES_LOCAL;
            spyOn(component.selecionados, 'emit');
            let processed = FORNECEDORES_LOCAL.map(itm => itm.item_id);
            expect(component.fornecedorSelecionado).toHaveLength(FORNECEDORES_LOCAL.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, FORNECEDORES_LOCAL, processed, 'fornecedorSelecionado');
        })
    })


    describe('Preencher fornecedor', () => {
        it('Deve salvar os fornecedores com base a resposta do serviço', () => {
            let response = of(FORNECEDORES_SERVER);
            spyOn(component['_service'], 'buscarTodosFornecedores').and.returnValue(response);
            expect(component.dropdownFornecedor).toHaveLength(0);

            component.preencheFornecedor();
            expect(component['_service'].buscarTodosFornecedores).toHaveBeenCalledTimes(1);
            expect(component.dropdownFornecedor).toHaveLength(FORNECEDORES_SERVER.length)
        });

        it('Deve fazer handling dos erros do servidor', () => {
            let response = throwError({status: 500, error: {}});
            spyOn(component['_service'], 'buscarTodosFornecedores').and.returnValue(response);
            expect(component.disabled).not.toEqual('true');
            expect(component.dropdownFornecedor).toHaveLength(0);
            component.preencheFornecedor();
            expect(component.dropdownFornecedor).toHaveLength(0);
            expect(component.disabled).toEqual('true');
        })
    })
});
