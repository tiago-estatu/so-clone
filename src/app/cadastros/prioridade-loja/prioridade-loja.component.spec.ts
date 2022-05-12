import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrioridadeLojaComponent } from './prioridade-loja.component';

describe('PrioridadeLojaComponent', () => {
  let component: PrioridadeLojaComponent;
  let fixture: ComponentFixture<PrioridadeLojaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrioridadeLojaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrioridadeLojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
