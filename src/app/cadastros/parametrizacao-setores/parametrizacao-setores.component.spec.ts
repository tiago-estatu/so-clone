import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrizacaoSetoresComponent } from './parametrizacao-setores.component';

describe('ParametrizacaoSetoresComponent', () => {
  let component: ParametrizacaoSetoresComponent;
  let fixture: ComponentFixture<ParametrizacaoSetoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ParametrizacaoSetoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParametrizacaoSetoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
