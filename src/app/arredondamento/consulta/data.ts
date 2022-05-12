export const DATA_EXCEL: any[] = [
    { 'cod regional': '' ,
      'cod Fornecedor': '',
      'cod Produto': '',
      'QT Cx Display': '',
      '% 1º CX Display': '',
      '% 2º Cx Display': '',
      'QT Cx Embarque': '',
      '% 1º CX Embarque': '',
      '% 2º Cx Embarque': '',
      '% Arredondamento': '',
      'QT Camada Pallet': '',
      '% Camada Pallet': '',
      'QT Pallet': '',
      '% Pallet': '',
      '% Desconto Comercial': '',
    }
  ];
  export interface CD {
    item_id: number;
    item_text: string;
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
export interface Produto{
    id: number,
    name: string,
}
export interface ProdutoCD{
    item_id: number;
    item_text: string;
}

export const PRODUTO_CD_DATA: ProdutoCD[]=[
    { item_id: 1, item_text: 'Naldecon Dia'},
     {item_id: 2, item_text: 'Naldecon Noite'}, 
    {item_id:3, item_text: 'Camisinha Sabor Morango'},
     {item_id:4, item_text: 'Fralda 1'},
      {item_id:5, item_text: 'Fralda 2'},
       {item_id:6, item_text: 'Fralda 3'}
];
