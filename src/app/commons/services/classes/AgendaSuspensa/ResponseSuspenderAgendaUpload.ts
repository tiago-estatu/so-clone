import { ResponseRegistrosInvalidos } from './ResponseRegistrosInvalidos';

export interface ResponseSuspenderAgendaUpload {
    qtTotalRegistros: number;
    qtTotalRegistrosNovos: number;
    qtTotalRegistrosAlterados: number;
    qtTotalRegistroComErro: number;
    registrosInvalidos?: ResponseRegistrosInvalidos[];
}

