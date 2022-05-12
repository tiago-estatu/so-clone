import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioParametrizacaoSetoresComponent } from './relatorio-parametrizacao-setores.component';

describe('RelatorioParametrizacaoSetoresComponent', () => {
  let component: RelatorioParametrizacaoSetoresComponent;
  let fixture: ComponentFixture<RelatorioParametrizacaoSetoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioParametrizacaoSetoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioParametrizacaoSetoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
