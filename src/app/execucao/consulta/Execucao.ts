export interface Execucao{

    id:number;
    idExecucao:number;
    codRotinaInterface:number;
    dataRotinaInterface:Date;
    numSeqRotinaInterface:number;
    nometabela:string;
    dataInicioExecucao: Date;
    dataFimExecucao: Date;
    flagErro: number;
    cdOperador:number;
    qtRegistro:number;
}