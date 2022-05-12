import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetorCdComboComponent } from './setor-cd-combo.component';

describe('SetorCdComboComponent', () => {
  let component: SetorCdComboComponent;
  let fixture: ComponentFixture<SetorCdComboComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetorCdComboComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetorCdComboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
