import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import Swal from 'sweetalert2';


@Component({
    selector: 'rd-cadastro-trava-dialog',
    templateUrl: './cadastro-trava.dialog.html',
    styleUrls: ['../cadastro-trava-estoque.component.scss']
})
export class CadastroTravaDialog implements OnInit {


    trava: FormGroup;
    constructor(
        private _fb: FormBuilder,
        private _dialogRef: MatDialogRef<CadastroTravaDialog>,
        private _service: TravaEstoqueService,
        @Inject(MAT_DIALOG_DATA) private _data: any
    ) {

    }


    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.trava = this._fb.group({
            cdRegional: [{value: null, disabled: true}],
            regional: [{value: null, disabled: true}],
            produto: [{value: null, disabled: true}],
            nmRegional: [{value: null, disabled: true}],
            cdProduto: [{value: null, disabled: true}],
            dsProduto: [{value: null, disabled: true}],
            qtReserva: [{value: null, disabled: true}],
            dtInicioReserva: [{value: new Date(), disabled: true}],
            dtFimReserva: [{value: new Date(), disabled: this._data.dtFimReserva >= new Date()}],
            cdMotivo: [{value: null, disabled: false}],
            dtReserva: [{value: null, disabled: true}],
            dataFinal: [{value: null, disabled: true}],
        })
        this.trava.setValue({
            ...this._data,
            regional: `${this._data.cdRegional} - ${this._data.nmRegional}`,
            produto: `${this._data.cdProduto} - ${this._data.dsProduto}`
        })
    }


    updateReserve() {
        this._service.updateReserve(this.trava.getRawValue()).subscribe(data => {
            this.closeDialog(this.trava.getRawValue());
        }, err => {
            this._service.showSwal('Ops!', err.error.erro.message, 'error')
        })
    }

    closeDialog(dataToSend?: any) {
        this._dialogRef.close(dataToSend)
    }
}