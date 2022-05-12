import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProdutoEspelhoComponent } from './produto-espelho.component';
import {ProdutoEspelhoService} from "../../commons/services/produto-espelho";

describe('ProdutoEspelhoComponent', () => {
  let component: ProdutoEspelhoComponent;
  let fixture: ComponentFixture<ProdutoEspelhoComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProdutoEspelhoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutoEspelhoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
