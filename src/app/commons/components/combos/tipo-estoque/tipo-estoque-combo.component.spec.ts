import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {TipoEstoqueComboComponent} from "./tipo-estoque-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {of, throwError} from "rxjs";
import {NewModalComponent} from "../../new-modal";
import {StudModalComponent} from "../../../helpers/studs.mock";
const TIPOS_SERVIDOR = [
    {cdTipoEstoqueIdeal: 1, dsTipoEstoqueIdeal: 'teste 1'},
    {cdTipoEstoqueIdeal: 2, dsTipoEstoqueIdeal: 'teste 2'}
];
const TIPOS_LOCAL = [
    {item_id: 1, item_Text: 'teste 1'},
    {item_id: 2, item_Text: 'teste 2'},
    {item_id: 3, item_Text: 'teste 3'},
]

describe(' Tipo Estoque Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: TipoEstoqueComboComponent;
    let fixture: ComponentFixture<TipoEstoqueComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [TipoEstoqueComboComponent],
            providers: [
                {provide: NewModalComponent, useClass: StudModalComponent},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(TipoEstoqueComboComponent);
        component = fixture.componentInstance;
        component.modalChild = TestBed.get(NewModalComponent);
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencher');
        component.ngOnInit();
        expect(component.preencher).toHaveBeenCalledTimes(1);
        expect(component.settings).toBeDefined();
    });

    describe('Limpar selecionados', () => {
       it('Deve limpar todos os campos selecionados', () => {

       })
    });

    describe('Selecionar tipo de estoque', () => {
        it('Deve emitir os tipos selecionados para o parente', () => {
            component.tipoEstoqueLista = [];
            spyOn(component.selecionados, 'emit');
            let processed = TIPOS_LOCAL.map(itm => itm.item_id);
            expect(component.tipoEstoqueLista).toHaveLength(0);
            component.selecionado(TIPOS_LOCAL);
            testUtils.selecionadoItem(component, TIPOS_LOCAL, processed, 'tipoEstoqueLista');
        })

        it('Deve emitir os tipos selecionados salvos para o parente se a função for chamada com um array vazio', () => {
            component.tipoEstoqueLista = TIPOS_LOCAL;
            spyOn(component.selecionados, 'emit');
            let processed = TIPOS_LOCAL.map(itm => itm.item_id);
            expect(component.tipoEstoqueLista).toHaveLength(TIPOS_LOCAL.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, TIPOS_LOCAL, processed, 'tipoEstoqueLista');
        })
    })

    describe('Preencher tipos de estoque', () => {
        it('Deve preencher os tipos de estoque com o recebido do serviço', () => {
            let response = of(TIPOS_SERVIDOR);
            spyOn(component['_service'], 'getAllTipo').and.returnValue(response);
            expect(component.dropdownEstoqueLista ).toHaveLength(0);
            let processed = TIPOS_SERVIDOR.map(itm => ({
                item_id: itm.cdTipoEstoqueIdeal,
                item_text: `${itm.cdTipoEstoqueIdeal} - ${itm.dsTipoEstoqueIdeal}`}
                ));
            component.preencher();

            expect(component['_service'].getAllTipo).toHaveBeenCalledTimes(1);
            expect(component.dropdownEstoqueLista ).toEqual(processed);
        })

        it('Deve informar dos erros 404 do servidor', () => {

            let response = throwError({status: 404, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'getAllTipo').and.returnValue(response);

            component.preencher();
            expect(component['_service'].getAllTipo).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(true);
        })

        it('Não deve informar dos erros que não são 404 do servidor', () => {

            let response = throwError({status: 500, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'getAllTipo').and.returnValue(response);

            component.preencher();
            expect(component['_service'].getAllTipo).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(false);
        })


    })


});
