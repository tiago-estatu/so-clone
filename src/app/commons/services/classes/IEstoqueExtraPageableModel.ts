import { IEstoqueExtraModalSalvarModel } from './IEstoqueExtraModalSalvarModel';

export interface EstoqueExtraPageableModel{
    content: IEstoqueExtraModalSalvarModel[],
    page: number,
    totalElements: number,
    size: number,
    totalPages: number

}