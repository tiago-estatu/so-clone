export interface SuspenderEmLote{
   idFornecedorAgenda?: number;
   filial?: number;
 motivoSuspensao: {
    cdMotivo: number;
    dsMotivo?: string;
    cdProdutos?: number[];
    cdOperador: string;
    dtFim: string;
    dtInicio: string;
    idAgendasAbasctecimento: number[];
 }
}