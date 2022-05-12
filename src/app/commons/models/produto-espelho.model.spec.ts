
import {ProdutoEspelhoModel} from "./produto-espelho.model";


describe('Produto Espelho Model', () => {

    // Prep
    let produtoEspelho: ProdutoEspelhoModel;


    // TESTS CASES

    it('Deve permitir construir em base ao modelo do servidor', () => {
        let forParsing = {cdProduto: 1, cdProdutoEspelhoAnterior: 2, cdProdutoEspelho: 3};
        produtoEspelho = new ProdutoEspelhoModel(forParsing);
        expect(produtoEspelho).toBeTruthy();
        expect(produtoEspelho.semDemanda).toBe(1);
        expect(produtoEspelho.espelhoCadastrado).toBe(2);
        expect(produtoEspelho.novoEspelho).toBe(3);
    });

    it('Deve permitir construir em base ao modelo do local', () => {
        let forParsing = {semDemanda: {cdProduto: 1}, novoEspelho: {cdProduto: 2}, espelhoCadastrado: {cdProduto: 3}};
        produtoEspelho = new ProdutoEspelhoModel(forParsing);
        expect(produtoEspelho).toBeTruthy();
        expect(produtoEspelho.semDemanda).toBe(1);
        expect(produtoEspelho.novoEspelho).toBe(2);
        expect(produtoEspelho.espelhoCadastrado).toBe(3);


    });

    it('Deve dar erro ao tentar construir com valores invalidos', () => {
        let serverResponse = {};
        let novoEspelho;
        expect(() => {novoEspelho = new ProdutoEspelhoModel(serverResponse)}).toThrowError();
        expect(novoEspelho).toBeFalsy();
    });


    describe('Request Method', () => {
        it('Deve retornar o modelo do servidor com o operador enviado', () => {
            let forParsing = {semDemanda: {cdProduto: 1}, novoEspelho: {cdProduto: 2}, espelhoCadastrado: {cdProduto: 3}};
            produtoEspelho = new ProdutoEspelhoModel(forParsing);

            let operador = 1;
            let response = produtoEspelho.request(operador);
            let valorFinal = {
                cdOperador: operador,
                cdProduto: forParsing.semDemanda.cdProduto,
                cdProdutoEspelho: forParsing.novoEspelho.cdProduto,
                cdProdutoEspelhoAnterior: forParsing.espelhoCadastrado.cdProduto
            };

            expect(response).toEqual(valorFinal);
        });

        it('Deve retornar erro se chamar o request com um operador nulo', () => {
            let forParsing = {semDemanda: {cdProduto: 1}, novoEspelho: {cdProduto: 2}, espelhoCadastrado: {cdProduto: 3}};
            produtoEspelho = new ProdutoEspelhoModel(forParsing);

            let operador = null;
            expect(() => produtoEspelho.request(operador)).toThrowError();

        })

    });

});
