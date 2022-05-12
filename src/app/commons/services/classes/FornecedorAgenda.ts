import { CdRegional } from './CdRegional';
import { IFornecedor } from './IFornecedor';
import { PedidoCompraTipo } from './PedidoCompraTipo';

 export interface FornecedorAgenda{
    idFornecedorAgenda: string;
    cdFabricante: IFornecedor;
    cdFornecedor: IFornecedor;
    diaSemana: string;
    flCompra: string;
    nrSemana: string;
    qtDiasIntervalo: string;
    tbCdRegional: CdRegional;
    tbPedidoCompraTipo: PedidoCompraTipo;
 }