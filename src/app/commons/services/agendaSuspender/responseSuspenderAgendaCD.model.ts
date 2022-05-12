import { responseErroSuspender } from './responseErroSuspender.model';

export interface responseSuspenderAgendaCD{
    content: {
        cdRegional?: number,
        cdFilial?: number,
        datasSuspensas: string[],
        datasJaSuspensas: string[],
        datasComProdutosJaSuspensos: string[]
    }[],
    erros: responseErroSuspender[],
    errosTotais: number
}