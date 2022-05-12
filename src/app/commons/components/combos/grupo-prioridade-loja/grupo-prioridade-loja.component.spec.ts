import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupoPrioridadeLojaComponent } from './grupo-prioridade-loja.component';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {UtilsHelper} from "../../../helpers";
import {TestHelper} from "../../../helpers/test.helper";
import {of, throwError} from "rxjs";

const GRUPOS_PRIORIDADE = [
  {item_id: 1, item_text: 'teste 1'},
  {item_id: 2, item_text: 'teste 2'},
];

const GRUPOS_PRIORIDADE_SERVER = [
  {cdGrupo: 1, dsGrupo: 'teste 1'},
  {cdGrupo: 2, dsGrupo: 'teste 2'},
  {cdGrupo: 3, dsGrupo: 'teste 3'},
  {cdGrupo: 4, dsGrupo: 'teste 4'},
];


describe('GrupoPrioridadeLojaComponent', () => {
  let component: GrupoPrioridadeLojaComponent;
  let fixture: ComponentFixture<GrupoPrioridadeLojaComponent>;
  let testUtils = new TestHelper(expect);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [ GrupoPrioridadeLojaComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [UtilsHelper]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrupoPrioridadeLojaComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    spyOn(component, 'preencherGruposPrioridade');
    component.ngOnInit();
    expect(component.preencherGruposPrioridade).toHaveBeenCalledTimes(1);
    expect(component.dropdownLista).toBeDefined();
    expect(component.selecionadoLista).toBeDefined();
    expect(component.dropdownSettingsSelecionarUm).toBeDefined();
  });


  describe('Limpar Selecionados', () => {
    it('deve limpar todos os itens selecionados e emitir o resultado para o parent', () => {
      component.selecionadoLista = [1, 2, 3];
      spyOn(component.selecionados, 'emit');
      component.limparSelecionados();
      testUtils.limparSelecionados(component, 'selecionadoLista');
    })
  })

  describe('Selecionar Grupos', () => {
    it('Deve emitir os grupos selecionados para o parent', () => {
      component.selecionadoLista = GRUPOS_PRIORIDADE;
      spyOn(component.selecionados, 'emit');
      let processed = GRUPOS_PRIORIDADE.map(itm => itm.item_id);
      expect(component.selecionadoLista).toHaveLength(GRUPOS_PRIORIDADE.length);
      component.selecionado();
      testUtils.selecionadoItem(component, GRUPOS_PRIORIDADE, processed, 'selecionadoLista');

    })
  })


  describe('Preencher grupo prioridade', () => {

    it('Deve preencher os grupos com a resposta do servidor', () => {
      spyOn(component['_service'], 'getGrupoPrioridadeDeLoja').and.returnValue(of(GRUPOS_PRIORIDADE_SERVER));
      expect(component.dropdownLista).toHaveLength(0);
      let processed = GRUPOS_PRIORIDADE_SERVER.map(item => {
        return {item_id: item.cdGrupo, item_text: item.dsGrupo}
      });
      component.preencherGruposPrioridade();
      expect(component['_service'].getGrupoPrioridadeDeLoja).toHaveBeenCalledTimes(1);
      expect(component.dropdownLista).toEqual(processed);

    })

    it('Deve fazer handling dos erros do servidor', () => {
      let response = throwError({status: 500, error: {mensagem: 'ERRO '}});
      spyOn(component['_service'], 'getGrupoPrioridadeDeLoja').and.returnValue(response);
      component.preencherGruposPrioridade();
      expect(component['_service'].getGrupoPrioridadeDeLoja).toHaveBeenCalledTimes(1);
      expect({title: 'Oops!', content: 'ERRO prioridade de loja combo!', icon: 'warning'}).dialogToExist();

    })


  })


});
