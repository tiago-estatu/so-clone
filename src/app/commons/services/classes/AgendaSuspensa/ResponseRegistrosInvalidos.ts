import { ResponseViolations } from './ResponseViolations';

export interface ResponseRegistrosInvalidos{
    linha: string;
    nrLinha: number;
    violations: ResponseViolations[];
}