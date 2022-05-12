import { IAgendaLoja } from './IAgendaLoja';
import { AgendaFalha } from './AgendaFalha';

export interface UploadResponseAgendaLoja {
    sucessList: IAgendaLoja[];
    failureList: AgendaFalha[];
}