import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HeaderService } from '../commons';

@Component({
  selector: 'rd-gestao-motivos',
  templateUrl: './gestao-motivos.component.html',
  styleUrls: ['./gestao-motivos.component.scss']
})
export class GestaoMotivosComponent implements OnInit {
 //flags
 componentLoading: boolean = false;

  // forms and controls
  motivoForm: FormGroup;

  constructor(
    protected _headerService: HeaderService, 
    private _fb: FormBuilder
    ) { }

  ngOnInit() {
    this._headerService.setTitle("Gestão de novos motivos");

    this.motivoForm = this._fb.group({
      tipoTelaSelecionado: [[], Validators.required]
    });
  }

}
