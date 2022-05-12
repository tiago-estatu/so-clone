export interface AgendaSuspensaDetalhe{
    agendaId?: number;
    idFornecedorAgenda?: number;
    idAgendaAbastecimento: number;
    dataAgenda: string;
    motivoSuspensaoTOs?: string[];
    flAgendaSuspensa: number;
    selecionado?:boolean;
}


/*
    agendaId: number;
    dtAgenda: string;
    idAgendaAbastecimento: number;
    motivoSuspensaoTOs: MotivoAgendaSuspensaTO[];
    flAgendaSuspensa: number;
    selecionado?:boolean;
}
*/