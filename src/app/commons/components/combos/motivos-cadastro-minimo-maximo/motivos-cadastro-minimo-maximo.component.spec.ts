import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotivosCadastroMinimoMaximoComponent } from './motivos-cadastro-minimo-maximo.component';

describe('MotivosCadastroMinimoMaximoComponent', () => {
  let component: MotivosCadastroMinimoMaximoComponent;
  let fixture: ComponentFixture<MotivosCadastroMinimoMaximoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotivosCadastroMinimoMaximoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotivosCadastroMinimoMaximoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
