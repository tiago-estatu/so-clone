export interface SuspenderAgendaParametro{
    dataInicio: String;
    dataFinal: String;
    motivo: String;
    cdOperador: string;
    cd?: number[],
    fornecedor?:number[],
    fabricante?:number[],
    filial?:number[],
    dias?:number[],
    produto?:number[],
}