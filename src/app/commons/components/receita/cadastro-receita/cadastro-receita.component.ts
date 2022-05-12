import { Component, OnInit } from '@angular/core';
import { MaskedDate, phoneMask, UfHelper, UtilsHelper, ValidatorHelper } from '../../../helpers';
import { ServicePath } from 'src/app/commons/const';
import * as moment from 'moment';


@Component({
  selector: 'rd-cadastro-receita',
  templateUrl: './cadastro-receita.component.html',
  styleUrls: ['./cadastro-receita.component.scss']
})
export class CadastroReceitaComponent implements OnInit {

  constructor(
      private compUf: UfHelper,
      private util: UtilsHelper,
      private validator: ValidatorHelper
  ) { }

  dateMask = MaskedDate; // para mascara no campo bsdatepicker datas
  phoneMask = phoneMask;

  ngOnInit() { }

  file;
  apiConfig;
  selectEnd;
  tiposEndereco = this.compUf.selectUf;
  cliente;
  pedido;

  // DADOS DO PACIENTE
  nomePaciente;
  rg;
  cpf;
  documento;
  emissor;
  dataNascimento;
  telefone;
  errosDadosPaciente = [];
  toggleDadosPaciente = true;
  

  // ENDEREÇO
  cep;
  endereco;
  numero;
  complemento;
  estado
  bairro;
  cidade;
  errosEndereco = [];
  toggleEndereco = false;
  
  //DADOS DO MÉDICO
  crm;
  ufCrm;
  erroMedico;
  medicoSelecionado = [];
  toggleMedico = false;

  //ITENS DA RECEITA
  itensContralados = [];
  itensContraladosReceita = [];
  erroItensContralados;
  toggleReceita = false;

  //IMAGENS DA RECEITA
  imagens = [];
  erroImagem;
  erroFormulario;
  toggleImagens = false;

  
  

  

  buscarMedico(){
      
      if(this.validaFormularioMedico()){
        this.erroMedico = "";
        let url = ServicePath.HTTP_BUSCA_MEDICO + '?f=nrCr@=' + this.crm + '&f=estado@=' + this.ufCrm;
        this.apiConfig.GET(url).subscribe((data: any) => {
          this.medicoSelecionado = data.value;
          if(this.medicoSelecionado.length <= 0){
            this.erroMedico = "Médico não encontrado para o CRM:" + this.crm  + " e UF:" + this.ufCrm;
          }else{
            this.limparFormularioMedico();
          }
        }, ex => { 
          this.erroMedico = ex.error.mensagem;
        });
      }
  }

  validaFormularioMedico(){
    if(this.util.isEmpty(this.crm)){
      this.erroMedico = "CRM é obrigatório"
      return false;
    }

    if(this.util.isEmpty(this.ufCrm)){
      this.erroMedico = "UF do CRM é obrigatório"
      return false;
    }
    return true; 
  }

  limparFormularioMedico(){
    this.ufCrm = "";
    this.crm = "";
  }

  deletarMedico(){
    this.medicoSelecionado = [];
  }


  getItensControlados(pedido){

    this.itensContralados = [];
    this.itensContraladosReceita = [];

    let url = ServicePath.HTTP_LISTA_PEDIDOS_ID + pedido.id;
      this.apiConfig.GET(url).subscribe((data: any) => {
        this.cliente = data.value.cliente;
        let itens = data.value.itens;
        itens.forEach(item => {
          if(item.pedeReceita){
            this.addItemControlado(item);
          }
        });
    }, ex => { 
      this.erroItensContralados = ex.error.mensagem;
    });
  }

  addItemControlado(item){
    let itemControlado = {
      "selecionado":false,
      "dsProduto": item.nome,
      "idProduto": item.cdProduto,
      "quantidadeItem":item.quantidadeComprada
    }


    this.itensContralados.push(itemControlado);
  }

  AddItemReceita(item){
    this.itensContraladosReceita.push(item);
    this.itensContralados.splice(this.itensContralados.indexOf(item), 1);
  }

  removerItem(item){
    this.itensContralados.push(item);
    this.itensContraladosReceita.splice(this.itensContraladosReceita.indexOf(item), 1);
  }


  enviarImagem(event:any) {
    this.erroImagem = "";
    if(event.target.files && event.target.files[0]) {
        if(event.target.files[0].type && event.target.files[0].type.split('/')[0] == ["image"]){
          if(event.target.files[0].size <= 1024000){
            this.file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = (event:any) => {
              let nomeReceita = "receita-oms-" + moment().format('DDMMYYYYhhmmss') + ".jpg";
              let imagemBase64 = event.target.result;
              let arrayImagens = imagemBase64.split(',');
              let imagem = arrayImagens[1];

              let body = {
                "base64Arquivo": imagem,
                "nomeArquivo": nomeReceita,
                "tipoArquivo": {
                  "cdTipoArquivo": 1,
                }
              }
              this.imagens.push(body);
            }
            reader.readAsDataURL(event.target.files[0]);
          }else{
            this.erroImagem = "Tamnho máximo da imagem deve ser 1MB";
          }
        } else {
          this.erroImagem = "Só é permitido enviar imagem";
        }
    }
}

deletarImagem(imagem){
  this.imagens.splice(this.imagens.indexOf(imagem), 1);
}

validaFormulario(){

  this.erroFormulario = "";
  this.errosDadosPaciente = [];
  this.errosEndereco = [];

  // if(!this.validaDadosPaciente()){
  //   this.erroFormulario = "Existem erros de validação nos dados do Paciente !";
  //   return false;
  // }

  // if(!this.validaEndereco()){
  //   this.erroFormulario = "Existem erros de validação no endereço !";
  //   return false;
  // }

  // if(this.medicoSelecionado.length <= 0){
  //   this.erroFormulario = "Adicione um médico na aba de dados do médico !";
  //   return false;
  // }

  // if(this.itensContraladosReceita.length <= 0){
  //   this.erroFormulario = "Adicione pelo menos um medicamento controlado na aba de itens da receita !";
  //   return false;
  // }

  // if(this.imagens.length <= 0){
  //   this.erroFormulario = "Adicione a imagem da receita na aba imagens da receita";
  //   return false;
  // }
  this.cadastraReceita();
}

validaDadosPaciente(){
  
  let retorno = true;

  if(this.util.isEmpty(this.nomePaciente)){
    this.errosDadosPaciente.push("Nome do paciente é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.cpf)){
    this.errosDadosPaciente.push("CPF é obrigatório !");
    retorno = false;
  }

  if(!this.validator.validaCpfCnpj(this.cpf, true)){
    this.errosDadosPaciente.push("CPF inválido !");
    retorno = false;
  }

  if(this.util.isEmpty(this.rg)){
    this.errosDadosPaciente.push("RG é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.emissor)){
    this.errosDadosPaciente.push("Emissor é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.dataNascimento)){
    this.errosDadosPaciente.push("Data de nascimento é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.telefone)){
    this.errosDadosPaciente.push("Telefone é obrigatório !");
    retorno = false;
  }
  return retorno;  
}

validaEndereco(){

  let retorno = true;

  if(this.util.isEmpty(this.cep)){
    this.errosEndereco.push("CEP é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.endereco)){
    this.errosEndereco.push("Logradouro é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.estado)){
    this.errosEndereco.push("Estado é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.bairro)){
    this.errosEndereco.push("Bairro é obrigatório !");
    retorno = false;
  }

  if(this.util.isEmpty(this.cidade)){
    this.errosEndereco.push("Cidade é obrigatório !");
    retorno = false;
  }

  return retorno;
  
}


cadastraReceita(){

  if(this.numero == undefined){
    this.numero = "";
  }

  if(this.complemento == undefined){
    this.complemento = "";
  }

  this.telefone = this.telefone.split("-").join("");
  this.telefone = this.telefone.split(")").join("");
  this.telefone = this.telefone.split("()").join("");

  let prefixo = this.telefone.substring(0,2);
  this.telefone = this.telefone.substring(2,);

  let body = {
    "cpfCnpj": this.validator.retiraMascaraCPFCNPJ(this.cpf),
    "emissor": this.emissor,
    "dtNasc": this.dataNascimento + " 00:00:00",
    "nomePaciente": this.nomePaciente,
    "rg": this.rg,
    "telefone": parseInt(this.telefone),
    "prefixo": parseInt(prefixo),
    "cr": this.medicoSelecionado[0].nrCr,
    "ufCrm": this.medicoSelecionado[0].estado,
    "documentos": this.imagens,
    "endereco": {
      "bairro": this.bairro,
      "cep": this.cep,
      "cidade": this.cidade,
      "complemento": this.complemento,
      "estado": this.estado,
      "nomeLogradouro": this.endereco,
      "numeroEndereco": this.numero
    },
    "itensReceita":this.itensContralados,
    "tipoReceita": {
      "cdTipoReceita": 1
    },
    "dados": {
      "idCliente": this.cliente.idCliente,
      "numeroPedido": this.pedido.numeroDoPedido
    }
  }



  // let body = {
  //   "cpfCnpj":"35294432803",
  //   "emissor":"SSP",
  //   "dtNasc":"1987-12-21 00:00:00",
  //   "nomePaciente":"Rafael de Oliveira Marcondes",
  //   "rg":347947013,
  //   "telefone":11952165469,
  //   "telefoneTipo": {
  //     "descricao": "CELULAR",
  //     "sigla": "M",
  //     "id":3
  //   },
  //   "cr":"14003",
  //   "ufCrm":"MG",
  //   "documentos":[{
  //         "base64Arquivo":"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","nomeArquivo":"receita-oms-20082019023702.jpg",
  //         "tipoArquivo":{"cdTipoArquivo":1}
  //       }],
  //       "endereco":{
  //         "bairro":"Vila das Belezas",
  //         "cep":"05777190",
  //         "cidade":"São Paulo",
  //         "complemento":"",
  //         "estado":"SP",
  //         "nomeLogradouro":"Rua Zulmira Cavalheiro Faustino",
  //         "numeroEndereco":"143"
  //       },
  //       "itensReceita":[{
  //         "selecionado":false,
  //         "dsProduto":"NOVAMOX 400/57MG 100ML",
  //         "idProduto":80359,
  //         "quantidadeItem":1
  //       }],
  //       "tipoReceita":{"cdTipoReceita":1},"dados":{"idCliente":146137488,"numeroPedido":1596853405}
  //     };


  this.apiConfig.POST(ServicePath.HTTP_CADASTRO_RECEITA,body,"pedido").subscribe((data: any) => {
  }, ex => { 
  });

}

abreToggleEndereco(){
  this.toggleEndereco = true;
}

abreToggleMedico(){
  this.toggleMedico = true;
}

abreToggleReceita(){
  this.toggleReceita = true;
}

abreToggleImagens(){
  this.toggleImagens = true;
}


}
