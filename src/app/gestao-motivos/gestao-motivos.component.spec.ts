import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GestaoMotivosComponent } from './gestao-motivos.component';

describe('GestaoMotivosComponent', () => {
  let component: GestaoMotivosComponent;
  let fixture: ComponentFixture<GestaoMotivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GestaoMotivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GestaoMotivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
