import { IArredondamento } from './IArredondamento';
import { ArredondamentoFalhaDTO } from '.';

export interface uploadResponseArredondamento{
    sucessList: IArredondamento[];
    failureList: ArredondamentoFalhaDTO[];
}