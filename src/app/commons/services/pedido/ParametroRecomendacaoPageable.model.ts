import { ParametroRecomendacao } from './ParametroRecomendacao';

export interface ParametroRecomendacaoPageableModel{
    content: ParametroRecomendacao[],
    page: number,
    totalElements: number,
    size: number,
    totalPages: number

}