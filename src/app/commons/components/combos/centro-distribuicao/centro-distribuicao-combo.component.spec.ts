import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {CentroDistribuicaoComboComponent} from "./centro-distribuicao-combo.component";
import {CUSTOM_ELEMENTS_SCHEMA, Injectable} from "@angular/core";
import {CdService, CentroDistribuicaoModel} from "../../../services/center-distribution";
import {of, throwError} from "rxjs";
import {NewModalComponent} from "../../new-modal";
import {StudModalComponent} from "../../../helpers/studs.mock";

const CDS = [
    {cd_esteira: 1, cd_regional: 1, fl_arred_sugestao: true, nm_cd_regional: 'teste 1'},
    {cd_esteira: 2, cd_regional: 2, fl_arred_sugestao: true, nm_cd_regional: 'teste 2'},
    {cd_esteira: 3, cd_regional: 1, fl_arred_sugestao: true, nm_cd_regional: 'teste 3'},

    {cd_esteira: 10, cd_regional: 2, fl_arred_sugestao: false, nm_cd_regional: 'fl arred su 1'},
    {cd_esteira: 11, cd_regional: 2, fl_arred_sugestao: false, nm_cd_regional: 'fl arred su 2'},
    {cd_esteira: 12, cd_regional: 1, fl_arred_sugestao: false, nm_cd_regional: 'fl arred su 3'},

];


@Injectable()
class StudService {
    getListCD() {}
}

describe('Centro Distribuição Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: CentroDistribuicaoComboComponent;
    let fixture: ComponentFixture<CentroDistribuicaoComboComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [CentroDistribuicaoComboComponent, StudModalComponent],
            providers: [
                {provide: NewModalComponent, useClass: StudModalComponent},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        TestBed.overrideComponent(CentroDistribuicaoComboComponent, {
            set: {
                providers: [
                    {provide: CdService, useClass: StudService},
                ],

            }
        });
        fixture = TestBed.createComponent(CentroDistribuicaoComboComponent);

        component = fixture.componentInstance;
        component.modalChild = TestBed.get(NewModalComponent);

    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheCD');
        component.ngOnInit();
        expect(component.dropdownSettings).toBeDefined();
        expect(component.preencheCD).toHaveBeenCalledTimes(1);
    });


    describe('Preencher CD', () => {
        it('Deve obter dados do serviço e preencher os CD', () =>{
            expect(component.dropdownCDLista).toHaveLength(0);
            spyOn(component['_service'], 'getListCD').and.returnValue(of(CDS));
            let expectedOutput = [...CDS].map(cdBase => ({
                item_id: cdBase.cd_regional,
                item_text: cdBase.cd_regional + " - " + cdBase.nm_cd_regional
            }));

            component.preencheCD();

            expect(component['_service'].getListCD).toHaveBeenCalledTimes(1);
            expect(component.dropdownCDLista.length).toBeGreaterThan(0);
            expect(component.dropdownCDLista).toEqual(expectedOutput)

        })

        it('Deve mostar o erro 404 do servidor', () => {
            expect(component.dropdownCDLista).toHaveLength(0);
            let err = throwError({status: 404, error: {mensagem: 'Não encontrado'}});
            spyOn(component['_service'], 'getListCD').and.returnValue(err);

            component.preencheCD();

            expect(component['_service'].getListCD).toHaveBeenCalledTimes(1);
            expect(component.dropdownCDLista.length).toEqual(0);
            expect(component.modalChild.somErro).toEqual(true)
            expect(component.modalChild.openModal).toEqual(true)
        })


        it('Não deve mostrar o modal se o erro do servidor não for 404', () => {
            expect(component.dropdownCDLista).toHaveLength(0);
            let err = throwError({status: 500, error: {mensagem: 'Não encontrado'}});
            spyOn(component['_service'], 'getListCD').and.returnValue(err);

            component.preencheCD();

            expect(component['_service'].getListCD).toHaveBeenCalledTimes(1);
            expect(component.dropdownCDLista.length).toEqual(0);
            expect(component.modalChild.somErro).toEqual(true);
            expect(component.modalChild.openModal).toEqual(false)
        })
    });


    describe('Limpar selecionados', () => {
        it('deve limpar todos os campos dos selecionados', () => {
            component.cdSelecionadoLista = [1,2,3];
            spyOn(component.selecionados, 'emit');
            spyOn(component.objetoCDSelecionado, 'emit');

            component.limparSelecionados();

            testUtils.limparSelecionados(component, 'cdSelecionadoLista');
            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledTimes(1);
            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledWith([]);
        })
    });


    describe('selecionar CD', () => {
        it('Deve receber um cd e emitir o cd selecionado', () => {
            component.cdSelecionadoLista = [];
            spyOn(component.selecionados, 'emit');
            spyOn(component.objetoCDSelecionado, 'emit');
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3},{item_id: 4},{item_id: 5}];
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.cdSelecionadoLista).toHaveLength(0);
            component.selecionarCd(allSelected);

            testUtils.selecionadoItem(component, allSelected, processed, 'cdSelecionadoLista');
            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledTimes(1);
            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledWith(allSelected);


        })

        it('Deve deve utilizar os cdSelecionados anteriormente se receber um array vazio', () => {
            spyOn(component.selecionados, 'emit');
            spyOn(component.objetoCDSelecionado, 'emit');
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3},{item_id: 4},{item_id: 5}];
            component.cdSelecionadoLista = allSelected;
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.cdSelecionadoLista).toHaveLength(allSelected.length);
            component.selecionarCd([]);
            expect(component.cdSelecionadoLista).toEqual(allSelected);

            testUtils.selecionadoItem(component, allSelected, processed, 'cdSelecionadoLista');

            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledTimes(1);
            expect(component.objetoCDSelecionado.emit).toHaveBeenCalledWith(allSelected);
        })
    })

});
