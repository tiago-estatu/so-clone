import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { fadeInOut, HeaderService, ValidatorHelper, UtilsHelper, LoadingService, ArredondamentoService, FornecedorService, CdService } from '../../commons';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { QueryFilters } from '../../commons/models/query-param.model';
import { RequestParamModel } from '../../commons/models/request-param.model';
import { FornecedorComboConfig } from '../../commons/components/combos';
import { HttpParams } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';

/**
 * Validator criado para validar um periodo de datas
 * @param datesForm Controle abstrato representando o formgroup
 */
export function initialDateValidator(datesForm: AbstractControl) {
  const dtInicio: Date = datesForm.get('dtInicio').value;
  const dtFim: Date = datesForm.get('dtFim').value;
  let error = null;

  let helper =  new UtilsHelper();
  let hasErr = helper.dateRangeValidator(dtInicio, dtFim, 30);
  error = hasErr ? {maxRange: {value: hasErr}} : null
  return error;
}

/**
 * Tela do relatorio de arrendondamento CD
 * Criada para visualizar os logs do cadastro de arredondamento CD
 */
@Component({
  selector: 'rd-relatorio-arredondamento-cd',
  templateUrl: './relatorio-arredondamento-cd.component.html',
  styleUrls: ['./relatorio-arredondamento-cd.component.scss'],
  animations: [fadeInOut]
})
export class RelatorioArredondamentoCdComponent implements OnInit, OnDestroy {
  /** Reactive form group */
  form: FormGroup;
  /** Query params para salvar os query params e formatar eles de maneira simples */
  query: QueryFilters;
  /** Config do input de fornecedor */
  config = new FornecedorComboConfig(null, null, false, true);
  /** Array que contem as subscriptions existentes no componente */
  sub = [];

  constructor(
    private _utils: UtilsHelper,
    private _headerService: HeaderService,
    private _fb: FormBuilder,
    private _loader: LoadingService,
    private _service: ArredondamentoService,
    private _fornecedorService: FornecedorService,
    private _cdService: CdService,
    private _validator: ValidatorHelper
  ) { }


  /** Ao iniciar o componente e setado o titulo da pagina
   * e chamamos a função de inicializar forms e query params
   */
  ngOnInit() {
      this._headerService.setTitle('Relatório Arredondamento CD');
      this.initForm();
      this.initSub()

  }
  
  /**
   * Getter do status do loader
   * Para saber que a pagina deve mostrar o loader ou não
   */
  get componentLoading() {
    return this._loader.getStatus()
  }

  /**
   * Adiciona ao array de sub
   * uma subscrição que escuta ao cdSelecionado para saber se
   * atualizar o cdFornecedor
   */
  initSub() {
    this.sub.push(
      this._cdService.$cdSelecionado.pipe(debounceTime(400)).subscribe(cd => {
        this._fornecedorService.$fornecedorSelecionado.next([]);
        let params: HttpParams = new HttpParams();
         if(!this._utils.isEmpty(cd)){
           params = params.set('cdRegional', cd.join(','))
         }
         params = params.set('fgCompraCd', 'true')
         params = params.set('cdOperador', localStorage.getItem('cdOperador'))
    
        cd.length > 0 ? this._fornecedorService.buscarTodosFornecedoresPorCds(params).subscribe() : this._fornecedorService.fornecedores.next([])
      })
    )
  }

  /**
   * Inicializa o reactive form group
   * campo - tipo devalidação
   * dtInicio requerida
   * dtFim requerida
   * cdRegional requerido
   * cdFornecedor requerido
   * o form enteiro initialDateValidator (validador customizado)
   * 
   * Apos gerar o form ele cria os query params com form attached
   */
  initForm() {
      this.form = this._fb.group({
        dtInicio: [new Date(), Validators.required],
        dtFim: [new Date(), Validators.required],
        cdRegional: [[], Validators.required],
        cdFornecedor: [[], Validators.required]
      }, 
      {
        validator: initialDateValidator
      });
      this.query = new QueryFilters(
        [
          new RequestParamModel('dtInicio', new Date(), 'dtInicio', (v) => this._validator.formataData(v)),
          new RequestParamModel('dtFim', new Date(), 'dtFim', (v) => this._validator.formataData(v)),
          new RequestParamModel('cdRegional', [], 'cdRegional'),
          new RequestParamModel('cdFornecedor', [], 'cdFornecedor'),
        ],
        this.form
      )
  }


  /**
   * Se o form e valido chama o serviço de exportar relatorio
   * com os query params atuais
   * 
   * Se o form for invalido, obtem qual campo tem erro e informa em 
   * um swal alert
   */
  exportar() {
    if(this.form.valid) {
      this._service.exportarRelatorio(this.query).subscribe()
    } else {
      let dtInicioErrors = this.form.errors ? this.form.errors.maxRange : null;

      let messages = [
        {value: 'Selecione um centro de distribuição válido', validator: this.form.get('cdRegional').valid},
        {value: 'Selecione um fornecedor válido', validator: this.form.get('cdFornecedor').valid},
        {value: (!!dtInicioErrors ? dtInicioErrors.value : 'Selecione uma data válida'), validator: !dtInicioErrors}
      ]

      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: messages.find(i => !i.validator).value
      })
    }
  }

  /**
   * Retorna um reactive form control como um FormControl
   * @param control nome do control
   */
  getControl(control:string): FormControl {
    return this.form.get(control) as FormControl
  }


  /**
   * Reseta o form, inicializando ele novamente
   * junto aos query params
   */
  resetForm() {
    this.initForm();
  }


  /**
   * Ao destruir o componente
   * percorre o array de sub e se desuscreve de todas as suscrições
   */
  ngOnDestroy() {
    this.sub.forEach(element => {
      element.unsubscribe()
    });
  }
}



