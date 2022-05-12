import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {FabricanteComboComponent} from "./fabricante-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {HttpModule} from "@angular/http";
import {of, throwError} from "rxjs";
const FABRICANTES = [
    {item_id: 1, item_txt: 'teste 1', cdFornecedor: 1, nomeRazaoSocial: 'teste 1'},
    {item_id: 2, item_txt: 'teste 2', cdFornecedor: 2, nomeRazaoSocial: 'teste 2'},
    {item_id: 3, item_txt: 'teste 3', cdFornecedor: 3, nomeRazaoSocial: 'teste 3'},
    {item_id: 4, item_txt: 'teste 4', cdFornecedor: 4, nomeRazaoSocial: 'teste 4'},
]

describe('Fabricante Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: FabricanteComboComponent;
    let fixture: ComponentFixture<FabricanteComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule, HttpModule],
            declarations: [FabricanteComboComponent],
            providers: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(FabricanteComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheFabricante');
        component.ngOnInit();
        expect(component.preencheFabricante).toHaveBeenCalledTimes(1);
    })

    describe('Limpar itens selecionados', () => {
        it('Deve limpar todos os itens selecionados', () => {
            component.fabricanteSelecionado = FABRICANTES;
            expect(component.fabricanteSelecionado).toHaveLength(FABRICANTES.length);
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'fabricanteSelecionado')
        })
    })

    describe('Selecionar item', () => {
        it('Deve receber os itens selecionados e emitir para o parente', () => {
            let allSelected = FABRICANTES;
            component.fabricanteSelecionado  = allSelected;
            spyOn(component.selecionados, 'emit');
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.fabricanteSelecionado).toHaveLength(allSelected.length);
            component.selecionado(allSelected);
            testUtils.selecionadoItem(component, allSelected, processed, 'fabricanteSelecionado');
        })

        it('Deve utilizar os itens salvos se for informado de um array vazio', () => {
            let allSelected = FABRICANTES;
            component.fabricanteSelecionado  = allSelected;
            spyOn(component.selecionados, 'emit');
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.fabricanteSelecionado).toHaveLength(allSelected.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, allSelected, processed, 'fabricanteSelecionado');
        })
    })

    describe('Preencher fabricante', () => {
        it('Deve preencher fabricante a partir do informado pelo serviço', () => {
            let response = of({_body: JSON.stringify(FABRICANTES)});
            spyOn(component['_service'], 'getFabricantesAll').and.returnValue(response);
            expect(component.dropdownFabricante).toHaveLength(0);
            component.preencheFabricante();
            expect(component.dropdownFabricante).toHaveLength(FABRICANTES.length);
            expect(component.dropdownFabricante).toEqual(FABRICANTES.map(itm => ({item_id: itm.cdFornecedor, item_text: itm.cdFornecedor + " - " + itm.nomeRazaoSocial})))
        })


        it('Deve desabilitar o input se retornar erro', () => {
            let response = throwError(false);
            expect(component.disabled).not.toEqual('true');
            spyOn(component['_service'], 'getFabricantesAll').and.returnValue(response);
            component.preencheFabricante();
            expect(component.disabled).toEqual('true');
        })
    })

});
