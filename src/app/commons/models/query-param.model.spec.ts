import {RequestParamModel} from "./request-param.model";
import {QueryFilters} from "./query-param.model";


describe('Query Param', () => {

    // Prep
    let queryParams: QueryFilters;

    beforeEach(() => {
         queryParams = new QueryFilters(
            [
                new RequestParamModel('size', 10),
                new RequestParamModel('page', 0, null, (val: number) => val - 1),
                new RequestParamModel('date', new Date(), null, (date: Date) => {return date.getDay()}),
                new RequestParamModel('quantity', 0, 'qty')
            ]
        );
    });

    // TESTS CASES

    it('Should create queryParams object', () => {
        expect(queryParams).toBeTruthy();

        let emptyParams = new QueryFilters();
        expect(emptyParams.length).toEqual(0);
    });

    it('Should allow to retrieve the param formatted and unformatted', () => {
        expect(queryParams.getParam('page')).toEqual(-1); //formatted
        expect(queryParams.getParam('page', false)).toEqual(0); //unformatted
    });

    it('Should update the a single param', () => {
        let finalValue = 20;
        queryParams.updateParam('size', finalValue);
        expect(queryParams.getParam('size')).toEqual(finalValue);
    });

    it('Should get with the name in case it has one, else with its key', () => {
        let qty = queryParams.getParam('quantity');
        let size = queryParams.getParam('size');
        expect(qty).toBeDefined();
        expect(size).toBeDefined();
    });

    it('Should update multiple values', () => {
        let finalSize = 50;
        let finalQty = 2;
        queryParams.updateParams([
            {name: 'size', value: finalSize},
            {name: 'qty', value: finalQty}
        ]);
        expect(queryParams.getParam('size')).toEqual(finalSize);
        expect(queryParams.getParam('qty')).toEqual(finalQty);

    });

    it('Should format the value with the provided formated when using getParam', () => {
        let val = 2;
        queryParams.updateParam('page', val);
        queryParams.updateParam('size', val);

        expect(queryParams.getParam('page')).toEqual(val - 1);
        expect(queryParams.getParam('size')).toEqual(val);
    });

    it('Should allow to remove a param', () => {
        expect(queryParams.getParam('date')).toBeTruthy();
        queryParams.removeParam('date');
        expect(queryParams.getParam).toThrowError();
    });

    it('Should allow to retrieve the params in a queryParamsString format,only with those who has values', () => {
       let queryString = queryParams.criarFiltro();
       expect(queryString).toEqual(`?size=10&date=${new Date().getDay()}`);

    });

    // EDGE CASES

    it('Should not allow to request a non-existent param', () => {
        expect(() => queryParams.getParam('nonexistent')).toThrow(new Error('Param not found'));
    });


    // RANDOM CASES
    // TODO add random cases

});