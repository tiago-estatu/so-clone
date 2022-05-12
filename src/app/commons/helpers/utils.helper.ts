import { Injectable } from '@angular/core';
import {HttpErrorResponse} from "@angular/common/http";
import Swal, {SweetAlertOptions} from "sweetalert2";

@Injectable()
export class UtilsHelper {

  montaUrl(busca, campo, formaPesquisa, isCaseSensitive) {

    if ((this.isEmpty(campo))) {
      return "";
    }

    let filtro = "&f="
    if (isCaseSensitive) {
      filtro += "(lowercase)";
    }

    let url = "";
    url += this.validaEstadoUrl(url);
    try {
      url += filtro + busca + formaPesquisa + campo.split(",").join("");
    } catch{
      url += filtro + busca + formaPesquisa + campo;
    }

    return url;
  }

  /**
   * retorna a mensagem do erro de arrays e objetos
   * @param err erro http
   * DIVIDA C
   * Despadronização das respostas do servidor
   * Handling ineficiente de comparação de tipos e keys no caso de objetos
   */
  static handleError(err) {
    let base = err.error;
    let response = Array.isArray(base) ? base[0] : base;
    return response.mensagem || response.message;
  }

  validaEstadoUrl(url) {
    if (url != "") {
      return url += "&";
    }
    return url;
  }



  isEmpty(campo) {
    if (campo == null || campo == '' || campo == undefined) {
      return true;
    }
    return false;
  }


  merge = {
    cliente: '&m=cliente-cliente',
    filial: '&m=filial-filial',
    televenda: '&m=televenda-televenda',
    dfe: '&m=dfe-dfe'
  };


  formaPesquisa = {
    igual: "@=",
    like: "!!",
    date: "@BD@",
    IN: "@/",
    MENOR: "@<",
    MAIOR: "@>",
    MENOR_IGUAL: "@S<",
    MAIOR_IGUAL: "@X>",
    NULO: "@vazio@",
    DIFERENTE_NULO: "@naovazio@",
    MERGE: ""
  };

  dateRangeValidator(i: Date, f: Date, maxRange) {
    let initial = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 5, 0, 0)
    let final = new Date(f.getFullYear(), f.getMonth(), f.getDate(), 5, 0, 0)
    let diff = (final.getTime() - initial.getTime())
    let error = null;
    error = diff > (maxRange * 86400000) ? 'Selecione um período menor ou igual a 30 dias' : null;
    error = initial > final ? 'A data inicial deve ser menor que a data final' : error;
    return error
  }

  // FAZ A VALIDAÇÃO NAS PÁGINAS DE IMPORTAÇÃO TAMANHO MÁXIMO DO EXCEL 5MB
  tamanhoMaxUpload(file) {
    if (file.size/1024/1024 > 5) {
      this.showSwal('Atenção!','Tamanho máximo do arquivo para importação é de 5MB','error');
      return false
    } else {
      return true
    }
  }

  showSwal(title: string, text: any, icone: any) {
    Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }

  // RECEBO (3) PARAMS (DATA INICIO, DATA FIM + VALOR MÁXIMO DE DIAS)
  rangeMaximoEmDias(primeiroDia: any, ultimoDia: any,  qtdMaxDias: number) {

    // RECEBO PARAMETRO DA QUANTIDADE MAX DE DIAS NO RANGE DE BUSCA
    const limitandoQtdDiasDePesquisa = new Date();
    limitandoQtdDiasDePesquisa.setDate(limitandoQtdDiasDePesquisa.getDate() + qtdMaxDias);

    // RECEBO DATA INICIO DA PESQUISA
    const primeiroDiaDoRange = primeiroDia;
    primeiroDiaDoRange.setDate(primeiroDiaDoRange.getDate());

    // RECEBO DATA FINAL DA PESQUISA
    const ultimoDiaDoRange = ultimoDia;
    ultimoDiaDoRange.setDate(ultimoDiaDoRange.getDate());

    // 6 DIAS REPRESENTADOS EM MILISEGUNDOS === '518400000'
    const diferencaEmMilisegundos = (ultimoDiaDoRange.getTime() - primeiroDiaDoRange.getTime());
    const millisegundosCalc = qtdMaxDias * 86400000;
    return (diferencaEmMilisegundos > millisegundosCalc  ? true : false);
}
  // RECEBO (1) PARAMS (DATA PARA CONSULTAR )
  ehPresente(dataComparativa: any) {
    const HOJE = new Date();
    return (dataComparativa.setHours(0,0,0,0) == HOJE.setHours(0,0,0,0));
  }

  showError(config: HttpErrorResponse) {
    if(!config.error.title) config.error.title = {500: 'Oops!'};
    let baseOptions: SweetAlertOptions = {
      confirmButtonText: 'Ok, obrigado',
      customClass: {confirmButton: 'setBackgroundColor'},
      title: config.error.title[config.status] || config.error.title[500],
      html: config.error.mensagem,
      icon: config.error.type || 'warning'
    };
    Swal.fire(baseOptions)
  }

  removeReferences(json: any | any[]) {
    return JSON.parse(JSON.stringify(json))
  }
}
