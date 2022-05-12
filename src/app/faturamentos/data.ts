export interface CD {
    item_id: number;
    item_text: string;
  }
  export interface ROTA {
    item_id: number;
    item_text: string;
  }
  export interface FATURAMENTO{
    idFaturamento: number;
    inputCD: string;
    rota: string;
    filial: string;
    qtdSkus: number,
    custo: number;
    cubagem: number;
    transmissao: number; 
  }
  export interface FATURAMENTO_ITEM {
    selecionar: boolean,
    cdProduto: number;
    descricaoProduto: string;
    valorUnit: number;
    qtdCompra: number;
    setor: number;
  }

export const CD_DATA: CD[]=[
 { item_id: 900, item_text: 'EMBU - SP'},
 { item_id: 905, item_text: 'PINHAIS - PR'},
 { item_id: 903, item_text: 'DUQUE DE CAXIAS - RJ'},
 { item_id: 1445, item_text: 'CONTAGEM - MG'},
 { item_id: 2023, item_text: 'PERNAMBUCO - PE'},
 { item_id: 908, item_text: 'RIBEIRÃO PRETO - SP'},
 { item_id: 1446, item_text: 'GOIANIA - GO'},
 { item_id: 1444, item_text: 'BUTANTA - SP'},
 { item_id: 2847, item_text: 'FORTALEZA - CE'},
 { item_id: 2605, item_text: 'CD GUARULHOS'},
 { item_id: 2376, item_text: 'SALVADOR - BA'},
];

export const ROTA_DATA: ROTA[]=[
    {item_id: 1, item_text: 'ROTA NOME 1'},
    {item_id: 2, item_text: 'ROTA NOME 2'},
    {item_id: 3, item_text: 'ROTA NOME 3'},
    {item_id: 4, item_text: 'ROTA NOME 4'},
    {item_id: 5, item_text: 'ROTA NOME 5'},
    {item_id: 6, item_text: 'ROTA NOME 6'}
];

export const FILIAL_DATA: ROTA[]=[
  {item_id: 107, item_text: 'RAIA DROGASIL - TAUBATE - A'},
  {item_id: 6005, item_text: 'RAIA DROGASIL -	RECREIO DOS BANDEIRANTES - A'}, 
  {item_id: 6004, item_text: 'RAIA DROGASIL - BOTAFOGO - A'},
  {item_id: 6006, item_text: 'RAIA - PAD FORD'},
  {item_id: 124, item_text: 'RAIA DROGASIL S/A - ANALIA FRANCO - A'},
  {item_id: 6007, item_text: 'RAIA - PAD BRIDGESTONE'}
];

export const FATURAMENTO_DATA: FATURAMENTO[] = [
  {idFaturamento: 1, inputCD: '2605 - CD GUARULHOS', rota: '3 - ROTA NOME 3', filial: '107 - RAIA DROGASIL - BOTAFOGO - A', qtdSkus: 135, custo: 1, cubagem: 0, transmissao: -1 },
];

export const FATURAMENTO_DETALHE:FATURAMENTO_ITEM[] = [
  {selecionar: false, cdProduto: 1, descricaoProduto: 'REXO DES SPR ACTIVE 90 REXO DES SPR', valorUnit: 15.5, qtdCompra: 95, setor: 4},
  {selecionar: false, cdProduto: 2, descricaoProduto: 'VITERNAT EMAG 50\'S', valorUnit: 15.5, qtdCompra: 1, setor: 3},
  {selecionar: false, cdProduto: 3, descricaoProduto: 'NIKE DES STIC NAT 75ML', valorUnit: 15.5, qtdCompra: 5, setor: 9},
  {selecionar: false, cdProduto: 4, descricaoProduto: 'DIPROGENTA CR  30G', valorUnit: 15.5, qtdCompra: 20, setor: 25},
  {selecionar: false, cdProduto: 5, descricaoProduto: 'DAIVONEX POM 30G', valorUnit: 15.5, qtdCompra: 14, setor: 1},
];

