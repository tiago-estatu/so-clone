import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioPrioridadeLojaComponent } from './relatorio-prioridade-loja.component';

describe('RelatorioPrioridadeLojaComponent', () => {
  let component: RelatorioPrioridadeLojaComponent;
  let fixture: ComponentFixture<RelatorioPrioridadeLojaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioPrioridadeLojaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioPrioridadeLojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
