import { CampoSuspenderCD } from './CampoSuspenderCD.model';

export interface AgendaSuspensaoPost {
    dataInicio: string,
    dataFim: string,
    cdMotivo: number,
    cdOperador: string,
    listaFiliais?: number[],
    campos?: CampoSuspenderCD[],
    cdProdutos?: number[]
   }
