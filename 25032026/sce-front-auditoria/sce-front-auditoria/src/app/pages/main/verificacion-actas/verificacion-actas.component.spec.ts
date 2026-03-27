import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerificacionActasComponent } from './verificacion-actas.component';

describe('VerificacionActasComponent', () => {
  let component: VerificacionActasComponent;
  let fixture: ComponentFixture<VerificacionActasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerificacionActasComponent]
    });
    fixture = TestBed.createComponent(VerificacionActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
