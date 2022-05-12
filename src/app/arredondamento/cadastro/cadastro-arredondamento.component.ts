import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import Swal from "sweetalert2";

import {

  ValidatorHelper,
  ServicePath,
  APIService,
  NewModalComponent,
  fadeInOut,
  ArredondamentoService
} from 'src/app/commons';
@Component({
  selector: 'rd-cadastro-arredondamento',
  templateUrl: './cadastro-arredondamento.component.html',
  animations: [fadeInOut],
})
export class CadastroArredondamentoComponent implements OnInit {
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  cdOperador = localStorage.getItem('cdOperador');
  idFornecedor;
  idProduto;
  idCentroDistribuicao;
  tiposCategoria;
  tiposMaster;
  marked = false;
  loaded = true;
  componentLoading = false;
  submitted = false;
  cadastroForm: FormGroup;
  posts: any = [];
  isPedido;
  rotaVoltar = '/arredondamento/consulta';

  objIdConveyors;
  tituloPagina;
  tipoPagina;
  subtituloPagina;
  mensagemModal;
  tituloModal;
  imagemModal;
  btnVoltarConfirmar;

  objEditar;

  constructor(
    private formBuilder: FormBuilder,
    private validator: ValidatorHelper,
    private arredondamentoService: ArredondamentoService,
    private router: Router
  ) {
    let max: number = 100;
    let min: number = 100;





    this.cadastroForm = this.formBuilder.group({
      cdFornecedor: [''],
      inputFornecedor: [''],
      cdProduto: [''],
      inputRegional: [''],
      cdRegional: [''],
      dsFornecedor: [''],
      dsProduto: [''],
      inputProduto: [''],
      dsRegional: [''],
      cdOperador: [this.cdOperador],
      // dtCadastro: [''],
      // dtUltPedido: [''],
      // pc1cxDisplay: ['', Validators.max(max)],
      pctCxEmbarque1: ['', Validators.max(max)],
      // pcCxDisplay: [''],
      pctCxEmbarque2: ['', Validators.max(max)],
      pctPallet: [''],
      qtCamadaPallet: [''],
      pcCmdPallet: ['', Validators.max(max)],
      qtCxDisplay: [''],
      qtCxEmbarque: [''],
      qtPallet: [''],
      // qtUnidAbastecimentRegional: [''],
    });

    /*this.objEditar = this.formBuilder.group({
      cdFornecedor: [''],
      cdProduto: [''],
      cdRegional: [''],
      pctCxEmbarque1: ['', Validators.max(max)],
      pctCxEmbarque2: ['', Validators.max(max)],
      pctPallet: [''],
      qtCamadaPallet: [''],
      pcCmdPallet: ['', Validators.max(max)],
      qtCxEmbarque: [''],
      qtPallet: [''],
    });*/
  }


  ngOnInit() {
    this.idFornecedor = localStorage.getItem("idFornecedor");
    this.idProduto = localStorage.getItem("idProduto");
    this.idCentroDistribuicao = localStorage.getItem("cdRegional");

    this.getObjConveyors();

    this.isPedido = localStorage.getItem('typeService');

    if (this.isPedido == '1') {
      this.isPedido = true;
      this.tipoPagina = ' CD.';
    } else {
      this.isPedido = false;
      this.tipoPagina = ' Loja.'
    }

    this.tituloPagina = 'Editar abastecimento de ' + this.tipoPagina;
  }

  toggleVisibility(e) {
    this.marked = e.target.checked;
  }

  // for easy access to form fields
  get fields() { return this.cadastroForm.controls; }

  validate() {
    // stop here if form is invalid
    if (this.cadastroForm.invalid) {
      return;
    }
    Swal.fire({
      title: 'Editar arredondamento.',
      text: 'Deseja editar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      customClass: { confirmButton: 'setBackgroundColor' },
      cancelButtonText: 'Não'
    }).then((willSucess) => {

      if (willSucess.value === true) {
        if (this.cadastroForm.invalid) {
          return;
        }
        this.atualizar();
      }

    });

  }


  atualizar() {
    this.componentLoading = true;

    // OBJECTO ENVIADO NO PAYLOAD PARA EDITAR ARREDONDAMENTO
    let objtoCustomizadoParaEditar = {
      cdFornecedor: this.cadastroForm.value.cdFornecedor,
      cdProduto: this.cadastroForm.value.cdProduto,
      cdRegional: this.cadastroForm.value.cdRegional,
      pctCxEmbarque1: this.cadastroForm.value.pctCxEmbarque1,
      pctCxEmbarque2: this.cadastroForm.value.pctCxEmbarque2,
      pctPallet: this.cadastroForm.value.pctPallet,
      qtCxEmbarque: this.cadastroForm.value.qtCxEmbarque,
      pcCmdPallet: this.cadastroForm.value.pcCmdPallet,
      qtPallet: this.cadastroForm.value.qtPallet,
      qtCamadaPallet: this.cadastroForm.value.qtCamadaPallet,

    };
    
    


    this.arredondamentoService.atualizarArredondamento(objtoCustomizadoParaEditar, this.cdOperador)
      .subscribe(() => {

        this.mensagemModal = 'Alteração realizada com sucesso';
        this.imagemModal = 'check';
        this.tituloModal = 'Sucesso!';
        this.btnVoltarConfirmar = true;
        this.modalChild.openModal = true;

      }, ex => {
        this.imagemModal = 'times-circle';
        this.mensagemModal = ex.error.mensagem;
        this.tituloModal = 'Erro!';
        this.modalChild.somErro = true;
        this.modalChild.openModal = true;
      }).add((info) => {

        this.loaded = true;
        this.componentLoading = false;
      });
  }


  getObjConveyors() {
    this.componentLoading = true;

    let filtro = '?cdFornecedor=' + this.idFornecedor;
    filtro += '&cdProduto=' + this.idProduto
    filtro += '&cdRegional=' + this.idCentroDistribuicao;

    this.arredondamentoService.getAllArredondamento(filtro)
      .subscribe((data: any) => {

        this.objIdConveyors = data.content[0];

        this.cadastroForm = this.formBuilder.group({
          inputFornecedor: [this.objIdConveyors.cdFornecedor + ' - ' + this.objIdConveyors.nmFornecedor],
          inputProduto: [this.objIdConveyors.cdProduto + ' - ' + this.objIdConveyors.dsProduto],
          dsProduto: [this.objIdConveyors.dsProduto],
          inputRegional: [this.objIdConveyors.cdRegional + ' - ' + this.objIdConveyors.nmRegional],
          cdFornecedor: [this.objIdConveyors.cdFornecedor], // código fornecedor
          cdOperador: [this.cdOperador], //codigo operador
          cdProduto: [this.objIdConveyors.cdProduto], //codigo produto
          cdRegional: [this.objIdConveyors.cdRegional], //codigo regional
          pctCxEmbarque1: [this.objIdConveyors.pc1cxEmbarque], // % caixa
          pctCxEmbarque2: [this.objIdConveyors.pcCxEmbarque], // % caixa
          pctPallet: [this.objIdConveyors.pcPallet], // % pallet
          qtCxEmbarque: [this.objIdConveyors.qtCxEmbarque], // quantidade caixa embarque
          qtPallet: [this.objIdConveyors.qtPallet], // quantidade pallet
          qtCamadaPallet: [this.objIdConveyors.qtCmdPallet], // quantidade camada pallet
          pcCmdPallet: [this.objIdConveyors.pcCmdPallet], // % camada pallet

        });



      }, ex => {
        if (ex.status === 404) {
          this.mensagemModal = ex.error.mensagem;
          this.imagemModal = 'warning';
          this.tituloModal = 'Nenhum dado encontrado';
          this.modalChild.openModal = true;

        } else {

          this.imagemModal = 'times-circle';
          this.mensagemModal = ex.error.mensagem;
          this.tituloModal = 'Erro!';
          this.modalChild.openModal = true;
        }
        this.modalChild.somErro = true;
      }).add(() => {
        this.componentLoading = false;
        this.loaded = true;
      });


  }
}