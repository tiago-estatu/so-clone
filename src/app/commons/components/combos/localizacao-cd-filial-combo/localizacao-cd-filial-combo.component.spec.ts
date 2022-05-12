import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizacaoCdFilialComboComponent } from './localizacao-cd-filial-combo.component';

describe('LocalizacaoCdFilialComboComponent', () => {
  let component: LocalizacaoCdFilialComboComponent;
  let fixture: ComponentFixture<LocalizacaoCdFilialComboComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocalizacaoCdFilialComboComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalizacaoCdFilialComboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
