import { TestBed } from '@angular/core/testing';

import { GrupoPrioridadeLojaService } from './grupo-prioridade-loja.service';

describe('GrupoPrioridadeLojaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GrupoPrioridadeLojaService = TestBed.get(GrupoPrioridadeLojaService);
    expect(service).toBeTruthy();
  });
});
