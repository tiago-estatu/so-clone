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
import { CdService, LoadingService } from 'src/app/commons';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';

@Component({
  selector: 'rd-relatorio-trava-estoque',
  templateUrl: './relatorio-trava-estoque.component.html',
  styleUrls: ['./relatorio-trava-estoque.component.scss'],
  animations: [fadeInOut, fadeIn]

})
export class RelatorioTravaEstoqueComponent implements OnInit {

  // FORM & QUERY
  reportForm: FormGroup;
  queryFilters: QueryFilters;

  constructor(
    private _headerService: HeaderService,
    private _utils: UtilsHelper,
    private _fb: FormBuilder,
    private _validator: ValidatorHelper,
    private _loader: LoadingService,
    private _service: TravaEstoqueService,
    private _cdService: CdService

  ) { }

  // LOADING (INTERAÇÃO COM O USER)
  get componentLoading(): Boolean {return this._loader.getStatus()}

  // CÓDIGO OPERADOR
  get cdOperador() {return localStorage.getItem('cdOperador')};

  ngOnInit() {
    this._headerService.setTitle('Relatório Trava de Estoque CD')
    this.reportForm = this._fb.group({
      dtInicio: [new Date(), Validators.required],
      dtFim: [new Date(), Validators.required],
      cdProduto: ['', Validators.minLength(1)],
      cdRegional: [[]]
    }, {
      validator: (control) => ({
        ...this._validator.initialDateValidator(control, 'dtInicio', 'dtFim', 90), // range de consulta datepicker:90 dias
        ...this._validator.atLeastOneTruthy(control, ['cdProduto', 'cdRegional'], 'Selecione <strong>Centro de Distribuição</strong> ou <strong>Produto</strong>')
      })
    });

    // AGRUPAMENTO DOS PARAMS
    this.queryFilters = new QueryFilters([
      new RequestParamModel('cdOperador', this.cdOperador),
      new RequestParamModel('cdRegional', ''),
      new RequestParamModel('cdProduto', '', null, (v) => v.split(';').join(',')),
      new RequestParamModel('dtInicio', new Date(), null, (v) => this._validator.formataData(v)),
      new RequestParamModel('dtFim', new Date(), null, (v) => this._validator.formataData(v)),
    ], this.reportForm)
  }

  // MÉTODO PARA LIMPAR FILTROS DA CONSULTA
  limparCampos() {
    this._cdService.limpar()
    this.reportForm.setValue({cdProduto: '', cdRegional: [], dtInicio: new Date(), dtFim: new Date()})
  }

  getControl(control: string): FormControl {return this.reportForm.get(control) as FormControl}

  showError() {
    let content = Object.values(this.reportForm.errors).map(e => `<div>${e.value}</div>`);
    Swal.fire({title: 'Verifique os campos!', html: `${content.join(' ')}`, icon: 'error', confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' }})
  }

  exportReport() {
    if(this.reportForm.valid) this._service.exportarRelatorio(this.queryFilters);
    if(!this.reportForm.valid) this.showError()
  }
}
