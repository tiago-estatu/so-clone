import { AgendaCD } from './AgendaCD';

export interface ConfiguracaoCD {
  push(x: any);
    cdRegionais: string;
    cdFabricantes: string;
    cdFornecedores: string;
    diaCompra: string;
    frequencia: string;
    agendas: AgendaCD[];
}


