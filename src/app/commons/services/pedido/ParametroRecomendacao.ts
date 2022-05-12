export interface ParametroRecomendacao {
    selecionado: boolean;
    skuId: number;
    dtPedido: Date;
    cdRegional: number;
    nmCdRegional: string;
    cdFornecedor: number;
    qtProduto: number;
    qtTotal: number;
    qtPedida: number;
    nmFilial: string;
    nmFornecedor: string;
    vlTotal: number;
    cdFabricante: number;
    nmFabricante: string;
    cdOperador: number | string;
}
