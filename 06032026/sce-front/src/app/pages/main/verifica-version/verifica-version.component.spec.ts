import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificaVersionComponent } from './verifica-version.component';

describe('VerificaVersionComponent', () => {
  let component: VerificaVersionComponent;
  let fixture: ComponentFixture<VerificaVersionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificaVersionComponent]
    });
    fixture = TestBed.createComponent(VerificaVersionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
