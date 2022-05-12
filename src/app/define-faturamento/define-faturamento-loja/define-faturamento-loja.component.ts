import { Component, OnInit } from "@angular/core";
import Swal from 'sweetalert2'
import {
  fadeInOut,
  fadeIn,
  UtilsHelper,
  HeaderService,
  FilialService,
  CdService,
  FaturamentoLojaService,
  LoadingService,
  LojaStore,
  FaturamentoLojaModel,
} from "src/app/commons";

import { MatDialog } from "@angular/material/dialog";
import { FilialRotaService } from 'src/app/commons/services/filial-rota';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { BehaviorSubject } from "rxjs";

@Component({
  selector: "rd-define-faturamento-loja",
  templateUrl: "./define-faturamento-loja.component.html",
  styleUrls: ["./define-faturamento-loja.component.scss"],
  animations: [fadeInOut, fadeIn]
})
export class DefineFaturamentoLojaComponent implements OnInit {
  filterForm: FormGroup;
  queryFilters: QueryFilters;
  hadChange = false;

  cdOperador = localStorage.getItem("cdOperador");
  
  todosCDSelecionados = [];
  todasRotasSelecionadas = [];
  todasFilialSelecionadas = [];

  constructor(
    private _headerService: HeaderService,
    public dialog: MatDialog,
    public _service: FaturamentoLojaService,
    public _filialRotaService: FilialRotaService,
    public _filialService: FilialService,
    public _cdService: CdService,
    private _fb: FormBuilder,
    private _loading: LoadingService
  ) { }

  ngOnInit() { 
    this._headerService.setTitle('Sistema de Faturamento Loja');
    this.initForm();
    this.initQuery();
  }

  initForm() {
    this.filterForm = this._fb.group({
        cdRegional: ['', Validators.required],
        cdRota: ['', Validators.required],
        cdFilial: ['', Validators],
    })
  }

initQuery(){
  this.queryFilters = new QueryFilters([
      new RequestParamModel('cdFilial', [], 'cdFilial'),
      new RequestParamModel('cdRegional', [], 'cdRegional'),
      new RequestParamModel('cdRota', [], 'cdRota'),
      new RequestParamModel('size', 999, 'size')
  ], this.filterForm);
}


clearGrid() {
    this._service.dataSource.next({status: 'LOAD', data: []});
}

  toTop() {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  limparCampos() {
    this.hadChange = false;
    this._filialRotaService.reset();
    this._filialService.reset();
    this._cdService.limpar();
  }

  consultar() {
   if(this.podeConsultar()){
     this.hadChange = false;
     const ds = this._service.getDefinicaoSistema(this.queryFilters);

    }
  }

  isDataSourceChange(){
    const store: LojaStore = this.dataSource.value;
    this.hadChange = false;
    store.data.forEach(data => {
      let original = data.faturamentoOriginal;
      let alterado = data.faturamento
      if(original != alterado){
        this.hadChange = true;
      }
    })
  }

  get dataSource() {
    return this._service.dataSource;
  }

  get filialList(){
    return this._filialService.filiais;
  }

  updateFaturamento() {
    Swal.fire({
      title: 'Atenção!',
      text: 'Deseja confirmar a alteração dos faturamentos?',
      icon: 'warning',
      confirmButtonText: 'Ok, confirmar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'setBackgroundColor' },
      showCancelButton: true,
  }).then((result) => {
    if (result.value === true) {
      this._service.updateFaturamento();
      this.isDataSourceChange();
    }
  });
}

  changeFaturamento(faturamento) {
    faturamento.changeFaturamento();
    this.isDataSourceChange();
  }

  get componentLoading(){
    return this._loading.getStatus();
  }

  podeConsultar(): Boolean {
    if (!this.filterForm.valid) {
        Swal.fire({
          title: "Oops, Filtro incompleto!",
          html: 'Por favor, selecione algum <strong>Centro de distribuição</strong> ou <strong> filial rota </strong> para prosseguir.',
          icon: 'warning',
          confirmButtonText: 'Ok, obrigado',
          customClass: {confirmButton: 'setBackgroundColor'}
        });
        return false;
      }
      return true;
  }

  todosCentroDistribuicaoSelecionado(callBack) {
    this.todosCDSelecionados = callBack;
  }

  todasRotaSelecionada(callBack) {
    this.todasRotasSelecionadas = callBack;
  }

  todasFilialSelecionada(callback) {
    this.todasFilialSelecionadas = callback;
  }
  /**
   * @param  {{field:string} data
   * @param  {any}} data
   */
  selectField(data: {field: string, data: any}) {
    let dict = {'ff': 'cdFilial', 'fr': 'cdRota', 'cd': 'cdRegional'};
    let valueForPatch = {};
    valueForPatch[dict[data.field]] = data.data;

    this.filterForm.patchValue(valueForPatch);
    this.clearGrid()
  }
}
