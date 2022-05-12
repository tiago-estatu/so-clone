import { AgendaLojaExcell } from './AgendaLojaExcell';

export interface AgendaLojaFalha {
    line: number;
    dados: AgendaLojaExcell;
    erros?: string[];
}