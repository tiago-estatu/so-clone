import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog,  } from '@angular/material';
import { fadeInOut, LoadingService, OperadorAcessoModel, OperadorAcessoService, PerfilAcessoService, ValidatorHelper } from 'src/app/commons';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { HeaderService } from 'src/app/commons/services/header.service';
import Swal from 'sweetalert2';
import { CadastroOperadorDialog } from './cadastro-operador-dialog/cadastro-operador.dialog';

@Component({
  selector: 'rd-consulta-operador-ativo',
  templateUrl: './consulta-operador-ativo.component.html',
  styleUrls: ['./consulta-operador-ativo.component.scss'],
  animations: [fadeInOut]
})
export class ConsultaOperadorAtivoComponent implements OnInit {
  //OPERADOR LOGADO
  cdOperador = localStorage.getItem('cdOperador');

  //FORMULARIOS 
  consultaForm: FormGroup;
  cadastroForm: FormGroup;

  queryFilters: QueryFilters = new QueryFilters();

  //VALOR DA GRID
  dataSource: OperadorAcessoModel[] = [];

  constructor( 
    private _headerService: HeaderService,
    private _fb: FormBuilder,
    private _loader: LoadingService,
    private _validator: ValidatorHelper,
    private _service: OperadorAcessoService,
    private _droplistPerfil: PerfilAcessoService,
    private _dialog: MatDialog,) { }

  ngOnInit() {
    //TITULO DA PAGINA
    this._headerService.setTitle('Consulta perfil e operadores')

    //INICIALIZACAO DO FORMULARIO DE CONSULTA COM VALIDAÇÃO DE OBRIGATÓRIO PREENCHIMENTO DE PELO MENOS UM CAMPO
    this.consultaForm = this._fb.group({
      idPerfil: [[], Validators],
      nrMatricula: ['', Validators]
    }, {
      validator: (control) => ({
        ...this._validator.atLeastOneTruthy(control, ['idPerfil', 'nrMatricula'], 'Selecione <strong>Perfil acesso</strong> ou <strong>Matricula</strong>')
      })
    });

    this.queryFilters = new QueryFilters([
      new RequestParamModel('idPerfil', []),
      new RequestParamModel('nrMatricula', ''),
      new RequestParamModel('page', 0),
      new RequestParamModel('size', 10),
    ], this.consultaForm)
  }
/**
   * Retorna um reactive form control como um FormControl
   * @param control nome do control
   */
  getConsultaFormField(field: string): FormControl {return this.consultaForm.get(field) as FormControl; }
  getCadastroFormField(field: string): FormControl {return this.cadastroForm.get(field) as FormControl; }

  //VALIDAÇÃO PARA ACC APENAS NUMEROS
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  consultar(page?: Number){
    this._loader.carregar()
    this.queryFilters.updateParam('page', typeof page == 'number' ? page : this.queryFilters.getParam('page'));
    if(this.consultaForm.valid) this._service.buscarOperadorAcesso(this.queryFilters).subscribe(data=>{
      this.setDados(data);
      this._loader.parar();
    }, err => {
      this.dataSource = [];
      this._loader.parar();
    });
  }
  //ABRE O MODAL PARA EDITAR A VIGENCIA DO OPERADOR
  alterarVigencia(row: OperadorAcessoModel){
    const dialogRef = this._dialog.open(CadastroOperadorDialog, {
      data: row,
      height: '400px',
    });
    dialogRef.afterClosed().subscribe(data => {
      if(null!=data){
        this.limparCampos();
      }
    })
  }


  // ENCERRAR VIGENCIA DO OPERADOR ATIVO SELECIONADO E ABRIR UM DIALOG
  encerrarVigencia(row) {
    Swal.fire({
      title: 'Atenção!',
      text: 'Você deseja encerrar a vigência do operador selecionado?',
      icon: 'warning',
      confirmButtonText: 'Ok, confirmar',
      customClass: { confirmButton: 'setBackgroundColor' },
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
  }).then((result) => {
      // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
      if (result.value === true) {
        this._loader.carregar()
        this._service.encerrarVigencia(row).subscribe(data => {
          this._loader.parar()
          this._service.showSwal('Sucesso', 'Vigência Encerrada com sucesso', 'success')
      
        }, err => {
          this._loader.parar()
          this._service.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível encerrar a vigência deste perfil. Verifique a sua conexão e tente novamente.', 'error')
      }).add(() => {
        this.consultar()
        this._loader.parar()
      })

      } else {
           this._loader.parar()
          return
      }
  });

  }

  getPage(pageEvent: Number) {
    this.consultar(pageEvent)
  }
  
   // UTILIZADO PARA TRANSPORTAR OS DADOS DA CONSULTA
   setDados = (dados) => this.dataSource = dados.content


  showError() {
    let content = Object.values(this.consultaForm.errors).map(e => `<div>${e.value}</div>`);
    Swal.fire({title: 'Verifique os campos!', html: `${content.join(' ')}`, icon: 'error', confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' }})
  }
 
 
  get componentLoading() {
    return this._loader.getStatus()
  }

  limparCampos(){
    this._service.reset();
    this.dataSource = [];
    this.consultaForm.reset();
    this.queryFilters = new QueryFilters([
      new RequestParamModel('idPerfil', []),
      new RequestParamModel('nrMatricula', ''),
      new RequestParamModel('page', 0),
      new RequestParamModel('size', 10),
    ], this.consultaForm);
    
    this._droplistPerfil.reset();
  }


}
