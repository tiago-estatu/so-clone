import {RequireMatch} from "./requireMatch";
import {AbstractControl} from "@angular/forms";

class Control extends AbstractControl{
    value: any;
    initialValue: any;

    patchValue(value: any, options?: Object): void {
        this.value = value
    }

    setValue(value: any, options?: Object): void {
        this.value = value;
    }

    reset(value?: any, options?: Object): void {
        this.value = this.initialValue;

    }

    constructor(initialValue?: any) {
        super(null, null);
        this.value = initialValue;
        this.initialValue = initialValue;
    }

}

describe('Selected Require Match Helper', () => {

    // TESTS CASES
    it('Should have exported all the functions', () => {
        expect(RequireMatch).toBeTruthy();
    });

    describe('Define RequireMatch', () => {


        it('Should return false if the value of the control value is a string', () => {
            let control = new Control();
            control.setValue('Teste');
            expect(RequireMatch(control)).toEqual({incorrect: true});
        });

        it('Should return true if the value of the control value is not a string', () => {
            let control = new Control();
            control.setValue(123);
            expect(RequireMatch(control)).toEqual(null);
        });
    });


});