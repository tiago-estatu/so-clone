import { IAgenda } from './IAgenda';
import { AgendaFalha } from './AgendaFalha';

export interface UploadResponseAgenda {
    sucessList: IAgenda[];
    failureList: AgendaFalha[];
}