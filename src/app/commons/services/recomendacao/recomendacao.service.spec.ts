import { TestBed } from '@angular/core/testing';

import { RecomendacaoService } from './recomendacao.service';

describe('RecomendacaoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RecomendacaoService = TestBed.get(RecomendacaoService);
    expect(service).toBeTruthy();
  });
});
