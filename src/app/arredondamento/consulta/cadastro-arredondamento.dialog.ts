import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
  selector: 'rd-cadastro-arredondamento-dialog',
  templateUrl: './cadastro-arredondamento.dialog.html',
  styleUrls: ['consulta-arredondamento.component.scss'],
  animations: [fadeInOut],
})
export class CadastroArredondamentoDialog implements OnInit {
  cdOperador = localStorage.getItem('cdOperador');
  objIdConveyors;
  componentLoading = false;
  cadastroForm: FormGroup;
  posts: any = [];
    isPedido = true;

  constructor(
    private formBuilder: FormBuilder,
    private validator: ValidatorHelper,
    private arredondamentoService: ArredondamentoService,
    private _dialogRef: MatDialogRef<CadastroArredondamentoDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }


  ngOnInit() {
    
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
        pctPallet: ['', Validators.max(max)],
        qtCamadaPallet: [''],
        pctCamadaPallet: ['', Validators.max(max)],
        qtCxDisplay: [''],
        qtCxEmbarque: [''],
        qtPallet: [''],
        // qtUnidAbastecimentRegional: [''],
      });
      this.setFormValues();
  }

  showPairError(errors){
    Swal.fire({
      title: 'Campos inválidos',
      html: errors.map(error => `<div>Campo <b>Quantidade ${error}</b> requerido quando o campo <b>% ${error}</b> for utilizado</div><br>`).join(' '),
      icon: 'warning'
    })
  }

  validatePairs(values) {
    let pairs = [];
    if(!values.qtPallet && !!values.pctPallet) pairs.push(['Pallets'])
    if(!values.qtCxEmbarque && (!!values.pctCxEmbarque1 || !!values.pctCxEmbarque2)) pairs.push(['Embarque'])
    if(!values.qtCamadaPallet && !!values.pctCamadaPallet) pairs.push(['Camada'])
    pairs.length > 0 ? this.showPairError(pairs) : null;
    return pairs.length === 0;
  }

  setFormValues() {
      this.cadastroForm.patchValue({
          ...this.data,
          inputRegional: `${this.data.cdRegional} - ${this.data.nmRegional}`,
          inputFornecedor: `${this.data.cdFornecedor} - ${this.data.nmFornecedor}`
      });
      this.cadastroForm.get('inputRegional').disable();
      this.cadastroForm.get('inputFornecedor').disable();
      this.cadastroForm.get('cdProduto').disable();
      this.cadastroForm.get('dsProduto').disable();
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
        if(this.cadastroForm.valid && willSucess.value) this.atualizar();
    });

  }

  closeDialog() {
      this._dialogRef.close()
  }

  atualizar() {
    let form = this.cadastroForm.getRawValue()
    if(!this.validatePairs(form)) return;
    // OBJECTO ENVIADO NO PAYLOAD PARA EDITAR ARREDONDAMENTO
    let objtoCustomizadoParaEditar = form
    
    this.arredondamentoService.atualizarArredondamento(objtoCustomizadoParaEditar, this.cdOperador).subscribe(da => {
       this._dialogRef.close(form)
    }, err => {
      Swal.fire({
        title: 'Ops!',
        html: err.error && err.error.mensagem ? err.error.mensagem  : 'Não foi possivel salvar as alterações. Verifique a sua conexão e tente novamente mais tarde.',
        icon: 'error'
      })
    })
  }



}