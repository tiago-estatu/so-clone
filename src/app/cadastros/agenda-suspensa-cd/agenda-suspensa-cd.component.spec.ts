import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaSuspensaCdComponent } from './agenda-suspensa-cd.component';

describe('AgendaSuspensaCdComponent', () => {
  let component: AgendaSuspensaCdComponent;
  let fixture: ComponentFixture<AgendaSuspensaCdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgendaSuspensaCdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendaSuspensaCdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
