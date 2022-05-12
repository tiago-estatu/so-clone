import { Component, OnInit } from '@angular/core';
import { ServicePath } from 'src/app/commons/const';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';



@Component({
  selector: 'rd-consulta-receita',
  templateUrl: './consulta-receita.component.html',
  styleUrls: ['./consulta-receita.component.scss']
})
export class ConsultaReceitaComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  pedido;
  receitas;
  erro;
  expandir = true;
  apiConfig;
  produtos = [];
  imagem;
  file;
  uploadErro;
  uploadSucesso;

  limparVariaveis(){
    this.pedido = "";
    this.receitas = "";
    this.erro = "";
    this.apiConfig = "";
    this.produtos = [];
    this.imagem = "";
    this.file = "";
    this.uploadErro = "";
    this.uploadSucesso = "";
  
  }
  

  getReceitas(pedido,apiConfig){
    this.apiConfig = apiConfig;
    this.pedido = pedido;
    
    let url = ServicePath.HTTP_LISTA_RECEITAS + '?f=codigoEntidade@=' + pedido.numeroDoPedido;
      apiConfig.GET(url).subscribe((data: any) => {
        if(data.value.length == 0){
          this.erro = "Não existem receitas cadastradas para este pedido";
        }else{
          this.receitas = data.value;
        }
    }, ex => { 
      this.erro = ex.error.mensagem;
    });
  }

  buscaProduto(receita){
    this.uploadSucesso = "";
    this.uploadErro = "";
    
    this.produtos = [];
    this.apiConfig.GET(ServicePath.HTTP_DETALHE_RECEITA + receita.idReceita).subscribe((data: any) => {
      this.produtos = data.value.itensReceita;
    }, ex => { 
      this.erro = ex.error.mensagem;
    });
  }

  

  private base64ToFile(base64Data, tempfilename, contentType) {
    contentType = contentType || '';
    const sliceSize = 1024;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      const begin = sliceIndex * sliceSize;
      const end = Math.min(begin + sliceSize, bytesLength);

      const bytes = new Array(end - begin);
      for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new File(byteArrays, tempfilename, {type: contentType});
  }

  baixarImagem(imagens){
    imagens.forEach(imagem => {
      let nome = imagem.nomeArquivo + ".jpg"
      let myFile = this.base64ToFile(imagem.base64Arquivo, nome, "image/jpeg");
      FileSaver.saveAs(myFile, nome);
   });
  }

  enviarImagem(event:any, receita) {
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
                "idReceita": receita.idReceita,
                "nomeArquivo": nomeReceita,
                "tipoArquivo": {
                  "cdTipoArquivo": 1,
                }
              }

              this.apiConfig.POST(ServicePath.HTTP_CADASTRO_DOCUMENTO, body).subscribe((data: any) => {
                this.getReceitas(this.pedido, this.apiConfig);
                this.uploadSucesso = "Upload realizado com sucesso"
              }, ex => { 
                this.uploadErro = ex.error.menssagem;
              });
            }
            reader.readAsDataURL(event.target.files[0]);
          }else{
            this.uploadErro = "Tamnho máximo da imagem deve ser 1MB";
          }
        } else {
          this.uploadErro = "Só é permitido enviar imagem";
        }
    }
}

}