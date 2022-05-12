import { TestBed } from '@angular/core/testing';

import { SetorCdService } from './setor-cd.service';

describe('SetorCdService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SetorCdService = TestBed.get(SetorCdService);
    expect(service).toBeTruthy();
  });
});
