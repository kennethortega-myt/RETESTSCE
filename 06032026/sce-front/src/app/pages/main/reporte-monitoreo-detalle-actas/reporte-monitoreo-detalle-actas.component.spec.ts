import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteMonitoreoDetalleActasComponent } from './reporte-monitoreo-detalle-actas.component';

describe('ReporteMonitoreoDetalleActasComponent', () => {
  let component: ReporteMonitoreoDetalleActasComponent;
  let fixture: ComponentFixture<ReporteMonitoreoDetalleActasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteMonitoreoDetalleActasComponent]
    });
    fixture = TestBed.createComponent(ReporteMonitoreoDetalleActasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
