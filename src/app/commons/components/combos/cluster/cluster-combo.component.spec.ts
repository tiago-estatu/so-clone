import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import { ClusterComboComponent } from './cluster-combo.component';
import {CUSTOM_ELEMENTS_SCHEMA, Injectable} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {ClusterService} from "../../../services/cluster";
import {of} from "rxjs";

const CLUSTERS = [
    {cd: 1, descricao: 'text 1'},
    {cd: 2, descricao: 'text 2'},
    {cd: 3, descricao: 'text 3'},
    {cd: 4, descricao: 'text 4'},
];



describe('Cluster Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: ClusterComboComponent;
    let fixture: ComponentFixture<ClusterComboComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule, HttpClientModule],
            declarations: [ClusterComboComponent],
            providers: [ClusterService],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ClusterComboComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
        spyOn(component, 'preencheCluster');
        component.ngOnInit();
        expect(component.dropdownSettings).toBeDefined();
        expect(component.preencheCluster).toHaveBeenCalledTimes(1);
    })


    describe('Limpar selecionados', () => {
        it('Deve limpar os campos selecionados', () => {
            component.clusterSelecionado = [1,2,3];
            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();

            testUtils.limparSelecionados(component, 'clusterSelecionado');
        })
    });


    describe('Selecionar item', () => {
        it('Deve emitir os itens selecionados', () => {
            component.clusterSelecionado = [];
            spyOn(component.selecionados, 'emit');
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3}];
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.clusterSelecionado).toHaveLength(0);
            component.selecionado(allSelected);
            testUtils.selecionadoItem(component, allSelected, processed, 'clusterSelecionado');
        })

        it('Deve utilizar os valores selecionados se receber um array vazio', () => {
            let allSelected = [{item_id: 1},{item_id: 2},{item_id: 3},{item_id: 4},{item_id: 5}];
            component.clusterSelecionado = allSelected;
            spyOn(component.selecionados, 'emit');
            let processed = allSelected.map(itm => itm.item_id);
            expect(component.clusterSelecionado).toHaveLength(allSelected.length);
            component.selecionado([]);
            testUtils.selecionadoItem(component, allSelected, processed, 'clusterSelecionado');
        })
    })


    describe('Preencher cluster a partir do serviço', () => {
        it('Deve preencher corretamente com a resposta do servidor', () => {
            let response = of(CLUSTERS);
            spyOn(component['_service'], 'getAllCluster').and.returnValue(response);
            expect(component.dataSource).toHaveLength(0);
            component.preencheCluster();
            expect(component.dataSource).toHaveLength(CLUSTERS.length);
            expect(component.dataSource).toEqual(CLUSTERS.map(itm => ({item_id: itm.cd, item_text: itm.descricao})))
        })
    })

});
