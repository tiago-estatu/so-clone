import { ProdutoAgendaSuspensa } from '../ProdutoAgendaSuspensa';


export interface MotivoAgendaSuspensa {
    dsMotivo: string;
    dtInico: string;
    dtFinal: string;
    produtos: ProdutoAgendaSuspensa[];
}