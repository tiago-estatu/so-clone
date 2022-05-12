import {cpfCnpjMask, dateTimeMask, MaskedDate, MaskedDateBack, phoneMask} from "./mask.helper";

// TODO refactor, add a reducer to simulate type
describe('Selected Require Match Helper', () => {

    // TESTS CASES
    it('Should have exported all the functions', () => {
        expect(MaskedDate).toBeTruthy();
        expect(MaskedDateBack).toBeTruthy();
        expect(dateTimeMask).toBeTruthy();
        expect(cpfCnpjMask).toBeTruthy();
        expect(phoneMask).toBeTruthy();

    });

    describe('MaskedDate and MaskedDateBack masks', () => {
        let eventObj;
        beforeEach(() => {
            eventObj = {
                target: {
                    value: ''
                }
            }
        });

        it('Should format a date into a DD/MM/YYYY as you type', () => {
            eventObj.target.value = '01';
            expect(eventObj.target.value).not.toEqual('01/');
            MaskedDate(eventObj);
            expect(eventObj.target.value).toEqual('01/');

            eventObj.target.value += '01';
            MaskedDate(eventObj);
            expect(eventObj.target.value).toEqual('01/01/');

            eventObj.target.value += '2020';
            MaskedDate(eventObj);
            expect(eventObj.target.value).toEqual('01/01/2020');

        });

        it('Should format a date into a DD-MM-YYYY as you type', () => {
            eventObj.target.value = '01';
            expect(eventObj.target.value).not.toEqual('01-');
            MaskedDateBack(eventObj);
            expect(eventObj.target.value).toEqual('01-');

            eventObj.target.value += '01';
            MaskedDateBack(eventObj);
            expect(eventObj.target.value).toEqual('01-01-');

            eventObj.target.value += '2020';
            MaskedDateBack(eventObj);
            expect(eventObj.target.value).toEqual('01-01-2020');

        })
    });

    describe('DateTimeMask mask', () => {
        let eventObj;
        beforeEach(() => {
            eventObj = {
                target: {
                    value: ''
                }
            }
        });
        it('Should Format the value into a DD/MM/YYYY HH:mm format as you type', () => {
            eventObj.target.value = '01';
            expect(eventObj.target.value).not.toEqual('01/');
            dateTimeMask(eventObj);
            expect(eventObj.target.value).toEqual('01/');

            eventObj.target.value += '01';
            dateTimeMask(eventObj);
            expect(eventObj.target.value).toEqual('01/01/');

            eventObj.target.value += '2020';
            dateTimeMask(eventObj);
            expect(eventObj.target.value).toEqual('01/01/2020 ');

            eventObj.target.value += '13';
            dateTimeMask(eventObj);
            expect(eventObj.target.value).toEqual('01/01/2020 13:');

            eventObj.target.value += '16';
            dateTimeMask(eventObj);
            expect(eventObj.target.value).toEqual('01/01/2020 13:16');
        })
    });

    describe('cpfCnpjMask mask', () => {
        it('Should cpf or cnpj mask pattern based on character length', () => {
            let cpfMask = [ /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/ ];
            let cnpjMask = [ /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '.', /[0-9]/, /[0-9]/, /[0-9]/, '/', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/ ];
            let rawValueCpf = '123.123.123.12';
            let complementaryCpfValue = '000.000000-00';
            expect(cpfCnpjMask(rawValueCpf)).toEqual(cpfMask);
            expect(cpfCnpjMask(complementaryCpfValue)).toEqual(cpfMask);
            expect(cpfCnpjMask('')).toEqual(cpfMask);

            let rawValueCnpj = '13.123.123/1000-12';
            let complementaryCnpjValue = '00000000000000';
            expect(cpfCnpjMask(rawValueCnpj)).toEqual(cnpjMask);
            expect(cpfCnpjMask(complementaryCnpjValue)).toEqual(cnpjMask);
        });

    });

    describe('phoneMask mask', () => {
        it('Should a phone mask pattern based on character length', () => {
            let rawValuePhone = '999999999';
            let complementaryPhoneValue = '009999999.90';
            expect(phoneMask(rawValuePhone)).toEqual([ '(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/ ]);
            expect(phoneMask(complementaryPhoneValue)).toEqual( [ '(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/ ]);
            expect(phoneMask('')).toEqual([ '(', /[0-9]/, /[0-9]/, ')', ' ', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, '-', /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/ ]);


        });

    })
});