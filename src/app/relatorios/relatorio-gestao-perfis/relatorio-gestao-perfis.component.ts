import { HttpClient } from '@angular/common/http';
import { fadeInOut, fadeIn } from '../../commons/const/animation';
import { ServicePath } from '../../commons/const/ServicePath';
// import { Swal, SweetAlertIcon } from 'sweetalert2';
import Swal, { SweetAlertIcon } from 'sweetalert2';

import { Http } from '@angular/http';
import { ValidatorHelper } from '../../commons/helpers/validator.helper';
import { HttpParams } from '@angular/common/http';
import { UtilsHelper } from '../../commons/helpers/utils.helper';
import { HeaderService } from '../../commons/services/header.service';
import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { CdService, LoadingService, PerfilAcessoService } from 'src/app/commons';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';

@Component({
  selector: 'rd-relatorio-gestao-perfis',
  templateUrl: './relatorio-gestao-perfis.component.html',
  styleUrls: ['./relatorio-gestao-perfis.component.scss'],
  animations: [fadeInOut, fadeIn]

})
export class RelatorioGestaoPerfisComponent implements OnInit {

  // FORM & QUERY
  relatorioForm: FormGroup;
  queryFilters: QueryFilters;

  constructor(
    private _headerService: HeaderService,
    private _utils: UtilsHelper,
    private _fb: FormBuilder,
    private _validator: ValidatorHelper,
    private _loader: LoadingService,
    private _perfilService: PerfilAcessoService

  ) { }

  // LOADING (INTERAÇÃO COM O USER)
  get componentLoading(): Boolean {return this._loader.getStatus()}

  // CÓDIGO OPERADOR
  get cdOperador() {return localStorage.getItem('cdOperador')};

  ngOnInit() {
    this._headerService.setTitle('Relatório Gestão de perfis')
    this.relatorioForm = this._fb.group({
      nrMatricula: [''],
      dtInicio: [new Date(), Validators.required],
      dtFim:  [new Date(), Validators.required],
      idPerfil: [[]]
    }, {
      validator: (control) => ({
        ...this._validator.atLeastOneTruthy(control, ['idPerfil', 'nrMatricula'], 'Selecione uma <strong>Matricula</strong> ou <strong>Perfil de acesso</strong> para prosseguir')
      })
    });

    // AGRUPAMENTO DOS PARAMS
    this.queryFilters = new QueryFilters([
      new RequestParamModel('idPerfil', ''),
      new RequestParamModel('nrMatricula',''),
      new RequestParamModel('dtInicio', new Date(), null, (v) => this._validator.formataData(v)),
      new RequestParamModel('dtFim', new Date(), null, (v) => this._validator.formataData(v)),
    ], this.relatorioForm)
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this._perfilService.reset()
    this.relatorioForm.setValue({nrMatricula: '', idPerfil: [], dtInicio: '', dtFim: ''})
  }

  getControl(control: string): FormControl {return this.relatorioForm.get(control) as FormControl}

  showError() {
    let content = Object.values(this.relatorioForm.errors).map(e => `<div>${e.value}</div>`);
    Swal.fire({title: 'Verifique os campos!', html: `${content.join(' ')}`, icon: 'error', confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' }})
  }

  exportar() {
    if(this.relatorioForm.valid) this._perfilService.exportarRelatorio(this.queryFilters);
    if(!this.relatorioForm.valid) this.showError()
  }

  // HABILITAR BOTÃO EXCLUIR
  habilitarBotao() {
    return (this.relatorioForm.status == 'VALID') ? false : true
  }
}
