import {voltarUrl} from "./urlBack";


describe('Url Back', () => {

    // TESTS CASES
    it('Should exist', () => {
        expect(voltarUrl).toBeTruthy();
    });

    describe('Voltar url', () => {
        it('Should not return if no item is set on localstorage', () => {
            let voltar = voltarUrl;
            localStorage.clear();
            expect(voltar([], '/home')).not.toBeDefined()
        });

        it('Should return the initial array except the last value if the route is the last item', () => {
            let routesArray = ['/home', '/products'];
            localStorage.setItem('urlVoltar', JSON.stringify(routesArray));

            let result = voltarUrl(routesArray, '/products');

            expect(result).not.toContain('/products')
        });


        it('Should return the initial array if the route is not the last item', () => {
            let routesArray = ['/home', '/reports', 'history'];
            localStorage.setItem('urlVoltar', JSON.stringify(routesArray));

            let result = voltarUrl(routesArray, '/products');

            expect(result.length).toEqual(3)
        })

    })

});