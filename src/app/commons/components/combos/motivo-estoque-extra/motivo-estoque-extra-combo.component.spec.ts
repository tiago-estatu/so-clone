import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {MotivoEstoqueExtraComboComponent} from "./motivo-estoque-extra-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {UtilsHelper} from "../../../helpers";
import {of, throwError} from "rxjs";

const MOTIVO_ESTOQUE_SERVER = [
    {cdMotivoEstoqueIdeal: 1, dsMotivoEstoqueIdeal: 'teste 1'},
    {cdMotivoEstoqueIdeal: 2, dsMotivoEstoqueIdeal: 'teste 2'},
    {cdMotivoEstoqueIdeal: 3, dsMotivoEstoqueIdeal: 'teste 3'}
];

const MOTIVO_ESTOQUE_LOCAL = [
    {item_id: 1, item_text: 'teste 1'},
    {item_id: 2, item_text: 'teste 2'},
];


describe('Motivo Estoque Extra Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: MotivoEstoqueExtraComboComponent;
    let fixture: ComponentFixture<MotivoEstoqueExtraComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [MotivoEstoqueExtraComboComponent],
            providers: [UtilsHelper],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(MotivoEstoqueExtraComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencherMotivos');
        component.ngOnInit();

        expect(component.preencherMotivos).toHaveBeenCalledTimes(1);
        expect(component.dropdownSettingsSelecionarUm).toBeDefined();
    })

    describe('Selecionar Motivo Estoque', () => {

        it('Deve emitir os motivos selecionados para o parente', () => {
            component.motivoSelecionadoLista = MOTIVO_ESTOQUE_LOCAL;
            let processed = MOTIVO_ESTOQUE_LOCAL.map(itm => itm.item_id);
            spyOn(component.selecionados, 'emit');
            component.selecionado();
            testUtils.selecionadoItem(component, MOTIVO_ESTOQUE_LOCAL, processed, 'motivoSelecionadoLista')
        })

    })


    describe('Preencher motivos', () => {
        it('Deve preencher os motivos com a resposta do servidor enviando o path para ele', () => {
            let response = of(MOTIVO_ESTOQUE_SERVER);
            let path = 'CUSTOM_PATH';
            let processed = MOTIVO_ESTOQUE_SERVER.map(item => ({
                item_id: item.cdMotivoEstoqueIdeal.toString(),
                item_text: `${item.cdMotivoEstoqueIdeal} - ${item.dsMotivoEstoqueIdeal}`
            }))
            component.config.pathService = path;
            spyOn(component['_service'], 'getAllMotivo').and.returnValue(response);
            expect(component.dropdownMotivo).toHaveLength(0);
            component.preencherMotivos();
            expect(component['_service'].getAllMotivo).toHaveBeenCalledTimes(1);
            expect(component['_service'].getAllMotivo).toHaveBeenCalledWith(path);
            expect(component.dropdownMotivo).toEqual(processed);

        })

        it('Deve mostar erros do servidor se o servidor retornar o status 404', () => {
            let response = throwError({status: 404, error: {mensagem: 'ERRO'}});
            spyOn(component['_service'], 'getAllMotivo').and.returnValue(response);
            expect(component.dropdownMotivo).toHaveLength(0);

            component.preencherMotivos();
            expect(component.dropdownMotivo).toHaveLength(0);
            expect({title: 'Nenhum dado encontrado', content: 'ERRO', icon: 'warning'}).dialogToExist();
            testUtils.closeDialog();
        })


        it('Não deve mostrar erros se o não responder com erros 404', () => {
            let response = throwError({status: 500, error: {mensagem: 'ERRO'}});
            spyOn(component['_service'], 'getAllMotivo').and.returnValue(response);
            expect(component.dropdownMotivo).toHaveLength(0);

            component.preencherMotivos();
            expect(component.dropdownMotivo).toHaveLength(0);
            expect({title: 'Nenhum dado encontrado', content: 'ERRO', icon: 'warning'}).not.dialogToExist();
        })
    })

});
