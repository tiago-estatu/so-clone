import { TestBed } from '@angular/core/testing';

import { LojaEspelhoService } from './loja-espelho.service';

describe('LojaEspelhoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LojaEspelhoService = TestBed.get(LojaEspelhoService);
    expect(service).toBeTruthy();
  });
});
