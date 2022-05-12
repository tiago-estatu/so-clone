import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroNovoOperadorComponent } from './cadastro-novo-operador.component';

describe('CadastroNovoOperadorComponent', () => {
  let component: CadastroNovoOperadorComponent;
  let fixture: ComponentFixture<CadastroNovoOperadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroNovoOperadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroNovoOperadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
