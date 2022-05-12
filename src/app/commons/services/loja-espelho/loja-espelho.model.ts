

export class ValidaLojaModel {
    cdFilial: number;
    nmFantasia: string;
    nmRazao?: string;
    nrCnpj?: string;
    dtEncerramento?: string;
    cdFilialTipo?: number;
    flFaturamento?: number;
    cdCluster: number;
    dtInauguracao: string;
    dsCluster: string;
}

export class LojaEspelhoModel{
    cdFilial?: number;
    dsFilial?: string;
    cdFilialEspelho: number;
    dsFilialEspelho: string;
    dtInauguracao?: string;
    cdCluster?: number;
    dsCluster?: string;
}

export class LojaEspelhoPostModel{
    cdFilial: number;
    cdFilialEspelho: number;
    cdFilialEspelhoAnterior?: number;
    cdOperador: number;
}
export class LojaEspelho {

}


export class LojaEspelhoFilterModel {

}
