
import { Component, OnDestroy, OnInit, VERSION } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderService, LoadingService, PerfilAcessoService, ValidatorHelper} from 'src/app/commons';
import { fadeInOut } from 'src/app/commons/const/animation';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { CadastroNovoOperadorService } from 'src/app//commons/services/cadastro-novo-operador/cadastro-novo-operador.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'rd-cadastro-novo-operador',
  templateUrl: './cadastro-novo-operador.component.html',
  styleUrls: ['./cadastro-novo-operador.component.scss'],
  animations: [fadeInOut]
})

export class CadastroNovoOperadorComponent implements OnInit {

  consultarForm: FormGroup;
  queryConsultar: QueryFilters

  cadastroOperadorForm: FormGroup;
  cadastroQuery: QueryFilters;


  constructor(
    private _fb: FormBuilder,
    public _validator: ValidatorHelper,
    private _headerService: HeaderService,
    private _loader: LoadingService,
    private _service: CadastroNovoOperadorService,
    private _droplistPerfil: PerfilAcessoService

  ) { }

  // SELEÇÃO DOS CHECKBOX NA GRID
  nenhumItemSelecionado: Boolean = true;
  selecionarTodos: Boolean;
  selecionado: Boolean;
  selecionadosNaGrid: any = 0;


  ngOnInit() {
      this._headerService.setTitle('Cadastro de novos operadores');

      // CONSULTA PARAMS
      this.consultarForm = this._fb.group({nrMatricula: ['', Validators.required]})

      // QUERY PARA CONSULTAR
      this.queryConsultar = new QueryFilters([
        new RequestParamModel('nrMatricula', Number),
        new RequestParamModel('page', 0),
        new RequestParamModel('size', 20),
      ], this.consultarForm)


      // CADASTRO FORM
      this.cadastroOperadorForm = this._fb.group({
        cdOperador: [''],
        dtInicioVg: [new Date(), Validators.required],
        dtFimVg: [, ],
        idPerfil: ['', Validators.required],
        nrMatricula: ['']
      })

      this.cadastroQuery = new QueryFilters([
        new RequestParamModel('cdOperador', ''),
        new RequestParamModel('dtInicioVg', new Date(), null, this._validator.formataData),
        new RequestParamModel('dtFimVg', null),
        new RequestParamModel('idPerfil', ''),
        new RequestParamModel('nrMatricula', ''),
      ], this.cadastroOperadorForm)
  }

    getConsultaForm(field: string): FormControl {return this.consultarForm.get(field) as FormControl}
    getCadastroForm(field: string): FormControl {return this.cadastroOperadorForm.get(field) as FormControl}


    // REMOVE DECIMAL (.) OU VIRGULA ANTES DE ENVIAR PARA A CONSULTA
    retiroPontoDecimal = (v) => v.toString().replace(/\.|,/, '');

    // BUSCAR RESULTADOS PARA MOSTRAR NA GRID
    consultar(page?: Number) {
      // LIMPO A GRID ANTES DA PRÓXIMA RESPOSTA
      this.selecionadosNaGrid = 0

      this.queryConsultar.updateParams([
        {name: 'nrMatricula', value: this.retiroPontoDecimal(this.queryConsultar.getParam('nrMatricula'))},
        {name: 'page', value: typeof page == 'number' ? page : this.queryConsultar.getParam('page')},
      ])

      this.consultarForm.valid ? this.listarMatriculas() : this._service.showSwal('Ops!', 'Número de matrícula é um campo requerido. Favor preencher e tentar novamente.', 'error')
    }


    // EXECUTAR CONSULTA
    listarMatriculas = () => this._service.buscarPelaMatricula(this.queryConsultar).subscribe((data) => this.setDados(data))

    // UTILIZADO PARA TRANSPORTAR OS DADOS DA CONSULTA PARA GRID
    setDados = (dados) => {
      this.selecionadosNaGrid = dados
    }

    // CADASTRO DE NOVO OPERADOR
    cadastrarNovoOperador() {
      this.cadastroQuery.updateParams([
        {name: 'cdOperador', value: this.recolherParamsGrid().cdOperaNovCad},
        {name: 'nrMatricula', value: this.recolherParamsGrid().nrMatricula},
      ])

      Swal.fire({
        title: 'Atenção!',
        text: 'Você deseja efetivar operador selecionado?',
        icon: 'warning',
        confirmButtonText: 'Ok, confirmar',
        customClass: { confirmButton: 'setBackgroundColor' },
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
    }).then((result) => {
        // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
        if (result.value === true) {
          this._service.cadastrarNovoOperador(this.cadastroQuery).subscribe(data => {
            let pageNumber: Number = this.queryConsultar.getParam('page');
            
            this.consultar(pageNumber);
            this.nenhumItemSelecionado = true;
          });
  
        } else {
            this._loader.parar()
            return
        }
    });
      
    }

    // FAÇO AGRUPAMENTO CÓDIGOS DE RESERVA SELECIONADOS NA GRID
    //return this.selecionadosNaGrid.filter(el => el.selecionado === true).map((v => ({ ...v, cdOperador:v.cdOperador, nrMatricula:v.matricula})))
    recolherParamsGrid() {
      let objMapeado;
      this.selecionadosNaGrid.filter(el => el.selecionado === true).map((v) => {objMapeado = {cdOperaNovCad:v.cdOperador, nrMatricula:v.matricula}})
      return objMapeado;
    }

    // HABILITAR BOTÃO EXCLUIR
    habilitoBotaocadastrarOperador() {
      return (this.nenhumItemSelecionado === false && this.cadastroOperadorForm.get('idPerfil').status == 'VALID') ? false : true
    }

    // LIMPAR FILTROS SELECIONADOS
    limparCampos() {
      this.consultarForm.patchValue({nrMatricula: ''})
      this.selecionadosNaGrid = 0
      this.cadastroOperadorForm.patchValue({dtInicioVg: new Date(), dtFimVg:new Date()})
      this._droplistPerfil.reset()
    }

    getPage(pageEvent: Number) {
      this.selecionarTodos = false;
      this.nenhumItemSelecionado = true;
      this.consultar(pageEvent)
    }

    itemSelecionado() {this.nenhumItemSelecionado = (this.selecionadosNaGrid.filter(el => el.selecionado).length === 0)}

    selecionarTodosItens(event) {
      this.selecionadosNaGrid.forEach(el => el.selecionado = event.checked);
      this.itemSelecionado();
    }

    get paging() {
      return this._service.$paging
    }

}
