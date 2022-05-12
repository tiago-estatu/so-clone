import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { of } from 'rxjs';
import { ArredondamentoService } from 'src/app/commons';
import { CommonsModule } from '../../commons/commons.module';
import { TestHelper } from '../../commons/helpers/test.helper';
import { RelatorioArredondamentoCdComponent } from './relatorio-arredondamento-cd.component';
const date = new Date();
const today = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 0, 0)
const yesterday = new Date();
yesterday.setTime(today.getTime() - 24*3600000)
const monthAgo = new Date();
monthAgo.setTime(today.getTime() - 31*24*3600000)

const baseForm = {cdRegional: [], cdFornecedor: [], dtInicio: today, dtFim: today}
const invertedDate = {cdRegional: [], cdFornecedor: [], dtInicio: today, dtFim: yesterday}
const correctDate = {cdRegional: [], cdFornecedor: [], dtInicio: yesterday, dtFim: today}
const moreThan30Days = {cdRegional: [], cdFornecedor: [], dtInicio: monthAgo, dtFim: today}
describe('ProdutoEspelhoComponent', () => {
  let component: RelatorioArredondamentoCdComponent;
  let fixture: ComponentFixture<RelatorioArredondamentoCdComponent>;
  const testUtils = new TestHelper(expect);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule, ReactiveFormsModule,
        BsDatepickerModule, CommonModule,
        CommonsModule, NoopAnimationsModule,
        HttpClientModule
      ],
      providers: [ArredondamentoService],
      declarations: [ RelatorioArredondamentoCdComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioArredondamentoCdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    
    expect(component.form).toBeTruthy();
    expect(component.query).toBeTruthy();
  });

  describe('Campos de input', () => {

    it('Deve ter os campos de, CD, fornecedor, data inical e data final', () => {
      spyOn(component, 'initForm').and.callThrough();
      component.ngOnInit();
      expect(component.initForm).toHaveBeenCalledTimes(1);
      let {dtInicio, dtFim} = component.form.getRawValue();
      expect(dtInicio).toBeInstanceOf(Date);
      expect(dtFim).toBeInstanceOf(Date);
      expect(dtInicio.getTime()).toEqual(dtFim.getTime())
      expect(component.form.getRawValue()).toEqual({...baseForm, dtFim: dtFim, dtInicio: dtInicio})
    })

    it('Deve ter as validações corretas do formulario', () => {
        component.ngOnInit();
        expect(component.form.valid).toBeFalsy();
        component.form.setValue({...correctDate, cdRegional: [1]})
        expect(component.form.valid).toBeFalsy();
        component.form.setValue({...correctDate, cdFornecedor: [1]})
        expect(component.form.valid).toBeFalsy();
        component.form.setValue({...correctDate, cdFornecedor: [1], cdRegional: [1]})
        expect(component.form.valid).toBeTruthy();
        component.form.setValue({...invertedDate, cdFornecedor: [1], cdRegional: [1]})
        expect(component.form.valid).toBeFalsy();
        component.form.setValue({...moreThan30Days, cdFornecedor: [1], cdRegional: [1]})
        expect(component.form.valid).toBeFalsy();
    })

    it('Deve poder limpar campos', () => {
      component.ngOnInit();
      component.form.setValue({...correctDate, cdFornecedor: [1], cdRegional: [1]});
      expect(component.form.getRawValue()).not.toEqual(correctDate);
      component.resetForm();
      let {dtInicio, dtFim} = component.form.getRawValue();
      expect(dtInicio).toBeInstanceOf(Date);
      expect(dtFim).toBeInstanceOf(Date);
      expect(dtInicio.getTime()).toEqual(dtFim.getTime())
      expect(component.form.getRawValue()).toEqual({...baseForm, dtInicio: dtInicio, dtFim: dtFim});
    })

  })


  describe('Get control function', () => {
    it('Deve retornar um formcontrol do form group', () => {
      component.ngOnInit();
      expect(component.getControl('cdFornecedor')).toBeTruthy();
      expect(component.getControl('cdRegional') instanceof FormControl)
    })
  })


  describe('Exportar relatorio', () => {
    it('Deve chamar a função de exportar do servico', () => {
        component.ngOnInit();
        spyOn(component['_service'], 'exportarRelatorio').and.returnValue(of({}));
        component.form.setValue({...correctDate, cdFornecedor: [1], cdRegional: [1]});
        component.exportar()
        expect(component['_service'].exportarRelatorio).toHaveBeenCalledTimes(1);
    })
  })



});
