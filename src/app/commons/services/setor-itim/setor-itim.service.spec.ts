import { TestBed } from '@angular/core/testing';

import { SetorItimService } from './setor-itim.service';

describe('SetorItimService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SetorItimService = TestBed.get(SetorItimService);
    expect(service).toBeTruthy();
  });
});
