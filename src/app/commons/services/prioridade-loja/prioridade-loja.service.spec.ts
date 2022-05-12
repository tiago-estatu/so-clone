import { TestBed } from '@angular/core/testing';

import { PrioridadeLojaService } from './prioridade-loja.service';

describe('PrioridadeLojaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PrioridadeLojaService = TestBed.get(PrioridadeLojaService);
    expect(service).toBeTruthy();
  });
});
