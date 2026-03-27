import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteDetalleAvanceRegistroUbigeoNacionComponent } from './reporte-detalle-avance-registro-ubigeo-nacion.component';

describe('ReporteDetalleAvanceRegistroUbigeoNacionComponent', () => {
  let component: ReporteDetalleAvanceRegistroUbigeoNacionComponent;
  let fixture: ComponentFixture<ReporteDetalleAvanceRegistroUbigeoNacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteDetalleAvanceRegistroUbigeoNacionComponent]
    });
    fixture = TestBed.createComponent(ReporteDetalleAvanceRegistroUbigeoNacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
