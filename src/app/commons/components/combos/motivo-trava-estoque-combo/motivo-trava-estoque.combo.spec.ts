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
import { DropdownMapperPipe } from 'src/app/commons/pipes';
import { TravaEstoqueService } from 'src/app/commons/services/trava-estoque/trava-estoque.service';

import { MotivoTravaEstoqueCombo } from './motivo-trava-estoque.combo';

describe('Motivo trava estoque combo', () => {
  let component: MotivoTravaEstoqueCombo;
  let fixture: ComponentFixture<MotivoTravaEstoqueCombo>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
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
    fixture = TestBed.createComponent(MotivoTravaEstoqueCombo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    spyOn(component, 'getMotivos').and.returnValue({})
    component.ngOnInit();
    expect(component.getMotivos).toHaveBeenCalledTimes(1)
  });


  describe('get motivos', () => {
      it('should force the service to get the motives from the backend', () => {
          spyOn(component['_service'], 'getMotives').and.returnValue(of([1,2,3]));
          expect(component.$motivos.value.length == 0);
          component.getMotivos();
          expect(component['_service'].getMotives).toHaveBeenCalledTimes(1);
          expect(component.$motivos.value.length == 3);

      })
  })




})
