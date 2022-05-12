
export class ProdutoEspelhoModel {
    semDemanda: Number;
    espelhoCadastrado: Number;
    novoEspelho?: Number;

    constructor(values: any) {
        this.semDemanda = values.cdProduto || values.semDemanda.cdProduto;
        this.espelhoCadastrado = values.cdProdutoEspelhoAnterior || values.espelhoCadastrado.cdProduto;
        this.novoEspelho = values.cdProdutoEspelho || values.novoEspelho.cdProduto
    }

    request(operador: string | number) {
        if(!operador) throw new Error('Operador invalido');
        return {
            cdOperador: operador,
            cdProduto: this.semDemanda,
            cdProdutoEspelho: this.novoEspelho,
            cdProdutoEspelhoAnterior: this.espelhoCadastrado
        }
    }

}
