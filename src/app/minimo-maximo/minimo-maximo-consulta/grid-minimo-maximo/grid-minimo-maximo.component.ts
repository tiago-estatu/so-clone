import { Component, OnInit, Input, EventEmitter, ViewChild, Output } from '@angular/core';
import { MinimoMaximoModel, SalvarMinimoMaximoModel, NewModalComponent, MinimoMaximoService, fadeInOut, fadeIn, ParametroMinimoMaximoModel, UtilsHelper, MinimoMaximoPageableModel } from 'src/app/commons';
import { Observable, of } from 'rxjs';
import { MinimoMaximoModalComponent } from 'src/app/commons/components/combos';
import { MatDialog, TooltipPosition } from '@angular/material';
import Swal from 'sweetalert2';
import { HttpParams } from '@angular/common/http';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'rd-grid-minimo-maximo',
  templateUrl: './grid-minimo-maximo.component.html',
  styleUrls: ['./grid-minimo-maximo.component.scss'],
  animations: [fadeInOut, fadeIn]
})

export class GridMinimoMaximoComponent implements OnInit {
  componentLoading: Boolean = false;
  // RECEBO A URL PRONTA PARA FAZER O REQUEST HttpClient
  dataSource: Observable<MinimoMaximoModel[]> = new Observable;
  @Input() query: HttpParams;
  @Input() jsonParaCriar: SalvarMinimoMaximoModel;
  pageNumber: number = 1;
  itemsPorPagina: number = 35;
  totalDeItems: number = 0;
  
  cdOperador = localStorage.getItem("cdOperador");
  mensagemModal;
  imagemModal;
  tituloModal;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  ultimaQuery: HttpParams = new HttpParams();

  constructor(
    public dialog: MatDialog,
    public _service: MinimoMaximoService,
    private _utils: UtilsHelper) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.validarMudancasEConsultar(this.pageNumber);
  }

  validarMudancasEConsultar(page) {

    if (this.query !== null && this.query !== undefined) {

      this.consultar(page);
      (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'block';
    } else {
      this.dataSource = new Observable<[]>();
      (<HTMLElement>document.querySelector('#mostraResultadosCarregados')).style.display = 'none';
    }
  }

  positionOptions: TooltipPosition[] = ['above'];
  position = new FormControl(this.positionOptions[0]);
  
  msgTooltip(item){
    if(item.isEditable){
      return "Editar minimo e maximo";
    }else{
      return item.dsMotivo;
    }
  }

  atualizar(item: MinimoMaximoModel) {
    let valorMinimo = item.quantidadeEstoqueMinimo === null ? '' : `${item.quantidadeEstoqueMinimo}`;
    let valorMaximo = item.quantidadeEstoqueMaximo === null ? '' : `${item.quantidadeEstoqueMaximo}`;
    this.jsonParaCriar = {
      cadastro: false,
      cdMotivoEstoqueMinMax: item.cdMotivoEstoqueMinMax,
      id: {
        cdFilial: item.codigoFilial,
        cdProduto: item.codigoProduto,
        inputFilial: item.codigoFilial + '-' + item.nomeFantasia,
        inputProduto: item.codigoProduto + '-' + item.descricaoProduto
      },
      qtEstoqueMin: valorMinimo,
      qtEstoqueMax: valorMaximo,
      cdOperadorAlteracao: this.cdOperador
    }

    const subscribe = this.atualizarRegistro.subscribe({
      error(msg) {
      }
    }).unsubscribe();
  }

  atualizarRegistro = new Observable((observer) => {

    Swal.fire({
      title: "Você deseja editar o registro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      customClass: {confirmButton: 'setBackgroundColor'}
    }).then(resultado => {
      if (resultado.value == true) {
        const dialogRef = this.dialog.open(MinimoMaximoModalComponent, {
          width: "auto",
          height: "auto",
          data: this.jsonParaCriar
        });
        dialogRef.afterClosed().subscribe(result => {
          if(result === Status.SALVOU){
            this.validarMudancasEConsultar(this.pageNumber);
          }
        });
      }
    });
    return {
      unsubscribe() {
      }
    };
  });

  getPage(pageNumber){
    this.pageNumber = pageNumber;
    this.consultar(pageNumber);
  }

  consultar(paginaSelecionada) {
    this.ultimaQuery = new HttpParams;
    this.totalDeItems = 0;
    if(this.query.has('consultar')){
      paginaSelecionada = 1;
      this.pageNumber = 1;
      this.query = this.query.set('page', `${paginaSelecionada}`)
      
      this.query = this.query.delete('consultar');
    }else{
      this.query = this.query.set('page', `${paginaSelecionada}`)
    }
   

    this.query = this.query.set('size', `${this.itemsPorPagina}`)

    this.ultimaQuery = this.query; 
    this.componentLoading = true;

    this._service.buscarTodos(this.ultimaQuery)
      .subscribe(data => {
        if(paginaSelecionada!== undefined){
          this.pageNumber=paginaSelecionada;
        }else{
          this.pageNumber = 1;
        }

        this.totalDeItems = data.totalElements;
        this.dataSource = of(data.content);
        
      }, ex => {

        this.dataSource = new Observable<[]>();
        if (ex.status === 404) {

          let codsFilial = [];
          if(this.ultimaQuery.has('codigoFilial')){
            codsFilial = this.ultimaQuery.get('codigoFilial').split(',');

          }

          let codsProduto = [];
          if(this.ultimaQuery.has('codigoProduto')){
            codsProduto = this.ultimaQuery.get('codigoProduto').split(',');
          }

          let codCentroDistribuicao = [];
          if(this.ultimaQuery.has('centroDistribuicao')){
            codCentroDistribuicao = this.ultimaQuery.get('centroDistribuicao').split(',');
          }
         
          if (codsFilial.length === 1 && codsProduto.length === 1) {
              if(codCentroDistribuicao.length === 0){
                const subscribe = this.novoRegistro.subscribe({
                  complete() {

                  },
                  next() {

                  },
                  error(msg) {
                  }
                });
              } else {
                this.mensagemModal = 'Não encontramos nenhum registro. Para realizar o cadastro deste Estoque, tire as opções do Centro de Distribuição!';
                this.imagemModal = 'warning';
                this.tituloModal = 'Nenhuma informação encontrada!';
                this.modalChild.openModal = true;
              }
          }else{
            this.mensagemModal = 'Não encontramos nenhum registro, tente outra busca!';
            this.imagemModal = 'warning';
            this.tituloModal = 'Nenhuma informação encontrada!';
            this.modalChild.openModal = true;
          }
        } else if (ex.status === 0) {
          this.mensagemModal = 'Serviço de consulta está fora, por favor entre em contato com a equipe técnica.';
          this.imagemModal = 'warning';
          this.tituloModal = 'Ops! Algo deu errado...';
          this.modalChild.openModal = true;
        } else {
          this.imagemModal = 'times-circle';
          this.mensagemModal = ex.error.mensagem;
          this.tituloModal = 'Erro!';
          this.modalChild.openModal = true;
        }
        this.modalChild.somErro = true;
      }).add(info => {
        this.componentLoading = false;
      });
  }
  novoRegistro = new Observable((observer) => {
   
    Swal.fire({
      title: "Você deseja cadastra-lo?",
      text: "Não encontramos nenhum registro com este filtro.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim",
      cancelButtonText: "Não",
      customClass: {confirmButton: 'setBackgroundColor'}
    }).then(resultado => {
      if (resultado.value == true) {
        const dialogRef = this.dialog.open(MinimoMaximoModalComponent, {
          width: "auto",
          height: "auto",
          data: this.jsonParaCriar
        });

        dialogRef.afterClosed().subscribe(result => {

          if(result === Status.SALVOU){
            this.validarMudancasEConsultar(this.pageNumber);
          }
        });
      }
    });
    return {
      unsubscribe() {

      }
    };
  });
   
}

enum Status{
  SALVOU = 'SALVOU',
  SAIU = 'SAIU',
};