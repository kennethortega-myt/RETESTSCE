import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionDigitacionComponent } from './verificacion-digitacion.component';

describe('VerificacionDigitacionComponent', () => {
  let component: VerificacionDigitacionComponent;
  let fixture: ComponentFixture<VerificacionDigitacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificacionDigitacionComponent]
    });
    fixture = TestBed.createComponent(VerificacionDigitacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
