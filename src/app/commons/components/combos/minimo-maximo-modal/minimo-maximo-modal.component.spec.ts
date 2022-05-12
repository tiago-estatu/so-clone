import {async, ComponentFixture, TestBed} from "@angular/core/testing";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {TestHelper} from "../../../helpers/test.helper";
import {MinimoMaximoModalComponent} from "./minimo-maximo-modal.component";


describe('Minimo Maximo Modal', () => {
    const testUtils = new TestHelper(expect);
    let component: MinimoMaximoModalComponent;
    let fixture: ComponentFixture<MinimoMaximoModalComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterModule.forChild([]), ReactiveFormsModule, FormsModule, CommonModule],
            declarations: [MinimoMaximoModalComponent],
            providers: []
        }).compileComponents();
        fixture = TestBed.createComponent(MinimoMaximoModalComponent);
        component = fixture.componentInstance;
    }));


    it('Should create component', () => {
        expect(component).toBeTruthy();
    })

});