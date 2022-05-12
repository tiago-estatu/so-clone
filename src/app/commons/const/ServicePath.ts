import { environment } from 'src/environments/environment';

export class ServicePath {

  static base_url = environment.base_url;
  static base_url_login = environment.base_url_login;
  static LOCAL = 'http://localhost:7004/';

  // ############################## INTERFACE_ITIM ##############################

  // static INTERFACE = ServicePath.base_url + "rd-interface-itim/";
  static INTERFACE = ServicePath.base_url + 'rd-interface-itim/';
  // static AUTORIZADOR = ServicePath.LOCAL + "7002/";

  static HTTP_FIND_INTERFACE_ITIM = ServicePath.INTERFACE + 'v1/';

  static HTTP_BUSCA_ID_INTERFACE_ITIM(cd_itim) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim;
  }

  static HTTP_BUSCA_CODIGO_INTERFACE_DATA_EXECUCAO(cd_itim, dt_execucao) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim + '/execucao/' + dt_execucao;
  }

  static HTTP_BUSCA_ID_INTERFACE_ID_EXECUCAO_ERRO(cd_itim, id_execucao) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim + '/execucaoErro/' + id_execucao;
  }

  static HTTP_BUSCA_DATA_INTERFACE_DATA_EXECUCAO_ERRO(cd_itim, dt_execucao) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim + '/execucaoErro/data/' + dt_execucao;
  }

  static HTTP_BUSCA_QUANTIDADE_INTERFACE_ITIM(dt_execucao) {
    return ServicePath.INTERFACE + 'v1/' + '/execucao/' + dt_execucao + '/resumo';
  }

  static HTTP_BUSCA_ID_INTERFACE_ID_EXECUCAO(cd_itim, id_execucao) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim + '/execucao/' + id_execucao;
  }

  static HTTP_BUSCA_INTERFACE_DATA_EXECUCAO(cd_itim, dt_execucao) {
    return ServicePath.INTERFACE + 'v1/' + cd_itim + '/execucao/data/' + dt_execucao;
  }

  // tslint:disable-next-line: member-ordering
  static HTTP_URL_ARREDONDAMENTO = ServicePath.base_url + 'rd-interface-itim-rounding/v1/arredondamento';

  static HTTP_RELATORIO_ARREDONDAMENTO_CD = ServicePath.base_url + 'rd-interface-itim-rounding/v1/arredondamento/relatorio'
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_ESTOQUE_EXTRA = ServicePath.base_url + 'rd-interface-stockextra/v1';
  
  static HTTP_URL_LOCALIZACAO = ServicePath.base_url + 'rd-interface-stockextra/v1';

  static HTTP_EXPORT_ARREDONDAMENTO_TEMPLATE = ServicePath.base_url + 'rd-interface-itim-rounding/v1/arredondamento/export/template';

  // tslint:disable-next-line: member-ordering
  static HTTP_EXPORT_ESTOQUE_EXTRA_TEMPLATE = ServicePath.base_url + 'rd-interface-stockextra/v1/estoqueExtra/export/template';
  static HTTP_EXPORT_ESTOQUE_EXTRA_LMPM_TEMPLATE = ServicePath.base_url + 'rd-interface-stockextra/v1/estoqueExtra/lmpm/export/template';

  static HTTP_URL_PRODUTO_ESPELHO = ServicePath.base_url + 'rd-interface-stockextra/v1/produtoEspelho';


  static HTTP_URL_SUBSTITUTO_GENERICO = ServicePath.base_url + 'rd-interface-stockextra/v1/substitutoGenerico';

  static HTTP_URL_PRIORIDADE_LOJA = ServicePath.base_url + 'rd-interface-stockextra/v1/';

  // INTERFACE ITIM

  // api_itim: 'http://10.1.55.199:8084/rd-interface-itim/',
  // tslint:disable-next-line: member-ordering
  // static HTTP_URL_INTERFACE_ITIM = ServicePath.base_url + 'rd-interface-itim/';
  static HTTP_URL_INTERFACE_ITIM = ServicePath.base_url + 'rd-interface-itim/';

  static HTTP_URL_LISTAR_PERFIL_ACESSO =  ServicePath.base_url + 'rd-interface-itim/v1/perfil';

  static HTTP_URL_LISTAR_PERFIL_ROTAS =  ServicePath.base_url + 'rd-interface-itim/v1/perfil/rotas';

  static HTTP_URL_CONSULTA_OPERADOR =  ServicePath.base_url + 'rd-interface-itim/v1/operador';
  // api_recomendation:            'http://10.1.55.199:8084/rd-interface-itim-pedido/v1/recomendacao/resumo',
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_RECOMENDACAO_RESUMO = ServicePath.base_url + 'rd-interface-itim-pedido/v1/recomendacao/resumo';

  // api_recomendation_post:       'http://10.1.55.199:8084/rd-interface-itim-pedido/v1/',
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_RECOMENDACAO = ServicePath.base_url + 'rd-interface-itim-pedido/v1/';

  // api_recomendation_detalhe:    'http://10.1.55.199:8084/rd-interface-itim-pedido/v1/recomendacao',
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_RECOMENDACAO_DETALHE = ServicePath.base_url + 'rd-interface-itim-pedido/v1/recomendacao';

  // api_recomendation_item_post:  'http://10.1.55.199:8084/rd-interface-itim-pedido/v1/itens',
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_RECOMENDACAO_ITEM = ServicePath.base_url + 'rd-interface-itim-pedido/v1/itens';

  // EXPORTAR RELATORIO DE PEDIDOS EMITIDOS
  // tslint:disable-next-line: member-ordering
  static HTTP_EXPORT_RELATORIO_PEDIDOS_EMITIDOS = ServicePath.base_url + 'zuul/rd-interface-itim-pedido/v1/relatorio';

  static HTTP_EXPORT_RELATORIO_PEDIDOS = ServicePath.base_url + 'zuul/rd-interface-itim-pedido/v1/recomendacao/relatorio';

  static HTTP_EXPORT_RELATORIO_PEDIDOS_RESUMO = ServicePath.base_url + 'zuul/rd-interface-itim-pedido/v1/recomendacao/resumo/relatorio';

  // EXPORTAR RELATORIO ESTOQUE EXTRA
  static HTTP_EXPORT_RELATORIO_ESTOQUE_EXTRA = ServicePath.base_url + 'rd-interface-stockextra/v1/estoqueExtra/relatorio';
  
  // EXPORTAR RELATORIO PRIORIDADE_LOJA
  static HTTP_EXPORT_RELATORIO_PRIORIDADE_LOJA = ServicePath.base_url + 'rd-interface-stockextra/v1/prioridadeFilial/export/relatorio';
  
  // EXPORTAR RELATORIO PARAMETRIZAÇÃO SETORES
  static HTTP_EXPORT_RELATORIO_PARAMETRIZACAO_SETORES = ServicePath.base_url + 'rd-interface-itim-rounding/v1/parametrosInterface/relatorio';

  static HTTP_LOJA_ESPELHO = ServicePath.base_url + 'rd-interface-stockextra/v1/filialEspelho';

  // EXPORTAR RELATORIO PRODUTO ESPELHO
  static HTTP_EXPORT_RELATORIO_PRODUTO_ESPELHO = ServicePath.base_url + 'rd-interface-stockextra/v1/produtoEspelho/relatorio';

  // EXPORTAR RELATORIO LOJA ESPELHO
  static HTTP_EXPORT_RELATORIO_LOJA_ESPELHO = ServicePath.base_url + 'rd-interface-stockextra/v1/filialEspelho/relatorio';

  // EXPORTAR RELATORIO ESTORNO SUSPENSÃO FATURAMENTO LOJA
  static HTTP_EXPORT_RELATORIO_ESTORNO_SUSPENSAO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/estornoSuspensao/relatorio';

  // EXPORTAR RELATORIO SISTEMA ATUAL FATURAMENTO LOJA
  static HTTP_EXPORT_RELATORIO_SISTEMA_ATUAL_FATURAMENTO_LOJA = ServicePath.base_url + 'rd-agenda-abastecimento/v1/definicaoSistemaFaturamento/relatorio';

  // EXPORTAR RELATORIO SISTEMA ATUAL FATURAMENTO CD
  static HTTP_EXPORT_RELATORIO_SISTEMA_ATUAL_FATURAMENTO_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/faturamentoFornecedor/relatorio';

  // EXPORTAR RELATORIO CADASTRO VIGENTE
  static HTTP_EXPORT_RELATORIO_CADASTRO_VIGENTE = ServicePath.base_url + 'rd-interface-itim-rounding/v1/cadastroVigente/relatorio';

  // CADASTRO PARAMETRO INTERFACE
  static HTTP_CADASTRO_PARAMETRO_INTERFACE = ServicePath.base_url + 'rd-interface-itim-rounding/v1/parametrosInterface/';

  // AUTORIZADOR INTERNO STOCK OPTIMZATION
  static HTTP_AUTORIZADOR_ROTAS = ServicePath.base_url + 'rd-interface-itim/v1/operador/authorize';




  // AGENDA CADASTRO
  // ServicePath.base_url + 'http://10.1.13.19:7012/v1/loja'
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_AGENDA_LOJA = ServicePath.base_url + 'rd-agenda-abastecimento/v1/loja';
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_AGENDA_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/cd';
  // ServicePath.base_url + 'rd-agenda-abastecimento/v1/cd';
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_AGENDA_ABASTECIMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/';
  // ServicePath.base_url + 'http://10.1.13.19:7012/v1/'
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_AGENDA_UPLOAD_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/cd/upload';
  // ServicePath.base_url + 'http://10.1.13.19:7012/v1/cd/upload';
  // tslint:disable-next-line: member-ordering
  static HTTP_URL_AGENDA_UPLOAD_LOJA = ServicePath.base_url + 'rd-agenda-abastecimento/v1/loja/upload';
  // ServicePath.base_url + 'http://10.1.13.19:7012/v1/loja/upload';

  static HTTP_URL_AGENDA = ServicePath.base_url + 'rd-agenda-abastecimento';

  // tslint:disable-next-line: member-ordering
  static HTTP_ATUALIZA_FREQUENCIA_AGENDA = 'http://10.1.13.82:7012/v1/cd/{idFornecedorAgenda}';

  static HTTP_URL_ESTOQUE_MINIMO_MAXIMO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/estoque/listarParametros';

  static HTTP_URL_ESTOQUE_MINIMO_MAXIMO_MOTIVOS = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/motivo-estoque-min-max';

  static HTTP_URL_MINIMO_MAXIMO_UPLOAD = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/upload';


  static HTTP_URL_MINIMO_MAXIMO_RELATORIO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/export-relatorio';

  // tslint:disable-next-line: member-ordering
  static HTTP_SALVA_ESTOQUE_MINIMO_MAXIMO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/estoque/salvar';

  // tslint:disable-next-line: member-ordering
  static HTTP_ATUALIZA_ESTOQUE_MINIMO_MAXIMO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/estoque/atualizar';

  static HTTP_EXPORT_ESTOQUE_MINIMO_MAXIMO_TEMPLATE = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/export/template';

  static HTTP_EXPORT_ESTOQUE_MINIMO_MAXIMO_GRID = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/export';

  static HTTP_ADICIONA_ESTOQUE_MINIMO_MAXIMO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/estoque/salvar';

  static HTTP_URL_CATEGORIA_PRODUTO = ServicePath.base_url + 'rd-estoque-minimo-maximo/v1/categoria';

  static HTTP_URL_REGIAO_MACRO = ServicePath.base_url + 'rd-estoque-minimo-maximo/rdso/regiaomacro';


  // ############################## SUSPENDER AGENDA DE FATURAMENTO ########################################################
  // tslint:disable-next-line: max-line-length
  static HTTP_URL_SUSPENDER_AGENDA_FATURAMENTO_CONSULTAR = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaFaturamento/agendasFaturamento?';

  static HTTP_URL_ESTORNO_AGENDA_FATURAMENTO_CONSULTAR = ServicePath.base_url + 'rd-agenda-abastecimento/v1/estornoSuspensao?';

  static HTTP_URL_ESTORNO_AGENDA_FATURAMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/estornoSuspensao/cancelar?';

  static HTTP_URL_MOTIVOS_SUSPENSAO_DE_FATURAMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/motivos';


  static base_url_localhost = '10.1.13.82:7012/';
  static HTTP_EXPORT_AGENDA_FATURAMENTO_TEMPLATE = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaFaturamento/export/template';

  static HTTP_EXPORT_AGENDA_FATURAMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaFaturamento/export';

  static HTTP_IMPORTAR_AGENDA_FATURAMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaFaturamento/upload';

  static HTTP_SUSPENDER_AGENDA_FATURAMENTO = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaFaturamento/suspender';

  static HTTP_EXPORT_SUSPENDER_AGENDA_CD_TEMPLATE = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaCd/export/template';

  static HTTP_EXPORT_SUSPENDER_AGENDA_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaCd/export';

  static HTTP_IMPORTAR_SUSPENDER_AGENDA_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaCd/upload';

  static HTTP_SUSPENDER_AGENDA_CD = ServicePath.base_url + 'rd-agenda-abastecimento/v1/agendaSuspensaCd';



  // ServicePath.base_url + 'http://10.1.13.19:7012/v1/loja/upload';
  // ############################## AUTORIZADOR ########################################################
  // tslint:disable-next-line: member-ordering
  static AUTORIZADOR = ServicePath.base_url_login + 'rd-autorizador/';
  // static AUTORIZADOR = ServicePath.DEV + "rd-autorizador/";
  // static AUTORIZADOR = ServicePath.LOCAL + "7001/";

  static HTTP_GERA_TOKEN = ServicePath.AUTORIZADOR + "v1/user/login";
  static HTTP_LOGIN = ServicePath.AUTORIZADOR + "v1/perfilOperador/";
  static HTTP_ATUALIZA_LOGIN = ServicePath.AUTORIZADOR + "v1/login";
  static HTTP_OPERADOR = ServicePath.AUTORIZADOR + "v1/operador/lista/";
  static HTTP_ATUALIZAR_PERFIL = ServicePath.AUTORIZADOR + "v1/operador/perfil";
  static HTTP_CRIAR_PERFIL = ServicePath.AUTORIZADOR + "v1/perfil";
  //############################## MENUS ########################################################

  static MENU = ServicePath.base_url_login + "rd-menu/";
  //static MENU = ServicePath.DEV + "rd-menu/";
  //static MENU = ServicePath.LOCAL + "7002/";

  static HTTP_MENUS = ServicePath.MENU + "v1/Interface-Itim";
  static HTTP_MENUS_INDISPONIVEIS = ServicePath.MENU + "v1/Interface-Itim/menusIndisponiveis/";
  static HTTP_TODOS_PERFIS = ServicePath.MENU + "v2/Interface-Itim/102/todosPerfis";
  static HTTP_SALVAR_PERFIL_ACESSO = ServicePath.MENU + "v1/Interface-Itim/";

  //############################## PEDIDOS ########################################################

  static PEDIDO = ServicePath.base_url + "rd-pedido/";
  //static PEDIDO = ServicePath.DEV + "rd-pedido/";
  //static PEDIDO = ServicePath.LOCAL + "7003/";

  static HTTP_LISTA_STATUS = ServicePath.PEDIDO + "v1/listaStatus";
  static HTTP_LISTA_PEDIDOS = ServicePath.PEDIDO + "v1/lista";
  static HTTP_FILA_PEDIDOS = ServicePath.PEDIDO + "v1/fila/";
  static HTTP_LISTA_PEDIDOS_ID = ServicePath.PEDIDO + "v1/";
  static HTTP_LISTA_PEDIDOS_STATUS = ServicePath.PEDIDO + "v1/status";
  static HTTP_LISTA_PEDIDOS_STATUS_DASHBOARD = ServicePath.PEDIDO + "v1/status/dashboard";
  static HTTP_LISTA_CHECKOUT = ServicePath.PEDIDO + "v1/checkout/";
  static HTTP_CHECKOUT = ServicePath.PEDIDO + "v1/checkout";
  static HTTP_FATURAR = ServicePath.PEDIDO + "v1/faturar/";
  static HTTP_CADASTRAR_TIPO_LOTE = ServicePath.PEDIDO + "v1/tipolote";
  static HTTP_LISTA_LOTE_PEDIDOS = ServicePath.PEDIDO + "v1/tipoLote/lista";
  static HTTP_LISTA_TIPO_PEDIDOS = ServicePath.PEDIDO + "v1/tipoPedido/lista";
  static HTTP_BACKORDER = ServicePath.PEDIDO + "v1/";
  static HTTP_DELETA_PEDIDO = ServicePath.PEDIDO + "v1/";
  static HTTP_LISTA_CANAL = ServicePath.PEDIDO + "v1/canal/lista";
  static HTTP_CRIA_CANAL = ServicePath.PEDIDO + "v1/canal/";
  static HTTP_CRIA_SUBCANAL = ServicePath.PEDIDO + "v1/subcanal/";
  static HTTP_LISTA_FORMA_PAGAMENTOS = ServicePath.PEDIDO + "v1/listaFormasPagamentos";
  static HTTP_LISTA_BANDEIRA_CARTAO = ServicePath.PEDIDO + "v1/listaBandeirasCartoes";
  //############################## CLIENTE ########################################################

  static CLIENTE = ServicePath.base_url + "rd-cliente/";
  //static CLIENTE = ServicePath.DEV + "rd-cliente/";
  //static CLIENTE = ServicePath.LOCAL + "7004/";

  static HTTP_FIND_CLIENTE = ServicePath.CLIENTE + "v1/lista";
  static HTTP_BUSCA_ID = ServicePath.CLIENTE + "v1/";
  static HTTP_ATUALIZA_CLIENTE_GENERAL = ServicePath.CLIENTE + "v1";
  static HTTP_ATUALIZA_CLIENTE_END = ServicePath.CLIENTE + "v1/";
  static HTTP_ATUALIZA_CLIENTE_PHONE = ServicePath.CLIENTE + "v1/";
  static HTTP_ATUALIZA_CLIENTE_TIPOEND = ServicePath.CLIENTE + "v1/tipoEndereco/lista";
  static HTTP_ATUALIZA_CLIENTE_TIPOPHONE = ServicePath.CLIENTE + "v1/tipoTelefone/lista";

  //############################## NF ########################################################

  static NOTA = ServicePath.base_url + "rd-nf/";
  //static NOTA = ServicePath.DEV + "rd-nf/";
  //static NOTA = ServicePath.LOCAL + "7006/";

  static HTTP_BUSCA_NF_ID = ServicePath.NOTA + "v1/";
  static HTTP_BUSCA_NF = ServicePath.NOTA + "v1/lista";
  static HTTP_BUSCA_CARTA_CORRECAO = ServicePath.NOTA + "v1/cartaCorrecao/download/";
  static HTTP_CRIA_CARTA_CORRECAO = ServicePath.NOTA + "v1/cartaCorrecao/";

  static criarDevolucao(idNota) {
    return ServicePath.NOTA + "v1/" + idNota + "/devolucao";
  }

  //############################## FILIAIS ########################################################

  static FILIAL = ServicePath.base_url + "rd-filial/";
  static HTTP_MERCHANTKEY = ServicePath.FILIAL + "v1/";
  //static FILIAL = ServicePath.DEV + "rd-filial/";
  //static FILIAL = ServicePath.LOCAL + "7008/"


  static HTTP_TODAS_FILIAIS = ServicePath.FILIAL + "v1/todas";
  static HTTP_LISTA_FILIAIS = ServicePath.FILIAL + "v1/lista";

  //############################## RELATORIO ########################################################

  static RELATORIO = ServicePath.base_url + "rd-oms-relatorio/";
  //static RELATORIO = ServicePath.LOCAL + "7003/";

  static HTTP_LISTA_RELATORIOS = ServicePath.RELATORIO + "v1/relatorio/lista";
  static HTTP_DOWNLOAD_RELATORIOS = ServicePath.RELATORIO + "v1/relatorio/download/";
  static HTTP_LISTA_LAYOUTS = ServicePath.RELATORIO + "v1/layout/lista";
  static HTTP_TIPO_LISTA_LAYOUT = ServicePath.RELATORIO + "v1/layout/tipo/lista";
  static HTTP_TIPO_LISTA_CAMPOS = ServicePath.RELATORIO + "v1/layout/camposDisponiveis";
  static HTTP_CRIA_LAYOUTS = ServicePath.RELATORIO + "v1/layout/";
  static HTTP_SEARCH_LISTA = ServicePath.RELATORIO + "v1/relatorio";

  //############################## RECEITAS ########################################################

  static RECEITA = ServicePath.base_url + "rd-receita-medica/";
  //static RECEITA = ServicePath.LOCAL + "7003/";

  static HTTP_LISTA_RECEITAS = ServicePath.RECEITA + "v1/lista";
  static HTTP_DETALHE_RECEITA = ServicePath.RECEITA + "v1/";
  static HTTP_CADASTRO_DOCUMENTO = ServicePath.RECEITA + "v1/documento";
  static HTTP_CADASTRO_RECEITA = ServicePath.RECEITA + "v1";

  //############################## PRODUTOS ########################################################

  static PRODUTO = ServicePath.base_url + "rd-produto/";
  //static PRODUTO = ServicePath.LOCAL + "7003/";

  static HTTP_PRODUTO = ServicePath.PRODUTO + "v1/";

  //############################## PRODUTOS ########################################################

  static MEDICO = ServicePath.base_url + "rd-medico/";
  //static MEDICO = ServicePath.LOCAL + "7003/";

  static HTTP_BUSCA_MEDICO = ServicePath.MEDICO + "v1/cr";

  static HTTP_TRAVA_ESTOQUE = ServicePath.base_url + 'rd-interface-stockextra/v1/reservaEstoque';

  static HTTP_PARAMETRIZACAO_SETOR = ServicePath.base_url + 'rd-interface-itim-rounding/v1/parametrosInterface';

}
