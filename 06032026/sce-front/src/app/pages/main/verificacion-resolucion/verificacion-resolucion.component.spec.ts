import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionResolucionComponent } from './verificacion-resolucion.component';

describe('VerificacionResolucionComponent', () => {
  let component: VerificacionResolucionComponent;
  let fixture: ComponentFixture<VerificacionResolucionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificacionResolucionComponent]
    });
    fixture = TestBed.createComponent(VerificacionResolucionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
