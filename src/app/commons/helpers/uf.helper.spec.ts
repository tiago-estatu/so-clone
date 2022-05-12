import {Component, Injectable} from "@angular/core";
import {UfHelper} from "./uf-helper";
import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
    selector: 'stud-component',
    template: '',
})
class StudComponent {
    constructor(public ufHelper: UfHelper) {
    }

}



describe('Uf Helper', () => {
    let component: StudComponent;
    let fixture: ComponentFixture<StudComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [StudComponent],
            providers: [UfHelper]
        }).compileComponents();
        fixture = TestBed.createComponent(StudComponent);
        component = fixture.componentInstance;
    }));


    it('Should be injectable into components', () => {
        expect(component).toBeTruthy();
        expect(component.ufHelper).toBeTruthy();
    });

    describe('Select Uf', () => {
        it('Should have an array with all the ufs', () => {
            expect(component.ufHelper.selectUf).toBeDefined();
            expect(Array.isArray(component.ufHelper.selectUf)).toEqual(true);
            expect(component.ufHelper.selectUf.length).toEqual(27);
        });
        it('Should store all the UFs in a nome-sigla object', () => {
            let inModel = component.ufHelper.selectUf.filter(uf => !!uf.nome && !!uf.sigla);
            expect(inModel.length).toEqual(component.ufHelper.selectUf.length);
        })
    })




});