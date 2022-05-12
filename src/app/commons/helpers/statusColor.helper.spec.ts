import {defineCorStatus} from "./statusColor";


describe('Status Color Helper', () => {

    // TESTS CASES
    it('Should exist', () => {
        expect(defineCorStatus).toBeTruthy();
    });

    describe('Define cor status', () => {
        let corStatus;
        let statuses;

        beforeEach(() => {
            corStatus = defineCorStatus;

        });
        it('Should handle CONCLUIDO statuses', () => {
            statuses = [101,31,108,109,112,114,115,116,118,140,137];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'CONCLUIDO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });

        it('Should handle ERRO statuses', () => {
            statuses = [104,32,107,111,121,123,125,127,132,135,134,138,141,143];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'ERRO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });

        it('Should handle DESPACHADO statuses', () => {
            statuses = [103,126,136];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'DESPACHADO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });

        it('Should handle SEPARACAO statuses', () => {
            statuses = [110];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'SEPARACAO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });

        it('Should handle ABERTO statuses', () => {
            statuses = [10,102,105,106, 113,117,119,120,124,128, 129,130,131,139,142,144];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'ABERTO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });

        it('Should handle DESPACHADO if no match is found', () => {
            statuses = [999, 1010, 909090, 123123];
            let filteredStatuses = statuses.filter(status => corStatus(status) === 'DESPACHADO');
            expect(filteredStatuses.length).toEqual(statuses.length)
        });


    })

});