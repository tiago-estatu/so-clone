import {Produto} from "../classes";


export class SubstitutoGenericoModel implements Produto{
    cdProduto: number;
    prioridade: number;
    dsProduto: string;
    cdFornecedor: number;
    nmFantasiaFornecedor: string;
    cdCategoriaMaster: number;
    dsCategoriaMaster: string;
    cdPrincipioAtivoComposto: number;
    dsPrincipioAtivoComposto: string;
    clCurvaFis: string;
    cdGrupoSubstituto: number;
    flDeletado?: number;
    strip = () => ({cdProduto: this.cdProduto, prioridade: this.prioridade, cdGrupoSubstituto: this.cdGrupoSubstituto, flDeletado: this.flDeletado === 1 ? 1 : 0});
    constructor(values: any) {
        this.prioridade = values.prioridade || null;
        this.cdProduto = values.cdProduto || null;
        this.dsProduto = values.dsProduto || null;
        this.cdFornecedor = values.cdFornecedor || null;
        this.nmFantasiaFornecedor = values.nmFantasiaFornecedor || null;
        this.cdCategoriaMaster = values.cdCategoriaMaster || null;
        this.dsCategoriaMaster = values.dsCategoriaMaster || null;
        this.cdPrincipioAtivoComposto = values.cdPrincipioAtivoComposto || null;
        this.dsPrincipioAtivoComposto = values.dsPrincipioAtivoComposto || null;
        this.clCurvaFis = values.clCurvaFis || null;
        this.cdGrupoSubstituto = values.cdGrupoSubstituto || null;
        this.flDeletado = values.flDeletado || null;

    }

}


