
import { Component, OnDestroy, OnInit, VERSION } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderService, LoadingService, PerfilAcessoService, PerfilRotasService, TodoItemFlatNode, UtilsHelper, ValidatorHelper} from 'src/app/commons';
import { fadeInOut } from 'src/app/commons/const/animation';
import { QueryFilters } from 'src/app/commons/models/query-param.model';
import { RequestParamModel } from 'src/app/commons/models/request-param.model';
import { CadastroNovoOperadorService } from 'src/app//commons/services/cadastro-novo-operador/cadastro-novo-operador.service';
import Swal from 'sweetalert2';
import {SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'rd-criar-novo-perfil',
  templateUrl: './criar-novo-perfil.component.html',
  styleUrls: ['./criar-novo-perfil.component.scss'],
  animations: [fadeInOut]
})

export class CriarNovoPerfilComponent implements OnInit {
  consultou: Boolean = false;
  consultarForm: FormGroup;
  queryConsultar: QueryFilters
  rotasPerfilSelecionados: SelectionModel<TodoItemFlatNode>;
  crudForm: FormGroup;
  cdPerfilParaClonar: number =0;


  constructor(
    private _fb: FormBuilder,
    public _validator: ValidatorHelper,
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _loader: LoadingService,
    private _service: PerfilRotasService,
    private _droplistPerfil: PerfilAcessoService
    
  ) { }

  // SELEÇÃO DOS CHECKBOX NO COMBO DE PERFIL
  perfilSelecionado = 0;


  ngOnInit() {
    this.setHeaderCadastro();

     // CONSULTA PARAMS
     this.consultarForm = this._fb.group({idPerfil: ['', Validators.required]})

     // QUERY PARA CONSULTAR
     this.queryConsultar = new QueryFilters([
       new RequestParamModel('idPerfil', Number),
     ], this.consultarForm)


     // CRUD FORM 
     this.crudForm = this._fb.group({
       idPerfil: [''],
       dsPerfil: ['',  Validators.compose([
         Validators.required, 
         Validators.pattern('^[A-Z ]+$')
        ]),
      ]
     })
 }

    getConsultaForm(field: string): FormControl {return this.consultarForm.get(field) as FormControl}
    getCrudForm(field: string): FormControl {
      return this.crudForm.get(field) as FormControl
    }

    // REMOVE DECIMAL (.) OU VIRGULA ANTES DE ENVIAR PARA A CONSULTA
    retiroPontoDecimal = (v) => v.toString().replace(/\.|,/, '');

    updateSelecionados(callback){
      this.rotasPerfilSelecionados = callback;
    }

    criarNovoPerfil(){
      this.setHeaderCadastro();
      this.crudForm.patchValue({dsPerfil: ''});
      this.consultou = true;

      this.rotasPerfilSelecionados.clear();
    }

    /**
     * Clonar o perfil selecionado
     * @param perfil
     * Pegamos a mesma informação do perfil selecionado para que o usuário cadastre um novo para se ter base
     */
    clonarPerfilPorId(perfil) {
      this.setHeaderClonar();

      this.setInformacoesParaClone(perfil);
     
      this.consultou = true;

    }
    
    salvarPerfil(){
      //TODO VALIDAR SE EXISTE JA UM DSPERFIL COM ESTE NOME
      if(!this._utils.isEmpty(this.rotasPerfilSelecionados)){
        this.confirmarGravacaoPerfil();
      }else{
        this.showSwal('Ops!', 'Por favor, escolha um menu para continuar com o cadastro.', 'warning');
      }
    }

    /**
     * Setar a informação no dsPerfil e para selecionar os menus
     * @param perfil
     */
    setInformacoesParaClone(perfil){
      this.cdPerfilParaClonar = perfil[0].item_id;
      this.crudForm.patchValue({dsPerfil: 'Clone de '+ perfil[0].item_text })
    }
    
     /**
     * Conversão do json para salvar o objeto da arvore
     * @return rotasPerfilSelecionado
     */
    configureJson(){
      const rotasPerfilSelecionado = this.rotasPerfilSelecionados.selected.filter(rota => rota.level===1)
      .reduce((prev, current, index) => {
        let { cdMenu, ...menuItem} = current;
       
        let menuSelecionado = prev[cdMenu] || {  cdMenu: cdMenu, menuItens: [],  };

        menuSelecionado.menuItens.push(menuItem); 

        prev[cdMenu]= menuSelecionado;
        return prev;
      }, []);

    return Object.values(rotasPerfilSelecionado);
    }

      // LIMPAR FILTROS SELECIONADOS
    limparCampos() {
      this.setHeaderCadastro();
      this.consultarForm.patchValue({idPerfil: ''})
      this.crudForm.patchValue({dsPerfil: ''})
      this.consultou = false;
      this._droplistPerfil.reset()
    }

    setHeaderCadastro(){
      this._headerService.setTitle('Criar Novo Perfil de Acesso');
      this.cdPerfilParaClonar = 0;

    }
    setHeaderClonar(){
      this._headerService.setTitle('Clonar Perfil de Acesso');
    }

    showSwal(title: string, text: any, icone: any) {
      Swal.fire({ title: title, text: text, icon: icone, confirmButtonText: 'Ok Fechar', customClass: { confirmButton: 'setBackgroundColor' } })
  }

    /**
     * Modal de Confirmação para gravar o perfil
     */
   confirmarGravacaoPerfil() {
    const dsPerfil = this.getCrudForm('dsPerfil').value;

    if(!this._utils.isEmpty(this._droplistPerfil.dataSource.value.filter(x => (x.dsPerfil.toUpperCase()===dsPerfil.toUpperCase())))){
      const infoModal = "Nome de perfil " + dsPerfil + " já existe. Por favor, escolha outro nome!";
      this.showSwal('Ops!',infoModal , 'warning')
      return
    }
    

    Swal.fire({
      title: 'Atenção!',
      text: 'Você deseja cadastrar um novo perfil com o nome: '+ dsPerfil +' ?',
      icon: 'warning',
      confirmButtonText: 'Ok, confirmar',
      customClass: { confirmButton: 'setBackgroundColor' },
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      // RETURN OPTIONS: {value: true} || {dismiss: "cancel"}
      if (result.value === true) {
        this._loader.carregar()
        this._service.create(this.configureJson(), dsPerfil).subscribe(data => {
          this._loader.parar()
          this._service.showSwal('Sucesso', 'Perfil Cadastrado com sucesso', 'success')
          this.limparCampos();
        }, err => {
          this._loader.parar()
          this._service.showSwal('Ops!', err.error && err.error.erro.message ? err.error.erro.message : 'Não foi possível cadastrar este perfil. Verifique a sua conexão e tente novamente.', 'error')
        }).add(() => {
          this._loader.parar()
        })
      }
    });
  }
}
