import { FailedDTO } from './FailedDTO';
import { SucessDTO } from './SucessDTO';

export interface ResponseDTO{
    sucessList: SucessDTO[];
    failureList: FailedDTO[];
    mensagem: string;
}