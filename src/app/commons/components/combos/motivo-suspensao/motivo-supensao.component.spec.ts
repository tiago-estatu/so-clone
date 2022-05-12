import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {MotivoSuspensaoComboComponent} from "./motivo-suspensao.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {UtilsHelper} from "../../../helpers";
import {of, throwError} from "rxjs";
import {NewModalComponent} from "../../new-modal";
import {StudModalComponent} from "../../../helpers/studs.mock";

const MOTIVOS_SUSPENSOS_SERVER = [
    {cdMotivoAgendaSuspena: 1, dsMotivoAgendaSuspena: 'teste 1'},
    {cdMotivoAgendaSuspena: 2, dsMotivoAgendaSuspena: 'teste 2'}
]

const MOTIVOS_SUSPENSOS_LOCAL = [
    {item_id: 1, item_text: 'teste 1'},
    {item_id: 2, item_text: 'teste 2'},
    {item_id: 3, item_text: 'teste 3'},
]

describe('Motivo Suspensao Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: MotivoSuspensaoComboComponent;
    let fixture: ComponentFixture<MotivoSuspensaoComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [MotivoSuspensaoComboComponent],
            providers: [
                UtilsHelper,
                {provide: NewModalComponent, useClass: StudModalComponent},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(MotivoSuspensaoComboComponent);
        component = fixture.componentInstance;
        component.modalChild = TestBed.get(NewModalComponent);

    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencherMotivoSuspensao')
        component.ngOnInit();
        expect(component.dropdownSettingsSelecionarUm).toBeDefined();
        expect(component.preencherMotivoSuspensao).toHaveBeenCalledTimes(1);
    })

    describe('Selecionar Motivos Suspensos', () => {
        it('Deve emitir os motivos suspensos selecionados', () => {
            component.motivoSelecionadoLista = MOTIVOS_SUSPENSOS_LOCAL;
            spyOn(component.selecionados, 'emit');
            let processed = MOTIVOS_SUSPENSOS_LOCAL.map(itm => itm.item_id);
            component.selecionado();
            testUtils.selecionadoItem(component, MOTIVOS_SUSPENSOS_LOCAL, processed, 'motivoSelecionadoLista')
        })
    })


    describe('Preencher motivos suspensos', () => {
        it('Deve preecher os motivos suspensos com a resposta do serviço', () => {
            let response = of(MOTIVOS_SUSPENSOS_SERVER);
            let argument = 'TEST_ARG';
            spyOn(component['_service'], 'getListaMotivoFaturamentoSupenso').and.returnValue(response);
            expect(component.dropdownMotivoSuspensao).toHaveLength(0);
            let processed = MOTIVOS_SUSPENSOS_SERVER.map(item => ({
                item_id: item.cdMotivoAgendaSuspena,
                item_text: `${item.cdMotivoAgendaSuspena} - ${item.dsMotivoAgendaSuspena}`
            }));
            component.preencherMotivoSuspensao(argument);
            expect(component['_service'].getListaMotivoFaturamentoSupenso).toHaveBeenCalledTimes(1);
            expect(component['_service'].getListaMotivoFaturamentoSupenso).toHaveBeenCalledWith(argument);
            expect(component.dropdownMotivoSuspensao).toEqual(processed);
        });

        it('Deve mostar o erro enviado pelo servidor se o erro for 404', () => {
            let response = throwError({status: 404, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'getListaMotivoFaturamentoSupenso').and.returnValue(response);
            component.preencherMotivoSuspensao('');
            expect(component['_service'].getListaMotivoFaturamentoSupenso).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(true);
        });

        it('Não deve mostar o erro enviado pelo servidor se o erro não for 404', () => {
            let response = throwError({status: 500, error: {mensagem: 'ERRO'}});
            component.modalChild.openModal = false;
            spyOn(component['_service'], 'getListaMotivoFaturamentoSupenso').and.returnValue(response);
            component.preencherMotivoSuspensao('');
            expect(component['_service'].getListaMotivoFaturamentoSupenso).toHaveBeenCalledTimes(1);
            expect(component.modalChild.openModal).toEqual(false);
        });
    })


});
