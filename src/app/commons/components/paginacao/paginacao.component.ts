import { Component, EventEmitter, Output, OnInit } from '@angular/core';

@Component({
  selector: 'rd-paginacao',
  templateUrl: './paginacao.component.html',
  styleUrls: ['./paginacao.component.scss']
})

export class PaginacaoComponent implements OnInit {

  constructor() { }

  quantidade = 40;
  qtdTotalPaginas;
  paginaAtual = 1;
  paginaDigitada: any = 1;
  paginacao;
  paginacaoTotalPaginas: boolean;
  totalRegistros = '';
  qtdTotalRegistros;
  qtdDaPagina;
  searchActive = false;



  @Output() outputPaginacao = new EventEmitter();

  ngOnInit() {
    this.paginacao = [];
  }

  paginacaoSucess(data) {

    this.limparPaginacao();

    this.qtdDaPagina = data.value.length;
    this.qtdTotalPaginas = data.qtPaginas;
    this.qtdTotalRegistros = data.qtTotalRegistros;
    this.totalRegistros = "&total=" + this.qtdTotalRegistros;
    this.paginaDigitada = this.paginaAtual;

    if (this.qtdTotalPaginas > 5) {
      this.paginacaoTotalPaginas = true;
    } else {
      this.paginacaoTotalPaginas = false;
    }

    this.logicaPaginacao();

  }

  busca() {
    this.searchActive = true;
    this.paginaAtual = 1;
    this.paginaDigitada = 1;
    this.totalRegistros = '';
  }



  logicaPaginacao() {
    if (this.qtdTotalPaginas < 2) {

      this.paginacao = [];

    } else {
      if (this.qtdTotalPaginas >= this.paginaAtual + 3) {

        if (this.paginaAtual >= 5) {
          this.paginacao = [this.paginaAtual - 2, this.paginaAtual - 1, this.paginaAtual, this.paginaAtual + 1, this.paginaAtual + 2]
        } else {
          if (this.qtdTotalPaginas >= 5) {
            this.paginacao = Array.from({ length: 5 }, (v, k) => k + 1);
          } else {

            this.paginacao = Array.from({ length: this.qtdTotalPaginas }, (v, k) => k + 1);
          }

        }

      } else {

        if (this.paginaAtual < 5) {
          if (this.qtdTotalPaginas <= 5) {
            this.paginacao = Array.from({ length: this.qtdTotalPaginas }, (v, k) => k + 1);
          } else {
            this.paginacao = [1, 2, 3, 4, 5];
          }

        } else {

          this.paginacao = [this.qtdTotalPaginas - 4, this.qtdTotalPaginas - 3, this.qtdTotalPaginas - 2, this.qtdTotalPaginas - 1, this.qtdTotalPaginas]

        }
      }
    }
  }

  limparPaginacao(){
    this.quantidade = 0;
    this.totalRegistros = '0'
    this.qtdDaPagina = 0;
    this.paginacao = [];
    this.qtdTotalPaginas = 0;
    this.paginacaoTotalPaginas = false;
  }


  trocarPagina(paginaDestino) {

    this.paginaAtual = paginaDestino;

    this.logicaPaginacao();

    // chama a funcao da pagina PAI colocado na tag dessa pagina filho (rd-paginacao)
    this.outputPaginacao.emit();

  }

}
