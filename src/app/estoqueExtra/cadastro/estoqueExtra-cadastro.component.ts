import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup } from '@angular/forms';

import {
  HeaderService,
  NewModalComponent,
  EstoqueExtraService,
  IEstoqueExtra, ValidatorHelper,
  fadeInOut,
  fadeIn,
  UtilsHelper
} from 'src/app/commons';
import { Router, ActivatedRoute } from '@angular/router';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
    selector: '[estoqueExtra-cadastro.component]',
    templateUrl: 'estoqueExtra-cadastro.component.html',
    animations: [fadeInOut, fadeIn]
  })
  export class EstoqueExtraCadastroComponent implements OnInit {
    @ViewChild(NewModalComponent) modalChild: NewModalComponent;
    rotaVoltar = '/estoqueExtra/consulta';
    tituloPagina = 'Cadastro Estoque Extra';
    cdOperador = localStorage.getItem('cdOperador');
    estoque: IEstoqueExtra;
    componentLoading;
    _dataInicial;
    _dataFinal;

    title: string = 'CADASTRO ESTOQUE EXTRA';

    dataInicioConvertido: Date;
    formulario: FormGroup;
    jsonPost: IEstoqueExtra;
    constructor(
      private formBuilder: FormBuilder ,
      private headerService: HeaderService,
      private estoqueExtra: EstoqueExtraService,
      private validator: ValidatorHelper,
      private activatedRoute:ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.headerService.setTitle("Gestão de Estoque Extra - Cadastro");
        this.estoque = this.activatedRoute.snapshot.data.vigencias;
        this.setTitle();
        this._dataInicial = this.validator.formataDataComBarra(this.estoque.dtInicioVigencia);
        this._dataFinal = this.validator.formataDataComBarra(this.estoque.dtFimVigencia);

        this.formulario = this.formBuilder.group({
          cdOperador: [this.cdOperador],
          inputFilial: [this.estoque.filial + '-' + this.estoque.dsFilial],
          inputProduto: [this.estoque.produto + '-' + this.estoque.dsProduto],
          inputQuantidade: [this.estoque.qtEstoque],
          inputTipo: [this.estoque.cdTipo + '-' + this.estoque.dsTipo],
          inputMotivo: [this.estoque.cdMotivo + '-' + this.estoque.dsMotivo],
          dsEstoqueIdeal: [this.estoque.dsEstoqueIdeal],
          pcVigenciaFour: [this.estoque.pcVigenciaFour],
          pcVigenciaOne: [this.estoque.pcVigenciaOne],
          pcVigenciaTree: [this.estoque.pcVigenciaThree],
          pcVigenciaTwo: [this.estoque.pcVigenciaTwo],
      });
    }
    get fields() { return this.formulario.controls; }
    validate() {
       this.montarJson();
        this.componentLoading = true;
        this.estoqueExtra.atualizar(this.jsonPost, this.estoque.cdEstoqueIdeal).subscribe(() => {
          Swal.fire({
            title: "Sucesso!",
            text: 'Alteração realizada com sucesso.',
            icon: 'success',
            confirmButtonText: 'Ok, obrigado',
            customClass: {confirmButton: 'setBackgroundColor'}
          });
        }, ex => {
            Swal.fire({
              title: "Ooops!",
              text: ex.error.mensagem,
              icon: 'warning',
              confirmButtonText: 'Ok, obrigado',
              customClass: {confirmButton: 'setBackgroundColor'}
            });
        }).add(() => {
          this.componentLoading = false;
        });
    }

   montarJson(){
     this.jsonPost = {
       dtInicioVigencia: this.validator.formataDataComBarra(this.estoque.dtInicioVigencia),
       dtFimVigencia: this.validator.formataData(this._dataFinal),
       cdOperador: this.cdOperador,
       dtAtualizacao: this.validator.formataData(new Date()),
       pcVigenciaOne: this.estoque.pcVigenciaOne,
       pcVigenciaTwo: this.estoque.pcVigenciaTwo,
       pcVigenciaThree: this.estoque.pcVigenciaThree,
       pcVigenciaFour: this.estoque.pcVigenciaFour
     }

   }

   setTitle():void {
      this.title = this.estoqueExtra.component === 'lmpm' ? 'CADASTRO ESTOQUE EXTRA LMPM' : this.title;
      this.rotaVoltar = this.estoqueExtra.component === 'lmpm' ? '/cadastros/estoque-extra-lmpm' : this.rotaVoltar;
   }
   

}