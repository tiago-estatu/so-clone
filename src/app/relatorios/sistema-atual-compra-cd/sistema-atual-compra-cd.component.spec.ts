import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SistemaAtualCompraCdComponent } from './sistema-atual-compra-cd.component';

describe('SistemaAtualCompraCdComponent', () => {
  let component: SistemaAtualCompraCdComponent;
  let fixture: ComponentFixture<SistemaAtualCompraCdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SistemaAtualCompraCdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SistemaAtualCompraCdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
