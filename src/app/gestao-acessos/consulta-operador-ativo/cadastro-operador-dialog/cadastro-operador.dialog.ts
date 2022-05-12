import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { OperadorAcessoModel, OperadorAcessoService, PerfilAcessoService, ValidatorHelper } from 'src/app/commons';
import Swal from 'sweetalert2';

@Component({
    selector: 'rd-cadastro-operador-dialog',
    templateUrl: './cadastro-operador.dialog.html',
    styleUrls: ['../consulta-operador-ativo.component.scss']
})
export class CadastroOperadorDialog implements OnInit {


    operadorForm: FormGroup;
    constructor(
        private _fb: FormBuilder,
        private _dialogRef: MatDialogRef<CadastroOperadorDialog>,
        private _service: OperadorAcessoService,
        private _validator: ValidatorHelper,
        @Inject(MAT_DIALOG_DATA) private _data: OperadorAcessoModel
    ) { }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
          this.operadorForm = this._fb.group({
         cdOperador: [{value: null}],
         nmOperador:[{value: null}],
         idPerfil: [{value:  this._data.idPerfil}],
         dsPerfil: [{value:  this._data.nmOperador}],
         cdPerfilTipo: [{value: null}],
         dtAdmissao: [{value: null}],
         dtInicioVigencia: [{value: new Date(), disabled: false}],
         dtFimVigencia: [{value: new Date()}, Validators.required],
         status: [{value: null}],
         operador: [{value: `${this._data.nmOperador}` , disabled: true}],
         perfil: [{value: `${this._data.dsPerfil}`, disabled: true}],
         matricula: [{value: `${this._data.matricula}`, disabled: true}],
    });
    
        const dtInicio = null != this._data.dtInicioVigencia? this._data.dtInicioVigencia.toString().slice(0,10) : '';
        const dtFinal = null != this._data.dtFimVigencia? this._data.dtFimVigencia.toString().slice(0,10) : '';
      this.operadorForm.setValue({
          ...this._data, 
          operador: `${this._data.nmOperador}`, 
          idPerfil:  this._data.idPerfil,
          perfil: `${this._data.dsPerfil}`,
          matricula: `${this._data.matricula}`,
          dtInicioVigencia: dtInicio,
          dtFimVigencia: dtFinal,
      });
    }


    update() {
        Swal.fire({
            title: 'Atenção!',
            text: 'Você confirma as alterações feitas?',
            icon: 'warning',
            confirmButtonText: 'Ok, confirmar',
            customClass: { confirmButton: 'setBackgroundColor' },
            showCancelButton: true,
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
            if (result.value === true) {
                this._service.atualizarVigencia(this.operadorForm.getRawValue()).subscribe(data => {
                    this.closeDialog(this.operadorForm.getRawValue());
                }, err => {
                    this._service.showSwal('Ops!', err.error.erro.message, 'error')
                })      
            } else {
                return
            }
        });
      
        }
    
    closeDialog(dataToSend?: any) {
        this._dialogRef.close(dataToSend)
    }

    getFormField(field: string): FormControl {
        return this.operadorForm.get(field) as FormControl;
      }
}