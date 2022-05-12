import { RecomandacaoId } from './RecomendacaoId';

export interface Recomendacao {
    selecionado: boolean;
    dtPedido: Date;
    cdProduto: number;
    cdRegional: number;
    dsProduto: string;
    cdFornecedor: number;
    nrSequence: number;
    qtPedida: number;
    vlItem: number;
    vlUnitario: number;
    pcDesconto: number;
    vlTotal: number;
    idPedidoCompra: null;
}
