import {TestBed} from '@angular/core/testing';
import {HttpClientModule, HttpHeaders} from "@angular/common/http";
import {of} from "rxjs";
import {AgendaService} from "./agenda-service";
import {ConfiguracaoCD} from "../../../execucao/agenda/ConfiguracaoCD";
import {AgendaCD} from "../../../execucao/agenda/AgendaCD";
import {ServicePath} from "../../const";
import {IAgendaLoja} from '../classes/IAgendaLoja';
import {delay} from 'rxjs/operators';


const AGENDAS: AgendaCD[] = [
    {cdFabricante: '1', cdFornecedor: '1', cdRegional: '1', diaSemana: '1', nrSemana: '1', qtDiasIntervalo: '1'},
    {cdFabricante: '2', cdFornecedor: '2', cdRegional: '2', diaSemana: '2', nrSemana: '2', qtDiasIntervalo: '2'},
];
const LISTA_CD: ConfiguracaoCD = {
    agendas: AGENDAS,
    cdFabricantes: '1',
    frequencia: '1',
    cdFornecedores: '1',
    cdRegionais: '1',
    diaCompra: '1',
    push(x: any) {
    }
};

const AGENDA_LOJA: IAgendaLoja = {
    cdPadraoAbastecimento: '1',
    cdFilial: '1',
};

describe('Agenda Service', () => {
    let service: AgendaService;


    beforeEach(() => {
        TestBed.configureTestingModule({imports: [HttpClientModule]});
        service = TestBed.get(AgendaService);
    });

    it('deve ser criado', () => {
        expect(service).toBeTruthy();
    });

    describe('Get consulta lista cd', () => {

        it('Deve retornar uma requisição GET ao api',  () => {
            let param = '1';
            let response = of([LISTA_CD]);
            spyOn(service['http'], 'get').and.returnValue(response);
            //prep

            service.getConsultaListaCD(param).subscribe(data => {
                expect(data).toEqual(LISTA_CD);
            });

            expect(service['http'].get).toHaveBeenCalledTimes(1);
            expect(service['http'].get).toHaveBeenCalledWith(ServicePath.HTTP_URL_AGENDA_CD, {params: param})
        })


    });

    describe('Get Consulta lista loja', () => {
        it('Deve retornar uma requisiação GET do api de loja', () => {
            let response = of([AGENDA_LOJA]);
            let param = '?qry=1';
            spyOn(service['http'], 'get').and.returnValue(response);
            service.getConsultaListaLOJA(param).subscribe(data => {
                expect(data).toEqual([AGENDA_LOJA]);
            });
            expect(service['http'].get).toHaveBeenCalledTimes(1);
            expect(service['http'].get).toHaveBeenCalledWith(ServicePath.HTTP_URL_AGENDA_LOJA + param);
        })
    })


});


