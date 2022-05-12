import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetorItimComboComponent } from './setor-itim-combo.component';

describe('SetorItimComboComponent', () => {
  let component: SetorItimComboComponent;
  let fixture: ComponentFixture<SetorItimComboComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetorItimComboComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetorItimComboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
