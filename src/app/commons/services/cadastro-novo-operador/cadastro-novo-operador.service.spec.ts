import { TestBed } from '@angular/core/testing';

import { CadastroNovoOperadorService } from './cadastro-novo-operador.service';

describe('CadastroNovoOperadorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CadastroNovoOperadorService = TestBed.get(CadastroNovoOperadorService);
    expect(service).toBeTruthy();
  });
});
