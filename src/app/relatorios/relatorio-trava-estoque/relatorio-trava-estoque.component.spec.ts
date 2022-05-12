import { TestHelper } from '../../commons/helpers/test.helper';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CommonsModule } from '../../commons/commons.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioTravaEstoqueComponent } from './relatorio-trava-estoque.component';
const TITLE = "Relatório Trava de Estoque CD";
const FIELDS = {dtInicioReserva: new Date(), dtFimReserva: new Date(), cdProduto: [], cdRegional: []}
const INVALID_FORM = {dtInicioReserva: new Date(), dtFimReserva: new Date(new Date().getTime() - 100000), cdProduto: [], cdRegional: []}
const VALID_FORM = {dtInicioReserva: new Date(), dtFimReserva: new Date(), cdProduto: [123], cdRegional: [123]}
const formater = (v: Date) => {`${v.getFullYear()}${v.getDate()}${v.getMonth()}`}
describe('RelatorioTravaDeEstoqueComponent', () => {
  let component: RelatorioTravaEstoqueComponent;
  let fixture: ComponentFixture<RelatorioTravaEstoqueComponent>;
  var testUtils = new TestHelper(expect)
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioTravaEstoqueComponent ],
      imports: [ HttpClientModule, 
                 FormsModule, 
                 NoopAnimationsModule, 
                 CommonsModule,  
                 CommonModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioTravaEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    spyOn(component['_headerService'], 'setTitle')

    expect(component).toBeTruthy();

    component.ngOnInit()

    expect(component['_headerService'].setTitle).toHaveBeenCalledTimes(1);
    expect(component['_headerService'].setTitle).toHaveBeenCalledWith(TITLE);
  });

  describe('Formulario', () => {
    it('Should have all the fields needed', () => {
      component.ngOnInit();
      let raw = component.reportForm.getRawValue()
      raw = {
        ...raw, 
        dtVigenciaInicial: formater(raw.dtInicioReserva),
        dtVigenciaFinal: formater(raw.dtFimReserva)
      }
      expect(raw).toEqual({
        ...FIELDS, 
        dtVigenciaInicial: formater(FIELDS.dtInicioReserva),
        dtVigenciaFinal: formater(FIELDS.dtFimReserva)
      })
    })

  })

  describe('Export report by email', () => {

    afterEach(() => {
      testUtils.closeDialog();
    })

    it('Should show an error when the validations arent meet', () => {
      let response = {status: 500, error: {message: 'Internal server error'}};
      spyOn(component['_service'], 'exportarRelatorio').and.returnValue(throwError(response));
      component.reportForm.setValue(INVALID_FORM);
      component.exportReport();

      expect(component['_service'].exportarRelatorio).toHaveBeenCalledTimes(0);
    })

    it('Should show a success message and do a http request in case the validations are meet', () => {
      let response = {message: 'sucesso'};
      spyOn(component['_service'], 'exportarRelatorio').and.returnValue(of(response));
      component.reportForm.setValue(VALID_FORM);
      component.exportReport();

      expect(component['_service'].exportarRelatorio).toHaveBeenCalledTimes(1);
    })

  })

  describe('LimparCampos', () => {
    it('Should clear all the values from the form', () => {
      component.reportForm.setValue(VALID_FORM);
      component.limparCampos();
      expect(component.reportForm.getRawValue()).toEqual(FIELDS);
    })
  })

});
