import { UtilsHelper } from './../../../helpers/utils.helper';
import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import Swal from "sweetalert2";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SalvarMinimoMaximoModel, NewModalComponent, fadeIn, fadeInOut } from 'src/app/commons';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MinimoMaximoService } from 'src/app/commons/services';

@Component({
  selector: "rd-minimo-maximo-modal",
  templateUrl: "./minimo-maximo-modal.component.html",
  styleUrls: ["./minimo-maximo-modal.component.scss"],
  animations: [fadeInOut, fadeIn]
})

export class MinimoMaximoModalComponent implements OnInit {
  mensagemModal;
  imagemModal;
  tituloModal;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  componentLoading: Boolean = false;
  bloquearAtualizar: Boolean = true;
  cadastroForm: FormGroup;
  titulo = 'Cadastrar Minimo e Maximo';
  btnAtualizarCadastrar = 'Cadastrar'
  cdOperador = localStorage.getItem("cdOperador");
  _motivoSelecionado = [];
  disabledMotivoDropDownOuInput: boolean;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<MinimoMaximoModalComponent>,
    private _service: MinimoMaximoService,
    private _utils: UtilsHelper,

    @Inject(MAT_DIALOG_DATA) public data: SalvarMinimoMaximoModel
  ) {
    this.cadastroForm = this._formBuilder.group({
      inputFilial: [{value:data.id.inputFilial, disabled:true}],
      cdFilial: [data.id.cdFilial],
      inputProduto: [{value:data.id.inputProduto, disabled:true}],
      cdProduto: [data.id.cdProduto],
      inputMotivo: [{value:data.cdMotivoEstoqueMinMax}],
      cdMotivoEstoqueMinMax: [data.cdMotivoEstoqueMinMax],
      inputMinimo: [data.qtEstoqueMin],
      inputMaximo: [data.qtEstoqueMax],
      cdOperadorCadastro: [data.cdOperadorCadastro],
      cdOperadorAtualizar: [data.cdOperadorAlteracao]
    });
    if(!data.cadastro){
      
      this.titulo = "Atualizar mínimo e máximo";
      this.btnAtualizarCadastrar = "Atualizar"
      this.disabledMotivoDropDownOuInput = true;
      if(this._utils.isEmpty(data.cdMotivoEstoqueMinMax)){
        data.cdMotivoEstoqueMinMax = 'Não cadastrado'
      }
      this.cadastroForm = this._formBuilder.group({
        inputFilial: [{value:data.id.inputFilial, disabled:true}],
        cdFilial: [data.id.cdFilial],
        inputProduto: [{value:data.id.inputProduto, disabled:true}],
        cdProduto: [data.id.cdProduto],
        inputMotivo: [{value:data.cdMotivoEstoqueMinMax, disabled:true}],
        cdMotivoEstoqueMinMax: [data.cdMotivoEstoqueMinMax],
        inputMinimo: [data.qtEstoqueMin],
        inputMaximo: [data.qtEstoqueMax],
        cdOperadorCadastro: [data.cdOperadorCadastro],
        cdOperadorAtualizar: [data.cdOperadorAlteracao]
      });
    }
  }

  setMotivosSelecionados(callback) {
    this._motivoSelecionado = callback
  }

  ngOnInit() {
  }

  onChangeMax(event){
    if(
      (event.target.name === 'inputMinimo' && event.target.value === this.data.qtEstoqueMin) ||
      event.target.name === 'inputMaximo' && event.target.value === this.data.qtEstoqueMax){
      this.bloquearAtualizar = true;
    }else{
      this.bloquearAtualizar = false;
    }
  }

  gravarMinimoMaximo(){
    this.componentLoading = true;

    let jsonCadastrar: SalvarMinimoMaximoModel;
    let jsonAtualizar: SalvarMinimoMaximoModel;

    if(this._utils.isEmpty(this._motivoSelecionado) && (this.data.cadastro)  ){
      this.mensagemModal = 'Por favor, selecione um motivo.';
      this.imagemModal = "warning";
      this.tituloModal = "Não foi possível salvar!";
      this.modalChild.openModal = true;
      this.componentLoading = false;
      
    }
    else if(this.cadastroForm.value['inputMinimo'] === this.data.qtEstoqueMin
          && this.cadastroForm.value['inputMaximo'] === this.data.qtEstoqueMax){
      this.mensagemModal = 'Os valores do <strong>mínimo</strong> ou <strong>máximo</strong> devem ser diferentes dos atuais.';
      this.imagemModal = "warning";
      this.tituloModal = "Não foi possível salvar com os valores inseridos!";
      this.modalChild.openModal = true;
      this.componentLoading = false;
    }
    else if ( this.data.cadastro ) {
    jsonCadastrar = {
      cdMotivoEstoqueMinMax: this._motivoSelecionado[0],
      id: {
        cdFilial: this.cadastroForm.value['cdFilial'],
        cdProduto: this.cadastroForm.value['cdProduto'],
      },
      qtEstoqueMin: this.cadastroForm.value['inputMinimo'],
      qtEstoqueMax: this.cadastroForm.value['inputMaximo'],
      cdOperadorCadastro: `${this.cdOperador}`,
    };

    if(this._utils.isEmpty(jsonCadastrar.qtEstoqueMin)){ delete jsonCadastrar.qtEstoqueMin }
    if(this._utils.isEmpty(jsonCadastrar.qtEstoqueMax)){ delete jsonCadastrar.qtEstoqueMax }
    if(this._utils.isEmpty(jsonCadastrar.cdMotivoEstoqueMinMax) || 
    jsonCadastrar.cdMotivoEstoqueMinMax == 'Não cadastrado'){ delete jsonCadastrar.cdMotivoEstoqueMinMax }

    this._service.gravarMinimoMaximo(jsonCadastrar).subscribe(res => {
      this.mensagemModal = 'Mínimo e máximo salvo com sucesso.';
      this.imagemModal = 'check';
      this.tituloModal = 'Sucesso!';
      this.modalChild.openModal = true;
    }, ex => {
      if(ex.status === 400 || ex.status === 404){
        this.mensagemModal = ex.error.mensagem;
        this.imagemModal = "warning";
        this.tituloModal = "Não conseguimos salvar!";
        this.modalChild.openModal = true;
      }
      this.componentLoading = false;
    }).add(add =>{
    }).unsubscribe();

  } else {
    jsonAtualizar = {
      cdMotivoEstoqueMinMax: this.cadastroForm.value['cdMotivoEstoqueMinMax'],
      id: {
        cdFilial: this.cadastroForm.value['cdFilial'],
        cdProduto: this.cadastroForm.value['cdProduto'],
      },
      qtEstoqueMin: this.cadastroForm.value['inputMinimo'],
      qtEstoqueMax: this.cadastroForm.value['inputMaximo'],
      cdOperadorAlteracao: this.cadastroForm.value['cdOperadorAtualizar']
    };

    if((isNaN(parseInt(jsonAtualizar.qtEstoqueMin))) && (!this._utils.isEmpty(jsonAtualizar.qtEstoqueMin))){
    this.mensagemModal = 'Revise os valores inseridos em mínimo e máximo.'
    this.imagemModal = "warning";
    this.tituloModal = "Não conseguimos salvar!";
    this.modalChild.openModal = true;
    this.componentLoading = false; 
    }
     else if((isNaN(parseInt(jsonAtualizar.qtEstoqueMax))) && (!this._utils.isEmpty(jsonAtualizar.qtEstoqueMax))){
    this.mensagemModal = 'Revise os valores inseridos em mínimo e máximo.'
    this.imagemModal = "warning";
    this.tituloModal = "Não conseguimos salvar!";
    this.modalChild.openModal = true;
    this.componentLoading = false; 

    }else{

      if(this._utils.isEmpty(jsonAtualizar.cdMotivoEstoqueMinMax) || 
      jsonAtualizar.cdMotivoEstoqueMinMax == 'Não cadastrado'){ delete jsonAtualizar.cdMotivoEstoqueMinMax }
  
        this.componentLoading = false; 
        this._service.atualizarMinimoMaximo(jsonAtualizar).subscribe(res => {
          this.modalSucessoAtualizar(res)
        }, ex => {
          // VALIDAÇÃO PARA MODAL QUANDO PRODUTO NÃO SE ENCONTRA NO MIX (404)
          if(ex.status === 400 || ex.status === 404) {
            this.mensagemModal = ex.error.mensagem;
            this.imagemModal = "warning";
            this.tituloModal = "Não conseguimos salvar!";
            this.modalChild.openModal = true;
          }
          this.componentLoading = false;
        }).add(add =>{ 
        }).unsubscribe();
    }
  }
}

//PERMITIR KEY SOMENTE DE NUMEROS E HIFEN
keyPress(event) {
      const pattern = /\d|-/g;
      const inputChar = String.fromCharCode((event).charCode); 
      if (!pattern.test(inputChar)) {    
          event.preventDefault();
      }
  }

modalSucessoAtualizar(res) {
  let mensagem = 'Atualizado com sucesso.';  
 


  if((res.qtEstoqueMin != this.data.qtEstoqueMin) && (res.qtEstoqueMax != this.data.qtEstoqueMax)) {
    mensagem = 'Mínimo e máximo atualizado com sucesso.';
  } else if(res.qtEstoqueMin != this.data.qtEstoqueMin) {
    mensagem = 'Mínimo atualizado com sucesso.';
  } else if(res.qtEstoqueMax != this.data.qtEstoqueMax) {
    mensagem = 'Máximo atualizado com sucesso.';
  }

  this.mensagemModal = mensagem;
  this.imagemModal = 'check';
  this.tituloModal = 'Sucesso!';
  this.modalChild.openModal = true;
  

}

  fechouModal(event){
    if(event){
      this.dialogRef.close(Status.SALVOU);
    }
  }

  exit() {
    this.dialogRef.close(Status.SAIU);
  }

}

enum Status{
  SALVOU = 'SALVOU',
  SAIU = 'SAIU',
};