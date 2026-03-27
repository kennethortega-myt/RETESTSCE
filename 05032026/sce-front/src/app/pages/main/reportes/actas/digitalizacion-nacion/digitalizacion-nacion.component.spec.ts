import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalizacionNacionComponent } from './digitalizacion-nacion.component';

describe('DigitalizacionNacionComponent', () => {
  let component: DigitalizacionNacionComponent;
  let fixture: ComponentFixture<DigitalizacionNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DigitalizacionNacionComponent]
    });
    fixture = TestBed.createComponent(DigitalizacionNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
