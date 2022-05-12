import { MinimoMaximoModel } from './minimo-maximo.model';

export interface MinimoMaximoPageableModel{
    content: MinimoMaximoModel[],
    page: number,
    totalElements: number,
    size: number,
    totalPages: number

}