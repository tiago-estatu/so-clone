import { ResponseRegistrosInvalidos } from '.';

export interface ResponseUpload {
    qtTotalRegistros: number;
    qtTotalRegistrosNovos: number;
    qtTotalRegistrosAlterados: number;
    qtTotalRegistroComErro: number;
    qtdDatasComProdutosJaSuspensos?: number;
    registrosInvalidos?: ResponseRegistrosInvalidos[];
    mensagem?: string;
    type?: string;
    detail?: string
}