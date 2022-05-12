export interface responseErroSuspender {
    cdRegional: number;
    cdFabricante: number;
    cdFornecedor: number;
    cdProduto: number;
    produtosInexistentes: number;
    produtosDeletados: number;
    produtosInativos: number;
    produtosNaoVendaveis: number;
    produtoNaoPertenceAoFornecedor: number;
    produtoNaoPertenceAoFabricante
}