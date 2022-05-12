import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { BehaviorSubject } from 'rxjs';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';


@Component({
    selector: 'rd-motivo-trava-estoque',
    template: `
        <!-- LABEL TITLE -->
        <div class="title-form vig">
            <i class="fa fa-0-5x fa-files-o"></i>
            Selecione um motivo
        </div>
        <!-- LABEL TITLE -->
        <!-- DROPDOWN INPUT -->
        <ng-multiselect-dropdown
            [formControl]="formControl"
            name="motivos"
            [placeholder]="'Selecionar motivo'"
            [data]="$motivos | async | dropmap: 'cdMotivoEstoqueReserva':'cdMotivoEstoqueReserva-dsMotivoEstoqueReserva'"
            [settings]="dropdownSettings">
        </ng-multiselect-dropdown>
        <!-- DROPDOWN INPUT -->
    `,
    styleUrls: ['./motivo-trava-estoque.combo.scss']
})

export class MotivoTravaEstoqueCombo implements OnInit {
    @Input('formControl')
    formControl?: FormControl = new FormControl('');


    $motivos = new BehaviorSubject<any[]>([]);
    dropdownSettings:IDropdownSettings = {
        singleSelection: true,
        idField: "item_id",
        textField: "item_text"
    };
    constructor(private _service: TravaEstoqueService) {

    }


    ngOnInit() {
        this.getMotivos();
    }

    getMotivos() {
        this._service.getMotives().subscribe(data => {
            this.$motivos.next(data || [])
        })
    }


}