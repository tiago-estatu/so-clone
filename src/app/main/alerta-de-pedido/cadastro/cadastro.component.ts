import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  phoneMask,
  NewModalComponent,
  fadeInOut
} from 'src/app/commons';

@Component({
  selector: 'rd-cadastro',
  templateUrl: './cadastro.component.html',
  animations: [fadeInOut],
})
export class AlertaPedidoCadastroComponent implements OnInit {



  @ViewChild(NewModalComponent) modalChild: NewModalComponent;

  loaded = true;
  componentLoading = false;
  cadastroForm: FormGroup;
  rotaVoltar = '/alerta-de-pedido/consulta';
  tituloPagina;
  phoneMask = phoneMask;
  subtituloPagina;
  mensagemModal;
  tituloModal;
  imagemModal;


  constructor(
    private formBuilder: FormBuilder
  ) {
    this.cadastroForm = this.formBuilder.group({
      statusTelevenda: ['', Validators.required],
      bandeira: ['', Validators.required],
      flAtivo: [''],
      tagsTemplate: ['', Validators.required],
      devices: ['', Validators.required],
      fluxos: ['', Validators.required],
      controlado: ['', Validators.required],
      servicosEntrega: ['', Validators.required],
      transportadoras: ['', Validators.required],
    });
  }


  ngOnInit() {
    this.tituloPagina = 'Cadastro de alerta';
  }


  modalFuncSave() {

  }

  loadingApi() {

  }

  // for easy access to form fields
  get fields() { return this.cadastroForm.controls; }

}
