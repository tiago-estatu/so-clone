import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatorioSubstitutoGenericoComponent } from './relatorio-substituto-generico.component';

describe('RelatorioSubstitutoGenericoComponent', () => {
  let component: RelatorioSubstitutoGenericoComponent;
  let fixture: ComponentFixture<RelatorioSubstitutoGenericoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioSubstitutoGenericoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatorioSubstitutoGenericoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
