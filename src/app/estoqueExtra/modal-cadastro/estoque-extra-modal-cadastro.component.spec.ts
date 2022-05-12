import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstoqueExtraModalCadastroComponent } from './estoque-extra-modal-cadastro.component';

describe('EstoqueExtraModalCadastroComponent', () => {
  let component: EstoqueExtraModalCadastroComponent;
  let fixture: ComponentFixture<EstoqueExtraModalCadastroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstoqueExtraModalCadastroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstoqueExtraModalCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
