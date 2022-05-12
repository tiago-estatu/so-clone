export interface AgendaFaturamentoModel {
    selecionado?: boolean;
    dataInicio: string;
    dataFim: string;
    cdRegional: number;
    nmRegional?: string;
    cdFornecedor?: string;
    nmFornecedor?: string;
    cdFabricante?: string;
    nmFabricante?: string;
    cdProduto?: number;
    cdFilial?: number;
    nmFantasia?: string;
    idFornecedorAgenda: number;
    detalhe?: [
        {
        dataFaturamento: String;
        motivoFaturamento: [
                {
                    cdMotivo: number;
                    dsMotivo: String;
                    fgMotivoProduto: Boolean
                }
            ];
            fgSuspensa: boolean;
            qtdSuspensos?: number;
            dtAlteracao: string;
            cdOperador: string;
        }
    ];
    fgFilialSuspensa?: number;
    idMotivoSuspensao?: number;
}
