import {RequestParamModel} from "./request-param.model";


describe('Request Param', () => {
    // Prep
    let param = new RequestParamModel('size', 10);
    let formattedParam = new RequestParamModel('date', new Date(), null, (val: Date) => val.getDay());
    let namedParam = new RequestParamModel('dxComplexParam', 1, 'complex');
    let expectedFormat = new Date().getDay();

    // TESTS CASES

    it('Should create params', () => {
        expect(param).toBeTruthy();
        expect(formattedParam).toBeTruthy();
        expect(namedParam).toBeTruthy();
    });

    it('Should add add a name if one is provided, else it should pick the key',() => {
        expect(param.name).toEqual('size');
        expect(namedParam.name).toEqual('complex');
    });

    it('Should add a empty string as a value if no value is provided',() => {
        let paramTest = new RequestParamModel('123', null, null);
        expect(paramTest.value).toEqual('')
    });

    it('Should format if a formatted is provided, else it should return the same value',() => {
        expect(formattedParam.formatter(formattedParam.value)).toEqual(expectedFormat);
        expect(param.formatter(param.value)).toEqual(10)
    });

    it('Should update its value',() => {
        let newValue = 20;
        let newDate = new Date();
        newDate.setDate(new Date().getDate() + 1);

        // updates values
        param.updateValue(newValue);
        formattedParam.updateValue(newDate);

        // expectations
        expect(param.formatter(param.value)).toEqual(newValue);
        expect(formattedParam.formatter(formattedParam.value)).toEqual(newDate.getDay());

    });


    // EDGE CASES

    it('Should throw error if an empty string is provided as a key', () => {
        expect(() => new RequestParamModel('', 10)).toThrowError('Key cannot be empty');
        expect(() => new RequestParamModel('   ', 10)).toThrowError('Key cannot be empty');
    });


    // RANDOM CASES
    // TODO add random cases

});