import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {DiaSemanaComboComponent} from "./dia-da-semana-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
const DIAS = [
    { item_id: 1, item_text: 'Domingo' },
    { item_id: 2, item_text: 'Segunda-feira' },
    { item_id: 3, item_text: 'Terça-feira' },
    { item_id: 4, item_text: 'Quarta-feira' },
    { item_id: 5, item_text: 'Quinta-feira' },
    { item_id: 6, item_text: 'Sexta-feira' },
    { item_id: 0, item_text: 'Sábado' },
];

describe('Dia Da Semana Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: DiaSemanaComboComponent;
    let fixture: ComponentFixture<DiaSemanaComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [DiaSemanaComboComponent],
            providers: [],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(DiaSemanaComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheDiaDaSemana');
        component.ngOnInit();
        expect(component.preencheDiaDaSemana).toHaveBeenCalledTimes(1);
        expect(component.dropdownSettings).toBeDefined();
        expect(component.single).toEqual(false);

    });


    it('Should create with single true', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheDiaDaSemana');
        component.single = true;
        component.ngOnInit();
        expect(component.preencheDiaDaSemana).toHaveBeenCalledTimes(1);
        expect(component.dropdownSettings).toBeDefined();
        expect(component.single).toEqual(true);

    });

    describe('Limpar selecionados', () => {
        it('Deve limpar todos os campos selecionados', () => {
            component.diaDaSemanaSelecionado = [1,2,3];
            expect(component.diaDaSemanaSelecionado).toHaveLength(3);
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'diaDaSemanaSelecionado')
        })
    })


    describe('Selecionar item', () => {
       it('Deve selecionar o produto e emitir o evento ao parente', () => {
           let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3},{item_id: 4},{item_id: 5}];
           component.diaDaSemanaSelecionado  = allSelected;
           spyOn(component.selecionados, 'emit');
           let processed = allSelected.map(itm => itm.item_id);
           expect(component.diaDaSemanaSelecionado).toHaveLength(allSelected.length);
           component.selecionado(allSelected);
           testUtils.selecionadoItem(component, allSelected, processed, 'diaDaSemanaSelecionado');
       })

        it('Deve utilizar os itens salvos se for enviado um array vazio', () => {
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3},{item_id: 4},{item_id: 5}];
            component.diaDaSemanaSelecionado  = allSelected;
            spyOn(component.selecionados, 'emit');
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.diaDaSemanaSelecionado).toHaveLength(allSelected.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, allSelected, processed, 'diaDaSemanaSelecionado');
        })
    });


    describe('Preencher dia da semana', () => {
        it('Deve preencher os dias da semana com o valor dos dias da semana', () => {
            expect(component.dropdownDiaDaSemana).toHaveLength(0);
            component.preencheDiaDaSemana();
            expect(component.dropdownDiaDaSemana).toEqual(DIAS);
        })
    })

});
