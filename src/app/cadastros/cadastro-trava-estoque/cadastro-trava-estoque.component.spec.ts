import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatExpansionModule } from '@angular/material';
import { HAMMER_LOADER } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginatePipe } from 'ngx-pagination';
import { of } from 'rxjs';
import { HeaderService, ValidatorHelper } from 'src/app/commons';
import { CommonsModule } from 'src/app/commons/commons.module';
import { TestHelper } from 'src/app/commons/helpers/test.helper';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';
import { CadastroTravaDialog } from './cadastro-trava-dialog/cadastro-trava.dialog';

import { CadastroTravaEstoqueComponent } from './cadastro-trava-estoque.component';
import { IReserve } from './trava-estoque';


const INITIAL_FORM = {cdRegional: [], cdProduto: [], data: new Date()}
const COMPARATOR_FORM = {cdRegional: [], cdProduto: []}

const VALID_FORM_DATA = {cdRegional: [900], cdProduto: [432],data: new Date()}
const ROW_EXAMPLE: IReserve = {
  cdProduto: 1001,
  dsProduto: `Produto 300mg`,
  cdRegional: 900,
  nmRegional: 'Parana',
  qtReserva: 10,
  dtInicioReserva: new Date(),
  dtFimReserva: new Date(),
  cdMotivo: 'Ecommerce'
}
describe('Trava Estoque Component', () => {
  let component: CadastroTravaEstoqueComponent;
  let fixture: ComponentFixture<CadastroTravaEstoqueComponent>;
  const testUtils = new TestHelper(expect);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroTravaEstoqueComponent, PaginatePipe],
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule, MatDialogModule, CommonsModule, CommonModule, MatExpansionModule, NoopAnimationsModule, BsDatepickerModule],
      providers: [TravaEstoqueService, ValidatorHelper, HeaderService,
        {
          provide: HAMMER_LOADER,
          useValue: () => new Promise(() => {})
        }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroTravaEstoqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.ngOnInit();
    expect(component['_headerService'].title.value).toEqual('Trava de estoque CD');
    expect(component.travaForm).toBeTruthy();
    expect(component.queryFilters).toBeTruthy();
    expect(component.travas.value).toHaveLength(0);
    expect(component.componentLoading).toEqual(false);
  });

  describe('Form and validators', () => {

    it('Should have the requested fields', () => {
      component.ngOnInit();
      let {data, ...comparableForm} = component.travaForm.getRawValue();
      let initialDate = INITIAL_FORM.data;
      expect([data.getMonth(), data.getDate(), data.getFullYear()])
      .toEqual([
        initialDate.getMonth(), initialDate.getDate(), initialDate.getFullYear()
      ])
      expect(comparableForm).toEqual(COMPARATOR_FORM);
    })
  })

  describe('Limpar campos', () => {
    it('Should reset the form field correctly', ()=> {
      component.ngOnInit();
      let validator = new ValidatorHelper();
      let formValues = component.travaForm.getRawValue();

      // test equal to newly created form
      let formatedInitial = {...INITIAL_FORM, data: validator.formataDataApi(INITIAL_FORM.data)};
      formValues.data = validator.formataDataApi(formValues.data);
      expect(formValues).toEqual(formatedInitial)

      // set new values to test not equal
      component.travaForm.patchValue({cdRegional: [900, 903], cdProduto: [100, 101]});
      formValues = component.travaForm.getRawValue();
      formValues.data = validator.formataDataApi(formValues.data);
      expect(formValues).not.toEqual(formatedInitial)

      // Call reset and test if equal to initial form
      component.limparCampos()
      formValues = component.travaForm.getRawValue();
      formValues.data = validator.formataDataApi(formValues.data);
      expect(formValues).toEqual(formatedInitial)

    })
  })

  describe('Import file', () => {
    it('Should capture the file select event and send the data to service', () => {
      let fileData = {target: {files: {item: (v) => '123;123'}}}
      spyOn(component['_service'], 'importFile').and.returnValue({})
      component.importFile(fileData);
      expect(component['_service'].importFile).toHaveBeenCalledTimes(1);
      expect(component['_service'].importFile).toHaveBeenCalledWith('123;123');
    })
  })

  describe('Get form field', () => {
    it('Should return a form control object from a reactive form group', () => {
      component.ngOnInit();
      let cdRegional = component.getFormField('cdRegional');
      let data = component.getFormField('data');
      expect(cdRegional).toBeInstanceOf(FormControl)
      expect(data).toBeInstanceOf(FormControl)
    })
  })

  describe('Consutar', () => {
      it('should show error if you try to call the function with an invalid form', () => {
        component.ngOnInit();
        component.travaForm.setValue(INITIAL_FORM);
        spyOn(component['_service'], 'getReserves').and.returnValue(of({}));
        component.consultar();
        expect(component.travaForm.valid).toEqual(false)
        expect(component['_service'].getReserves).toHaveBeenCalledTimes(0);
        testUtils.expectDialog('Ops!','Todos os campos são requeridos. Preencha todos os campos e tente novamente.','error');
      })

      it('should call the service if the form is valid', () => {
        component.ngOnInit();
        component.travaForm.setValue({...INITIAL_FORM, cdRegional: [900]});
        spyOn(component['_service'], 'getReserves').and.returnValue(of({}));
        component.consultar();
        expect(component.travaForm.valid).toEqual(true)
        expect(component['_service'].getReserves).toHaveBeenCalledTimes(1);
      })
  })

  describe('Pagination', () => {
    it('Should paginate correctly and updates paging information on page', () => {
      component.ngOnInit();
      component.travaForm.setValue(VALID_FORM_DATA);
      spyOn(component, 'consultar').and.callThrough();
      spyOn(component['_service'], 'getReserves').and.returnValue(of({}));
      component.getPage(1)
      expect(component.consultar).toHaveBeenCalledTimes(1);
      expect(component.consultar).toHaveBeenCalledWith(1);
      expect(component.queryFilters.getParam('page')).toEqual(1)
      component.getPage(3)
      expect(component.consultar).toHaveBeenCalledTimes(2);
      expect(component.consultar).toHaveBeenCalledWith(3);
      expect(component.queryFilters.getParam('page')).toEqual(3)
    })
  })

  describe('Import file', () => {
    it('Should only accept csv files', () => {

    })

  })

  describe('Edit row', () => {
    it('Should open a dialog to edit the row', () => {
      spyOn(component['_dialog'], 'open').and.returnValue({afterClosed: () => of(null)});
      component.editRow(ROW_EXAMPLE);
      expect(component['_dialog'].open).toHaveBeenCalledTimes(1)
      expect(component['_dialog'].open).toHaveBeenCalledWith(
        CadastroTravaDialog, {
          data: ROW_EXAMPLE,
          panelClass: ['col-xl-6', 'col-lg-6', 'col-md-7', 'col-sm-8', 'col-xs-12', 'col-12']
      }
      )
    })

    it('Should refresh the page if the dialog returns data', () => {
      spyOn(component['_dialog'], 'open').and.returnValue({afterClosed: () => of(ROW_EXAMPLE)});
      spyOn(component, 'consultar');
      component.queryFilters.updateParam('page', 4)
      component.editRow(ROW_EXAMPLE);
      expect(component['_dialog'].open).toHaveBeenCalledTimes(1)
      expect(component.consultar).toHaveBeenCalledTimes(1)
      expect(component.consultar).toHaveBeenCalledWith(component.queryFilters.getParam('page'));
    })

    it('Should not refresh the page if the dialog returns a falsy value', () => {
      spyOn(component['_dialog'], 'open').and.returnValue({afterClosed: () => of(null)});
      spyOn(component, 'consultar');
      component.editRow(ROW_EXAMPLE);
      expect(component['_dialog'].open).toHaveBeenCalledTimes(1)
      expect(component.consultar).toHaveBeenCalledTimes(0)
    })
  })
  


  describe('Export csv model', () => {
    it('Should call the service to download the file', () => {
      spyOn(component['_service'], 'downloadCSV').and.returnValue(of({}));
      component.downloadCSV();
      expect(component['_service'].downloadCSV).toHaveBeenCalledTimes(1);
  })
})




})
