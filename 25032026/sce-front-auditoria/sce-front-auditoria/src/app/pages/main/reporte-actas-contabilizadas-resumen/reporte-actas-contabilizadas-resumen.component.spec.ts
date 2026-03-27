import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteActasContabilizadasResumenComponent } from './reporte-actas-contabilizadas-resumen.component';

describe('ReporteActasContabilizadasResumenComponent', () => {
  let component: ReporteActasContabilizadasResumenComponent;
  let fixture: ComponentFixture<ReporteActasContabilizadasResumenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReporteActasContabilizadasResumenComponent]
    });
    fixture = TestBed.createComponent(ReporteActasContabilizadasResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
