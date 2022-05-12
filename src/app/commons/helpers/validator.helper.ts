import { AbstractControl, FormGroup } from '@angular/forms';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as EmailValidator from 'email-validator';

@Injectable()
export class ValidatorHelper {

  formGroup: FormGroup;
  submitted = false;
  errorMessage = undefined;
  errorLoaded = false;

  isInvalid(field: string) {
    return this.submitted && this.formGroup.get(field).errors ? this.formGroup.get(field).errors : undefined;
  }

  isRequired(field: string) {
    return this.isInvalid(field).required;
  }


  dateRangeValidator(i: Date, f: Date, maxRange) {
    let initial = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 5, 0, 0)
    let final = new Date(f.getFullYear(), f.getMonth(), f.getDate(), 5, 0, 0)
    let diff = (final.getTime() - initial.getTime())
    let error = null;
    
    error = diff > (maxRange * 86400000) ? `Selecione um período menor ou igual a ${maxRange.toString()} dias` : null;
    error = initial > final ? 'A data inicial deve ser menor que a data final' : error;
    return error
  }


  /**
   * Validator criado para validar um periodo de datas em 30 dias
   * @param datesForm Controle abstrato representando o formgroup
   */
  // initialDateValidator(datesForm: AbstractControl, dtInicialLabel: string, dtFimLabel: string) {
  //   const dtInicio: Date = datesForm.get(dtInicialLabel).value;
  //   const dtFim: Date = datesForm.get(dtFimLabel).value;
  //   let error = null;

  //   let hasErr = this.dateRangeValidator(dtInicio, dtFim, 30);
  //   error = hasErr ? {maxRange: {value: hasErr}} : null
  //   return error;
  // }

  initialDateValidator(datesForm: AbstractControl, dtInicialLabel: string, dtFimLabel: string, rangeConsulta: number=30) {
    
    const dtInicio: Date = datesForm.get(dtInicialLabel).value;
    const dtFim: Date = datesForm.get(dtFimLabel).value;
    let error = null;

    let hasErr = this.dateRangeValidator(dtInicio, dtFim, rangeConsulta);
    error = hasErr ? {maxRange: {value: hasErr}} : null
    return error;
  }

  

  /**
   * Validator criado para validar um periodo de datas em 30 dias
   * @param datesForm Controle abstrato representando o formgroup
   */
  atLeastOneTruthy(formGroup: AbstractControl, labels: string[], message) {
    let controls = labels.map(label => formGroup.get(label).value)
    .filter(control => Array.isArray(control) ? control.length > 0 : !!control)
    let error = null;
    if(controls.length == 0) error = {minimumFilters: {value: message}}
    return error
  }

  error(ex: HttpErrorResponse) {
    if (ex.status == undefined || ex.status == 403) {
      this.errorMessage = "Acesso negado";
    } else if (ex.status == 401) {
      this.errorMessage = "Usuário ou senha inválidos";
    } else {
      this.errorMessage = "Ocorreu um erro interno";
    }
  }

  mascaraCpfCnpj(numero) {
    if (numero !== undefined) {
      if (numero.length == 11) {
        return this.mascaraCpf(numero);
      } else if ((numero.length == 14)) {
        return this.mascaraCnpj(numero);
      } else {
        return numero;
      }
    } else {
      return numero;
    }
  }


  validaCheck(valor) {
    if (valor === true) {
      return 1
    }
    else {
      return 0;
    }

  }

  mascaraCpf(valor) {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, "\$1.\$2.\$3\-\$4");
  }

  mascaraCnpj(valor) {
    return valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, "\$1.\$2.\$3\/\$4\-\$5");
  }

  retiraMascaraCPFCNPJ(numero) {
    if (numero !== undefined && numero !== null) {
      numero = numero.split(".").join("");
      numero = numero.replace("-", "");
      numero = numero.replace("/", "");
      return numero;
    }
    return "";

  }

  validaCpfCnpj(numero, isObrigatorio) {
    numero = this.retiraMascaraCPFCNPJ(numero);
    if (numero == "") {
      if (isObrigatorio) {
        return false;
      }
      return true;
    }
    if (numero.length == 11) {
      return this.validaCpf(numero);
    } else if ((numero.length == 14)) {
      return this.validaCnpj(numero);
    } else {
      return false;
    }
  }


  identificaCPFCNPJ(documento, isObrigatorio) {
    documento = this.retiraMascaraCPFCNPJ(documento);
    if (documento === "") {
      if (isObrigatorio) {
        return "CPF/CNPJ É UMA CAMPO OBRIGATÓRIO"
      } else {
        return "CPF/CNPJ";
      }
    }
    if (documento.length === 11) {
      if (this.validaCpf(documento)) {
        return "CPF VALIDADO"
      }
      return "CPF INVÁLIDO"
    } else if (documento.length === 14) {
      if (this.validaCpfCnpj(documento, isObrigatorio)) {
        return "CNPJ VALIDADO"
      }
      return "CNPJ INVÁLIDO"
    } else {
      return "DOCUMENTO INVÁLIDO"
    }
  }



  validaCpf(cpf) {
    var numeros, digitos, soma, i, resultado, digitos_iguais;
    digitos_iguais = 1;
    if (cpf.length < 11)
      return false;
    for (i = 0; i < cpf.length - 1; i++)
      if (cpf.charAt(i) != cpf.charAt(i + 1)) {
        digitos_iguais = 0;
        break;
      }
    if (!digitos_iguais) {
      numeros = cpf.substring(0, 9);
      digitos = cpf.substring(9);
      soma = 0;
      for (i = 10; i > 1; i--)
        soma += numeros.charAt(10 - i) * i;
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(0))
        return false;
      numeros = cpf.substring(0, 10);
      soma = 0;
      for (i = 11; i > 1; i--)
        soma += numeros.charAt(11 - i) * i;
      resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
      if (resultado != digitos.charAt(1))
        return false;
      return true;
    }
    else
      return false;
  }



  validaCnpj(cnpj) {
    if (!cnpj || cnpj.length != 14
      || cnpj == "00000000000000"
      || cnpj == "11111111111111"
      || cnpj == "22222222222222"
      || cnpj == "33333333333333"
      || cnpj == "44444444444444"
      || cnpj == "55555555555555"
      || cnpj == "66666666666666"
      || cnpj == "77777777777777"
      || cnpj == "88888888888888"
      || cnpj == "99999999999999")
      return false
    var tamanho = cnpj.length - 2
    var numeros = cnpj.substring(0, tamanho)
    var digitos = cnpj.substring(tamanho)
    var soma = 0
    var pos = tamanho - 7
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--
      if (pos < 2) pos = 9
    }
    var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1
    numeros = cnpj.substring(0, tamanho)
    soma = 0
    pos = tamanho - 7
    for (var i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--
      if (pos < 2) pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11
    if (resultado != digitos.charAt(1)) return false
    return true;
  }


  IsEmail(email, isObrigatorio) {
    if (email === "") {
      if (isObrigatorio) {
        return false;
      }
      return true;
    }
    return EmailValidator.validate(email);
  }


  validaData(data) {
    return !!new Date(data).getTime();
  }



  formataData(data) {
    let novaData = "";
    if(!data) return data;
    if (data.length == 10) {
      novaData = data;

    } else {
      novaData = ("00" + data.getDate()).slice(-2) + '/' + ("00" + (data.getMonth() + 1)).slice(-2) + '/' + data.getFullYear();

    }
    return novaData;
  }

  formataDataComBarra(data) {
    let novaData = "";

    if (data.length == 10) {
      let arrayData = data.split("-");
      novaData = arrayData[2] +"/" + arrayData[1] + "/" + arrayData[0] ;
    } else {
      novaData = data.getFullYear() + '/'+ ("00" + (data.getMonth() + 1)).slice(-2) +  '/'+("00" + data.getDate()).slice(-2);
    }

    return novaData;


  }

  formataDataComBarraPadraoBr(data) {
    let novaData = '';
    if (data.length == 10) {
      const arrayData = data.split('-');
      novaData = arrayData[2] + '/' + arrayData[1] + '/' + arrayData[0];
    } else {
      novaData = ('00' + data.getDate()).slice(-2) + '/' + ('00' + (data.getMonth() + 1)).slice(-2) +  '/' + data.getFullYear();
    }
    return novaData;
}

  formataDataBack(data) {
    let novaData = "";
    let dateObj = new Date(data);
    if(!dateObj.getTime()) return data;
    data = dateObj;
    novaData = ("00" + data.getDate()).slice(-2) + '-' + ("00" + (data.getMonth() + 1)).slice(-2) + '-' + data.getFullYear();

    return novaData;


  }

  formataDataApi(data) {
    let novaData = "";

    if (data.length == 10) {
      let arrayData = data.split("/");
      novaData = arrayData[2] +arrayData[1] + arrayData[0] ;
    } else {
      novaData = data.getFullYear() +("00" + (data.getMonth() + 1)).slice(-2) + ("00" + data.getDate()).slice(-2);
    }

    return novaData+"000000";
  }

  formataDataParaAmericano(data) {
    let novaData = "";

    if (data.length == 10) {
      let arrayData = data.split("/");
      novaData = `${arrayData[2]}-${arrayData[1]}-${arrayData[0]}`;
    } else {
      novaData = data.getFullYear() + '-'+ ("00" + (data.getMonth() + 1)).slice(-2) +  '-'+("00" + data.getDate()).slice(-2);
    }

    return novaData;
  }

  formataDataApiInicio(data) {
    let novaData = "";

    if (data.length == 10) {
      let arrayData = data.split("/");
      novaData = arrayData[2] + arrayData[1] + arrayData[0] + "000000";
    } else {
      novaData = data.getFullYear() + ("00" + (data.getMonth() + 1)).slice(-2) + ("00" + data.getDate()).slice(-2) + "000000";
    }

    return novaData;
  }

  formataDataHora(dataHora:Date) {
    let dataString = dataHora.getFullYear() + ("00" + (dataHora.getMonth() + 1)).slice(-2) + ("00" + dataHora.getDate()).slice(-2);
    let horaString = ("00" + dataHora.getHours()).slice(-2) + ("00" + dataHora.getMinutes()).slice(-2) + ("00" + dataHora.getSeconds()).slice(-2);
    return dataString + horaString;
  }



  formataDataApiFinal(data) {
    let novaData = "";

    if (data.length == 10) {
      let arrayData = data.split("/");
      novaData = arrayData[2] + arrayData[1] + arrayData[0] + "235959";
    } else {
      novaData = data.getFullYear() + ("00" + (data.getMonth() + 1)).slice(-2) + ("00" + data.getDate()).slice(-2) + "235959";
    }

    return novaData;
  }

  stringToDate(_date, _format, _delimiter) {
    try {
      var formatLowerCase = _format.toLowerCase();
      var formatItems = formatLowerCase.split(_delimiter);
      var dateItems = _date.split(_delimiter);
      var monthIndex = formatItems.indexOf("mm");
      var dayIndex = formatItems.indexOf("dd");
      var yearIndex = formatItems.indexOf("yyyy");
      var month = parseInt(dateItems[monthIndex]);
      month -= 1;
      var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
      if(!formatedDate.getTime()) return _date;
      return formatedDate;
    } catch{
      return _date;
    }

  }
}