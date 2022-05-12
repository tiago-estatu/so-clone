import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import {
  PaginacaoComponent,
  NewModalComponent,
  APIService,
  ServicePath,  
  cpfCnpjMask,
  UtilsHelper,
  HeaderService
} from 'src/app/commons';
import { ExecucaoService } from '../execucao.service';
import { MaskedDate } from '../../commons/helpers/mask.helper';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Execucao } from './Execucao';

@Component({
  selector: 'rd-execucao-consulta',
  templateUrl: './execucao-consulta.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(200, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(200, style({ opacity: 0 }))
      ])
    ])
  ]
})


export class ConsultaExecucaoComponent implements OnInit,AfterViewInit {
 
  expandir = true;
  
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  @ViewChild(PaginacaoComponent) paginationChild: PaginacaoComponent;
  @ViewChild(MatSort) sort: MatSort;
  
  maxDate:Date;
  locale = 'pt-br';
  
  constructor(
    private apiConfig: APIService,
    private headerService : HeaderService,
    private localeService: BsLocaleService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: UtilsHelper,
    private execucaoService:ExecucaoService
    ) {
      this.maxDate = new Date();
      this.maxDate.setDate(this.maxDate.getDate());
      this.localeService.use(this.locale);
    }
    
    resultsLength = 10;
    // VARS
    conveyorsForm: FormGroup;
    cpfCnpjMask = cpfCnpjMask; // para mascara de cpf ou cnpj
    componentLoading = false;
    dateMask = MaskedDate; // para mascara no campo bsdatepicker datas
    //posts: any = [];
    loaded = false;
    montarUrlParametros = '';
    toggle;
    titlesColumns = ['codRotinaInterface','dataRotinaInterface', 'nometabela'];
    mensagemModal;
    tituloModal; imagemModal;
    posts = new MatTableDataSource<Execucao>();
    
    ngAfterViewInit(): void {
    }
    
    ngOnInit() {

    this.headerService.setTitle("Consulta Execução interface");
      
      this.posts.sort = this.sort;      
      
    // FORM
    this.conveyorsForm = this.formBuilder.group({
      inputDataInicio: ['10/10/2019', Validators.required]      
    });


    // if (!this.utils.isEmpty(localStorage.getItem('url_pesquisa'))) {

    //   const objUrlPesquisa = JSON.parse(localStorage.getItem("url_pesquisa"))[0];

    //   if (objUrlPesquisa.pagina == 'transportadoras') {

    //     this.montarUrlParametros = objUrlPesquisa.parametros;
    //     this.paginationChild.paginaAtual = objUrlPesquisa.paginaAtual;
    //     this.paginationChild.quantidade = objUrlPesquisa.quantidade;
    //     this.paginationChild.totalRegistros = objUrlPesquisa.totalRegistros;

    //     this.getCacheValueInputs();

    //   }

    // }


    // this.loadingApi();

  }

  get fields() { return this.conveyorsForm.controls; }

  loadingApi() {

    this.componentLoading = true;
    let urlContainer;
    /*urlContainer = ServicePath.HTTP_LISTA_TRANSPORTADORAS +
      '?inicio=' + this.paginationChild.paginaAtual +
      '&quantidade=' + this.paginationChild.quantidade +
      this.montarUrlParametros +
      this.paginationChild.totalRegistros;*/

//      urlContainer = 'http://10.1.55.198:8084/rd-interface-itim/v1/execucao/data/2019-08-27'; 

      this.execucaoService.listarExecucaoInterface(new Date( this.conveyorsForm.controls.inputDataInicio.value)) 
      .subscribe((data: any) => {
        this.posts.data = data.value;
        this.paginationChild.paginacaoSucess(data);
        this.saveSearchAndInputs();
      }, ex => {
        this.mensagemModal = ex.error.mensagem;
        if (ex.status === 404) {
          this.imagemModal = 'warning';
          this.tituloModal = "Nenhum dado encontrado!";
          this.modalChild.openModal = true;
        } else {
          this.imagemModal = 'times-circle';
          this.tituloModal = "Erro!";
          this.modalChild.openModal = true;
          this.modalChild.somErro = true;
        }
      }).add(() => {
        this.componentLoading = false;
        this.loaded = true;
      });
  }
  limparTela(){

  }
  filtrarItens() {
    this.zerarVariaveisDeBusca();
    
    if (this.fields.inputCnpj.valid) {
      this.montarUrlParametros += '&f=nrCnpj@=' + this.conveyorsForm.value.inputCnpj.replace(/\D/g, '')
    }

    
    this.componentLoading = true;
    //this.paginationChild.busca();
    this.loadingApi();
  }

  zerarVariaveisDeBusca() {
    this.montarUrlParametros = '';
  //  this.paginationChild.limparPaginacao();
  }

  goTo(event, id?) {
    event.preventDefault();
    localStorage.setItem("idTransportadora", id);
    this.router.navigateByUrl("/transportadoras/cadastro");
  }


  /*toggleVisibility(post) {

    this.componentLoading = true;

    const patchTransportadoras = ServicePath.HTTP_ATUALIZA_TRANSPORTADORAS;

    const arrayJson = {
      flAtivo: post.flAtivo === 1 ? post.flAtivo = 0 : post.flAtivo = 1,
      idTransportadora: post.idTransportadora
    };

    this.apiConfig.PATCH(patchTransportadoras, arrayJson)
      .subscribe(() => {
        this.mensagemModal = 'Alteração realizada com sucesso';
        this.imagemModal = 'check';
        this.tituloModal = "Sucesso!";
        this.modalChild.openModal = true;
      }, ex => {
        this.imagemModal = 'times-circle';
        this.mensagemModal = ex.error.mensagem;
        this.tituloModal = "Erro!";
        this.modalChild.openModal = true;
        this.modalChild.somErro = true;
      }).add(() => {
        this.loadingApi();
      });
  }
*/

  saveSearchAndInputs() {

    this.setCacheInputs();

    localStorage.setItem("url_pesquisa", JSON.stringify([{
      'pagina': 'transportadoras',
      'parametros': this.montarUrlParametros,
     /* 'paginaAtual': this.paginationChild.paginaAtual,
      'quantidade': this.paginationChild.quantidade,
      'totalRegistros': this.paginationChild.totalRegistros*/
    }]));

  }


  setCacheInputs() {
    localStorage.setItem("data_form", JSON.stringify([{
      'inputCnpj': this.fields.inputCnpj.value,      
    }]));
  }

  getCacheValueInputs() {

    const objPopulateInput = JSON.parse(localStorage.getItem('data_form'))[0];
    this.fields['inputCnpj'].setValue(objPopulateInput.inputCnpj);    

  }
}
