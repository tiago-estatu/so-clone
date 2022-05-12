import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {Router, RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {CategoriaProdutoComboComponent} from "./categoria-produto-combo.component";
import {NgMultiSelectDropDownModule} from "ng-multiselect-dropdown";
import {NewModalComponent} from "../../new-modal";
import {Component, CUSTOM_ELEMENTS_SCHEMA, Injectable} from "@angular/core";
import {SanitizeHtmlPipe} from "../../../pipes";
import {
    CategoriaProdutoModel,
    CategoriaProdutoService,
} from "../../../services/categoria-produto";
import {HttpClientModule, HttpErrorResponse} from "@angular/common/http";
import {Observable, of, throwError} from "rxjs";
import {StudModalComponent} from "../../../helpers/studs.mock";


@Injectable()
class StudService {
    listaProdutos: CategoriaProdutoModel[] = [
        {cd: 10, descricao: 'cd 10'},
        {cd: 11, descricao: 'cd 11'},
        {cd: 12, descricao: 'cd 12'},
        {cd: 13, descricao: 'cd 13'},
    ];

    buscarTodasCategoriasProduto(): Observable<CategoriaProdutoModel[]> {
        let error = !!localStorage.getItem('error');
        let errorCode = parseInt(localStorage.getItem('errorCode'));
        let msg = errorCode === 404 ? '404 not found' : 'This shouldnt happen!';
        return error ? throwError(new HttpErrorResponse({
            status: errorCode,
            error: {mensagem: msg}
        })) : of(this.listaProdutos);
    }
}



describe('Categoria Produto Combo', () => {
    const testUtils = new TestHelper(expect);
    let component: CategoriaProdutoComboComponent;
    let fixture: ComponentFixture<CategoriaProdutoComboComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                FormsModule,
                CommonModule,
                NgMultiSelectDropDownModule,
                HttpClientModule
            ],
            declarations: [
                CategoriaProdutoComboComponent,
                SanitizeHtmlPipe,
                StudModalComponent
            ],
            providers: [
                {provide: CategoriaProdutoService, useClass: StudService},
                {provide: Router, useValue: RouterModule},
                {provide: NewModalComponent, useClass: StudModalComponent},
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]

        }).compileComponents();

        TestBed.overrideComponent(CategoriaProdutoComboComponent, {
            set: {
                providers: [{provide: CategoriaProdutoService, useClass: StudService}],
            }
        });

        fixture = TestBed.createComponent(CategoriaProdutoComboComponent);
        component = fixture.componentInstance;
        component.modalChild = TestBed.get(NewModalComponent);

    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
    });


    describe('Preencher Categoria Produto', () => {
        beforeEach(() => {
            localStorage.removeItem('error');
            localStorage.removeItem('errorCode');
        });

        afterEach(() => {
            component.modalChild.openModal = false;
        });
        it('Should fill the dropdown list with info from the service', async () => {
            component.dropdownCategoriaProdutoLista = [];
            expect(component.dropdownCategoriaProdutoLista.length).toEqual(0);
            component.preencheCategoriaProduto();
            await fixture.whenStable();
            expect(component.dropdownCategoriaProdutoLista.length).toEqual(4);
        });

        it('Should handle 404 api errors gracefully', async () => {
            localStorage.setItem('error', 'true');
            localStorage.setItem('errorCode', '404');
            component.preencheCategoriaProduto();
            fixture.detectChanges();
            await fixture.whenStable();
            expect(component.modalChild.openModal).toEqual(true);
            expect(component.tituloModal).toEqual('Nenhum dado encontrado');
            expect(component.mensagemModal).toEqual('404 not found');
            expect(component.imagemModal).toEqual('warning');
        });


        it('Should handle any api errors gracefully', async () => {
            localStorage.setItem('error', 'true');
            localStorage.setItem('errorCode', '403');
            component.preencheCategoriaProduto();
            await fixture.whenStable();
            expect(component.modalChild.openModal).toEqual(true);
            expect(component.tituloModal).toEqual('Oops');
            expect(component.mensagemModal).toEqual('This shouldnt happen!');
            expect(component.imagemModal).toEqual('warning');

        });
    });


    describe('Limpar selecionados', () => {
        it('Should clear all selected items and emit a event', () => {
            component.categoriaProdutoSelecionadoLista = [1,2,3,4,5];
            expect(component.categoriaProdutoSelecionadoLista.length).toBeGreaterThan(0);

            spyOn(component.selecionados, 'emit');
            component.limparSelecionados();
            expect(component.categoriaProdutoSelecionadoLista.length).toEqual(0);
            expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        })
    });


    describe('Selecionado Event', () => {

        it('Should handle the select event', () => {
            let event = ['1234', '123'];
            expect(component.categoriaProdutoSelecionadoLista.length).toEqual(0);
            spyOn(component.selecionados, 'emit');
            component.selecionado(event);
            expect(component.categoriaProdutoSelecionadoLista.length).toEqual(2);
            expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        });

        it('Should handle the select event with a empty value', () => {
            let event = [];
            component.categoriaProdutoSelecionadoLista = ['123', '321'];
            expect(component.categoriaProdutoSelecionadoLista.length).toEqual(2);
            spyOn(component.selecionados, 'emit');
            component.selecionado(event);
            expect(component.categoriaProdutoSelecionadoLista.length).toEqual(2);
            expect(component.selecionados.emit).toHaveBeenCalledTimes(1);
        });

    });
});
