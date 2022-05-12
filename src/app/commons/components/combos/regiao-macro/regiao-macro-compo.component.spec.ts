import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {RegiaoMacroComboComponent} from "./regiao-macro-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule, HttpParams} from "@angular/common/http";
import {UtilsHelper, ValidatorHelper} from "../../../helpers";
import {of, throwError} from "rxjs";
import {NewModalComponent} from "../../new-modal";
import {StudModalComponent} from "../../../helpers/studs.mock";

const REGIOES_LOCAL = [
    {item_id: 1, item_text: 'teste 1'},
    {item_id: 2, item_text: 'teste 2'},
    {item_id: 3, item_text: 'teste 3'},
];

const REGIOES_SERVER = [
    [1, 'Teste 1'],
    [2, 'Teste 2'],
    [3, 'Teste 3'],
    [4, 'Teste 4'],
]

describe('Regiao Macro Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: RegiaoMacroComboComponent;
    let fixture: ComponentFixture<RegiaoMacroComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [RegiaoMacroComboComponent],
            providers: [
                ValidatorHelper,
                UtilsHelper,
                {provide: NewModalComponent, useClass: StudModalComponent},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(RegiaoMacroComboComponent);
        component = fixture.componentInstance;
        component.modalChild = TestBed.get(NewModalComponent);
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
    })


    describe('Limpar selecionado', () => {
        it('Deve limpar todos os campos selecionado e emitir o valor vazio para o parent', () => {
            component.regiaoSelecionadoLista = [1, 2, 3];
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'regiaoSelecionadoLista');

        })
    })

    describe('Selecionar Regiao', () => {
        it('Deve selecionar a regiao e emitir o resultado mapeado para o parent', () => {
            component.regiaoSelecionadoLista = [];
            spyOn(component.selecionados, 'emit');
            let processed = REGIOES_LOCAL.map(itm => itm.item_id);
            expect(component.regiaoSelecionadoLista).toHaveLength(0);
            component.selecionado(REGIOES_LOCAL);
            testUtils.selecionadoItem(component, REGIOES_LOCAL, processed, 'regiaoSelecionadoLista');
        })

        it('Deve utlizar as regioes salvas e emitir o resultado mapeado para o parent se receber um array vazio', () => {
            component.regiaoSelecionadoLista = REGIOES_LOCAL;
            spyOn(component.selecionados, 'emit');
            let processed = REGIOES_LOCAL.map(itm => itm.item_id);
            expect(component.regiaoSelecionadoLista).toHaveLength(REGIOES_LOCAL.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, REGIOES_LOCAL, processed, 'regiaoSelecionadoLista');
        })
    })


    describe('Gerar filtro', () => {
        it('Deve gerar um queryParam com os filtros se o componente tiver cdsSelecionados', () => {
            let expectedParam = new HttpParams().set('cdRegional', [1, 2, 3]);
            component.cdsSelecionados = [1, 2, 3];

            let result = component.gerarFiltroCdRegional();
            expect(result).toEqual(expectedParam);
        });

        it('Deve gerar um queryParam vazio se o componente nãp tiver cdsSelecionados', () => {
            let expectedParam = new HttpParams();
            component.cdsSelecionados = [];

            let result = component.gerarFiltroCdRegional();
            expect(result).toEqual(expectedParam);
        })
    });

    describe('Preencher Regiao Macro', () => {
        it('Deve preencher com base na resposta do serviço', () => {
            let response = of({value: REGIOES_SERVER});
            spyOn(component['_service'], 'buscarRegioes').and.returnValue(response);
            spyOn(component, 'gerarFiltroCdRegional').and.returnValue('');
            expect(component.dropdownRegiaoLista).toHaveLength(0);
            let processed = REGIOES_SERVER.map(itm => ({item_id: itm[0], item_text: `${itm[0]} - ${itm[1]}`}));
            component.preencheRegiaoMacro();

            expect(component['_service'].buscarRegioes).toHaveBeenCalledTimes(1);
            expect(component.gerarFiltroCdRegional).toHaveBeenCalledTimes(1);
            expect(component.dropdownRegiaoLista).toEqual(processed);
        })

        it('Deve mostrar o erro do servidor se este responder com status 404', () => {

            let response = throwError({status: 404, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'buscarRegioes').and.returnValue(response);
            spyOn(component, 'gerarFiltroCdRegional').and.returnValue('');

            component.preencheRegiaoMacro();
            expect(component['_service'].buscarRegioes).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(true);
        })

        it('Deve não deve mostar o erro se o servidor um erro diferente a 404', () => {

            let response = throwError({status: 500, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'buscarRegioes').and.returnValue(response);
            spyOn(component, 'gerarFiltroCdRegional').and.returnValue('');

            component.preencheRegiaoMacro();
            expect(component['_service'].buscarRegioes).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(false);
        })
    })

});
