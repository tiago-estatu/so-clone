import { AgendaSuspensaDetalhe } from './AgendaSuspensaDetalhe';

export class AgendaSuspensa{
    selecionado?: boolean;
    cdFabricante: number;
    cdFornecedor: number;
    cdRegional: number;
    detalhes: AgendaSuspensaDetalhe[];
    fgStatus: number;
    idFornecedorAgenda: number;
    nmCdRegional: string;
    nmFabricante: string;
    nmFornecedor: string;
    dtInicio: string;
    dtFim: string;
    //agendas: AgendaSuspensaDetalhe[];

    constructor(_){
        this.cdFabricante = _.cdFabricante;
        this.cdFornecedor= _.cdFornecedor;
        this.cdRegional = _.cdRegional;
        this.detalhes = this.setDetalheSelecionadoFalse(_.detalhes);
        this.fgStatus = _.fgStatus;
        this.idFornecedorAgenda = _.idFornecedorAgenda;
        this.nmCdRegional = _.nmCdRegional;
        this.nmFabricante = _.nmFabricante;
        this.nmFornecedor = _.nmFornecedor;
    }
    
    public selecionar() : void{
        this.selecionado = true;
    }

    public desselecionar() : void{
        this.selecionado = false;
    }
    public getDetalhes(): AgendaSuspensaDetalhe[]{
        if(this.detalhes === undefined || this.detalhes === null ) return [];

        return this.detalhes;
    }
    
    public setDataVigencia(dtInicio, dtFim){
        this.dtInicio = dtInicio;
        this.dtFim = dtFim;
    }
    
    public selecionarTodasAgendas() : void{
        this.getDetalhes().filter(e => e.flAgendaSuspensa === 0).forEach(e => e.selecionado = true);
    }

    setDetalheSelecionadoFalse(detalhes): AgendaSuspensaDetalhe[]{
        return detalhes.map((detalhe: AgendaSuspensaDetalhe) => 
             ({...detalhe, selecionado: false})
        )
    }
   
}