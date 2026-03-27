import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvanceEstadoActasNacionComponent } from './avance-estado-actas-nacion.component';

describe('AvanceEstadoActasNacionComponent', () => {
  let component: AvanceEstadoActasNacionComponent;
  let fixture: ComponentFixture<AvanceEstadoActasNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AvanceEstadoActasNacionComponent]
    });
    fixture = TestBed.createComponent(AvanceEstadoActasNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
