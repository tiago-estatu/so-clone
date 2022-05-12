import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioInformacoesRecomendacaoComponent } from './relatorio-informacoes-recomendacao.component';

describe('RelatorioInformacoesRecomendacaoComponent', () => {
  let component: RelatorioInformacoesRecomendacaoComponent;
  let fixture: ComponentFixture<RelatorioInformacoesRecomendacaoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioInformacoesRecomendacaoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioInformacoesRecomendacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
