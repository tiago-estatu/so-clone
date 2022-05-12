import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaOperadorAtivoComponent } from './consulta-operador-ativo.component';

describe('ConsultaOperadorAtivoComponent', () => {
  let component: ConsultaOperadorAtivoComponent;
  let fixture: ComponentFixture<ConsultaOperadorAtivoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsultaOperadorAtivoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaOperadorAtivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
