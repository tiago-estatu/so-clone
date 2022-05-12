import { AgendaExcell } from './AgendaExcell';


export interface AgendaFalha {
    line: number;
    dados: AgendaExcell;
    erros?: string[];
}
