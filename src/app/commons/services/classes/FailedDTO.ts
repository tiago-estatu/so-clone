import { IEstoqueExtraVO } from './IEstoqueExtraVO';

export interface FailedDTO{
    line: number;
	estoqueExtra: IEstoqueExtraVO;
	erros: string[];
}