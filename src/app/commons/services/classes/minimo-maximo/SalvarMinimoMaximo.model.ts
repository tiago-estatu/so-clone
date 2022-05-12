export interface SalvarMinimoMaximoModel{
    cadastro?: boolean;
    cdOperadorAlteracao?: string;
    cdOperadorCadastro?: string;
    dtAlteracao?: string;
    dtCadastro?: string;
    cdMotivoEstoqueMinMax?: any;
    id: {
    cdFilial: number;
    inputFilial?: string;
    cdProduto: number;
    inputProduto?: string;
    };
    qtEstoqueMax?: string;
    qtEstoqueMin?: string;
}