import { TestBed } from '@angular/core/testing';

import { ComparacionDigitacionAsistAutomaApiService } from './comparacion-digitacion-asist-automa-api.service';

describe('ComparacionDigitacionAsistAutomaApiService', () => {
  let service: ComparacionDigitacionAsistAutomaApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComparacionDigitacionAsistAutomaApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
