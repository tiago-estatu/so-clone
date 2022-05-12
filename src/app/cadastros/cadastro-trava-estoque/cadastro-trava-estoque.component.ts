import { tap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { HeaderService, LoadingService, ValidatorHelper, CdService, UtilsHelper } from 'src/app/commons';
import { fadeInOut } from 'src/app/commons/const/animation';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import Swal from 'sweetalert2';
import { CadastroTravaDialog } from './cadastro-trava-dialog/cadastro-trava.dialog';
import { IReserve } from './trava-estoque';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

@Component({
  selector: 'rd-cadastro-trava-estoque',
  templateUrl: './cadastro-trava-estoque.component.html',
  styleUrls: ['./cadastro-trava-estoque.component.scss'],
  animations: [fadeInOut]
})
export class CadastroTravaEstoqueComponent implements OnInit {

  travaForm: FormGroup;
  queryFilters: QueryFilters;
  fileControl: FormControl = new FormControl('');
  columns = ['cdRegional', 'cdProduto', 'qtReserva' ,'dtInicioReserva', 'dtFimReserva', 'cdMotivo']

  constructor(
    private _fb: FormBuilder,
    private _service: TravaEstoqueService,
    private _dialog: MatDialog,
    private _validator: ValidatorHelper,
    private _headerService: HeaderService,
    private _loader: LoadingService,
    private _cdService: CdService,
    private _utils: UtilsHelper

  ) { }

  // SELEÇÃO DOS CHECKBOX NA GRID
  nenhumItemSelecionado: Boolean = true;
  selecionarTodos: Boolean = false;
  selecionado: Boolean;
  selecionadosNaGrid: any = 0;
  cdReservasSelecionadas = []

  ngOnInit():void {
    this._headerService.setTitle('Trava de estoque CD')
    this.travaForm = this._fb.group({
      cdRegional: [[], Validators.required],
      cdProduto: [[], Validators.required],
      dtReserva: [new Date(),Validators.required]
    })

    this.queryFilters = new QueryFilters([
      new RequestParamModel('cdRegional', []),
      new RequestParamModel('cdProduto', '', null, (v) => v.split(';').join(',')),
      new RequestParamModel('dtReserva', new Date(), null, this._validator.formataData),
      new RequestParamModel('page', 0),
      new RequestParamModel('size', 10),
    ], this.travaForm)
  }

  // BUSCAR RESULTADOS PARA MOSTRAR NA GRID
  consultar(page?: Number) {
    this.queryFilters.updateParam('page', typeof page == 'number' ? page : this.queryFilters.getParam('page'));
    this.travaForm.valid ? this.buscarResultadosConsulta() : Swal.fire('Ops!', 'Centro de distribução ou código produto são requeridos. Preencha os campos e tente novamente.', 'error')
  }

  // EXECUTAR CONSULTA
  buscarResultadosConsulta(){
    this.displayNoneGrid()
    this._service.buscarTravasCadastradas(this.queryFilters).subscribe((data) => this.setDados(data))
  }

  // EXLCUSÃO DE TRAVAS SELCIONADAS E ATUALIZAÇÃO DO GRID DE RESULTADOS
  excluirTravas() {
      Swal.fire({
          title: 'Atenção!',
          text: 'As reservas selecionadas serão excluídas.',
          icon: 'warning',
          confirmButtonText: 'Ok, confirmar',
          customClass: { confirmButton: 'setBackgroundColor' },
          showCancelButton: true,
      }).then((result) => {
          // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
          if (result.value === true) {
              this._service.deleteReserve(this.agruparCodigoReserva(), this.queryFilters)
                .subscribe(data => this._service.showSwal('Sucesso', 'Trava de estoque excluida com sucesso', 'success'), err => {
                  this._service.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível excluir trava de estoque. Verifique a sua conexão e tente novamente.', 'error')
          }).add(() => {
              this._loader.parar()
              this.selecionarTodos = false;
              this.nenhumItemSelecionado = true;
              this.consultar()
          })

        } else {// SE USUÁRIO CANCELAR
            return
        }
    });

  }

  // UTILIZADO PARA TRANSPORTAR OS DADOS DA CONSULTA
  setDados = (dados) => this.selecionadosNaGrid = dados.content

  // BAIXAR MODELO EXCEL DE IMPORTAÇÃO
  downloadCSVCadastro = () => this._service.downloadCSVCadastro();

  downloadCSVDelete = () => this._service.downloadCSVDelete()

  // FAÇO AGRUPAMENTO CÓDIGOS DE RESERVA SELECIONADOS NA GRID
  agruparCodigoReserva() {
    return this.selecionadosNaGrid.filter(el => el.selecionado === true && el.flVigente === true).map((x) => x.cdProdutoReserva)
  }

  // ESCONDER GRID DE RESULTADOS
  displayNoneGrid(){
    this.selecionarTodos = false;
    this.nenhumItemSelecionado = true;
    this.selecionadosNaGrid = 0;
  }

  // VERIFICAR ESTADO DE SELECIONADOS
  verificarSelecionados(){
    return this.selecionadosNaGrid.filter(el => el.selecionado === true && el.flVigente === true).length !== 0 ? false : true
  }

  // HABILITAR BOTÃO EXCLUIR
  habilitoBotaoExcluirReservas() {
      return this.selecionadosNaGrid !== 0 ? this.verificarSelecionados() : true
  }

  // LIMPAR FILTROS SELECIONADOS
  limparCampos() {
    this._cdService.limpar();
    this.travaForm.patchValue({dtReserva: new Date(), cdProduto: ''})
    this.displayNoneGrid()
  }

  getPage(pageEvent: Number) {
    this.selecionarTodos = false;
    this.nenhumItemSelecionado = true;
    this.consultar(pageEvent)
  }

  itemSelecionado() {
    this.nenhumItemSelecionado = (this.selecionadosNaGrid.filter(el => el.selecionado).length === 0);
  }

  selecionarTodosItens(event) {
    this.selecionadosNaGrid.forEach(el => el.selecionado = event.checked);
    this.itemSelecionado();
  }

  importFile(event) {
    let fileData = event.target.files.item(0);
    if(!fileData) return

    // VERIFICAR TAMANHO DO ARQUIVO EXCEL
    this.fileControl.setValue('');
    if(!this._utils.tamanhoMaxUpload(fileData)) return

    this._service.importFile(fileData);
  }

  importDelete(event) {
    let fileData = event.target.files.item(0);
    if(!fileData) return

    // VERIFICAR TAMANHO DO ARQUIVO EXCEL
    this.fileControl.setValue('');
    if(!this._utils.tamanhoMaxUpload(fileData)) return

    this._service.importDelete(fileData);
  }

  getFormField(field: string): FormControl {
    return this.travaForm.get(field) as FormControl;
  }

  get travas() {
    return this._service.$reserves
  }

  get paging() {
    return this._service.$paging
  }

  get componentLoading() {
    return this._loader.getStatus()
  }
}
