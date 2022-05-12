import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioLojaEspelhoComponent } from './relatorio-loja-espelho.component';

describe('RelatorioLojaEspelhoComponent', () => {
  let component: RelatorioLojaEspelhoComponent;
  let fixture: ComponentFixture<RelatorioLojaEspelhoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioLojaEspelhoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioLojaEspelhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
