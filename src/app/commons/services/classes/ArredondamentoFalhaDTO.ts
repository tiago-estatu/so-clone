import { ArredondamentoVO } from '.';

export interface ArredondamentoFalhaDTO{
    line: number;
    rounding: ArredondamentoVO;
    erros?: string[];
}