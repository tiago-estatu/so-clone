import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {FilialRotaComboComponent} from "./filial-rota-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpModule} from "@angular/http";
import {HttpClientModule, HttpParams} from "@angular/common/http";
import {UtilsHelper} from "../../../helpers";
import {of, throwError} from "rxjs";

const ROTA = {item_id: 1, item_text: 'Teste 1'};

const ROTAS_SERVER = Array(3).fill(0).map((itm, idx) => {
    return {cdFilialRota: idx + 1, dsFilialRota: `rota index ${idx}`}
});


describe('Filial Rota Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: FilialRotaComboComponent;
    let fixture: ComponentFixture<FilialRotaComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpModule, HttpClientModule],
            declarations: [FilialRotaComboComponent],
            providers: [UtilsHelper],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(FilialRotaComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencherRota');
        component.ngOnInit();
        expect(component.dropdownSettingsSelecionarUm).toBeDefined();
        expect(component.preencherRota).toHaveBeenCalledTimes(1);
    });


    describe('Gerar paramentros', () => {
        it('Deve Gerar HttpParams baseado no state do componente', () => {
            let selected = ['123'];
            let httpParams = new HttpParams().set('cdRegional', selected);

            let params = {empty: new HttpParams(), content: httpParams};
            let results:any = {empty: component.gerarParametro()};

            component.cdsSelecionados = selected;
            results = {...results, content: component.gerarParametro()};

            expect(results.empty.get('cdRegional')).toEqual(params.empty.get('cdRegional'));
            expect(results.content.get('cdRegional')).toEqual(params.content.get('cdRegional'))
        })
    })

    describe('preencher rota', () => {
        it('Deve preencher as rotas com o resultado do serviço', () => {
            let response = of(ROTAS_SERVER);
            let processed = ROTAS_SERVER.map(itm => {
                return {item_id: itm.cdFilialRota, item_text:  `${itm.cdFilialRota} - ${itm.dsFilialRota}`}
            });
            spyOn(component['_service'], 'getFilialRota').and.returnValue(response);
            spyOn(component, 'gerarParametro').and.returnValue('');
            expect(component.dropdownLista).toHaveLength(0);

            component.preencherRota();
            expect(component['_service'].getFilialRota).toHaveBeenCalledTimes(1);
            expect(component.dropdownLista).toEqual(processed);
        });

        it('Deve mostrar o erro enviado pelo servidor', () => {
            let response = throwError({status: 500, error: {mensagem: 'ERRO'}});
            spyOn(component['_service'], 'getFilialRota').and.returnValue(response);
            spyOn(component, 'gerarParametro').and.returnValue('');

            component.preencherRota();
            expect(component['_service'].getFilialRota).toHaveBeenCalledTimes(1);
            expect({title: 'Oops!', content: 'ERRO.filial rota combo!', icon: 'warning'}).dialogToExist();
            testUtils.closeDialog();
        })
    })


    describe('Limpar selecionados', () => {
        it('Deve limpar os campos selecionados', () => {
            component.selecionadoLista = [1,2,3];
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            testUtils.limparSelecionados(component, 'selecionadoLista');
        })
    })

    describe('Selecionar Rota', () => {
        it('Deve emitir as rotas selecionadas formatadas', () => {
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3}];
            component.selecionadoLista  = allSelected;
            spyOn(component.selecionados, 'emit');
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.selecionadoLista).toHaveLength(allSelected.length);
            component.selecionado();
            testUtils.selecionadoItem(component, allSelected, processed, 'selecionadoLista');
        })

    })

});
