import {UtilsHelper} from "./utils.helper";


describe('Utils helper', () => {

    // Prep
    let utils: UtilsHelper;

    beforeEach(() => {
        utils = new UtilsHelper();
    });

    // TESTS CASES
    it('Should initialize UtilsHelper class', () => {
        expect(utils).toBeTruthy();
    });

    describe('Valida Estado', () => {
        it('Should validate if it is not empty', () => {
            expect(utils.validaEstadoUrl('')).toEqual('');
        });
        it('Should return the formated value', () => {
            expect(utils.validaEstadoUrl('test')).toEqual('test&')
        })
    });

    describe('Monta url', () => {
        let config = {busca: 'teste', campo: [1, 2, 3], formaPesquisa: '', isCaseSensitive: false};
        beforeEach(() => {
            let config = {busca: 'teste', campo: [1, 2, 3], formaPesquisa: '', isCaseSensitive: false};
        });

        it('Should handle if the campo argument is empty or null', () => {
            let result = utils.montaUrl(config.busca, '', config.formaPesquisa, config.isCaseSensitive);
            expect(result).toEqual('');
            result = utils.montaUrl(config.busca, null, config.formaPesquisa, config.isCaseSensitive);
            expect(result).toEqual('');

            result = utils.montaUrl(config.busca, undefined, config.formaPesquisa, config.isCaseSensitive);
            expect(result).toEqual('');
        });

        it('Should return a formated url without case sensitive', () => {
            let result = utils.montaUrl(config.busca, config.campo, config.formaPesquisa, config.isCaseSensitive);
            expect(result).toEqual('&f=teste1,2,3')
        });

        it('Should return a formated url with case sensitive', () => {
            let result = utils.montaUrl(config.busca, config.campo, config.formaPesquisa, true);
            expect(result).toEqual('&f=(lowercase)teste1,2,3')
        })
    });

    describe('Is empty', () => {
        it('Should return false if the value is not empty', () => {
            let obj = {name: 'Teste'};
            let number = 2;
            let text = 'This is a text';
            let func = () => 'function';
            expect(utils.isEmpty(number)).toEqual(false);
            expect(utils.isEmpty(text)).toEqual(false);
            expect(utils.isEmpty(obj)).toEqual(false);
            expect(utils.isEmpty(func)).toEqual(false);
        });

        it('Should return on null or empty values', () => {
            let notDefined;
            let nulled = null;
            let emptyString = '';
            expect(utils.isEmpty(notDefined)).toEqual(true);
            expect(utils.isEmpty(nulled)).toEqual(true);
            expect(utils.isEmpty(emptyString)).toEqual(true);
        })
    });

    describe('Eh Presente', () => {
        it('Should return true if is present', () => {
            let today = new Date();
            expect(utils.ehPresente(today)).toEqual(true);
        });

        it('Should return false if is not present', () => {
            let yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(utils.ehPresente(yesterday)).toEqual(false);
        });
    })

});