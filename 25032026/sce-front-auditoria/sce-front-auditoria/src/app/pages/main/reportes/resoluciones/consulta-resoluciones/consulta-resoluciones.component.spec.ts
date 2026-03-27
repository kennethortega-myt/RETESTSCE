import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaResolucionesComponent } from './consulta-resoluciones.component';

describe('ConsultaResolucionesComponent', () => {
  let component: ConsultaResolucionesComponent;
  let fixture: ComponentFixture<ConsultaResolucionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultaResolucionesComponent]
    });
    fixture = TestBed.createComponent(ConsultaResolucionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
