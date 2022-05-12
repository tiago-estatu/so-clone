import { Component, ViewChild, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  UtilsHelper,
  ValidatorHelper,
  cpfCnpjMask,
  MaskedDate,
  NewModalComponent,
  ServicePath,
  PaginacaoComponent,
  APIService,
  fadeInOut
} from 'src/app/commons';

@Component({
  selector: 'rd-clientes-consulta',
  templateUrl: './clientes-consulta.component.html',
  styleUrls: ['./clientes-consulta.component.scss'],
  animations: [fadeInOut]
})


export class ClientesConsultaComponent implements OnInit {

  @ViewChild(PaginacaoComponent) paginationChild: PaginacaoComponent;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;


  loaded = false;
  componentLoading = false;
  posts: any = [];
  clientesForm: FormGroup;
  dataPreenchida;
  montarUrlParametros;
  dateMask = MaskedDate; // para mascara no campo bsdatepicker datas
  cpfCnpjMask = cpfCnpjMask; // para mascara de cpf ou cnpj
  maxDate: Date;
  locale = 'pt-br';
  documentoIsValido = true;
  labelCpfCnpj;
  variaveisDeBusca;
  expandir = true;
  loadForm;
  temp: any;
  titlesColumns = ['nome', 'cdCliente', 'cdClienteWeb', 'email', 'dataCadastro', 'cpfCnpj', 'tipoCartao', 'acoes'];
  mensagemModal;
  tituloModal;
  imagemModal;


  constructor(
    private router: Router,
    private apiConfig: APIService,
    private localeService: BsLocaleService,
    private cdRef: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private validator: ValidatorHelper,
    private utils: UtilsHelper
  ) {
    this.localeService.use(this.locale);
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() + 1);
  }

  zerarVariaveisDeBusca() {
    // this.mensagemModal = 'Por favor valide a receita para concluir a entrega.';
    // this.tituloModal = "Pedido contém medicamento controlado!";
    // this.imagemModal = 'warning';
    // this.modalChild.openModal = true;
    // this.modalChild.conteudoModal = true;
    // this.modalChild.botoesPrincipais = false;
    // this.modalChild.modalLargeSize = true;
    // return;
    this.montarUrlParametros = '';
    this.expandir = true;
    this.paginationChild.limparPaginacao();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
    // BUG DE ERRO!?
  }





  ngOnInit() {


    this.loadForm = true;
    this.clientesForm = this.formBuilder.group({
      inputNome: ['', Validators.required],
      inputEmail: ['', Validators.required],
      inputCpfCnpj: ['', Validators.required],
      inputCodCliente: ['', Validators.required],
      inputCodClienteWeb: ['', Validators.required],
      inputDataInicio: ['', Validators.required],
      inputDataFinal: ['', Validators.required],
    });


    if (!this.utils.isEmpty(localStorage.getItem('url_pesquisa'))) {

      const objUrlPesquisa = JSON.parse(localStorage.getItem("url_pesquisa"))[0];

      if (objUrlPesquisa.pagina == 'clientes') {
        this.montarUrlParametros = objUrlPesquisa.parametros;
        this.paginationChild.paginaAtual = objUrlPesquisa.paginaAtual;
        this.paginationChild.quantidade = objUrlPesquisa.quantidade;
        this.paginationChild.totalRegistros = objUrlPesquisa.totalRegistros;

        this.loadingApiClientes();
        this.getCacheValueInputs();

      }

    }

    localStorage.removeItem('urlVoltar');
    this.temp = localStorage.getItem('generalID');
  }

  // for easy access to form fields
  get fields() { return this.clientesForm.controls; }


  mascaraCpfCnpj(valorAqui) {
    const cpfCnpj = this.validator.mascaraCpfCnpj(valorAqui);
    this.documentoIsValido = this.validator.validaCpfCnpj(cpfCnpj, false);
    this.labelCpfCnpj = this.validator.identificaCPFCNPJ(cpfCnpj, false);

  }

  clicked(event: any, object) {
    this.temp = object.id;
    localStorage.setItem('generalID', this.temp);
  }


  loadingApiClientes() {

    this.componentLoading = true;

    this.variaveisDeBusca = ServicePath.HTTP_FIND_CLIENTE +
      '?inicio=' + this.paginationChild.paginaAtual +
      '&quantidade=' + this.paginationChild.quantidade +
      this.montarUrlParametros +
      '&f=cdClienteWeb@naovazio@' +
      this.paginationChild.totalRegistros;

    this.componentLoading = true;
    this.apiConfig.GET(this.variaveisDeBusca)
      .subscribe((data: any) => {
        this.posts = data.value;
        this.paginationChild.paginacaoSucess(data);
        this.loaded = true;
        this.expandir = false;
        this.saveSearchAndInputs();
      }, ex => {
        if (ex.status == 404 || 400) {
          this.imagemModal = 'warning';
          this.mensagemModal = "Nenhum dado foi encontrado com o filtro selecionado, tente novamente com outros filtros.";
          this.tituloModal = 'Nenhum dado encontrado!';
          this.modalChild.openModal = true;
        } else {
          this.imagemModal = 'times-circle';
          this.mensagemModal = ex.error.mensagem;
          this.tituloModal = 'Erro!';
          this.modalChild.openModal = true;
          this.modalChild.somErro = true;
        }
      }).add(() => {
        this.componentLoading = false;
      });

  }


  filtrarItens() {
    this.zerarVariaveisDeBusca();
    this.componentLoading = true;
    this.dataPreenchida = false;

    if (this.fields.inputNome.invalid &&
      this.fields.inputEmail.invalid &&
      (this.fields.inputCpfCnpj.invalid || this.documentoIsValido == false) &&
      this.fields.inputCodCliente.invalid &&
      this.fields.inputCodClienteWeb.invalid &&
      this.fields.inputDataInicio.invalid &&
      this.fields.inputDataFinal.invalid) {

      this.tituloModal = "Campos não preenchidos";
      this.mensagemModal = "Preencha ao menos um campo corretamente ou o intervalo de datas de cadastro para consultar lista de clientes."
      this.imagemModal = 'warning';
      this.modalChild.openModal = true;
      this.modalChild.somErro = true;
      this.componentLoading = false;
    } else {

      this.paginationChild.busca();

      this.montarUrlParametros = '';

      if (this.fields.inputNome.valid) {
        this.montarUrlParametros += "&f=(lowercase)nmCliente!!" + this.fields.inputNome.value.toLowerCase();
      }

      if (this.fields.inputCodCliente.valid) {
        this.montarUrlParametros += "&f=id@=" + this.fields.inputCodCliente.value;
      }


      if (this.fields.inputCodClienteWeb.valid) {
        this.montarUrlParametros += "&f=cdClienteWeb@=" + this.fields.inputCodClienteWeb.value;
      }

      if (this.fields.inputCpfCnpj.valid && this.documentoIsValido) {

        this.montarUrlParametros += "&f=nrCnpjCpf@=" + this.fields.inputCpfCnpj.value.replace(/\D/g, '');
      }

      if (this.fields.inputEmail.valid) {
        this.montarUrlParametros += "&f=(lowercase)dsEmail!!" + this.fields.inputEmail.value.toLowerCase();
      }

      if (this.fields.inputDataInicio.valid || this.fields.inputDataFinal.valid) {
        this.dataPreenchida = true;
      }

      if (this.fields.inputDataInicio.valid && this.fields.inputDataFinal.valid) {
        this.montarUrlParametros += "&f=dtCadastro@BD@" + this.validator.formataDataApiInicio(this.fields.inputDataInicio.value);
        this.montarUrlParametros += "-" + this.validator.formataDataApiFinal(this.fields.inputDataFinal.value);
      }

      // se as duas datas tiverem preenchidas
      if (this.fields.inputDataFinal.valid && this.fields.inputDataInicio.valid) {
        if (new Date(this.fields.inputDataInicio.value).getDate() - new Date(this.fields.inputDataFinal.value).getDate() > 365) {
          this.mensagemModal = "Preencha um menor intervalo de datas de cadastro (1 ano), para consultar lista de clientes.";
          this.tituloModal = "Datas com intervalos grandes";
          this.imagemModal = 'warning';
          this.modalChild.openModal = true;
          this.componentLoading = false;
          this.modalChild.somErro = true;
          return false;
        }
        this.dataPreenchida = false;
      }
      // quando somente uma das datas estiver preenchida
      else if (this.dataPreenchida == true) {
        this.mensagemModal = 'Preencha o intervalo de datas de cadastro ou limpe os campos de datas para consultar lista de clientes.';
        this.tituloModal = "Datas não preenchidas";
        this.imagemModal = 'warning';
        this.modalChild.openModal = true;
        this.componentLoading = false;
        this.modalChild.somErro = true;
        return false;
      }

      this.loadingApiClientes();

    }
  }


  saveSearchAndInputs() {

    this.setCacheInputs();

    const array_voltar = JSON.stringify(['clientes/consulta']);
    localStorage.setItem('urlVoltar', array_voltar);
    localStorage.setItem("url_pesquisa", JSON.stringify([{
      'pagina': 'clientes',
      'parametros': this.montarUrlParametros,
      'paginaAtual': this.paginationChild.paginaAtual,
      'quantidade': this.paginationChild.quantidade,
      'totalRegistros': this.paginationChild.totalRegistros
    }]));
  }


  setCacheInputs() {
    localStorage.setItem("data_form", JSON.stringify([{
      'inputNome': this.fields.inputNome.value,
      'inputEmail': this.fields.inputEmail.value,
      'inputCpfCnpj': this.fields.inputCpfCnpj.value,
      'inputCodCliente': this.fields.inputCodCliente.value,
      'inputCodClienteWeb': this.fields.inputCodClienteWeb.value,
      'inputDataInicio': this.fields.inputDataInicio.valid ? this.validator.formataData(this.fields.inputDataInicio.value) : '',
      'inputDataFinal': this.fields.inputDataFinal.valid ? this.validator.formataData(this.fields.inputDataFinal.value) : '',
    }]));
  }

  getCacheValueInputs() {
    const objPopulateInput = JSON.parse(localStorage.getItem('data_form'))[0];
    this.fields['inputNome'].setValue(objPopulateInput.inputNome);
    this.fields['inputCodCliente'].setValue(objPopulateInput.inputCodCliente);
    this.fields['inputCodClienteWeb'].setValue(objPopulateInput.inputCodClienteWeb);
    this.fields['inputCpfCnpj'].setValue(objPopulateInput.inputCpfCnpj);
    this.fields['inputEmail'].setValue(objPopulateInput.inputEmail);
    this.fields['inputDataInicio'].setValue(objPopulateInput.inputDataInicio);
    this.fields['inputDataFinal'].setValue(objPopulateInput.inputDataFinal);
  }


}
