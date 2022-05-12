import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MatExpansionModule, MAT_DIALOG_DATA } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { of, throwError } from 'rxjs';
import { CommonsModule } from 'src/app/commons/commons.module';
import { TestHelper } from 'src/app/commons/helpers/test.helper';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import { CadastroOperadorDialog } from './cadastro-operador.dialog';
const VALID_FORM_DATA =  {
  cdProduto: [1001],
  dsProduto: `Produto 300mg`,
  cdRegional: [900],
  nmRegional: 'Parana',
  qtReserva: 10,
  dtInicioReserva: new Date(),
  dtFimReserva: new Date(),
  cdMotivo: 'Ecommerce'
}
const ROW_EXAMPLE = {
  cdProduto: 1001,
  dsProduto: `Produto 300mg`,
  cdRegional: 900,
  nmRegional: 'Parana',
  qtReserva: 10,
  dtInicioReserva: new Date(),
  dtFimReserva: new Date(),
  cdMotivo: 'Ecommerce'
}


describe('Cadastro Estoque Dialog', () => {
  let component: CadastroOperadorDialog;
  let fixture: ComponentFixture<CadastroOperadorDialog>;
  const testUtils = new TestHelper(expect);
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule, MatDialogModule, CommonsModule, CommonModule, MatExpansionModule, NoopAnimationsModule, BsDatepickerModule],
      declarations: [ CadastroOperadorDialog],
      providers: [
        TravaEstoqueService,
        {
          provide: MatDialogRef,
          useValue: {close: () => {}}
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: ROW_EXAMPLE
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroOperadorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
  });

  it('Should be opened with initial info', () => {
      expect(component['_data']).toEqual(ROW_EXAMPLE);
      spyOn(component, 'initForm').and.callThrough();
      component.ngOnInit();
      expect(component.trava).toBeTruthy();
      expect(component.initForm).toHaveBeenCalledTimes(1)
  })


  describe('Save changes', () => {
      it('Should save changes when valid data is provided and close itself', () => {
        component.ngOnInit();
        component.trava.setValue({
          ...ROW_EXAMPLE,
          regional: `${ROW_EXAMPLE.cdRegional} - ${ROW_EXAMPLE.nmRegional}`,
          produto: `${ROW_EXAMPLE.cdProduto} - ${ROW_EXAMPLE.dsProduto}`
        });
        spyOn(component, 'closeDialog').and.returnValue({})
        spyOn(component['_service'], 'updateReserve').and.returnValue(of({success: true}))
        component.updateReserve();
        expect(component['_service'].updateReserve).toHaveBeenCalledTimes(1)
        expect(component.closeDialog).toHaveBeenCalledTimes(1);
        let raw = component.trava.getRawValue();
        expect(component.closeDialog).toHaveBeenCalledWith({
          ...raw,
          regional: `${raw.cdRegional} - ${raw.nmRegional}`,
          produto: `${raw.cdProduto} - ${raw.dsProduto}`

        })
        
        
      })

      it('Should show an error when invalid data is provided and continue open', () => {
        component.ngOnInit();
        let error = {status: 500, error: {message: 'Internal server error'}}
        component.trava.setValue({
          ...ROW_EXAMPLE,
          regional: `${ROW_EXAMPLE.cdRegional} - ${ROW_EXAMPLE.nmRegional}`,
          produto: `${ROW_EXAMPLE.cdProduto} - ${ROW_EXAMPLE.dsProduto}`
        });
        spyOn(component, 'closeDialog').and.returnValue({})
        spyOn(component['_service'], 'updateReserve').and.returnValue(throwError(error))
        component.updateReserve();
        expect(component['_service'].updateReserve).toHaveBeenCalledTimes(1)
        expect(component.closeDialog).toHaveBeenCalledTimes(0)
        testUtils.expectDialog('Ops!', error.error.message, 'error');
        
      })
  })

  describe('Close dialog', () => {
      it('Should close itself sending any receiving arguments', () => {
        spyOn(component['_dialogRef'], 'close').and.returnValue({})
        component.closeDialog(12);
        expect(component['_dialogRef'].close).toHaveBeenCalledTimes(1)
        expect(component['_dialogRef'].close).toHaveBeenCalledWith(12)
      })
  })

  

})
