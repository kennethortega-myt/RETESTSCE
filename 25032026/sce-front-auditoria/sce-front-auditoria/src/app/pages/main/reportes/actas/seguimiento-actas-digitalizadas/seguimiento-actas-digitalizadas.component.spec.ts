import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoActasDigitalizadasComponent } from './seguimiento-actas-digitalizadas.component';

describe('SeguimientoActasDigitalizadasComponent', () => {
  let component: SeguimientoActasDigitalizadasComponent;
  let fixture: ComponentFixture<SeguimientoActasDigitalizadasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SeguimientoActasDigitalizadasComponent]
    });
    fixture = TestBed.createComponent(SeguimientoActasDigitalizadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
