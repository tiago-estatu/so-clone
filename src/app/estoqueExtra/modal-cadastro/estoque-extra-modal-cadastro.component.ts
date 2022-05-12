import { EstoqueExtraShared } from './../../commons/components/estoque-extra/estoque-extra.shared';
import { error } from 'protractor';
import { ValidatorHelper } from './../../commons/helpers/validator.helper';
import { IEstoqueExtraModalSalvarModel } from './../../commons/services/classes/IEstoqueExtraModalSalvarModel';
import { UtilsHelper } from './../../commons/helpers/utils.helper';
// import { UtilsHelper } from './../../../helpers/utils.helper';
import { Component, OnInit, Input, Inject, ViewChild } from "@angular/core";
// import Swal from "sweetalert2";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SalvarMinimoMaximoModel, NewModalComponent, fadeIn, fadeInOut, EstoqueExtraService } from 'src/app/commons';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MinimoMaximoService } from 'src/app/commons/services';
import Swal, { SweetAlertIcon } from "sweetalert2";
import { isEmpty } from 'rxjs/operators';


@Component({
  selector: 'rd-estoque-extra-modal-cadastro',
  templateUrl: './estoque-extra-modal-cadastro.component.html',
  styleUrls: ['./estoque-extra-modal-cadastro.component.scss'],
  animations: [fadeInOut, fadeIn]
})
export class EstoqueExtraModalCadastroComponent implements OnInit {


  // @Input() jsonParaCriar: IEstoqueExtraModalSalvarModel;

  mensagemModal;
  imagemModal;
  tituloModal;
  @ViewChild(NewModalComponent) modalChild: NewModalComponent;
  componentLoading: Boolean = false;
  bloquearAtualizar: Boolean = true;
  cadastroForm: FormGroup;
  titulo = 'Cadastro Gestão Estoque Extra';
  btnCadastrar = 'Cadastrar'
  cdOperador = localStorage.getItem("cdOperador");
  _motivoSelecionado = [];
  disabledMotivoDropDownOuInput: boolean;
  jsonCadastrar: IEstoqueExtraModalSalvarModel;
  options = { confirmButtonText: 'Ok, obrigado', customClass: { confirmButton: 'setBackgroundColor' } };
  msg: { title: string, html: string, icon: SweetAlertIcon }


  constructor(
    private _formBuilder: FormBuilder,
    private _utils: UtilsHelper,
    private _service: EstoqueExtraService,
    private _validator: ValidatorHelper,
    public dialogRef: MatDialogRef<EstoqueExtraModalCadastroComponent>,

    @Inject(MAT_DIALOG_DATA) public data: IEstoqueExtraModalSalvarModel

  ) {
    let _produto;
    this.data.cdProduto.forEach(produto => {
      _produto = produto
    })
    this.cadastroForm = this._formBuilder.group({
      inputFilial: [{ value: data.cdFilial, disabled: true }],
      cdFilial: [data.cdFilial],
      inputProduto: [{ value: _produto.cdProduto + ' - ' + _produto.dsProduto, disabled: true }],
      cdProduto: [_produto.cdProduto],
      inputTipoEstoque: [{ value: data.tipo, disabled: true }],
      cdTipoEstoque: [data.tipo],
      inputMotivo: [{ value: data.motivo, disabled: true }],
      cdMotivo: [data.motivo],
      dataInicial: [{ value: new Date(data.dtInicioVigencia), disabled: true }],
      dataFinal: [{ value: new Date(data.dtFimVigencia), disabled: true }],
      inputQuantidade: [''],
      inputPorc1Vig: [''],
      inputPorc2Vig: [''],
      inputPorc3Vig: [''],
      inputPorc4Vig: [''],
    });
  }

  ngOnInit() {

  }

  get getDtInicioFormatada() {
    return this._validator.formataData(this.cadastroForm.get('dataInicial').value);
  }

  get getDtFimFormatada() {
    return this._validator.formataData(this.cadastroForm.get('dataFinal').value);
  }

  setMotivosSelecionados(callback) {
    this._motivoSelecionado = callback
  }

  cadastrar() {
    this.componentLoading = true;

    this.jsonCadastrar = {
      cdFilial: parseInt(this.cadastroForm.value['cdFilial']),
      cdOperador: this.cdOperador,
      cdProduto: this.cadastroForm.value['cdProduto'],
      dtFimVigencia: this.getDtFimFormatada,
      dtInicioVigencia: this.getDtInicioFormatada,
      motivo: parseInt(this.cadastroForm.value['cdMotivo']),
      pcVigenciaFour: this.cadastroForm.value['inputPorc4Vig'],
      pcVigenciaOne: this.cadastroForm.value['inputPorc1Vig'],
      pcVigenciaThree: this.cadastroForm.value['inputPorc3Vig'],
      pcVigenciaTwo: this.cadastroForm.value['inputPorc2Vig'],
      qtdEstoque: this.cadastroForm.value['inputQuantidade'],
      tipo: parseInt(this.cadastroForm.value['cdTipoEstoque'])
    }
    this.isEmptyJson()

    if(this.validacoesCadastrar()){
      this._service.cadastrarViaModal(this.jsonCadastrar).subscribe(res => {
        this.modalSucesso(res)
      }, ex => {
        this.handleError(ex)
        this.componentLoading = false;
        return
      })
    }

  }

  validacoesCadastrar(){
    const options = {confirmButtonText: 'Ok, obrigado', customClass: {confirmButton: 'setBackgroundColor'}};
    let msg: { title: string, html: string, icon: SweetAlertIcon }
    
    if((this.jsonCadastrar.pcVigenciaOne > 100 || 
        this.jsonCadastrar.pcVigenciaTwo > 100 || 
        this.jsonCadastrar.pcVigenciaThree > 100 || 
        this.jsonCadastrar.pcVigenciaFour > 100)) { 
      msg = { 
        title: 'Atenção!', 
        html: 'Por favor, para cadastrar insira</br> <strong>% de vigência</strong> menor ou igual a 100',
        icon: 'warning'}
        Swal.fire({...options, ...msg});
        this.componentLoading = false;
      return false
    } else{
      return true
      }
  }

  isEmptyJson() {
    if (this._utils.isEmpty(this.jsonCadastrar.pcVigenciaOne)) { delete this.jsonCadastrar.pcVigenciaOne }
    if (this._utils.isEmpty(this.jsonCadastrar.pcVigenciaTwo)) { delete this.jsonCadastrar.pcVigenciaTwo }
    if (this._utils.isEmpty(this.jsonCadastrar.pcVigenciaThree)) { delete this.jsonCadastrar.pcVigenciaThree }
    if (this._utils.isEmpty(this.jsonCadastrar.pcVigenciaFour)) { delete this.jsonCadastrar.pcVigenciaFour }
  }

  exit() {
    this.dialogRef.close(Status.SAIU);
  }

  fechouModal(event) {
    if (event) {
      this.dialogRef.close(Status.SALVOU);
    }
  }

  //PERMITIR KEY SOMENTE NUMEROS
  keyPress(event) {
    if((event.keyCode < 48) || (event.keyCode > 57)){
      event.preventDefault()
    }
  }

  modalSucesso(res) {
    this.msg = {
      title: 'Sucesso!',
      html: res.mensagem,
      icon: 'success'
    }
    Swal.fire({ ...this.options, ...this.msg });
    this.componentLoading = false;
    return false
  }
  handleError(ex) {
    this.msg = {
      title: 'Não foi possível cadastrar!',
      html: ex.error.mensagem,
      icon: 'warning'
    }
    Swal.fire({ ...this.options, ...this.msg });
  }


}


enum Status {
  SALVOU = 'SALVOU',
  SAIU = 'SAIU',
};
